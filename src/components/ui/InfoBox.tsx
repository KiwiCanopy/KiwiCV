import React, { useCallback, useId, useRef, useState } from 'react';

import { FloatingTooltip } from '@/components/ui/FloatingTooltip';
import { useHoverGrace } from '@/components/ui/useHoverGrace';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { isKeyboardActivation, nextTabbableAfter, tabbablesIn } from '@/utils/focus';

interface InfoBoxProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  width?: string;
  italic?: boolean;
  interactive?: boolean;
  /** Accessible name for the trigger. Defaults to the generic "More information". */
  label?: string;
}

export const InfoBox = ({
  children,
  content,
  position = 'top',
  className = '',
  width = 'w-64',
  italic = true,
  interactive = false,
  label,
}: InfoBoxProps) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openedByFocusRef = useRef(false);
  const restoringFocusRef = useRef(false);
  const tooltipId = useId();
  const triggerId = useId();
  const [isVisible, setIsVisible] = useState(false);
  // A modal's focus trap bounces focus from anything outside it, so the surface
  // portals into the dialog that holds the trigger rather than into `body`.
  const [modalHost, setModalHost] = useState<HTMLElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    setModalHost(node?.closest<HTMLElement>('[role="dialog"], [role="alertdialog"]') ?? null);
  }, []);
  const isSmallScreen = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
  const effectivePos =
    isSmallScreen && (position === 'left' || position === 'right') ? 'top' : position;

  const grace = useHoverGrace();
  const hide = useCallback(() => setIsVisible(false), []);
  // WCAG 1.4.13 persistent: the pointer leaving does not hide what focus is holding open.
  const hideUnlessFocused = useCallback(() => {
    const active = document.activeElement;
    if (triggerRef.current?.contains(active) || tooltipRef.current?.contains(active)) return;
    setIsVisible(false);
  }, []);

  const handleMouseEnter = () => {
    grace.cancel();
    setIsVisible(true);
  };
  const handleMouseLeave = () => grace.schedule(hideUnlessFocused);

  // The click suppression that used to hide invalid nesting is gone, so the
  // failure mode changed from "the ancestor's action is swallowed" to "the
  // ancestor's action runs". Neither TypeScript nor ESLint can see through a
  // component boundary to catch it, so check the rendered structure in dev.
  React.useEffect(() => {
    if (!import.meta.env.DEV) return;

    const offender = triggerRef.current?.parentElement?.closest('label, a, button');
    if (offender) {
      console.error(
        `InfoBox: the trigger is nested inside <${offender.tagName.toLowerCase()}>. ` +
          'Render it as a sibling instead — see FieldLabel.',
      );
    }
  }, []);

  // Escape returns focus only from inside the tooltip; a hover-opened one leaves it where it is.
  const dismiss = useCallback(() => {
    setIsVisible(false);
    if (!tooltipRef.current?.contains(document.activeElement)) return;
    restoringFocusRef.current = true;
    triggerRef.current?.focus();
    restoringFocusRef.current = false;
  }, []);

  // The surface is portalled to the end of `body` or of the dialog, so Tab order is
  // bridged by hand: into it from the trigger, and out of it to whatever follows the
  // trigger. The surface itself (focused by a click on its text) counts as both ends.
  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!interactive || !isVisible || event.shiftKey) return;
    if (event.key !== 'Tab' && event.key !== 'ArrowDown') return;
    const first = tooltipRef.current && tabbablesIn(tooltipRef.current)[0];
    if (!first) return;
    // Stopped too, or a modal's focus scope reads the moved focus as its last stop and wraps.
    event.preventDefault();
    event.stopPropagation();
    first.focus();
  };

  const handleTooltipKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab' || !tooltipRef.current || !triggerRef.current) return;
    const inside = tabbablesIn(tooltipRef.current);
    const active = document.activeElement;
    const onSurface = active === tooltipRef.current;
    if (event.shiftKey && (onSurface || active === inside[0])) {
      event.preventDefault();
      event.stopPropagation();
      triggerRef.current.focus();
    } else if (!event.shiftKey && (onSurface || active === inside.at(-1))) {
      const next = nextTabbableAfter(triggerRef.current, tooltipRef.current);
      setIsVisible(false);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      next.focus();
    }
  };

  return (
    <div
      className={cn('group relative flex inline-flex items-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={setTriggerRef}
        id={triggerId}
        type="button"
        aria-label={label || t('common.more_information')}
        aria-expanded={interactive ? isVisible : undefined}
        aria-controls={interactive && isVisible ? tooltipId : undefined}
        aria-describedby={interactive ? undefined : tooltipId}
        onClick={(event) => {
          // No preventDefault or stopPropagation here. Both were added because
          // consumers nested this trigger inside a <label> or a <Link>, and
          // suppressing the click masked that instead of fixing it — which is
          // how the Data Management help icon ended up killing its own link.
          // Every consumer now renders the trigger as a sibling (see
          // FieldLabel), so a consumer that needs suppression has a structural
          // problem to fix rather than a flag to set.
          if (!isKeyboardActivation(event) && openedByFocusRef.current) {
            openedByFocusRef.current = false;
            setIsVisible(true);
            return;
          }
          openedByFocusRef.current = false;
          setIsVisible((visible) => !visible);
        }}
        onKeyDown={handleTriggerKeyDown}
        onFocus={() => {
          // The focus `dismiss` hands back must not reopen what it just closed.
          if (restoringFocusRef.current) return;
          openedByFocusRef.current = true;
          setIsVisible(true);
        }}
        onBlur={(event) => {
          openedByFocusRef.current = false;
          if (interactive && tooltipRef.current?.contains(event.relatedTarget as Node)) return;
          setIsVisible(false);
        }}
        // ⚠️ A 24px FLOOR — WCAG 2.2 AA's target minimum (2.5.8) — and
        // deliberately NOT an outward-bleeding overlay. A fixed box clipped any
        // child wider than an icon; the floor grows in flow instead.
        //
        // It was `min-h-11 min-w-11`, which made every label row carrying a hint
        // 44px tall instead of 20px; `items-center` then pushed the label down
        // 12px and its control down 24px, so a field with a hint sat visibly
        // below the one beside it. Replacing that with `after:-inset-3` fixed
        // the row but bled 12px past the button on all sides: it covered the top
        // edge of the Skills "Level" select below, so clicking there opened this
        // tooltip instead of the dropdown, and it clipped the badge beside it.
        //
        // Growth here is in flow — no pseudo-element, no negative inset, no
        // positioning — so it displaces siblings and can never paint over them,
        // which is the overlap it guards against. `FieldLabel` floors every row
        // at `min-h-6` so hinted and unhinted rows match regardless.
        className="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-transparent p-0 text-inherit"
      >
        {children}
      </button>

      {/* A non-interactive surface stays mounted (invisible) while closed, so the
          description resolves on first focus; a group mounts only while open. */}
      {(isVisible || !interactive) && (
        <FloatingTooltip
          id={tooltipId}
          ref={tooltipRef}
          anchorRef={triggerRef}
          container={modalHost}
          open={isVisible}
          side={effectivePos}
          arrow
          role={interactive ? 'group' : 'tooltip'}
          // A group needs a name of its own; a tooltip's is its content.
          aria-labelledby={interactive ? triggerId : undefined}
          remeasureKey={content}
          onDismiss={dismiss}
          onOutsidePress={hide}
          tabIndex={interactive ? -1 : undefined}
          // Hoverable either way (WCAG 1.4.13): the pointer may cross onto the surface.
          onMouseEnter={grace.cancel}
          onMouseLeave={handleMouseLeave}
          onKeyDown={interactive ? handleTooltipKeyDown : undefined}
          onClick={(event) => {
            // Acting on a control inside the tooltip is done with it.
            if ((event.target as HTMLElement).closest('button, a')) setIsVisible(false);
          }}
          onBlur={(event) => {
            if (
              triggerRef.current?.contains(event.relatedTarget as Node) ||
              tooltipRef.current?.contains(event.relatedTarget as Node)
            ) {
              return;
            }
            setIsVisible(false);
          }}
          className={cn(
            'pointer-events-auto',
            'max-w-[calc(100vw-24px)] shrink-0 rounded-lg p-3 shadow-xl',
            width,
            'text-start break-words whitespace-normal',
          )}
        >
          <div
            className={cn('text-popover-foreground text-xs leading-relaxed', italic && 'italic')}
          >
            {content}
          </div>
        </FloatingTooltip>
      )}
    </div>
  );
};
