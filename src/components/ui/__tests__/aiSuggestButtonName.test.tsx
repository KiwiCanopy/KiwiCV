// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { REPO_ROOT } from '@/test/sourceFiles';
import { render, screen } from '@testing-library/react';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false }),
}));

/** The button navigates on click, so it needs a router in scope to render. */
const renderInRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

/**
 * Every one of these buttons is icon-only, and `title` was its only
 * accessible name.
 *
 * `title` does supply one: it is the last fallback in the accname algorithm, so
 * the button was never *nameless* and axe never flagged it. It is simply the
 * weakest source — invisible on touch, unreliable for voice control, announced
 * inconsistently between screen readers. The glyph is `aria-hidden` and the
 * button renders no visible text, so there was nothing else.
 *
 * ⚠️ The bar is not "has a name". It is "**names its target**". Six of these
 * render on one screen — one per section header plus one per accordion entry —
 * and six controls announcing "Improve with AI" is a list nobody can navigate
 * by voice or by rotor.
 */
describe('the Improve button names itself', () => {
  it('exposes an aria-label, not merely a title', () => {
    renderInRouter(<AISuggestButton target="section:work" ariaLabel="Optimize Work Experience" />);
    const button = screen.getByRole('button', { name: 'Optimize Work Experience' });
    expect(button.getAttribute('aria-label')).toBe('Optimize Work Experience');
  });

  it('says the same thing to the pointer and to the screen reader', () => {
    renderInRouter(<AISuggestButton target="section:work" ariaLabel="Optimize Work Experience" />);
    const button = screen.getByRole('button', { name: 'Optimize Work Experience' });
    expect(button.getAttribute('title')).toBe(button.getAttribute('aria-label'));
  });

  it('gives two buttons on one screen distinguishable names', () => {
    renderInRouter(
      <>
        <AISuggestButton target="item:work:a" ariaLabel="Improve with AI: Globex" />
        <AISuggestButton target="item:work:b" ariaLabel="Improve with AI: Initech" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Improve with AI: Globex' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Improve with AI: Initech' })).toBeTruthy();
  });

  /**
   * ⚠️ The ACCEPT state, which is the one the naming fix exists for and the one
   * the first two attempts got wrong — first dropping the target entirely, then
   * appending the idle action label to produce "Accept all changes: Optimize
   * Work Experience". Seeded through the store, because `hasPendingSuggestions`
   * is `suggestionsCount > 0` (`AISuggestButton.tsx:104-107`).
   */
  it('names its target in the accept state, without a second verb', () => {
    useResumeStore.setState((s) => ({
      ai: {
        ...s.ai,
        suggestions: { 'section:work': { improvedValue: { summary: 'x' } } },
      },
    }));

    renderInRouter(
      <AISuggestButton
        target="section:work"
        ariaLabel="Optimize Work Experience"
        targetName="Work Experience"
      />,
    );

    const name = screen.getByRole('button').getAttribute('aria-label')!;
    expect(name).toContain('Work Experience');
    // The idle verb must NOT ride along — that is the two-imperatives defect.
    expect(name).not.toContain('Optimize');
  });

  it('is still named when a call site forgets, just badly', () => {
    renderInRouter(<AISuggestButton target="cv" />);
    // The fallback keeps the button reachable rather than nameless. The scan
    // below is what stops a call site relying on it.
    expect(screen.getByRole('button').getAttribute('aria-label')).toBeTruthy();
  });
});

/**
 * The render tests above prove the component honours a label. They cannot prove
 * a CALL SITE passes one — and a new section header that forgets would render a
 * button announcing the same words as the five beside it, with every suite
 * green. This reads the sources instead.
 */
describe('every call site passes a target-aware name', () => {
  /**
   * ⚠️ Enumerated, not listed. The first version hardcoded three paths — a
   * regression pin wearing a forward guard's docstring, since the "new section
   * header that forgets" it claims to catch would be a FOURTH file the array
   * cannot see. `git ls-files` is the derivation
   * `changelog-highlight-slug.test.cjs` uses for the identical reason. (Not
   * `aiImprovableSections.test.ts` — that one resolves a single known path.)
   *
   * ⚠️ It sees TRACKED files only, so a brand-new call site is unscanned until
   * it is committed. Acceptable: the PR is what this guards, and nothing
   * reaches one uncommitted.
   */
  const ROOT = REPO_ROOT;

  const callSites = spawnSync('git', ['ls-files', '-z', '*.tsx'], { cwd: ROOT, encoding: 'utf8' })
    .stdout.split('\0')
    .filter(Boolean)
    .filter((rel) => !rel.includes('__tests__'))
    .filter((rel) => /<AISuggestButton\b/.test(readFileSync(path.join(ROOT, rel), 'utf8')));

  it('found the call sites at all', () => {
    expect(callSites.length).toBeGreaterThan(0);
  });

  it.each(callSites)('%s names its button', (relative) => {
    const source = readFileSync(path.join(ROOT, relative), 'utf8');

    for (const match of source.matchAll(/<AISuggestButton\b/g)) {
      // ⚠️ Bounded by the element's OWN close. Slicing to the next `/>` assumed
      // self-closing JSX, so a non-self-closed tag ran on into the following
      // element and could borrow ITS ariaLabel — a scan that fails open.
      const rest = source.slice(match.index);
      const close = rest.search(/\/>|>/);
      const element = rest.slice(0, close === -1 ? 400 : close);

      expect(
        element.includes('ariaLabel='),
        `an <AISuggestButton> in ${relative} passes no ariaLabel, so it will announce the same words as every other one on screen`,
      ).toBe(true);

      // ⚠️ A button that can reach the ACCEPT state needs a target NOUN too:
      // `ariaLabel` is the idle action label, so the accept name would either
      // lose its target or grow a second verb. `triggerOnly` buttons never
      // reach that state (`AISuggestButton.tsx:105`), so they are exempt.
      if (!element.includes('triggerOnly')) {
        expect(
          element.includes('targetName='),
          `an <AISuggestButton> in ${relative} can show proposals but passes no targetName, so it will announce a bare "Accept all changes" alongside its siblings`,
        ).toBe(true);
      }
    }
  });
});
