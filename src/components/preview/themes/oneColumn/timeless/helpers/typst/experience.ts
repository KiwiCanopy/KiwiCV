import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function highlights(items: string[] | undefined, fontScale: number): string {
  if (!items || items.length === 0) return '';
  return `
    #v(${4 * fontScale}pt)
    #list(
      marker: text(size: ${8 * fontScale}pt)[•],
      ${items.map((item) => `[${escapeTypst(item)}]`).join(',\n      ')}
    )`;
}

function itemEntry({
  title,
  subtitle,
  date,
  url,
  summary,
  highlightsMarkup,
  fontScale,
}: {
  title?: string;
  subtitle?: string;
  date?: string;
  url?: string;
  summary?: string;
  highlightsMarkup?: string;
  fontScale: number;
}): string {
  const titleMarkup = url
    ? `#link("${sanitizeUrl(url)}")[#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}] #link-icon("external-link")]`
    : `#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}]`;

  return `#block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left + bottom, right + bottom),
      [${titleMarkup}],
      [#text(size: ${9 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(date)}]]
    )
    ${subtitle ? `#v(${2 * fontScale}pt)\n#text(size: ${10 * fontScale}pt, style: "italic", fill: rgb("#333333"))[${escapeTypst(subtitle)}]` : ''}
    ${summary ? `${getTypstEntryDetailsGap(fontScale)}\n#text(size: ${9 * fontScale}pt, fill: rgb("#444444"))[${escapeTypst(summary)}]` : ''}
    ${highlightsMarkup || ''}
  ]
  #v(${16 * fontScale}pt)`;
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const entries = v.work.map((item) => {
    const title = cvLocale.boldHeaderWork === 'company' ? item.name : item.position;
    const subtitle = [
      cvLocale.boldHeaderWork === 'company' ? item.position : item.name,
      item.location,
    ]
      .filter(Boolean)
      .join(' · ');
    return itemEntry({
      title,
      subtitle,
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      summary: item.summary,
      highlightsMarkup: highlights(item.highlights, fontScale),
      fontScale,
    });
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.work || 'Work Experience')}")`,
    entries,
  });
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  const items = v[sectionId] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const entries = items.map((item) =>
    itemEntry({
      title: item.name,
      subtitle: [item.entity, item.location].filter(Boolean).join(' · '),
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      summary: item.description,
      highlightsMarkup: highlights(item.highlights, fontScale),
      fontScale,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels[sectionId] || labels.projects || 'Projects')}")`,
    entries,
  });
}

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const entries = v.volunteer.map((item) =>
    itemEntry({
      title: item.position,
      subtitle: [item.organization, item.location].filter(Boolean).join(' · '),
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      summary: item.summary,
      highlightsMarkup: highlights(item.highlights, fontScale),
      fontScale,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.volunteer || 'Volunteer')}")`,
    entries,
  });
}
