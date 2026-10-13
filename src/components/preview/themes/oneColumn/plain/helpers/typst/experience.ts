import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getEntryHeaderMarkup,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange } = context;
  if (!v.work || v.work.length === 0) return '';

  const label = labels.work || 'work';
  const boldHeader = cvLocale.boldHeaderWork;
  const entries = v.work.map((item) => {
    const titleText = boldHeader === 'company' ? item.name : item.position;
    const subtitleText = boldHeader === 'company' ? item.position : item.name;
    const details = [subtitleText, item.location].filter(Boolean).join(' · ');

    const headerMarkup = getEntryHeaderMarkup(titleText, details, item.url);

    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange } = context;
  const items = v[sectionId] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const label = labels[sectionId] || sectionId;
  const entries = items.map((item) => {
    const subtitleText = [item.entity, item.location].filter(Boolean).join(' · ');
    const headerMarkup = getEntryHeaderMarkup(item.name, subtitleText, item.url);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.description)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const label = labels.volunteer || 'volunteer';
  const entries = v.volunteer.map((item) => {
    // A custom section has no organization: lead with the name instead of
    // an empty bold title and a dangling " · ".
    const headerMarkup = item.organization
      ? getEntryHeaderMarkup(
          item.organization,
          [item.position, item.location].filter(Boolean).join(' · '),
          item.url,
        )
      : getEntryHeaderMarkup(item.position, item.location, item.url);

    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}],`).join(' ');

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}",
      highlights: (${highlightsList})
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}
