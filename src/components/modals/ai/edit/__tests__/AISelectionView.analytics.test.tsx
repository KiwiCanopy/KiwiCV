// @vitest-environment jsdom
import { AISelectionView } from '@/components/modals/ai/edit/AISelectionView';
import { type AIEditContext } from '@/components/modals/ai/edit/types';
import { en } from '@/locales/en/index';
import { analytics } from '@/services/analytics';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { AI_TOOL_SELECTED: 'ai_tool_selected' },
  analytics: { track: vi.fn() },
}));

const UUID = '3f2b8c1e-9a4d-4e6b-8f1a-2c3d4e5f6a7b';

/**
 * Picking a tool reports the target the way every AI event does — never an
 * entry's `_vId` or a custom section's uuid, which are stable across sessions.
 */
describe('AI_TOOL_SELECTED', () => {
  it.each([`item:custom:${UUID}:v-entry-1`, 'item:work:v-entry-1'])(
    'carries no identifier for %s',
    (activeTarget) => {
      const context = { activeTarget, isTranslationMode: false, setMode: vi.fn() };
      render(<AISelectionView context={context as unknown as AIEditContext} />);
      fireEvent.click(screen.getByText(en.ai.mode_professional));

      const [, props] = vi.mocked(analytics.track).mock.lastCall ?? [];
      const sent = JSON.stringify(props);
      expect(sent).not.toContain(UUID);
      expect(sent).not.toContain('v-entry-1');
      expect(props).toMatchObject({ mode: 'professional', ai_scope: 'item' });
    },
  );
});
