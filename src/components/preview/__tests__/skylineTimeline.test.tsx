// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import {
  getBoundFormatters,
  getSectionLabels,
} from '@/components/preview/themes/shared/translations';
import { MainAwardsSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Awards';
import { MainCertificatesSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Certificates';
import { MainEducationSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Education';
import { MainPublicationsSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/main/Publications';
import { SideAwardsSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Awards';
import { SideCertificatesSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Certificates';
import { SideEducationSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Education';
import { SideProjectsSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Projects';
import { SidePublicationsSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Publications';
import { SideVolunteerSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Volunteer';
import { SideWorkSection } from '@/components/preview/themes/twoColumn/skyline/helpers/HTML/side/Work';
import { TIMELINE_DOT_UNLIT } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/CommonHTML';
import { PALETTES_HTML } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/constants';
import type { UnifiedSectionComponent } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/types';
import {
  serializeAwards,
  serializeCertificates,
  serializePublications,
} from '@/components/preview/themes/twoColumn/skyline/helpers/typst/achievementsReferences';
import { serializeEducation } from '@/components/preview/themes/twoColumn/skyline/helpers/typst/educationSkills';
import {
  serializeProjects,
  serializeVolunteer,
  serializeWork,
} from '@/components/preview/themes/twoColumn/skyline/helpers/typst/experience';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { applyPlacement } from '@/test/themePlacements';
import { ALL_BOLD_HEADERS, type ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Skyline's main column draws Projects and Volunteer on the timeline in both
 * outputs, with the dot lit for an ongoing entry. `previewExportParity` compares
 * text only, so it cannot see the rail or the dot.
 *
 * Each section carries one ongoing entry and one ended one. The volunteer entry
 * ends in "Present", which a bare emptiness test would read as ended.
 */
const LABELS = { projects: 'Probe Projects', volunteer: 'Probe Volunteer' } as const;

function swappedSkyline(): ResumeData {
  const data = buildSingleItemResume('skyline');
  data.meta.theme.name = 'skyline';
  applyPlacement(data, 'swapped');
  data.meta.theme.params = { ...data.meta.theme.params, sectionLabels: { ...LABELS } };
  const [project] = data.projects;
  data.projects = [
    { ...project, name: 'Ongoing project', endDate: '' },
    { ...project, name: 'Ended project', endDate: '2022-12' },
  ];
  const [volunteer] = data.volunteer;
  data.volunteer = [
    { ...volunteer, position: 'Ongoing volunteer', endDate: 'Present' },
    { ...volunteer, position: 'Ended volunteer', endDate: '2019-12' },
  ];
  return data;
}

/** A colour as jsdom serializes it, so a hex palette entry compares with a computed style. */
const cssColor = (color: string) => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
};

describe('skyline main-column timeline', () => {
  describe('preview', () => {
    beforeAll(() => {
      const data = swappedSkyline();
      const bound = getBoundFormatters(data);
      document.body.innerHTML = renderToStaticMarkup(
        createElement(ThemeRegistry.skyline.HTMLComponent, {
          data,
          formatCVDate: bound.formatCVDate,
          formatCVDateRange: bound.formatCVDateRange,
        }),
      );
    });
    const primary = cssColor(PALETTES_HTML.default.primary);
    const unlit = cssColor(TIMELINE_DOT_UNLIT);

    /** The section card under the given header, and the dot beside each entry title. */
    const dots = (label: string) => {
      const heading = [...document.querySelectorAll('h3')].find((h) => h.textContent === label);
      const card = heading?.parentElement?.parentElement;
      return [...(card?.querySelectorAll('h4') ?? [])].map((title) => {
        const row = title.closest('div[style*="gap:16px"]') as HTMLElement | null;
        const dot = row?.firstElementChild?.firstElementChild as HTMLElement | null;
        return { title: title.textContent, color: dot?.style.backgroundColor };
      });
    };

    it.each([
      ['projects', 'Ongoing project', 'Ended project'],
      ['volunteer', 'Ongoing volunteer', 'Ended volunteer'],
    ] as const)('%s renders a timeline row per entry, lit only when ongoing', (id, on, off) => {
      expect(dots(LABELS[id])).toEqual([
        { title: on, color: primary },
        { title: off, color: unlit },
      ]);
    });
  });

  describe('PDF', () => {
    const typst = SERIALIZERS.skyline(swappedSkyline());

    const section = (label: string) => {
      const start = typst.indexOf(`#skyline-section("${label}"`);
      const end = typst.indexOf('#skyline-section(', start + 1);
      return start < 0 ? '' : typst.slice(start, end < 0 ? undefined : end);
    };

    it.each(['projects', 'volunteer'] as const)(
      '%s emits a timeline row per entry, lit only when ongoing',
      (id) => {
        const markup = section(LABELS[id]);
        expect(markup).toContain('#skyline-timeline(rows:');
        expect([...markup.matchAll(/isPresent: (\w+)/g)].map((m) => m[1])).toEqual([
          'true',
          'false',
        ]);
      },
    );
  });
});

type SeededSection =
  | 'work'
  | 'projects'
  | 'privateProjects'
  | 'volunteer'
  | 'education'
  | 'awards'
  | 'certificates'
  | 'publications';

/** Every text field of the section's item, each carrying its own sentinel. */
function seededItem(section: SeededSection) {
  const sentinels: string[] = [];
  const item: Record<string, unknown> = { ...createEmptyItem(section) };
  for (const [field, value] of Object.entries(item)) {
    if (field.endsWith('Date') || field === '_vId') continue;
    const sentinel = `ZQ${section}${field}`;
    if (field === 'url') item[field] = `https://${sentinel.toLowerCase()}.example.com/p`;
    else if (typeof value === 'string') item[field] = sentinel;
    else if (Array.isArray(value)) item[field] = [sentinel];
    else continue;
    sentinels.push(field === 'url' ? sentinel.toLowerCase() : sentinel);
  }
  return { item: { ...item, startDate: '2020-01', endDate: '2021-06' }, sentinels };
}

/** The needles the markup contains, in the order it prints them. */
const printed = (markup: string, needles: string[]) =>
  needles.filter((s) => markup.includes(s)).sort((a, b) => markup.indexOf(a) - markup.indexOf(b));

/**
 * The sidebar entry, below the projection. `applyLayoutVariant('side')` blanks
 * `summary`/`highlights` before either renderer runs, so `previewExportParity`
 * sees agreement whatever the side components do. This feeds unprojected items
 * to both, so the two sidebar renderers cannot pick different fields.
 */
describe('skyline sidebar entries show what the PDF sidebar prints', () => {
  type SideSection = 'work' | 'projects' | 'privateProjects' | 'volunteer';
  const COMPONENTS: Record<SideSection, UnifiedSectionComponent> = {
    work: SideWorkSection,
    projects: SideProjectsSection,
    privateProjects: SideProjectsSection,
    volunteer: SideVolunteerSection,
  };

  it.each(
    (Object.keys(COMPONENTS) as SideSection[]).flatMap((section) =>
      ALL_BOLD_HEADERS.map((bold) => [section, bold] as const),
    ),
  )('%s (boldHeaderWork %s)', (section, bold) => {
    const data = buildSingleItemResume('skyline');
    data.meta.theme.params = { ...data.meta.theme.params, boldHeaderWork: bold };
    const { cvLocale, formatCVDateRange } = getBoundFormatters(data);
    const labels = getSectionLabels(cvLocale.sections || {});
    const { item, sentinels } = seededItem(section);

    const html = renderToStaticMarkup(
      createElement(COMPONENTS[section], {
        data: [item],
        p: PALETTES_HTML.default,
        labels,
        cvLocale,
        formatCVDate: (d?: string) => d ?? '',
        formatCVDateRange,
        fontScale: 1,
      }),
    );
    const context = {
      labels,
      v: { [section]: [item] } as never,
      cvLocale,
      formatCVDateRange,
      fontScale: 1,
    };
    const typst =
      section === 'work'
        ? serializeWork(true, context)
        : section === 'volunteer'
          ? serializeVolunteer(true, context)
          : serializeProjects(section, true, context);

    const date = formatCVDateRange('2020-01', '2021-06');
    expect(date).not.toBe('');
    const needles = [date, ...sentinels];
    const pdf = printed(typst, needles);

    // The control: the PDF sidebar prints date first, then the title, and ends
    // with the prose and the bullets.
    const prose = section === 'work' || section === 'volunteer' ? 'summary' : 'description';
    expect(pdf[0]).toBe(date);
    expect(pdf.slice(-2)).toEqual([`ZQ${section}${prose}`, `ZQ${section}highlights`]);
    expect(printed(html, needles)).toEqual(pdf);
  });
});

/**
 * Education is drawn as cards, not on the timeline, but takes its fields from
 * the same `educationTimelineRow` in every renderer. The main column's
 * date is a right-hand badge whose source position differs between outputs, so
 * the order check there leaves it out.
 */
describe('skyline education entries show what the PDF prints', () => {
  const DEGREE = ['studyType', 'area'];

  const PLACEMENTS = [true, false].flatMap((isSide) =>
    ALL_BOLD_HEADERS.map((bold) => [isSide, bold] as const),
  );

  /** One education item through the preview component and the serializer. */
  function render(isSide: boolean, bold: (typeof ALL_BOLD_HEADERS)[number], item: object) {
    const data = buildSingleItemResume('skyline');
    data.meta.theme.params = { ...data.meta.theme.params, boldHeaderEducation: bold };
    const { cvLocale, formatCVDateRange } = getBoundFormatters(data);
    const labels = getSectionLabels(cvLocale.sections || {});
    const html = renderToStaticMarkup(
      createElement(isSide ? SideEducationSection : MainEducationSection, {
        data: [item] as never,
        p: PALETTES_HTML.default,
        labels,
        cvLocale,
        formatCVDate: (d?: string) => d ?? '',
        formatCVDateRange,
        fontScale: 1,
      }),
    );
    const typst = serializeEducation(isSide, {
      labels,
      v: { education: [item] } as never,
      cvLocale,
      formatCVDateRange,
      fontScale: 1,
    });
    return { html, typst, formatCVDateRange };
  }

  it.each(PLACEMENTS)('isSide %s (boldHeaderEducation %s)', (isSide, bold) => {
    const { item, sentinels } = seededItem('education');
    const { html, typst, formatCVDateRange } = render(isSide, bold, item);

    const date = formatCVDateRange('2020-01', '2021-06');
    const url = sentinels.find((s) => s.endsWith('url'))!;
    const sentinel = (field: string) => `ZQeducation${field}`;
    const needles = isSide ? [date, ...sentinels] : sentinels;
    const pdf = printed(typst, needles);

    // The control: the link wraps the title, so the url leads it; then the
    // bold field, the other half of the header, the location and the score;
    // only the main column lists courses.
    const lead = bold === 'company' ? ['institution', ...DEGREE] : [...DEGREE, 'institution'];
    const fields = [...lead, 'location', 'score', ...(isSide ? [] : ['courses'])];
    expect(pdf).toEqual([...(isSide ? [date] : []), url, ...fields.map(sentinel)]);
    expect(printed(html, needles)).toEqual(pdf);
    expect(html).toContain(date);
  });

  it.each(PLACEMENTS)(
    'isSide %s (boldHeaderEducation %s): no separator without a study type',
    (isSide, bold) => {
      const item = { ...createEmptyItem('education'), institution: 'ZQinst', area: 'ZQarea' };
      const { html, typst } = render(isSide, bold, item);
      for (const output of [html, typst]) {
        expect(output).toContain('ZQarea');
        expect(output).not.toMatch(/[[>] (— )?ZQarea/);
      }
    },
  );
});

/**
 * Awards, Certificates and Publications are cards with one date, mapped once by
 * `awardRow`/`certificateRow`/`publicationRow` for every renderer.
 * Unprojected, like the sidebar block above: `applyLayoutVariant('side')`
 * blanks the summary before either renderer, so only a raw item shows whether
 * both sidebars print it.
 */
describe('skyline award, certificate and publication entries show what the PDF prints', () => {
  type Section = 'awards' | 'certificates' | 'publications';
  const SECTIONS: Record<
    Section,
    {
      main: UnifiedSectionComponent;
      side: UnifiedSectionComponent;
      serialize: typeof serializeAwards;
      date: string;
      fields: string[];
    }
  > = {
    awards: {
      main: MainAwardsSection,
      side: SideAwardsSection,
      serialize: serializeAwards,
      date: 'date',
      fields: ['title', 'awarder', 'location', 'summary'],
    },
    certificates: {
      main: MainCertificatesSection,
      side: SideCertificatesSection,
      serialize: serializeCertificates,
      date: 'date',
      fields: ['name', 'issuer'],
    },
    publications: {
      main: MainPublicationsSection,
      side: SidePublicationsSection,
      serialize: serializePublications,
      date: 'releaseDate',
      fields: ['name', 'publisher', 'summary'],
    },
  };

  const RUNS = (Object.keys(SECTIONS) as Section[]).flatMap((section) =>
    [true, false].map((isSide) => [section, isSide] as const),
  );

  /** One item through the placement's preview component and the serializer. */
  function render(section: Section, isSide: boolean, item: object) {
    const { main, side, serialize } = SECTIONS[section];
    const data = buildSingleItemResume('skyline');
    const { cvLocale, formatCVDateRange } = getBoundFormatters(data);
    const labels = getSectionLabels(cvLocale.sections || {});
    const formatCVDate = (d?: string | null) => (d ? `D:${d}` : '');
    const html = renderToStaticMarkup(
      createElement(isSide ? side : main, {
        data: [item],
        p: PALETTES_HTML.default,
        labels,
        cvLocale,
        formatCVDate,
        formatCVDateRange,
        fontScale: 1,
      }),
    );
    const typst = serialize(isSide, {
      labels,
      v: { [section]: [item] } as never,
      formatCVDate,
      fontScale: 1,
    });
    return { html, typst };
  }

  it.each(RUNS)('%s isSide %s', (section, isSide) => {
    const { date: dateField, fields } = SECTIONS[section];
    const { item, sentinels } = seededItem(section);
    const dateSentinel = `ZQ${section}${dateField}`;
    const { html, typst } = render(section, isSide, { ...item, [dateField]: dateSentinel });

    const date = `D:${dateSentinel}`;
    const url = sentinels.find((s) => s.endsWith('url'))!;
    const body = sentinels.filter((s) => s !== dateSentinel && s !== url);
    // The main column's date is a right-hand badge whose source position
    // differs between outputs, so the order check there leaves it out.
    const needles = isSide ? [date, url, ...body] : [url, ...body];

    // The control: the sidebar leads with the date; the link wraps the title,
    // so the url leads it; then the subtitle line and the summary.
    const expected = [url, ...fields.map((f) => `ZQ${section}${f}`)];
    expect(printed(typst, needles)).toEqual(isSide ? [date, ...expected] : expected);
    expect(printed(html, needles)).toEqual(printed(typst, needles));
    for (const output of [html, typst]) expect(output).toContain(date);
  });

  it.each(RUNS)('%s isSide %s: absent fields print nothing', (section, isSide) => {
    const title = section === 'awards' ? 'title' : 'name';
    const item = { [title]: 'ZQtitle', ...(section === 'awards' ? { location: 'ZQloc' } : {}) };
    const { html, typst } = render(section, isSide, item);
    for (const output of [html, typst]) {
      expect(output).toContain('ZQtitle');
      if (section === 'awards') expect(output).toContain('ZQloc');
      expect(output).not.toMatch(/undefined|D:|· ZQloc/);
    }
  });
});
