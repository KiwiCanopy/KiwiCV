import { useCallback, useRef, useState } from 'react';

import {
  type DestinationId,
  type ExportFormatId,
  type ExportRunState,
} from '@/components/modals/export/types';
import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import { buildExportArtifacts } from '@/hooks/export/buildExportArtifacts';
import { runDestination } from '@/hooks/export/destinationAdapters';
import { type SyncProviderId, useCloudSync } from '@/hooks/useCloudSync';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { type ResumeData } from '@/types/resume';

/** How long a fully successful export's toast stays, the dialog having closed (#34). */
export const ALL_OK_TOAST_MS = 10_000;

const IDLE_STATE: ExportRunState = {
  isRunning: false,
  rows: {},
  buildError: null,
  hasRun: false,
  outcome: null,
};

export interface UseExportRunParams {
  resume: ResumeData;
  formats: Record<ExportFormatId, boolean>;
}

export interface UseExportRun {
  state: ExportRunState;
  /** Destinations that finished, in row order. */
  succeeded: DestinationId[];
  /** Destinations a retry would target. */
  failed: DestinationId[];
  /** Polite live-region text. Empty while nothing has happened. */
  announcement: string;
  /** `postingUrl` is already normalized; `null` saves no link. */
  run: (ids: DestinationId[], projectName: string, postingUrl?: string | null) => Promise<void>;
}

/**
 * The sequencer behind the dialog's single trigger.
 *
 * Two acts. First the package is built once, before any destination is
 * touched, so a late failure never re-compiles and three destinations never pay
 * the Typst compile three times. Then the destinations run **serially** in row
 * order: the ZIP's download must not fire while a network push is mid-flight
 * and steal the tab's attention, and the per-row progress the dialog reports is
 * only legible with one active row.
 *
 * The loop never breaks. Every adapter returns a result rather than throwing,
 * so one failure leaves the others intact and the trigger can relabel to a
 * retry over exactly the failed set.
 */
export function useExportRun({ resume, formats }: UseExportRunParams): UseExportRun {
  const { t } = useTranslation();
  const { handleSync } = useCloudSync();
  const addToast = useToastStore((state) => state.addToast);
  const [state, setState] = useState<ExportRunState>(IDLE_STATE);
  // A state read inside the run closure would be the value captured when the
  // trigger was last rendered, which is exactly the double-submit this guards.
  const runningRef = useRef(false);
  const [announcement, setAnnouncement] = useState('');

  const run = useCallback(
    async (ids: DestinationId[], projectName: string, postingUrl: string | null = null) => {
      if (runningRef.current || ids.length === 0) return;
      runningRef.current = true;

      const total = ids.length;
      setState({
        isRunning: true,
        rows: Object.fromEntries(ids.map((id) => [id, { status: 'idle' as const }])),
        buildError: null,
        hasRun: false,
        outcome: null,
      });
      setAnnouncement(t('sync.export_dialog.progress', { done: 0, total }));

      // Idempotent, and the whole run is one export: pin the version once
      // rather than once per destination.
      useResumeStore.getState().syncVersion();

      try {
        const artifacts = await buildExportArtifacts({ resume, projectName, formats });

        const succeededIds: DestinationId[] = [];
        for (const id of ids) {
          setState((prev) => ({ ...prev, rows: { ...prev.rows, [id]: { status: 'running' } } }));

          const result = await runDestination(id, {
            artifacts,
            t,
            syncToCloud: (variant, providers: SyncProviderId[], mode) =>
              handleSync(variant, projectName, mode, { providers, artifacts, postingUrl }),
          });

          if (result.success) succeededIds.push(id);
          setState((prev) => ({
            ...prev,
            rows: {
              ...prev.rows,
              [id]: result.success ? { status: 'done' } : { status: 'failed', error: result.error },
            },
          }));
          setAnnouncement(
            t('sync.export_dialog.progress', {
              done: ids.indexOf(id) + 1,
              total,
            }),
          );
        }

        const themeMeta = getThemeMeta(resume.meta.theme.name);
        // One emission per run, replacing the download and cloud events that
        // used to fire from two competing workflows.
        analytics.track(ANALYTICS_EVENTS.EXPORT_PERFORMED, {
          type: 'export',
          formats: ['json', ...(formats.pdf ? ['pdf'] : []), ...(formats.html ? ['html'] : [])],
          providers: succeededIds,
          language: resume.meta.theme.locale,
          themeId: resume.meta.theme.name,
          paletteId: resume.meta.theme.params.palette,
          ...(themeMeta?.layout === 'two-column' && {
            sidebarPosition: resume.meta.content.order.twoColumn.sidebarPosition,
          }),
        });

        const done = succeededIds.length;
        const summary =
          done === total
            ? t('sync.export_dialog.result_all_ok', { count: total })
            : done === 0
              ? t('sync.export_dialog.result_all_failed')
              : t('sync.export_dialog.result_partial', { done, total });

        // Exactly one toast per run, so the result survives the user closing
        // the dialog. Every argument is a `t()` call — `i18n:literals` and the
        // bare-literal test both hunt `addToast` announcers.
        const outcome = done === total ? 'all_ok' : done === 0 ? 'failed' : 'partial';
        // The full success outlives the dialog, which closes on it (#34). The
        // toast regions stay audible under the modal: `aria-hidden` skips `[aria-live]`.
        if (outcome === 'all_ok') addToast(summary, 'success', ALL_OK_TOAST_MS);
        else addToast(summary, outcome === 'failed' ? 'error' : 'warning');
        setAnnouncement(summary);
        setState((prev) => ({ ...prev, isRunning: false, hasRun: true, outcome }));
      } catch (error) {
        // Act 1 failed: nothing was written anywhere, so every selected row
        // carries the same reason.
        const detail = error instanceof Error ? error.message : String(error);
        const message = t('sync.export_dialog.build_failed');
        setState({
          isRunning: false,
          hasRun: true,
          outcome: 'failed',
          buildError: detail,
          rows: Object.fromEntries(
            ids.map((id) => [id, { status: 'failed' as const, error: message }]),
          ),
        });
        addToast(message, 'error');
        setAnnouncement(message);
      } finally {
        runningRef.current = false;
      }
    },
    [addToast, formats, handleSync, resume, t],
  );

  const entries = Object.entries(state.rows) as [DestinationId, { status: string }][];

  return {
    state,
    succeeded: entries.filter(([, row]) => row.status === 'done').map(([id]) => id),
    failed: entries.filter(([, row]) => row.status === 'failed').map(([id]) => id),
    announcement,
    run,
  };
}
