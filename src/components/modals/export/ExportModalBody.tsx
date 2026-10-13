import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ExportNameFields } from '@/components/modals/export/ExportNameFields';
import { ExportRunFooter } from '@/components/modals/export/ExportRunFooter';
import { CloudSetupRow } from '@/components/modals/export/destinations/CloudSetupRow';
import { DestinationList } from '@/components/modals/export/destinations/DestinationList';
import { HostingPathField } from '@/components/modals/export/destinations/HostingPathField';
import {
  clearExportDraft,
  readExportDraft,
  writeExportDraft,
} from '@/components/modals/export/exportDraft';
import { PackageSummary } from '@/components/modals/export/package/PackageSummary';
import { useExportDestinations } from '@/components/modals/export/useExportDestinations';
import { useExportRun } from '@/components/modals/export/useExportRun';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useSyncAuthGateway } from '@/hooks/sync/useSyncAuthGateway';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
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
 * The dialog never closes on its own. A ZIP download has just fired and a
 * per-destination report has just been written; vanishing it would repeat the
 * old auto-close defect in a new costume.
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

  const { destinations, selected, showCloudSetup, formats, toggleDestination, toggleFormat } =
    useExportDestinations();
  const { ensureConnected } = useSyncAuthGateway();

  const projectName = constructBackupFilename(base, company, position, resume.meta.theme.name);
  const preview = getCleanProjectName(projectName);

  const { state, succeeded, failed, announcement, run } = useExportRun({ resume, formats });

  // Mounts only while the dialog is open (rendered inside DialogFrame's
  // portal), so this fires once per open.
  useEffect(() => {
    analytics.track(ANALYTICS_EVENTS.EXPORT_MODAL_OPENED, {
      language: resume.meta.theme.locale,
    });
  }, [resume.meta.theme.locale]);

  useEffect(() => {
    writeExportDraft({ base, company, position });
  }, [base, company, position]);

  useEffect(() => {
    onChromeChange({ busy: state.isRunning, name: base });
  }, [onChromeChange, state.isRunning, base]);

  const attempted = Object.keys(state.rows).length;
  const finished = Object.values(state.rows).filter(
    (row) => row?.status === 'done' || row?.status === 'failed',
  ).length;
  const isComplete = state.hasRun && attempted > 0 && failed.length === 0;
  const isRetry = state.hasRun && failed.length > 0;
  const targets = isRetry ? failed : selected.filter((id) => !succeeded.includes(id));

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

  const handleDone = () => {
    clearExportDraft();
    onClose();
  };

  return (
    <div className="space-y-4">
      <ExportNameFields
        base={base}
        company={company}
        position={position}
        preview={preview}
        suggestedBase={suggestedBase}
        disabled={state.isRunning}
        onBaseChange={setBase}
        onCompanyChange={setCompany}
        onPositionChange={setPosition}
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
        isComplete={isComplete}
        isRetry={isRetry}
        canRun={preview.trim().length > 0}
        announcement={announcement}
        buildFailed={state.buildError !== null}
        onCancel={handleCancel}
        onRun={() => void run(targets, projectName)}
        onDone={handleDone}
      />
    </div>
  );
}
