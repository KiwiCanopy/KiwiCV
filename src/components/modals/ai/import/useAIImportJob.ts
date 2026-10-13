import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';

import {
  isOtherSourceLanguage,
  resolveImportSourceLanguage,
} from '@/components/modals/ai/import/sourceLanguage';
import { type ImportStyle } from '@/components/modals/ai/import/types';
import { type AIStatus } from '@/components/modals/ai/template/statusTypes';
import { AI_PAYWALL_CODES } from '@/constants/ai';
import { useAIJobRun } from '@/hooks/useAIJobRun';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { importResume } from '@/utils/importResume';

interface UseAIImportJobOptions {
  extractedDocxImage: string | null;
  isTranslationEnabled: boolean;
  needsUpgrade: boolean;
  sourceLanguage: string;
  sourceLanguageOther: string;
  targetLanguage: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setIsUpgradeModalOpen: Dispatch<SetStateAction<boolean>>;
  setRefusedMode: Dispatch<SetStateAction<'limit' | 'generic' | null>>;
  setStatus: Dispatch<SetStateAction<AIStatus>>;
  syncUsageStatus: () => Promise<{ proRequestsToday: number; isDailyLimitReached: boolean }>;
}

/**
 * A parse runs to at most the model's 65,536-token output cap, measured at 121–130 s; 180 s
 * adds worker overhead and a 1.25× margin. 2–13 page imports measured 6–32 s.
 */
const IMPORT_POLL_WINDOW_MS = 180_000;

/** The parsed CV the worker writes to `ai_jobs.result`. */
interface ImportedResult {
  basics?: { image?: string; [key: string]: unknown };
  meta?: unknown;
  [key: string]: unknown;
}

export function useAIImportJob({
  extractedDocxImage,
  isTranslationEnabled,
  needsUpgrade,
  sourceLanguage,
  sourceLanguageOther,
  targetLanguage,
  setErrorMessage,
  setIsUpgradeModalOpen,
  setRefusedMode,
  setStatus,
  syncUsageStatus,
}: UseAIImportJobOptions) {
  const { t, language } = useTranslation();
  const { session, refreshProfile, isPremium } = useAuth();
  const setResume = useResumeStore((state) => state.setResume);
  const addToast = useToastStore((state) => state.addToast);
  const fileContent = useFlowStore((state) => state.import.fileContent);
  const fileType = useFlowStore((state) => state.import.fileType);
  const customInstructions = useFlowStore((state) => state.import.customInstructions);
  const allowReorg = useFlowStore((state) => state.import.allowReorg);
  const setStep = useFlowStore((state) => state.setImportStep);

  // The prompt happily takes a typed language name for a CV written in a
  // language the interface does not ship in. The stored locale cannot: it drives
  // theme section labels, date formatting, the PDF footer, the `{lang}` filename
  // token and the exported HTML `lang` attribute, so it stays one of the
  // supported locales. With no translation target to fall back on, the closest
  // honest guess is the interface language the user is importing in.
  const promptSourceLanguage = resolveImportSourceLanguage(sourceLanguage, sourceLanguageOther);
  const resumeLocale = isTranslationEnabled
    ? targetLanguage
    : isOtherSourceLanguage(sourceLanguage)
      ? language
      : sourceLanguage;

  // Owns the poll and the row: an unmount mid-import stops the poll, so it
  // cannot overwrite the CV the user moved on to, and deletes the row.
  const jobRun = useAIJobRun();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Guards the start action while the pre-flight usage sync is in flight.
  // That await is a network round trip during which the button stayed enabled,
  // so a second click started a second import job.
  const [isStarting, setIsStarting] = useState(false);

  const handleParse = async (style: ImportStyle) => {
    if (!fileContent) return;
    if (isStarting || jobRun.isRunning()) return;
    setIsStarting(true);
    try {
      await startParse(style);
    } finally {
      if (isMountedRef.current) setIsStarting(false);
    }
  };

  const startParse = async (style: ImportStyle) => {
    if (!fileContent) return;

    if (needsUpgrade) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Re-check server-side usage: the allowance can have been spent in another
    // tab since the modal opened, and a guaranteed rejection should surface as
    // the paywall rather than as a failed job.
    if (isPremium) {
      const usageStatus = await syncUsageStatus();
      if (usageStatus.isDailyLimitReached) {
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    if ((style === 'custom' || style === 'job_description') && !customInstructions.trim()) {
      addToast(t('ai.import_error_enter_instructions'), 'error');
      return;
    }

    setStep('processing');
    setStatus('processing');

    await jobRun.start<ImportedResult>({
      accessToken: session?.access_token,
      userId: session?.user?.id,
      // The uploaded file rests here until the row is deleted.
      insert: {
        payload: {
          fileBase64: fileContent.base64,
          fileType,
          text: fileContent.text,
          // Typed so a stray style cannot reach the worker as a mode it has no prompt for.
          mode: (style === 'literal'
            ? 'parse_import'
            : style === 'professional'
              ? 'professional'
              : style === 'job_description'
                ? 'job_description'
                : 'custom') satisfies AIPromptMode | 'parse_import',
          instructions:
            style === 'professional'
              ? 'Extract and rewrite professionally.'
              : style === 'literal'
                ? 'Extract exactly as written.'
                : style === 'job_description'
                  ? `Extract and tailor for impact to match the following job description:\n\n${customInstructions}`
                  : customInstructions,
          allowReorg,
          currentLang: promptSourceLanguage,
          targetLang: isTranslationEnabled ? targetLanguage : promptSourceLanguage,
        },
      },
      workerUrl: '/.netlify/functions/parse-cv-background',
      workerBody: (jobId) => ({ jobId }),
      // Importing parses a whole document, and aborting a job that would have
      // finished discards a paid result.
      pollWindowMs: IMPORT_POLL_WINDOW_MS,
      startErrorMessage: 'Failed to trigger background CV parsing function',
      // The refusal's own code picks the paywall's mode, as in the improve dialog.
      onRefused: async (kind) => {
        setRefusedMode(kind === AI_PAYWALL_CODES.LIMIT_REACHED ? 'limit' : 'generic');
        setIsUpgradeModalOpen(true);
        setStep('style');
        setStatus('idle');
        await syncUsageStatus();
      },
      onStartError: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('CV Parsing Error:', error);
        setStatus('error');
        setErrorMessage(message || t('common.error_occurred'));
      },
      onTimeout: () => {
        setStatus('error');
        setErrorMessage(t('common.error_occurred'));
      },
      onCompleted: async (result) => {
        if (extractedDocxImage && result.basics) {
          result.basics.image = extractedDocxImage;
        }

        const currentResume = useResumeStore.getState().resume;
        result.meta = {
          ...(currentResume.meta || {}),
          theme: {
            ...((currentResume.meta && currentResume.meta.theme) || {}),
            params: {
              ...((currentResume.meta &&
                currentResume.meta.theme &&
                currentResume.meta.theme.params) ||
                {}),
            },
            locale: resumeLocale,
          },
        };

        await importResume(setResume, result as Parameters<typeof importResume>[1], {
          clearAI: true,
          silent: true,
        });

        setStatus('success');
        addToast(t('ai.import_success'), 'success');

        const format =
          fileType === 'application/pdf'
            ? 'pdf'
            : fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ? 'docx'
              : 'text';

        analytics.track(ANALYTICS_EVENTS.CV_IMPORTED_AI, { format, mode: style, language });

        await refreshProfile();
        await syncUsageStatus();
      },
      onFailed: async (error) => {
        throw new Error(error || 'Parsing failed');
      },
      onPollError: (pollError) => {
        console.error(pollError);
        setStatus('error');
        setErrorMessage(t('common.error_occurred'));
      },
    });
  };

  return { handleParse, isStarting };
}
