import { useEffect } from 'react';

import { useAIRunner } from '@/components/modals/ai/edit/useAIRunner';
import { useResumeStore } from '@/store/resume/useResumeStore';

/**
 * The modal's view of `useAIRunner`: the same run, gated on the modal being
 * open, plus the one side effect that belongs to opening a modal rather than to
 * a run.
 */
export const useAIEdit = () => {
  const isOpen = useResumeStore((state) => state.ai.isModalOpen);
  const autoRun = useResumeStore((state) => state.ai.autoRun);
  const clearUpdatedTargets = useResumeStore((state) => state.clearUpdatedTargets);

  const runner = useAIRunner({ enabled: isOpen });

  // ⚠️ Stays here, not in the runner. It clears the "just changed" highlight for
  // the surface the user is about to look at, so it must fire when the modal
  // mounts — not on every editor mount, which is where the composer's runner
  // lives.
  useEffect(() => {
    clearUpdatedTargets();
  }, [clearUpdatedTargets]);

  return { isOpen, autoRun, ...runner };
};
