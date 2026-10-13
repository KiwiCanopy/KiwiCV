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

function plain2EntryHeader(
  title: string,
  subtitle: string | undefined,
  url: string | undefined,
  fontScale: number,
): string {
  const content = `#text(size: ${10.5 * fontScale}pt, weight: "bold", fill: brand-title)[${escapeTypst(title)}]${
    subtitle
      ? ` #text(size: ${9.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]`
      : ''
  }`;

  if (url) {
    return `link("${sanitizeUrl(url)}")[${content} #text(fill: brand-text-muted)[#link-icon("external-link")]]`;
  }
  return `[${content}]`;
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const label = labels.work || 'work';
  const boldHeader = cvLocale.boldHeaderWork;
  const entries = v.work.map((item) => {
    const titleText = boldHeader === 'company' ? item.name : item.position;
    const subtitleText = [boldHeader === 'company' ? item.position : item.name, item.location]
      .filter(Boolean)
      .join(' · ');
    const headerMarkup = plain2EntryHeader(titleText, subtitleText, item.url, fontScale);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
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

  const label = labels[sectionId] || sectionId;
  const entries = items.map((item) => {
    const entityType = [item.entity, item.type].filter(Boolean).join(' — ');
    const subtitleText = [entityType, item.location].filter(Boolean).join(' · ');
    const headerMarkup = plain2EntryHeader(
      item.name,
      subtitleText || undefined,
      item.url,
      fontScale,
    );
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.description)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const label = labels.volunteer || 'volunteer';
  const entries = v.volunteer.map((item) => {
    const subtitleText = [item.organization, item.location].filter(Boolean).join(' · ');
    const headerMarkup = plain2EntryHeader(item.position, subtitleText, item.url, fontScale);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}
