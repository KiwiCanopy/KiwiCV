// @vitest-environment jsdom
import { type ReactElement, useState } from 'react';

import { AICustomPromptConfig } from '@/components/modals/ai/template/AICustomPromptConfig';
import { AIJobDescriptionConfig } from '@/components/modals/ai/template/AIJobDescriptionConfig';
import { CoverLetterStyleField } from '@/components/modals/ai/template/CoverLetterStyleField';
import { AI_MAX_CHAR_LIMIT, COVER_LETTER_STYLE_MAX } from '@/constants/ai';
import { AIComposerField } from '@/features/dashboard/editor/composer/AIComposerField';
import { useUIStore } from '@/store/ui/useUIStore';
import { REPO_ROOT, named, sourceFiles } from '@/test/sourceFiles';
import { charCapZone } from '@/utils/charCapZone';
import { cn } from '@/utils/cn';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * One `CharCounter`, four call sites, one rule (owner, 2026-10-12): three zones, a
 * spoken count, and a polite notice only when an edit changes the zone.
 */

// The counter formats for the UI language, never the browser's; pin it.
beforeEach(() => useUIStore.setState({ appLanguage: 'en' }));
afterEach(cleanup);

const num = new Intl.NumberFormat('en').format;

const noop = () => {};

type Zone = 'ok' | 'near' | 'full';

const lengthFor = (zone: Zone, limit: number) =>
  zone === 'ok' ? 12 : zone === 'near' ? Math.ceil(limit * 0.9) : limit;

const threeZone = (base: string, zone: Zone) =>
  cn(
    base,
    zone === 'full'
      ? 'text-destructive font-bold'
      : zone === 'near'
        ? 'text-warning font-bold'
        : 'text-muted-foreground',
  );

type Site = {
  name: string;
  limit: number;
  render: (value: string, onChange: (next: string) => void) => ReactElement;
  base: string;
};

const SITES: Site[] = [
  {
    name: 'AIJobDescriptionConfig',
    limit: AI_MAX_CHAR_LIMIT,
    render: (value, onChange) => <AIJobDescriptionConfig value={value} onChange={onChange} />,
    base: 'text-[10px] font-medium transition-colors',
  },
  {
    name: 'AICustomPromptConfig',
    limit: AI_MAX_CHAR_LIMIT,
    render: (value, onChange) => <AICustomPromptConfig value={value} onChange={onChange} />,
    base: 'text-[10px] font-medium transition-colors',
  },
  {
    name: 'AIComposerField',
    limit: AI_MAX_CHAR_LIMIT,
    render: (value, onChange) => (
      <AIComposerField
        mode="job_description"
        value={value}
        onChange={onChange}
        charLimit={AI_MAX_CHAR_LIMIT}
        focusSignal={0}
      />
    ),
    base: 'shrink-0 text-xs font-medium tabular-nums transition-colors',
  },
  {
    name: 'CoverLetterStyleField',
    limit: COVER_LETTER_STYLE_MAX,
    render: (value, onChange) => (
      <CoverLetterStyleField value={value} onChange={onChange} onClear={noop} />
    ),
    base: 'ml-auto text-[10px] font-medium transition-colors',
  },
];

const tokens = (className: string) => new Set(className.split(/\s+/).filter(Boolean));

/** The counter element: the parent of the visual count, which is hidden from AT. */
const counterFor = (length: number, limit: number) => {
  const visual = screen.getByText(`${num(length)} / ${num(limit)}`);
  expect(visual.getAttribute('aria-hidden')).toBe('true');
  return visual.parentElement!;
};

/** A controlled host, so typing reaches the field the way it does in the app. */
function Host({ site, initial }: { site: Site; initial: string }) {
  const [value, setValue] = useState(initial);
  return site.render(value, setValue);
}

const type = (length: number) =>
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x'.repeat(length) } });

const status = () => screen.getByRole('status');

describe('charCapZone', () => {
  it('turns near at 90% of the cap and full only at it', () => {
    expect(charCapZone(8999, 10000)).toBe('ok');
    expect(charCapZone(9000, 10000)).toBe('near');
    expect(charCapZone(9999, 10000)).toBe('near');
    expect(charCapZone(10000, 10000)).toBe('full');
    expect(charCapZone(4499, 5000)).toBe('ok');
    expect(charCapZone(4500, 5000)).toBe('near');
    expect(charCapZone(5000, 5000)).toBe('full');
  });
});

describe('every AI free-text counter follows one rule', () => {
  for (const site of SITES) {
    const near = Math.ceil(site.limit * 0.9);
    const nearText = `This field is close to its ${num(site.limit)}-character limit.`;
    const fullText = `This field has reached its ${num(site.limit)}-character limit. Anything more is not added.`;

    for (const zone of ['ok', 'near', 'full'] as const) {
      it(`${site.name} at ${zone}: three-zone colour and a spoken count`, () => {
        const length = lengthFor(zone, site.limit);
        render(site.render('x'.repeat(length), noop));

        const counter = counterFor(length, site.limit);
        expect(tokens(counter.className)).toEqual(tokens(threeZone(site.base, zone)));
        expect(counter.querySelector('.sr-only')?.textContent).toBe(
          `${num(length)} of ${num(site.limit)} characters used`,
        );
      });
    }

    it(`${site.name} puts its counter in the field’s description`, () => {
      render(site.render('x'.repeat(10), noop));
      const counter = counterFor(10, site.limit);
      expect(counter.id).not.toBe('');
      const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby') ?? '';
      expect(describedBy.split(' ')).toContain(counter.id);
    });

    describe(`${site.name} announces politely, only when an edit changes the zone`, () => {
      it('is silent at mount, even when already near the cap', () => {
        render(<Host site={site} initial={'x'.repeat(near + 5)} />);
        expect(status().getAttribute('aria-live')).toBe('polite');
        expect(status().textContent).toBe('');
      });

      it('speaks on entering near and full, and not on keystrokes within a zone', () => {
        render(<Host site={site} initial="" />);

        type(near - 1);
        expect(status().textContent).toBe('');

        type(near);
        expect(status().textContent).toBe(nearText);

        // Same zone: the region's text does not change, so nothing is re-read.
        type(near + 1);
        expect(status().textContent).toBe(nearText);

        type(site.limit);
        expect(status().textContent).toBe(fullText);

        type(near - 1);
        expect(status().textContent).toBe('');
      });

      it('keeps the notice out of the counter, so a description never replays it', () => {
        render(<Host site={site} initial="" />);
        type(site.limit);
        expect(counterFor(site.limit, site.limit).contains(status())).toBe(false);
      });
    });
  }

  describe('a value changed from outside never speaks', () => {
    const near = Math.ceil(COVER_LETTER_STYLE_MAX * 0.9);

    // Clear writes '' through `onClear`, never the change handler; Restore
    // stands for any parent write, landing on the exact length announced.
    function ClearableHost() {
      const [value, setValue] = useState('');
      return (
        <>
          <CoverLetterStyleField value={value} onChange={setValue} onClear={() => setValue('')} />
          <button type="button" onClick={() => setValue('x'.repeat(near))}>
            Restore
          </button>
        </>
      );
    }

    it('drops the notice on Clear, and stays silent when the parent restores the zone', () => {
      render(<ClearableHost />);
      type(near);
      expect(status().textContent).not.toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
      expect(screen.getByRole('textbox')).toHaveProperty('value', '');
      expect(status().textContent).toBe('');

      // Clear focuses the field, and a focused TextArea keeps its own copy.
      act(() => screen.getByRole('textbox').blur());
      fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
      expect(screen.getByRole('textbox')).toHaveProperty('value', 'x'.repeat(near));
      expect(status().textContent).toBe('');

      // The next edit inside the zone is not a zone change either.
      type(near + 1);
      expect(status().textContent).toBe('');
    });

    function CapHost({ cap }: { cap: number }) {
      const [value, setValue] = useState('');
      return (
        <AIComposerField
          mode="job_description"
          value={value}
          onChange={setValue}
          charLimit={cap}
          focusSignal={0}
        />
      );
    }

    it('drops the notice when the cap changes under it', () => {
      const { rerender } = render(<CapHost cap={AI_MAX_CHAR_LIMIT} />);
      type(AI_MAX_CHAR_LIMIT);
      expect(status().textContent).not.toBe('');

      // Same text, a larger cap: the field is no longer full, and nothing was edited.
      rerender(<CapHost cap={AI_MAX_CHAR_LIMIT * 2} />);
      expect(status().textContent).toBe('');
    });

    // The composer is one field whose value swaps with the mode.
    function ComposerHost() {
      const [isJob, setIsJob] = useState(true);
      const [job, setJob] = useState('');
      const [custom, setCustom] = useState('');
      return (
        <>
          <AIComposerField
            mode={isJob ? 'job_description' : 'custom'}
            value={isJob ? job : custom}
            onChange={isJob ? setJob : setCustom}
            charLimit={AI_MAX_CHAR_LIMIT}
            focusSignal={0}
          />
          <button type="button" onClick={() => setIsJob(!isJob)}>
            Toggle
          </button>
        </>
      );
    }

    it('stays silent across a composer mode round trip', () => {
      const composerNear = Math.ceil(AI_MAX_CHAR_LIMIT * 0.9);
      render(<ComposerHost />);
      type(composerNear);
      expect(status().textContent).not.toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('textbox')).toHaveProperty('value', '');
      expect(status().textContent).toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('textbox')).toHaveProperty('value', 'x'.repeat(composerNear));
      expect(status().textContent).toBe('');
    });
  });
});

describe('numbers follow the UI language, not the browser', () => {
  /** Type the site's field to its cap. */
  const full = (site: Site) => {
    render(<Host site={site} initial="" />);
    type(site.limit);
  };

  it('en: 5,000 and 10,000', () => {
    full(SITES[3]);
    const counter = screen.getByText('5,000 / 5,000').parentElement!;
    expect(counter.querySelector('.sr-only')?.textContent).toBe('5,000 of 5,000 characters used');
    expect(status().textContent).toBe(
      'This field has reached its 5,000-character limit. Anything more is not added.',
    );
    cleanup();

    full(SITES[2]);
    expect(screen.getByText('10,000 / 10,000')).toBeTruthy();
  });

  it('de: 5.000 and 10.000, never 5,000', () => {
    useUIStore.setState({ appLanguage: 'de' });
    full(SITES[3]);
    const counter = screen.getByText('5.000 / 5.000').parentElement!;
    expect(counter.querySelector('.sr-only')?.textContent).toBe(
      '5.000 von 5.000 Zeichen verwendet',
    );
    expect(status().textContent).toBe(
      'Dieses Feld hat das Limit von 5.000 Zeichen erreicht. Weiterer Text wird nicht übernommen.',
    );
    cleanup();

    full(SITES[2]);
    const composer = screen.getByText('10.000 / 10.000').parentElement!;
    expect(composer.querySelector('.sr-only')?.textContent).toBe(
      '10.000 von 10.000 Zeichen verwendet',
    );
    expect(status().textContent).toBe(
      'Dieses Feld hat das Limit von 10.000 Zeichen erreicht. Weiterer Text wird nicht übernommen.',
    );
  });
});

/** Deleting three copies beats a test that they agree — so no fourth copy may appear. */
describe('no hand-written AI counter outside CharCounter', () => {
  const SRC = join(REPO_ROOT, 'src');

  it('finds the count-over-limit pattern only in the component', () => {
    const offenders = sourceFiles(SRC, { extensions: ['.tsx'], skip: [named('__tests__')] }).filter(
      (file) =>
        !file.endsWith('CharCounter.tsx') &&
        /toLocaleString\(\)\}?\s*\/\s*\{?[\w.]+\.toLocaleString\(\)/.test(
          readFileSync(file, 'utf8'),
        ),
    );
    expect(offenders).toEqual([]);
  });
});
