import { useCallback, useEffect, useState } from 'react';

import { type ImportStyle } from '@/components/modals/ai/import/types';
import { useAIImportFile } from '@/components/modals/ai/import/useAIImportFile';
import { useAIImportJob } from '@/components/modals/ai/import/useAIImportJob';
import { type AIStatus } from '@/components/modals/ai/template/statusTypes';
import { AI_PRO_DAILY_LIMIT } from '@/constants/ai';
import { useAuth } from '@/hooks/useAuth';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { fetchAIUsageStatus } from '@/utils/ai';

export type { ImportStyle } from '@/components/modals/ai/import/types';

export const useAIImport = () => {
  const { session, isPremium } = useAuth();
  const step = useFlowStore((state) => state.import.step);
  const setStep = useFlowStore((state) => state.setImportStep);
  const resetImport = useFlowStore((state) => state.resetImport);
  const allowReorg = useFlowStore((state) => state.import.allowReorg);
  const setAllowReorg = useFlowStore((state) => state.setImportAllowReorg);
  const sourceLanguage = useFlowStore((state) => state.import.sourceLanguage);
  const setSourceLanguage = useFlowStore((state) => state.setImportSourceLanguage);
  // `|| ''` covers a session persisted before this field existed: the store is
  // sessionStorage-backed and rehydrates `import` as a whole object.
  const sourceLanguageOther = useFlowStore((state) => state.import.sourceLanguageOther || '');
  const setSourceLanguageOther = useFlowStore((state) => state.setImportSourceLanguageOther);
  const targetLanguage = useFlowStore((state) => state.import.targetLanguage);
  const setTargetLanguage = useFlowStore((state) => state.setImportTargetLanguage);
  const isTranslationEnabled = useFlowStore((state) => state.import.isTranslationEnabled);
  const setIsTranslationEnabled = useFlowStore((state) => state.setImportIsTranslationEnabled);
  const customInstructions = useFlowStore((state) => state.import.customInstructions);
  const setCustomInstructions = (value: string) =>
    useFlowStore.getState().setImportCustomInstructions(value);
  const fileName = useFlowStore((state) => state.import.fileName);

  const [status, setStatus] = useState<AIStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  // Set from a worker refusal's own code, which outranks a possibly stale usage count.
  const [refusedMode, setRefusedMode] = useState<'limit' | 'generic' | null>(null);
  const [activeStyle, setActiveStyle] = useState<ImportStyle | null>(null);
  const [proRequestsToday, setProRequestsToday] = useState<number | null>(null);
  const [isResolvingUsage, setIsResolvingUsage] = useState(false);
  const { extractedDocxImage, handleFileChange, resetFileState } = useAIImportFile();

  const isDailyLimitReached = isPremium && (proRequestsToday || 0) >= AI_PRO_DAILY_LIMIT;
  const needsUpgrade = !isPremium || isDailyLimitReached;

  useEffect(() => {
    if (!isPremium || !session?.access_token) return;

    let isMounted = true;
    const loadUsageStatus = async () => {
      setIsResolvingUsage(true);
      try {
        const usageStatus = await fetchAIUsageStatus();
        if (isMounted) setProRequestsToday(usageStatus.proRequestsToday);
      } catch (error) {
        console.error('Failed to fetch AI import usage status:', error);
      } finally {
        if (isMounted) setIsResolvingUsage(false);
      }
    };

    loadUsageStatus();
    return () => {
      isMounted = false;
    };
  }, [isPremium, session?.access_token]);

  useEffect(() => {
    if (step === 'processing' && status === 'idle') setStep('style');
  }, [setStep, status, step]);

  const resetState = useCallback(() => {
    resetImport();
    setStatus('idle');
    setErrorMessage('');
    setActiveStyle(null);
    resetFileState();
  }, [resetFileState, resetImport]);

  const syncUsageStatus = useCallback(async () => {
    if (!isPremium) {
      setProRequestsToday(0);
      return { proRequestsToday: 0, isDailyLimitReached: false };
    }

    setIsResolvingUsage(true);
    try {
      const usageStatus = await fetchAIUsageStatus();
      setProRequestsToday(usageStatus.proRequestsToday);
      return usageStatus;
    } catch (error) {
      console.error('Failed to refresh AI import usage status:', error);
      return { proRequestsToday: proRequestsToday || 0, isDailyLimitReached };
    } finally {
      setIsResolvingUsage(false);
    }
  }, [isDailyLimitReached, isPremium, proRequestsToday]);

  const { handleParse, isStarting } = useAIImportJob({
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
  });
  const handleStyleSelect = (style: ImportStyle) => {
    if (needsUpgrade) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setActiveStyle(style);
  };

  return {
    step,
    setStep,
    status,
    errorMessage,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeModalMode: refusedMode ?? (isDailyLimitReached ? 'limit' : 'generic'),
    closeUpgradeModal: () => {
      setIsUpgradeModalOpen(false);
      setRefusedMode(null);
    },
    activeStyle,
    setActiveStyle,
    fileName,
    customInstructions,
    setCustomInstructions,
    needsUpgrade,
    isDailyLimitReached,
    isResolvingUsage,
    proRequestsToday,
    handleFileChange,
    handleParse,
    isStarting,
    handleStyleSelect,
    allowReorg,
    setAllowReorg,
    sourceLanguage,
    setSourceLanguage,
    sourceLanguageOther,
    setSourceLanguageOther,
    targetLanguage,
    setTargetLanguage,
    isTranslationEnabled,
    setIsTranslationEnabled,
    resetState,
  };
};

export type AIImportContext = ReturnType<typeof useAIImport>;
