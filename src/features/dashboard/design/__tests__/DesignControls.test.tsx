// @vitest-environment jsdom
import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import { DesignDisclosure } from '@/features/dashboard/design/DesignDisclosure';
import { ColorPicker } from '@/features/dashboard/design/helpers/ColorPicker';
import { ThemeCard } from '@/features/dashboard/design/helpers/ThemeCard';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { PALETTE_CHANGED: 'palette_changed' },
  analytics: { track: vi.fn() },
}));

const initialResumeStoreState = useResumeStore.getState();

afterEach(() => {
  vi.useRealTimers();
  useResumeStore.setState(initialResumeStoreState, true);
});

describe('Design controls', () => {
  it('opens a named disclosure and connects it to its panel', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <DesignDisclosure
        id="design-template"
        title="Template"
        summary="Lunar · Cyan"
        icon={<span>T</span>}
        open={false}
        onOpenChange={onOpenChange}
      >
        <p>Template choices</p>
      </DesignDisclosure>,
    );

    const trigger = screen.getByRole('button', { name: /Template/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('design-template-panel');
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('exposes the selected template state', () => {
    render(
      <ThemeCard theme={getThemeMeta('lunar')} isActive onSelect={vi.fn()} t={(key) => key} />,
    );
    expect(
      screen.getByRole('button', { name: 'themes.names.lunar' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('leaves preview-sync status to a mounted preview renderer', () => {
    useResumeStore.setState({ isSyncingData: false });
    vi.useFakeTimers();
    render(
      <ColorPicker
        themeId="lunar"
        currentPalettes={[
          // ⚠️ `iconUi`/`iconUiMuted` are the PDF's icon fills and the
          // picker never reads them; they are here because `ThemePaletteMeta`
          // requires them, and they are deliberately *not* copies of `ui` — the
          // whole point of the field is that a swatch can be a background.
          { id: 'calm', ui: '#1c373d', iconUi: '#ffffff', iconUiMuted: '#888888' },
          { id: 'fresh', ui: '#a9cb59', iconUi: '#ffffff', iconUiMuted: '#888888' },
        ]}
        localPaletteId="calm"
        setLocalPaletteId={vi.fn()}
        t={(key) => key}
      />,
    );
    // The accessible name is now the composed key, since the stub `t` echoes it:
    // a palette carries no display string of its own.
    fireEvent.click(screen.getByRole('button', { name: 'themes.palettes.lunar.fresh' }));

    expect(useResumeStore.getState().isSyncingData).toBe(false);
    vi.runAllTimers();
    expect(useResumeStore.getState().isSyncingData).toBe(false);
  });
});
