import { applyThemeLayout } from '@/test/fixtureLayout';
import { type ResumeData, initialResumeState } from '@/types/resume';

/**
 * A resume carrying **exactly one** of every array-bearing field.
 *
 * That is the whole point of the fixture, not an arbitrary size. Every Typst
 * crash this suite exists to catch came from a one-element Typst tuple: `([x])` is
 * grouping, `([x],)` is an array, and only the latter answers `.map()` or
 * `.len()`. Serializers build
 * those tuples by joining a JavaScript array, so the bug is invisible at zero
 * elements (no tuple) and at two (`([a], [b])` is already an array). One is the
 * only arity that reaches it.
 *
 * Written as a factory of inline literals rather than a shared constant that
 * gets spread: a single `['…']` hoisted out and reused would alias one array
 * across every item, and structural assertions would not notice.
 *
 * Deliberately *not* run through `enrichResumeWithPlaceholders`. That only acts
 * on an empty resume (`isResumeEmpty`), so it is a no-op here — but if it ever
 * stopped being one it would substitute multi-element placeholder content and
 * quietly destroy the single-element property this fixture is named for.
 */
export function buildSingleItemResume(
  themeId: string,
  options: { classicLetter?: boolean; longLetter?: boolean; pageBreaks?: boolean } = {},
): ResumeData {
  const data = structuredClone(initialResumeState) as ResumeData;

  data.basics = {
    ...data.basics,
    name: 'Ada Lovelace',
    label: 'Analytical Engineer',
    image: '',
    email: 'ada@example.com',
    phone: '+44 20 7946 0000',
    url: 'https://example.com',
    summary: 'One paragraph of summary text.',
    location: {
      address: '12 Nowhere Lane',
      postalCode: 'W1A 1AA',
      city: 'London',
      countryCode: 'GB',
      region: 'England',
    },
    profiles: [
      { network: 'GitHub', username: 'ada', url: 'https://github.com/ada', visible: true },
    ],
  };

  data.work = [
    {
      name: 'Analytical Engines Ltd',
      position: 'Lead Engineer',
      location: 'London',
      url: 'https://example.com/work',
      startDate: '2020-01',
      endDate: '2023-06',
      summary: 'Ran the engine.',
      highlights: ['Solo work highlight'],
      visible: true,
    },
  ];

  data.volunteer = [
    {
      organization: 'Engine Society',
      position: 'Mentor',
      location: 'London',
      url: 'https://example.com/volunteer',
      startDate: '2019-01',
      endDate: '2019-12',
      summary: 'Mentored one cohort.',
      highlights: ['Solo volunteer highlight'],
      visible: true,
    },
  ];

  data.education = [
    {
      institution: 'University of Nowhere',
      location: 'London',
      url: 'https://example.com/edu',
      area: 'Mathematics',
      studyType: 'BSc',
      startDate: '2015-09',
      endDate: '2018-06',
      score: '1.0',
      courses: ['Solo course'],
      visible: true,
    },
  ];

  data.awards = [
    {
      title: 'Engine Prize',
      date: '2022-05',
      awarder: 'Engine Society',
      location: 'London',
      summary: 'Awarded once.',
      url: 'https://example.com/award',
      visible: true,
    },
  ];

  data.certificates = [
    {
      name: 'Certified Engineer',
      date: '2021-03',
      issuer: 'Engine Board',
      url: 'https://example.com/cert',
      visible: true,
    },
  ];

  data.publications = [
    {
      name: 'Notes on the Engine',
      publisher: 'Engine Press',
      releaseDate: '2021-11',
      url: 'https://example.com/pub',
      summary: 'One publication.',
      visible: true,
    },
  ];

  data.skills = [{ name: 'Rust', level: 4, keywords: ['Solo keyword'], visible: true }];

  data.languages = [{ language: 'English', certificate: 'C2', level: 5, visible: true }];

  data.interests = [{ name: 'Chess', keywords: ['Solo interest keyword'], visible: true }];

  data.references = [{ name: 'Charles Babbage', reference: 'One reference line.', visible: true }];

  data.projects = [
    {
      name: 'Engine Simulator',
      description: 'One project.',
      highlights: ['Solo project highlight'],
      roles: ['Solo project role'],
      keywords: ['Solo project keyword'],
      startDate: '2022-01',
      endDate: '2022-12',
      url: 'https://example.com/project',
      entity: 'Analytical Engines Ltd',
      location: 'London',
      type: 'application',
      visible: true,
    },
  ];

  data.privateProjects = [
    {
      name: 'Home Engine',
      description: 'One private project.',
      highlights: ['Solo private highlight'],
      roles: ['Solo private role'],
      keywords: ['Solo private keyword'],
      startDate: '2023-01',
      endDate: '2023-12',
      url: 'https://example.com/private',
      entity: 'Self',
      location: 'London',
      type: 'application',
      visible: true,
    },
  ];

  data.customSections = [
    {
      id: '0b9c3c55-6c1e-4c1f-9a43-2f7f4f8a5e01',
      title: 'Conferences',
      items: [
        {
          name: 'Solo conference',
          startDate: '2024-05',
          endDate: '2024-05',
          url: 'https://example.com/conference',
          summary: 'One custom entry.',
          highlights: ['Solo custom highlight'],
          visible: true,
        },
      ],
    },
  ];

  data.coverLetter = {
    ...data.coverLetter,
    enabled: true,
    // The empty-URL link is deliberate. `[label]()` emitted `#link("")`, which
    // Typst rejects outright, and because the cover letter runs through
    // `markdownToTypst` on every theme it failed the export everywhere.
    // It is a boundary input in the same family as the one-element tuple.
    // `longLetter` is the other side of the signature footer, which is
    // bottom-anchored with `#v(1fr)`. A one-paragraph letter proves the anchor
    // pushes the signature down; only a letter that already fills the page
    // proves the `1fr` collapses instead of printing the signature over the
    // body. The two cases exercise opposite branches of the same spacing.
    //
    // Sixteen, not "several": at nine the letter merely reached the bottom of
    // page one, which is the boundary and not the case worth pinning. Sixteen
    // overflows onto a second letter page, so the footer has to land on *that*
    // page's bottom — the failure mode `#place(bottom, ..)` would have had.
    paragraphs: options.longLetter
      ? Array.from(
          { length: 16 },
          (_, index) =>
            `Paragraph ${index + 1} of a **long cover letter** that runs to the bottom of the page. ` +
            'It repeats itself at length so the letter body reaches the end of the text area and ' +
            'the fractional spacing before the signature has nothing left to distribute. ' +
            'Every sentence here exists to take up vertical space and nothing else.',
        )
      : ['One **cover letter** paragraph with a [link](https://example.com) and an [empty]() one.'],
    // `classicLayout` selects a completely separate branch of
    // `buildCoverLetterTypst` — the DIN 5008 variant with its own `#set page`
    // and fixed-mm `#place` geometry. One of the three crashes this suite
    // exists for was in the cover-letter path, so both branches get compiled.
    layout: {
      ...data.coverLetter.layout,
      showSender: true,
      showRecipient: true,
      classicLayout: !!options.classicLetter,
    },
    recipient: { name: 'Hiring Team', company: 'Engine Co', address: '1 Engine Road' },
    subject: 'Application as Lead Engineer',
    date: '2026-07-25',
  };

  data.meta.theme.name = themeId;
  data.meta.theme.locale = 'en';

  // ⚠️ Load-bearing: an empty two-column order renders a document with no
  // sections that compiles perfectly. See `applyThemeLayout`'s docblock.
  applyThemeLayout(data, themeId);

  // A manual page break is one checkbox in the layout editor, and it routes
  // through a branch (`hasPageBreak`) that every serializer has and that no
  // string test compiles. It found a real crash: StackOverflow emitted
  // `#pagebreak()` inside a `#block`, which Typst rejects outright.
  if (options.pageBreaks) {
    const { main, sidebar } = data.meta.content.order.twoColumn;
    data.meta.content.pageBreaks = {
      oneColumn: [...data.meta.content.order.oneColumn],
      twoColumn: { main: [...main], sidebar: [...sidebar] },
    };
  }

  return data;
}
