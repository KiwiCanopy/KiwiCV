import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
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
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange } = context;
  if (!v.work || v.work.length === 0) return '';

  let markup = '';
  const boldHeader = cvLocale.boldHeaderWork;
  v.work.forEach((item, index) => {
    const title = boldHeader === 'company' ? item.name : item.position;
    const org = boldHeader === 'company' ? item.position : item.name;
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlights = item.highlights
      ? item.highlights.map((h) => `  - ${escapeTypst(h)}`).join('\n')
      : '';

    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(title || '')}],
  org: [${escapeTypst(org || '')}],
  location: [${escapeTypst(item.location || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${item.summary ? `${escapeTypst(item.summary)}\n` : ''}
  ${highlights ? `${highlights}\n` : ''}
]\n`;

    if (index === 0) {
      markup += `\n// Work Experience\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.work)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange } = context;
  const items = v[sectionId] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  let markup = '';
  const label = labels[sectionId] || sectionId;
  items.forEach((item, index) => {
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const orgParts = [item.entity, item.type].filter(Boolean);
    const org = orgParts.map(escapeTypst).join(' — ');
    const highlights = item.highlights
      ? item.highlights.map((h) => `  - ${escapeTypst(h)}`).join('\n')
      : '';

    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(item.name || '')}],
  org: [${org}],
  location: [${escapeTypst(item.location || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${item.description ? `${escapeTypst(item.description)}\n` : ''}
  ${highlights ? `${highlights}\n` : ''}
]\n`;

    if (index === 0) {
      markup += `\n// ${sectionId === 'projects' ? 'Projects' : 'Private Projects'}\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(label)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  let markup = '';
  v.volunteer.forEach((item, index) => {
    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlights = item.highlights
      ? item.highlights.map((h) => `  - ${escapeTypst(h)}`).join('\n')
      : '';

    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(item.position || '')}],
  org: [${escapeTypst(item.organization || '')}],
  location: [${escapeTypst(item.location || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${item.summary ? `${escapeTypst(item.summary)}\n` : ''}
  ${highlights ? `${highlights}\n` : ''}
]\n`;

    if (index === 0) {
      markup += `\n// Volunteer\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.volunteer)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}
