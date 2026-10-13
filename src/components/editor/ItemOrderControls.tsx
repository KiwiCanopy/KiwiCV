import { useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { LOCKED_BUTTON_CLASS, lockedButtonProps } from '@/components/ui/fieldLock';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ItemOrderControlsProps {
  itemLabel: string;
  position: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  /**
   * `inline` renders the two icon buttons beside the item. `menu` renders
   * full-width labelled rows for use inside an overflow menu, where the row
   * has no space for a permanent pair of controls.
   */
  variant?: 'inline' | 'menu';
  /**
   * The reason element of a list a pending AI proposal locks. Set, both buttons
   * are inert, out of the tab order and described by it.
   */
  lockedReasonId?: string;
}

export function ItemOrderControls({
  itemLabel,
  position,
  total,
  onMoveUp,
  onMoveDown,
  variant = 'inline',
  lockedReasonId,
}: ItemOrderControlsProps) {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const groupLabel = t('common.move_items');
  const canMoveUp = position > 1;
  const canMoveDown = position < total;
  const moveUpLabel = t('common.move_up_named', { name: itemLabel, position, total });
  const moveDownLabel = t('common.move_down_named', { name: itemLabel, position, total });

  const upRef = useRef<HTMLButtonElement>(null);
  const downRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef<'up' | 'down' | null>(null);
  const previousPositionRef = useRef(position);

  useLayoutEffect(() => {
    // Wait for the caller to actually commit the move. Callers guard their own
    // bounds and can silently decline, in which case position never changes and
    // nothing is announced — reporting success there would be a lie.
    if (position === previousPositionRef.current) return;
    previousPositionRef.current = position;

    // Position can also change because a sibling moved. Only the item the user
    // acted on should announce or take focus.
    const intent = pendingRef.current;
    if (!intent) return;
    pendingRef.current = null;

    setAnnouncement(t('common.moved_named', { name: itemLabel, position, total }));

    // Reordering relocates this control's DOM node, and reaching a boundary
    // disables the button that was just pressed. Both drop focus to <body>,
    // stranding a keyboard user mid-operation. Put focus back on the pressed
    // button, or its sibling when the boundary disabled it.
    const preferred = intent === 'up' ? upRef.current : downRef.current;
    const fallback = intent === 'up' ? downRef.current : upRef.current;
    const target = preferred && !preferred.disabled ? preferred : fallback;
    if (target && !target.disabled) {
      target.focus();
    }
  }, [position, total, itemLabel, t]);

  const handleMoveUp = () => {
    pendingRef.current = 'up';
    onMoveUp();
  };

  const handleMoveDown = () => {
    pendingRef.current = 'down';
    onMoveDown();
  };

  const liveRegion = (
    <span className="sr-only" role="status" aria-live="polite">
      {announcement}
    </span>
  );

  if (variant === 'menu') {
    return (
      <div role="group" aria-label={groupLabel} className="flex flex-col">
        <Button
          ref={upRef}
          variant="quiet"
          size="sm"
          disabled={!canMoveUp}
          onClick={handleMoveUp}
          aria-label={moveUpLabel}
          className="w-full justify-start"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          {t('common.move_up')}
        </Button>
        <Button
          ref={downRef}
          variant="quiet"
          size="sm"
          disabled={!canMoveDown}
          onClick={handleMoveDown}
          aria-label={moveDownLabel}
          className="w-full justify-start"
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          {t('common.move_down')}
        </Button>
        {liveRegion}
      </div>
    );
  }

  const inertProps = lockedButtonProps(lockedReasonId);
  const inertClass = cn(lockedReasonId !== undefined && LOCKED_BUTTON_CLASS);

  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={groupLabel}>
      <IconButton
        ref={upRef}
        label={moveUpLabel}
        variant="quiet"
        disabled={!canMoveUp}
        onClick={handleMoveUp}
        className={inertClass}
        {...inertProps}
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      <IconButton
        ref={downRef}
        label={moveDownLabel}
        variant="quiet"
        disabled={!canMoveDown}
        onClick={handleMoveDown}
        className={inertClass}
        {...inertProps}
      >
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      {liveRegion}
    </div>
  );
}
