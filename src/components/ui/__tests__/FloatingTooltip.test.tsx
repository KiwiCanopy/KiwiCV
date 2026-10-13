// @vitest-environment jsdom
import { useRef } from 'react';

import { type FloatingSide, FloatingTooltip } from '@/components/ui/FloatingTooltip';
import { InfoBox } from '@/components/ui/InfoBox';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The shared floating surface behind `InfoBox` and the Improve button's refusal
 * reason. Placement is pinned against a 1024x700 viewport and a 200x40 surface.
 */

afterEach(() => vi.restoreAllMocks());

function Harness({
  open,
  side,
  arrow,
  onDismiss,
  onOutsidePress,
}: {
  open: boolean;
  side?: FloatingSide;
  arrow?: boolean;
  onDismiss?: () => void;
  onOutsidePress?: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchorRef} aria-describedby="tip">
        Anchor
      </button>
      <FloatingTooltip
        id="tip"
        anchorRef={anchorRef}
        open={open}
        side={side}
        arrow={arrow}
        onDismiss={onDismiss}
        onOutsidePress={onOutsidePress}
      >
        Why
      </FloatingTooltip>
    </>
  );
}

const stubLayout = (anchorTop: number, anchorLeft: number) => {
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(700);
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: anchorTop,
    bottom: anchorTop + 20,
    left: anchorLeft,
    right: anchorLeft + 20,
    width: 20,
    height: 20,
    x: anchorLeft,
    y: anchorTop,
    toJSON: () => ({}),
  });
};

const tip = () => document.getElementById('tip')!;

describe('FloatingTooltip', () => {
  it('stays in the document while closed, so a description resolves before the first hover', () => {
    render(<Harness open={false} />);
    expect(tip().getAttribute('role')).toBe('tooltip');
    expect(tip().className).toContain('invisible');
    expect(screen.getByRole('button', { name: 'Anchor' }).getAttribute('aria-describedby')).toBe(
      'tip',
    );
    // Portalled out of the anchor's parent.
    expect(screen.getByRole('button').parentElement?.contains(tip())).toBe(false);
  });

  it('centres above the anchor with room for its arrow', () => {
    stubLayout(300, 500);
    render(<Harness open side="top" arrow />);
    expect(tip().className).not.toContain('invisible');
    expect(parseFloat(tip().style.top)).toBe(300 - 12 - 40);
    expect(parseFloat(tip().style.left)).toBe(500 + 10 - 100);
    expect(tip().querySelector('[aria-hidden="true"]')?.className).toContain('top-full');
  });

  it('flips below when there is no room above, and the arrow follows', () => {
    stubLayout(20, 500);
    render(<Harness open side="top" arrow />);
    expect(parseFloat(tip().style.top)).toBe(20 + 20 + 12);
    expect(tip().querySelector('[aria-hidden="true"]')?.className).toContain('bottom-full');
  });

  it('clamps into the viewport and shifts the arrow back onto the anchor', () => {
    stubLayout(300, 0);
    render(<Harness open side="top" arrow />);
    // Ideal left is 10 - 100 = -90; clamped to the 8px edge, a 98px shift.
    expect(parseFloat(tip().style.left)).toBe(8);
    expect(tip().querySelector<HTMLElement>('[aria-hidden="true"]')?.style.left).toBe(
      'calc(50% - 98px)',
    );
  });

  it('dismisses on Escape and on a press outside, but not on one inside', () => {
    const onDismiss = vi.fn();
    const onOutsidePress = vi.fn();
    render(<Harness open onDismiss={onDismiss} onOutsidePress={onOutsidePress} />);

    fireEvent.pointerDown(tip());
    fireEvent.pointerDown(screen.getByRole('button'));
    expect(onOutsidePress).not.toHaveBeenCalled();
    fireEvent.pointerDown(document.body);
    expect(onOutsidePress).toHaveBeenCalledOnce();

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe('InfoBox on the shared surface', () => {
  const renderInfoBox = () =>
    render(
      <InfoBox content="Backups live in your own cloud">
        <span aria-hidden="true">?</span>
      </InfoBox>,
    );
  const trigger = () => screen.getByRole('button', { name: 'More information' });
  // Mounted while closed; jsdom applies no stylesheet, so `invisible` is read off the class.
  const isShown = () => !screen.getByRole('tooltip').className.includes('invisible');

  it('describes its trigger before the first focus, and hides the tooltip when closed', () => {
    renderInfoBox();
    const tooltip = screen.getByRole('tooltip');
    expect(isShown()).toBe(false);
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(tooltip.textContent).toBe('Backups live in your own cloud');
    fireEvent.focus(trigger());
    expect(isShown()).toBe(true);
    // The arrow is drawn once placed.
    expect(tooltip.querySelector('[aria-hidden="true"]')).not.toBeNull();
    fireEvent.blur(trigger());
    expect(isShown()).toBe(false);
  });

  it('closes on Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    renderInfoBox();
    await user.click(trigger());
    expect(isShown()).toBe(true);
    await user.keyboard('{Escape}');
    expect(isShown()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on a press outside', () => {
    renderInfoBox();
    fireEvent.mouseEnter(trigger().parentElement!);
    expect(isShown()).toBe(true);
    fireEvent.pointerDown(document.body);
    expect(isShown()).toBe(false);
  });
});
