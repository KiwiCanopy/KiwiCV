// @vitest-environment jsdom
import { AIAccessChip } from '@/features/dashboard/editor/composer/AIAccessChip';
import {
  COMPOSER_MODES,
  COMPOSER_MODE_LABEL_KEYS,
} from '@/features/dashboard/editor/composer/types';
import { en } from '@/locales/en/index';
import { lookupTranslation } from '@/utils/translationLookup';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The chip says why a run will bounce. Its load-bearing case is the one that
 * renders nothing: a Premium Pass holder inside their daily allowance has
 * nothing to be warned about, and decorating their working Improve button is
 * how a pass starts feeling metered.
 *
 * ⚠️ This replaced a cost chip that priced each run in credits. The case that
 * chip existed for — "5 credits · 12 left" — is gone with the credits system,
 * so the two surviving states are both warnings.
 */
describe('the composer access chip', () => {
  it('renders nothing at all for a Premium Pass inside its allowance', () => {
    const { container } = render(<AIAccessChip state={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('says a pass is required when the user has none', () => {
    render(<AIAccessChip state="blocked" />);
    expect(screen.getByText(en.ai.insufficient_premium_access_title)).toBeTruthy();
  });

  it('says the allowance is spent when a Pass has hit its daily limit', () => {
    render(<AIAccessChip state="limit" />);
    expect(screen.getByText(en.ai.limit_reached_title)).toBeTruthy();
  });

  /**
   * The compact form drops the sentence rather than shortening it, so the
   * resting composer row cannot wrap. The wording must stay reachable — it is
   * the only thing that says *why* the button will not run.
   */
  it('keeps the wording reachable in the compact form', () => {
    const { container } = render(<AIAccessChip state="blocked" compact />);
    const label = screen.getByText(en.ai.insufficient_premium_access_title);
    expect(label.className).toContain('sr-only');
    expect(container.firstElementChild?.getAttribute('title')).toBe(
      en.ai.insufficient_premium_access_title,
    );
  });

  it('wears the warning role in both states', () => {
    const { container: blocked } = render(<AIAccessChip state="blocked" />);
    const { container: limit } = render(<AIAccessChip state="limit" />);
    expect(blocked.firstElementChild?.className).toContain('warning');
    expect(limit.firstElementChild?.className).toContain('warning');
  });
});

const resolve = (path: string) => lookupTranslation(en, path);

/**
 * `Record<ComposerMode, string>` makes a missing mode label TS2741, which no
 * test needs to restate. What a `Record` cannot say is that a value **names**
 * something: `t()` returns the path for a key it cannot find, so a plausible
 * typo ships a segmented control reading `ai.composer_mode_job`.
 */
describe('the composer mode labels', () => {
  it.each(COMPOSER_MODES)('labels %s with a key the en bundle resolves', (mode) => {
    expect(typeof resolve(COMPOSER_MODE_LABEL_KEYS[mode])).toBe('string');
  });
});
