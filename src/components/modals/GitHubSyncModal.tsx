import { useState } from 'react';
import { SiGithub } from 'react-icons/si';

import { GitHubPatFields } from '@/components/modals/github-sync/GitHubPatFields';
import { GitHubSyncModalFooter } from '@/components/modals/github-sync/GitHubSyncModalFooter';
import type { GitHubSyncModalProps } from '@/components/modals/github-sync/types';
import { useGitHubConnect } from '@/components/modals/github-sync/useGitHubConnect';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { anchorById } from '@/utils/focus';
import { CircleAlert } from 'lucide-react';

/**
 * Mounting the content only while open is what resets the connection form
 * between openings — Radix used to do that by unmounting `Dialog.Content`.
 * The frame moves inside the content because it needs the loading flag the
 * content's hook drives.
 */
export function GitHubSyncModal({ isOpen, onClose, onBack, onConnected }: GitHubSyncModalProps) {
  if (!isOpen) return null;

  return <GitHubSyncModalContent onClose={onClose} onBack={onBack} onConnected={onConnected} />;
}

function GitHubSyncModalContent({
  onClose,
  onBack,
  onConnected,
}: Omit<GitHubSyncModalProps, 'isOpen'>) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  // Read here, never drilled — an optional prop a second renderer could omit
  // would silently break focus restoration (`GoogleAuthModal` does the same).
  const restoreFocusToId = useFlowStore((state) => state.auth.restoreFocusToId);
  const {
    pat,
    setPat,
    repoUrl,
    setRepoUrl,
    rememberPat,
    setRememberPat,
    status,
    errorMessage,
    showPat,
    setShowPat,
    handleConnect,
  } = useGitHubConnect({ setIsLoading, onConnected, onClose });

  return (
    <DialogFrame
      open
      onOpenChange={(open) => !open && onClose()}
      restoreFocusTo={restoreFocusToId ? anchorById(restoreFocusToId) : undefined}
      title={t('settings.github.modal_title')}
      icon={<SiGithub className="h-6 w-6" />}
      description={t('settings.github.modal_description')}
      busy={isLoading}
      maxWidth="2xl"
      zIndexClassName="z-[90]"
    >
      <div className="space-y-4">
        <GitHubPatFields
          pat={pat}
          setPat={setPat}
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          rememberPat={rememberPat}
          setRememberPat={setRememberPat}
          showPat={showPat}
          setShowPat={setShowPat}
          isDisabled={isLoading || status === 'success'}
        />

        {status === 'error' && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-4 py-3 text-sm">
            <CircleAlert className="h-4 w-4 flex-shrink-0" />
            <p className="leading-tight">{errorMessage}</p>
          </div>
        )}

        <GitHubSyncModalFooter
          status={status}
          isLoading={isLoading}
          canConnect={!!pat && !!repoUrl}
          onConnect={() => void handleConnect()}
          onBack={onBack}
          onClose={onClose}
        />
      </div>
    </DialogFrame>
  );
}
