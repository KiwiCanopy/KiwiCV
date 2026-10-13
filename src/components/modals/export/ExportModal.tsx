import { useState } from 'react';
import { CiExport } from 'react-icons/ci';

import {
  type ExportChromeState,
  ExportModalBody,
} from '@/components/modals/export/ExportModalBody';
import { readExportDraft } from '@/components/modals/export/exportDraft';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getProjectFilename } from '@/utils/export';
import { type FocusAnchor } from '@/utils/focus';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupRequired?: () => void;
  /**
   * Where focus goes when this dialog was opened by the gateway closing — the
   * reverse leg of the same enum swap.
   */
  restoreFocusTo?: FocusAnchor;
}

const IDLE_CHROME: ExportChromeState = { busy: false, name: '' };

export function ExportModal({
  isOpen,
  onClose,
  onSetupRequired,
  restoreFocusTo,
}: ExportModalProps) {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  // With a cover letter enabled the export is a résumé + letter package, so the
  // dialog title reflects the broader "application documents" it produces.
  const coverLetterEnabled = useResumeStore((state) => state.resume.coverLetter.enabled);

  // The body owns the name fields and the run; the frame needs exactly two
  // things out of it, so they are lifted rather than duplicating the state.
  const [chrome, setChrome] = useState<ExportChromeState>(IDLE_CHROME);

  // The body unmounts with the portal, so a reopen must not inherit the previous
  // run's busy flag. Adjusted during render rather than in an effect: an effect
  // would render the stale chrome once before correcting it.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setChrome(IDLE_CHROME);
  }

  const name = chrome.name || readExportDraft()?.base || getProjectFilename(resume);

  return (
    <DialogFrame
      open={isOpen}
      restoreFocusTo={restoreFocusTo}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        coverLetterEnabled
          ? t('sync.export_dialog.title_documents', { name })
          : t('sync.export_dialog.title', { name })
      }
      description={t('sync.export_dialog.description')}
      icon={<CiExport className="h-6 w-6" />}
      maxWidth="2xl"
      zIndexClassName="z-50"
      busy={chrome.busy}
    >
      {/* Body lives in a child so DialogFrame's Radix portal mounts it only
          while open — the name fields and the run state reset per open, and the
          module draft is what deliberately survives a setup detour. */}
      <ExportModalBody
        onClose={onClose}
        onSetupRequired={onSetupRequired}
        onChromeChange={setChrome}
      />
    </DialogFrame>
  );
}
