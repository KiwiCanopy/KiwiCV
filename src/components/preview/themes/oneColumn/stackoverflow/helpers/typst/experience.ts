import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
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
      marker: text(size: ${8 * fontScale}pt, fill: brand-text-muted)[•],
      ${items.map((item) => `[${escapeTypst(item)}]`).join(',\n      ')}
    )`;
}

function entry({
  title,
  org,
  date,
  url,
  body,
}: {
  title?: string;
  org?: string;
  date?: string;
  url?: string;
  body?: string;
}): string {
  const cleanTitle = escapeTypst(title || '');
  const cleanOrg = escapeTypst(org || '');
  const cleanDate = escapeTypst(date || '');
  const titleContent = url
    ? `#link("${sanitizeUrl(url)}")[#text(weight: "bold", fill: brand-dark)[${cleanTitle}] #link-icon("external-link")]`
    : `#text(weight: "bold", fill: brand-dark)[${cleanTitle}]`;

  return `#stackoverflow-entry(
    title: [${titleContent}${cleanOrg ? ` #text(fill: brand-text-muted)[${cleanOrg}]` : ''}],
    date: [${cleanDate}],
    body: [${body || ''}]
  )`;
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const entries = v.work.map((item) => {
    const title = cvLocale.boldHeaderWork === 'company' ? item.name : item.position;
    const org = [cvLocale.boldHeaderWork === 'company' ? item.position : item.name, item.location]
      .filter(Boolean)
      .join(' · ');
    const body = `${item.summary ? `#text(size: ${9 * fontScale}pt, fill: brand-text)[${escapeTypst(item.summary)}]` : ''}${highlights(item.highlights, fontScale)}`;

    return entry({
      title,
      org,
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      body,
    });
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.work || 'Work Experience')}")`,
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

  const entries = items.map((item) => {
    const org = [[item.entity, item.type].filter(Boolean).join(' — '), item.location]
      .filter(Boolean)
      .join(' · ');
    const body = `${item.description ? `#text(size: ${9 * fontScale}pt, fill: brand-text)[${escapeTypst(item.description)}]` : ''}${highlights(item.highlights, fontScale)}`;
    return entry({
      title: item.name,
      org,
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      body,
    });
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels[sectionId] || labels.projects || 'Projects')}")`,
    entries,
  });
}

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const entries = v.volunteer.map((item) => {
    const org = [item.organization, item.location].filter(Boolean).join(' · ');
    const body = `${item.summary ? `#text(size: ${9 * fontScale}pt, fill: brand-text)[${escapeTypst(item.summary)}]` : ''}${highlights(item.highlights, fontScale)}`;
    return entry({
      title: item.position,
      org,
      date: formatCVDateRange(item.startDate, item.endDate),
      url: item.url,
      body,
    });
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.volunteer || 'Volunteer')}")`,
    entries,
  });
}
