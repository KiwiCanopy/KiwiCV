import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { buildCoverLetterTypst } from '@/components/preview/themes/shared/coverLetterTypst';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { describe, expect, it } from 'vitest';

const THEME_OPTIONS = {
  fontScale: 1,
  // What `getTypstFooterParts` hands the serializer for the résumé's own footer.
  // The letter now renders exactly these, so a case about the signature block
  // sets them here rather than through `coverLetter.date`.
  footerParts: ['Berlin, DE', '24 July 2026'],
  pageMargin: '(x: 40pt, y: 40pt)',
  themeHeader: '#text[THEME-HEADER]',
  senderAddress: 'Musterstraße 1, 12345 Berlin',
  textColor: '#000000',
  mutedColor: '#333333',
  borderColor: '#cccccc',
};

function resumeWithLetter(overrides: Partial<ResumeData['coverLetter']> = {}): ResumeData {
  const data = structuredClone(initialResumeState) as ResumeData;
  data.basics.name = 'Ada Lovelace';
  data.basics.location.city = 'Berlin';
  data.basics.location.countryCode = 'DE';
  data.coverLetter = {
    enabled: true,
    paragraphs: ['Dear **Jane**,', 'I would _love_ to join [Acme](https://acme.com).'],
    layout: {
      textAlign: 'left',
      showSender: true,
      showRecipient: true,
      showFooter: true,
      classicLayout: false,
    },
    recipient: {
      name: 'Jane Smith',
      company: 'Acme Inc.',
      address: '123 Example Street, 12345 City',
    },
    subject: 'Application for **Senior Engineer**',
    date: '24 July 2026',
    ...overrides,
  };
  return data;
}

describe('buildCoverLetterTypst', () => {
  it('returns empty markup when the letter is disabled', () => {
    expect(buildCoverLetterTypst(resumeWithLetter({ enabled: false }), THEME_OPTIONS)).toBe('');
  });

  it('returns empty markup when enabled but without subject and paragraphs', () => {
    const data = resumeWithLetter({ paragraphs: ['', '   '], subject: '  ' });
    expect(buildCoverLetterTypst(data, THEME_OPTIONS)).toBe('');
  });

  it('routes paragraphs and the subject through the markdown tokenizer', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    expect(markup).toContain('#strong[Jane]');
    expect(markup).toContain('#emph[love]');
    expect(markup).toContain('#link("https://acme.com")[Acme]');
    expect(markup).toContain('#strong[Senior Engineer]');
  });

  it('escapes user text so it cannot become Typst syntax', () => {
    const data = resumeWithLetter({
      paragraphs: ['#eval("boom") [x] $y$'],
      recipient: { name: 'Jane #footnote[x]', company: '', address: '' },
      subject: 'Re: <offer> // urgent',
      date: '#datetime.today()',
    });
    const markup = buildCoverLetterTypst(data, THEME_OPTIONS);
    expect(markup).toContain('\\#eval("boom") \\[x\\] \\$y\\$');
    expect(markup).toContain('Jane \\#footnote\\[x\\]');
    expect(markup).toContain('Re: \\<offer\\> \\/\\/ urgent');
    expect(markup).toContain('\\#datetime.today()');
    // No unescaped `#eval` anywhere (every occurrence is `\#eval`).
    expect(markup).not.toMatch(/[^\\]#eval/);
  });

  it('renders the theme header variant by default', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    expect(markup).toContain('#text[THEME-HEADER]');
    expect(markup).toContain('margin: (x: 40pt, y: 40pt)');
    expect(markup).not.toContain('DIN 5008');
  });

  it('renders DIN 5008 geometry in the classic layout', () => {
    const data = resumeWithLetter({
      layout: {
        textAlign: 'left',
        showSender: true,
        showRecipient: true,
        showFooter: true,
        classicLayout: true,
      },
    });
    const markup = buildCoverLetterTypst(data, THEME_OPTIONS);
    expect(markup).toContain('classic DIN 5008');
    expect(markup).toContain('margin: (left: 25mm, right: 20mm, top: 20mm, bottom: 20mm)');
    expect(markup).not.toContain('THEME-HEADER');
    // Sender line and multi-line recipient block inside the address window.
    expect(markup).toContain('Ada Lovelace #sym.dot.c Musterstraße 1, 12345 Berlin');
    expect(markup).toContain(
      'Jane Smith #linebreak() Acme Inc. #linebreak() 123 Example Street #linebreak() 12345 City',
    );
  });

  it('honors showSender/showRecipient/showFooter toggles', () => {
    const data = resumeWithLetter({
      layout: {
        textAlign: 'left',
        showSender: false,
        showRecipient: false,
        showFooter: false,
        classicLayout: false,
      },
    });
    const markup = buildCoverLetterTypst(data, THEME_OPTIONS);
    expect(markup).not.toContain('Jane Smith');
    expect(markup).not.toContain('Musterstraße');
    // Footer renders the signature line box; absent when disabled.
    expect(markup).not.toContain('stroke: (top: 1pt +');
  });

  it('justifies paragraphs when textAlign is justify and not otherwise', () => {
    const left = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    expect(left).toContain('#par(justify: false)[');
    const data = resumeWithLetter({
      layout: {
        textAlign: 'justify',
        showSender: true,
        showRecipient: true,
        showFooter: true,
        classicLayout: false,
      },
    });
    expect(buildCoverLetterTypst(data, THEME_OPTIONS)).toContain('#par(justify: true)[');
  });

  it('renders the city-prefixed date line and the signature footer', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    expect(markup).toContain('Berlin, 24 July 2026');
    // Footer parts: location + letter date, plus the signature name box.
    expect(markup).toContain('Berlin, DE, 24 July 2026');
    expect(markup).toContain('stroke: (top: 1pt + rgb("#cccccc"))');
  });

  /**
   * ⚠️ The signature footer used to be built from `coverLetter.date` — the
   * letter's OWN top date line — so clearing that field blanked the signature
   * date too, and the design tab's `footerDate` never reached the letter. The
   * two are separate lines answering to separate settings.
   */
  it('takes the signature footer from the design footer, not the letter date', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter({ date: '1 January 1999' }), {
      ...THEME_OPTIONS,
      footerParts: ['Hamburg, DE', '31 December 2026'],
    });

    // The top line is still the letter's own date.
    expect(markup).toContain('Berlin, 1 January 1999');
    // The signature block is the résumé's footer, and carries neither.
    expect(markup).toContain('Hamburg, DE, 31 December 2026');
    expect(markup).not.toContain('Berlin, DE, 1 January 1999');
  });

  it('keeps the signature footer when the letter has no date of its own', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter({ date: '' }), THEME_OPTIONS);

    expect(markup).toContain('Berlin, DE, 24 July 2026');
  });

  it('fills the letter page with the theme background only when pageFill is set', () => {
    const filled = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      pageFill: '#121212',
    });
    expect(filled).toContain('fill: rgb("#121212")');
    const plain = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    expect(plain).not.toContain(
      '#set page(paper: "a4", margin: (x: 40pt, y: 40pt), background: none, fill:',
    );
  });

  it('wraps the body chain via wrapBody in the theme variant only', () => {
    const options = {
      ...THEME_OPTIONS,
      wrapBody: (content: string) => `#test-card[\n${content}\n]`,
    };
    const themed = buildCoverLetterTypst(resumeWithLetter(), options);
    expect(themed).toContain('#test-card[');
    // The header stays outside the wrapper; the subject is inside it.
    expect(themed.indexOf('#test-card[')).toBeGreaterThan(themed.indexOf('THEME-HEADER'));
    expect(themed.indexOf('#strong[Senior Engineer]')).toBeGreaterThan(
      themed.indexOf('#test-card['),
    );
    const classicData = resumeWithLetter({
      layout: {
        textAlign: 'left',
        showSender: true,
        showRecipient: true,
        showFooter: true,
        classicLayout: true,
      },
    });
    expect(buildCoverLetterTypst(classicData, options)).not.toContain('#test-card[');
    expect(buildCoverLetterTypst(resumeWithLetter({ enabled: false }), options)).toBe('');
  });

  it('emits senderPrefix before the sender line in the theme variant', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      senderPrefix: '\\/\\/ ',
    });
    expect(markup).toContain('[\\/\\/ Ada Lovelace #sym.dot.c');
  });

  it('fills the subject with subjectColor and leaves everything else on textColor', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      subjectColor: '#2563eb',
    });
    expect(markup).toContain('fill: rgb("#2563eb"))[Application for #strong[Senior Engineer]');
    // The accent is the subject's alone — it must not leak into the body.
    expect(markup.match(/#2563eb/g)).toHaveLength(1);
    // Without it the subject falls back to the body-text colour.
    expect(buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS)).toContain(
      'fill: rgb("#000000"))[Application for #strong[Senior Engineer]',
    );
  });

  it('hands renderSubject the converted subject and the resolved defaults', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      subjectColor: '#2563eb',
      renderSubject: (subject, defaults) =>
        `#badge(${defaults.size}, "${defaults.color}")[${subject}]`,
    });
    expect(markup).toContain('#badge(11, "#2563eb")[Application for #strong[Senior Engineer]');
    // It replaces the default run rather than wrapping it.
    expect(markup).not.toContain('#text(weight: "bold", size: 11pt, fill: rgb("#2563eb"))');
  });

  it('hoists a rendered sender above wrapBody instead of into the chain', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      wrapBody: (content: string) => `#test-card[\n${content}\n]`,
      renderSender: (sender: string) => `#sender-tag[${sender}]`,
    });
    expect(markup).toContain('#sender-tag[');
    expect(markup.indexOf('#sender-tag[')).toBeLessThan(markup.indexOf('#test-card['));
    // The sender appears exactly once — hoisting must not duplicate it.
    expect(markup.match(/Musterstraße/g)).toHaveLength(1);
    // Without the hook it stays inside the wrapper.
    const inline = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      wrapBody: (content: string) => `#test-card[\n${content}\n]`,
    });
    expect(inline.indexOf('Musterstraße')).toBeGreaterThan(inline.indexOf('#test-card['));
  });

  it('replaces the page background in both variants when pageBackground is set', () => {
    const options = { ...THEME_OPTIONS, pageBackground: '#place(left, rect(width: 7pt))' };
    const themed = buildCoverLetterTypst(resumeWithLetter(), options);
    expect(themed).toContain('background: #place(left, rect(width: 7pt))');
    expect(themed).not.toContain('background: none');
    const classic = buildCoverLetterTypst(
      resumeWithLetter({
        layout: {
          textAlign: 'left',
          showSender: true,
          showRecipient: true,
          showFooter: true,
          classicLayout: true,
        },
      }),
      options,
    );
    expect(classic).toContain('background: #place(left, rect(width: 7pt))');
    // The default stays `none` so nothing from the résumé bleeds onto the letter.
    expect(buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS)).toContain('background: none');
  });

  it('anchors the signature footer to the page bottom, outside wrapBody', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), {
      ...THEME_OPTIONS,
      wrapBody: (content: string) => `#test-card[\n${content}\n]`,
    });
    // Fractional spacing, not `#place(bottom, ..)`: it collapses on a full page
    // instead of printing the signature over the body.
    expect(markup).toContain('#v(1fr)');
    expect(markup).not.toContain('#place(bottom');
    // A wrapper of automatic height would swallow the `1fr`, so the footer has
    // to sit after the wrapper closes.
    const footerAt = markup.indexOf('stroke: (top: 1pt +');
    expect(footerAt).toBeGreaterThan(markup.lastIndexOf('#v(1fr)') - 1);
    expect(markup.slice(markup.indexOf('#v(1fr)'))).not.toContain('#test-card[');
  });

  it('emits no anchor spacing when the footer is switched off', () => {
    const markup = buildCoverLetterTypst(
      resumeWithLetter({
        layout: {
          textAlign: 'left',
          showSender: true,
          showRecipient: true,
          showFooter: false,
          classicLayout: false,
        },
      }),
      THEME_OPTIONS,
    );
    expect(markup).not.toContain('#v(1fr)');
  });

  it('contains no top-level set rules other than its own page setup', () => {
    const markup = buildCoverLetterTypst(resumeWithLetter(), THEME_OPTIONS);
    const setRules = markup.match(/^#set .+$/gm) || [];
    expect(setRules).toHaveLength(1);
    expect(setRules[0]).toMatch(/^#set page/);
  });
});

describe('theme serializers', () => {
  const serializers = Object.entries(SERIALIZERS);
  it('covers all 12 themes', () => {
    expect(serializers).toHaveLength(12);
  });

  it.each(serializers)('%s: emits no cover letter when disabled', (_name, serialize) => {
    const data = resumeWithLetter({ enabled: false });
    expect(serialize(data)).not.toContain('Cover letter');
  });

  it.each(serializers)(
    '%s: prepends the letter before the résumé page setup when enabled',
    (_name, serialize) => {
      const markup = serialize(resumeWithLetter());
      const letterAt = markup.indexOf('Cover letter');
      expect(letterAt).toBeGreaterThan(-1);
      expect(markup).toContain('#strong[Jane]');
      // The theme's own #set page must come after the letter so the résumé
      // starts on a fresh page with theme geometry.
      const themePageAt = markup.lastIndexOf('#set page');
      expect(themePageAt).toBeGreaterThan(letterAt);
    },
  );
});

// Regression: plain and plain2 build a Typst array `highlights: (…)`
// and call `highlights.len()`; a single parenthesised element without a
// trailing comma is grouping, not an array, so `.len()` fails to compile. The
// trailing comma keeps it an array for any count.
describe('single-highlight Typst arrays', () => {
  function resumeWithOneHighlight(): ResumeData {
    const data = structuredClone(initialResumeState) as ResumeData;
    data.basics.name = 'Ada Lovelace';
    data.work = [
      {
        name: 'Acme',
        position: 'Engineer',
        url: '',
        startDate: '2020-01',
        endDate: '',
        summary: '',
        highlights: ['Solo bullet'],
        visible: true,
      },
    ];
    data.meta.content.order.oneColumn = ['work'];
    return data;
  }

  it.each([
    ['plain', SERIALIZERS.plain],
    ['plain2', SERIALIZERS.plain2],
  ] as const)('%s: emits a valid array for exactly one highlight', (_name, serialize) => {
    const markup = serialize(resumeWithOneHighlight());
    expect(markup).toContain('highlights: ([Solo bullet],)');
    expect(markup).not.toContain('highlights: ([Solo bullet])');
  });

  // misty builds Typst arrays for skill keywords and interests and calls
  // `.map()`/`.len()` on them; a single element without a trailing comma is
  // grouping, not an array, and fails to compile.
  function mistyData(order: ResumeData['meta']['content']['order']['twoColumn']): ResumeData {
    const data = structuredClone(initialResumeState) as ResumeData;
    data.basics.name = 'Ada Lovelace';
    data.skills = [{ name: 'Rust', keywords: ['Solo'], visible: true }];
    data.interests = [{ name: 'Chess', keywords: ['Blitz'], visible: true }];
    data.meta.content.order.twoColumn = order;
    return data;
  }

  it('misty: single skill keyword and main-column interest emit valid arrays', () => {
    const markup = SERIALIZERS.misty(
      mistyData({ main: ['skills', 'interests'], sidebar: [], sidebarPosition: 'left' }),
    );
    // skill keywords: `([Solo],).map(...)`, never `([Solo]).map(...)`
    expect(markup).toContain('([Solo],).map(kw => misty-badge');
    expect(markup).not.toContain('([Solo]).map(kw => misty-badge');
    // interest card + its single keyword both carry trailing commas
    expect(markup).toContain('misty-interest-card("Chess", ("Blitz",)),');
  });

  it('misty: single sidebar interest emits a valid array', () => {
    const markup = SERIALIZERS.misty(
      mistyData({ main: [], sidebar: ['interests'], sidebarPosition: 'left' }),
    );
    expect(markup).toContain(']],).map(item => box(');
    expect(markup).not.toContain(']]).map(item => box(');
  });
});
