import { useEffect, useRef } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useToastStore } from '@/store/ui/useToastStore';

/**
 * Announces a failed persist as a toast, at every viewport width.
 *
 * ⚠️ **The toast is the notice, not a duplicate of one.** `SaveStatusLine` is
 * `hidden lg:flex`, and `display:none` removes an element from the
 * accessibility tree as well as the screen — so below 1024px its `role="alert"`
 * never fires. A user could lose work with no signal at all, on exactly the
 * devices most likely to evict local storage.
 *
 * ⚠️ Fires on the TRANSITION into failure, not per failing write. `saveStatus`
 * stays `'error'` until a later write succeeds, so an unguarded effect would
 * stack a toast per keystroke. It re-arms once a save succeeds, because the
 * second failure of a session is as worth reporting as the first.
 *
 * Lives in its own module so the rule above can be tested. Reached through
 * `SaveStatusLine`, which is already subscribed to this status — effects run
 * normally in a CSS-hidden component, so mounting it there costs nothing and
 * avoids a second subscription.
 */
export const useSaveFailureToast = () => {
  const { t } = useTranslation();
  const saveStatus = useResumeStore((state) => state.saveStatus);
  const addToast = useToastStore((state) => state.addToast);
  const wasFailing = useRef(false);

  useEffect(() => {
    const failing = saveStatus === 'error';
    if (failing && !wasFailing.current) {
      // Longer than the 3s default: this one reports possible data loss, and it
      // is the only notice below `lg`.
      addToast(t('dashboard.save_status.error'), 'error', 10000);
    }
    wasFailing.current = failing;
  }, [saveStatus, addToast, t]);
};
