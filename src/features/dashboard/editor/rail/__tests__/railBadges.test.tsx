// @vitest-environment jsdom
import { SectionRailRow } from '@/features/dashboard/editor/rail/SectionRailRow';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const renderRow = (props: Partial<Parameters<typeof SectionRailRow>[0]> = {}) =>
  render(
    <ul>
      <SectionRailRow
        sectionKey="work"
        entryCount={0}
        proposalCount={0}
        isActive={false}
        isCollapsed={false}
        onSelect={() => {}}
        {...props}
      />
    </ul>,
  );

/**
 * ⚠️ The dimming classes are asserted rather than eyeballed because they are
 * lifted verbatim from the section header's badge. If either copy changes, an
 * empty section reads as a populated one in exactly one of the two places.
 */
describe('the rail row badge', () => {
  it('dims and desaturates a zero entry count', () => {
    renderRow({ entryCount: 0 });
    const badge = screen.getByText('0');
    expect(badge.className).toContain('opacity-40');
    expect(badge.className).toContain('grayscale');
  });

  it('shows a non-zero entry count at full strength', () => {
    renderRow({ entryCount: 3 });
    const badge = screen.getByText('3');
    expect(badge.className).toContain('opacity-100');
    expect(badge.className).not.toContain('grayscale');
  });

  it('renders no badge at all for a section with no countable entries', () => {
    renderRow({ sectionKey: 'coverLetter', entryCount: undefined });
    expect(screen.queryByText('0')).toBeNull();
  });

  /**
   * The rule the design turns on: a row waiting on AI is asking to be visited,
   * and the resting entry count beside it only dilutes that. Never both.
   */
  it('replaces the entry count with the proposal pill, never showing both', () => {
    renderRow({ entryCount: 4, proposalCount: 2 });
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.queryByText('4')).toBeNull();
  });

  it('names the proposal pill for a screen reader', () => {
    renderRow({ entryCount: 4, proposalCount: 2 });
    expect(screen.getByText('2 AI proposals waiting')).toBeTruthy();
  });

  it('uses the singular for one proposal', () => {
    renderRow({ entryCount: 4, proposalCount: 1 });
    expect(screen.getByText('1 AI proposal waiting')).toBeTruthy();
  });

  /**
   * A collapsed rail is icons only, so the label has to survive as an accessible
   * name — otherwise the whole navigation is fourteen unlabelled buttons.
   */
  it('keeps the row name reachable while collapsed', () => {
    renderRow({ isCollapsed: true });
    expect(screen.getByRole('button', { name: /Work Experience/ })).toBeTruthy();
  });

  it('drops the entry count while collapsed but keeps the proposal pill', () => {
    const { rerender } = renderRow({ isCollapsed: true, entryCount: 5 });
    expect(screen.queryByText('5')).toBeNull();

    rerender(
      <ul>
        <SectionRailRow
          sectionKey="work"
          entryCount={5}
          proposalCount={3}
          isActive={false}
          isCollapsed={true}
          onSelect={() => {}}
        />
      </ul>,
    );
    expect(screen.getByText('3')).toBeTruthy();
  });
});
