import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ExportNameFields } from '@/components/modals/export/ExportNameFields';
import { ExportRunFooter } from '@/components/modals/export/ExportRunFooter';
import { CloudSetupRow } from '@/components/modals/export/destinations/CloudSetupRow';
import { DestinationList } from '@/components/modals/export/destinations/DestinationList';
import { HostingPathField } from '@/components/modals/export/destinations/HostingPathField';
import { PackageSummary } from '@/components/modals/export/package/PackageSummary';
import { useExportDestinations } from '@/components/modals/export/useExportDestinations';
import { useExportRun } from '@/components/modals/export/useExportRun';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { clearExportDraft, readExportDraft, writeExportDraft } from '@/hooks/export/exportDraft';
import { useSyncAuthGateway } from '@/hooks/sync/useSyncAuthGateway';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { normalizePostingUrl } from '@/utils/applicationMeta';
import { constructBackupFilename, getCleanProjectName, getProjectFilename } from '@/utils/export';
import { localizedPath } from '@/utils/localeRouting';

export interface ExportChromeState {
  busy: boolean;
  name: string;
}

interface ExportModalBodyProps {
  onClose: () => void;
  onSetupRequired?: () => void;
  /** Lifts the two things the dialog frame has to know: its name and its busy flag. */
  onChromeChange: (chrome: ExportChromeState) => void;
}

/**
 * Configure, then one trigger.
 *
 * ⚠️ Closes on its own only when every destination succeeded; the toast,
 * kept `ALL_OK_TOAST_MS`, carries the result (owner, 2026-10-24, #34). Any failure keeps the
 * per-destination report and Retry on screen.
 */
export function ExportModalBody({
  onClose,
  onSetupRequired,
  onChromeChange,
}: ExportModalBodyProps) {
  const { t, uiLanguage } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const suggestedBase = getProjectFilename(resume);

  // Restored from the module draft so a detour through the cloud gateway — which
  // unmounts this dialog, `activeSyncModal` being a single enum — does not lose
  // what was typed.
  const draft = readExportDraft();
  const [base, setBase] = useState(draft?.base ?? suggestedBase);
  const [company, setCompany] = useState(draft?.company ?? '');
  const [position, setPosition] = useState(draft?.position ?? '');
  const [postingUrl, setPostingUrl] = useState(draft?.postingUrl ?? '');

  const { destinations, selected, showCloudSetup, formats, toggleDestination, toggleFormat } =
    useExportDestinations();
  const { ensureConnected } = useSyncAuthGateway();

  const projectName = constructBackupFilename(base, company, position, resume.meta.theme.name);
  const preview = getCleanProjectName(projectName);

  const { state, failed, announcement, run } = useExportRun({ resume, formats });

  // Mounts only while the dialog is open (rendered inside DialogFrame's
  // portal), so this fires once per open.
  useEffect(() => {
    analytics.track(ANALYTICS_EVENTS.EXPORT_MODAL_OPENED, {
      language: resume.meta.theme.locale,
    });
  }, [resume.meta.theme.locale]);

  useEffect(() => {
    writeExportDraft({ base, company, position, postingUrl });
  }, [base, company, position, postingUrl]);

  useEffect(() => {
    onChromeChange({ busy: state.isRunning, name: base });
  }, [onChromeChange, state.isRunning, base]);

  const attempted = Object.keys(state.rows).length;
  const finished = Object.values(state.rows).filter(
    (row) => row?.status === 'done' || row?.status === 'failed',
  ).length;
  const isRetry = state.hasRun && failed.length > 0;
  const targets = isRetry ? failed : selected;

  const handleSetup = () => {
    ensureConnected({
      mode: 'push',
      // Unreachable from this row — it only renders while nothing is connected —
      // but `ensureConnected` requires the branch, and leaving the dialog open
      // is the right answer if the state changes underneath it.
      onSuccess: () => {},
      onSetupRequired: () => onSetupRequired?.(),
      // ⚠️ This closes the dialog `Set up` lives in and opens the auth modal in
      // one state update, so the control `DialogFrame` captured is gone by the
      // time that modal closes. The anchor is the OUTER flow's starting control
      // — the header's Export button — not this row's.
      onInterrupt: () => onClose(),
      restoreFocusToId: EXPORT_TRIGGER_ANCHOR_ID,
    });
  };

  const handleCancel = () => {
    clearExportDraft();
    onClose();
  };

  // Layout, not passive: the idle footer must never paint over all-done rows.
  // Once only — callers pass a fresh `onClose` each render, which would re-fire
  // this in the commit that unmounts the body.
  const closedRef = useRef(false);
  const allOk = state.outcome === 'all_ok';
  useLayoutEffect(() => {
    if (!allOk || closedRef.current) return;
    closedRef.current = true;
    clearExportDraft();
    onClose();
  }, [allOk, onClose]);

  return (
    <div className="space-y-4">
      <ExportNameFields
        base={base}
        company={company}
        position={position}
        postingUrl={postingUrl}
        showPostingUrl={selected.some((id) => id === 'github_repo' || id === 'google_drive')}
        preview={preview}
        suggestedBase={suggestedBase}
        disabled={state.isRunning}
        onBaseChange={setBase}
        onCompanyChange={setCompany}
        onPositionChange={setPosition}
        onPostingUrlChange={setPostingUrl}
      />

      <PackageSummary formats={formats} disabled={state.isRunning} onToggleFormat={toggleFormat} />

      <div className="space-y-2">
        <p className="text-muted-foreground/80 px-1 text-[10px] font-black tracking-widest uppercase">
          {t('sync.export_dialog.send_to')}
        </p>

        <DestinationList
          destinations={destinations}
          rows={state.rows}
          locked={state.isRunning}
          onToggle={toggleDestination}
          extras={{ github_pages: <HostingPathField disabled={state.isRunning} /> }}
        />

        {showCloudSetup ? (
          <CloudSetupRow onSetup={handleSetup} disabled={state.isRunning} />
        ) : (
          <p className="text-muted-foreground/70 px-1 text-[11px] leading-relaxed">
            {t('sync.export_dialog.connected_only')}{' '}
            <Link
              to={localizedPath(uiLanguage, `/settings#sync`)}
              className="text-primary-strong font-bold underline-offset-4 hover:underline"
            >
              {t('sync.export_dialog.manage_link')}
            </Link>
          </p>
        )}
      </div>

      <ExportRunFooter
        count={targets.length}
        total={attempted}
        done={finished}
        isRunning={state.isRunning}
        isRetry={isRetry}
        canRun={preview.trim().length > 0}
        announcement={announcement}
        buildFailed={state.buildError !== null}
        onCancel={handleCancel}
        onRun={() => void run(targets, projectName, normalizePostingUrl(postingUrl))}
      />
    </div>
  );
}
