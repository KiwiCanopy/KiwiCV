import { type RefObject, useMemo, useState } from 'react';

import type { PassthroughBlock } from '@/features/raw-json/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import type { FocusAnchor } from '@/utils/focus';

/** Marks each row's remove button, read positionally for the focus handoff. */
export const PASSTHROUGH_REMOVE_ATTR = 'data-passthrough-remove';

const EMPTY: Record<string, unknown> = {};

const byteLength = (value: unknown): number =>
  new TextEncoder().encode(JSON.stringify(value) ?? '').length;

/**
 * The remove button now at `index` (clamped, so removing the last row offers
 * the one before it), else the panel's own disclosure trigger — the first
 * `aria-expanded` button in it — which outlives every row because the panel
 * stays mounted once something was removed.
 */
const removeAnchor =
  (container: RefObject<HTMLElement | null>, index: number): FocusAnchor =>
  () => {
    const root = container.current;
    const buttons = [
      ...(root?.querySelectorAll<HTMLElement>(`[${PASSTHROUGH_REMOVE_ATTR}]`) ?? []),
    ];
    return (
      buttons[Math.min(index, buttons.length - 1)] ??
      root?.querySelector<HTMLElement>('button[aria-expanded]')
    );
  };

export const usePassthroughPanel = (container: RefObject<HTMLElement | null>) => {
  const { t } = useTranslation();
  const passthrough = useResumeStore((state) => state.resume.passthrough ?? EMPTY);
  const removePassthroughBlock = useResumeStore((state) => state.removePassthroughBlock);
  const confirm = useConfirmStore((state) => state.confirm);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);

  const blocks = useMemo<PassthroughBlock[]>(
    () =>
      Object.entries(passthrough).map(([key, value]) => ({
        key,
        value,
        bytes: byteLength(value),
      })),
    [passthrough],
  );

  const remove = async (key: string, index: number) => {
    const confirmed = await confirm({
      title: t('raw_json.passthrough.remove_confirm_title', { name: key }),
      message: t('raw_json.passthrough.remove_confirm_message'),
      confirmText: t('common.remove'),
      variant: 'destructive',
      restoreFocusTo: removeAnchor(container, index),
    });
    if (!confirmed) return;
    removePassthroughBlock(key);
    setLastRemoved(key);
  };

  return { blocks, lastRemoved, remove };
};
