import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { CUSTOM_SECTION_TYPST_ICON } from '@/components/preview/themes/shared/customSections';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  /** A custom section in the volunteer slot: neutral header icon. */
  isCustomSection?: boolean;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function linkTitle(title: string, url: string | null | undefined, size: number): string {
  const titleMarkup = `#text(weight: "bold", size: ${size}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (!url) return titleMarkup;
  return `#link("${sanitizeUrl(url)}")[${titleMarkup} #h(3pt) #link-icon("external-link")]`;
}

function dateBadge(date: string, fontScale: number): string {
  if (!date) return '[]';
  return `box(
    fill: brand-primary-very-light,
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${7 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

function timelineRow({
  title,
  subtitle,
  location,
  date,
  summary,
  highlights,
  url,
  isPresent,
  fontScale,
}: {
  title: string;
  subtitle?: string;
  location?: string;
  date: string;
  summary?: string;
  highlights?: string[];
  url?: string;
  isPresent: boolean;
  fontScale: number;
}): string {
  const subtitleLine = [subtitle, location].filter(Boolean).join(' · ');
  const highlightsList = (highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

  return `    (
      isPresent: ${isPresent},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          column-gutter: ${8 * fontScale}pt,
          [
            ${linkTitle(title, url, 9.5 * fontScale)}
            ${
              subtitleLine
                ? `${getTypstEntrySubheaderGap(fontScale, '            ')}
                            #text(size: ${8.5 * fontScale}pt, weight: "semibold", fill: brand-text-light)[${escapeTypst(subtitleLine)}]`
                : ''
            }
          ],
          ${dateBadge(date, fontScale)}
        )
        ${summary ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
        ${
          highlights && highlights.length > 0
            ? `#v(${2 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(size: ${8 * fontScale}pt, fill: brand-primary)[#sym.bullet], ${highlightsList})`
            : ''
        }
      ]
    ),`;
}

function simpleSideEntry(
  title: string,
  subtitle: string,
  date: string,
  url: string | null | undefined,
  fontScale: number,
): string {
  return `#foggy-small-card[
  ${date ? `#text(size: ${7 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}] \\` : ''}
  ${linkTitle(title, url, 8.5 * fontScale)}
  ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]` : ''}
]
#v(${6 * fontScale}pt)`;
}

export function serializeWork(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const boldHeader = cvLocale.boldHeaderWork;
  const entries = v.work.map((item) => {
    const title = boldHeader === 'company' ? item.name : item.position;
    const subtitle = boldHeader === 'company' ? item.position : item.name;
    const date = formatCVDateRange(item.startDate, item.endDate);
    if (isSide) {
      return simpleSideEntry(
        title,
        [subtitle, item.location].filter(Boolean).join(' · '),
        date,
        item.url,
        fontScale,
      );
    }
    return timelineRow({
      title,
      subtitle,
      location: item.location,
      date,
      summary: item.summary,
      highlights: item.highlights,
      url: item.url,
      isPresent: isOngoingEndDate(item.endDate),
      fontScale,
    });
  });

  const firstTimeline = `#foggy-timeline(rows: (\n${entries[0]}\n))`;
  const remainingTimeline =
    entries.length > 1 ? `\n#foggy-timeline(rows: (\n${entries.slice(1).join('\n')}\n))` : '';
  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.work || 'work')}", "work", is-side: ${isSide})`,
    entries: isSide ? entries : [firstTimeline, remainingTimeline].filter(Boolean),
  });
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  isSide: boolean,
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  const items = v[sectionId as keyof typeof v] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const entries = items.map((item) => {
    const projectMeta = [item.entity, item.type].filter(Boolean).join(' — ');
    const date = formatCVDateRange(item.startDate, item.endDate);
    // ⚠️ `entity` and `type` are both main-column-only, so the side
    // subtitle is the location alone — `projectMeta` is the main column's string
    // and this branch must not reuse it. `MAIN_COLUMN_ONLY_FIELDS` is what prints
    // the badge promising both, and `mainColumnOnlyPromise.test.ts` asserts it in
    // both outputs. `type` and `entity` both once leaked here, and `entity`
    // leaked from `side/Projects.tsx` too — the two renderers agreed, so
    // `previewExportParity.test.ts` was green over all ten rows.
    if (isSide) return simpleSideEntry(item.name, item.location || '', date, item.url, fontScale);
    return timelineRow({
      title: item.name,
      subtitle: projectMeta,
      location: item.location,
      date,
      summary: item.description,
      highlights: item.highlights,
      url: item.url,
      isPresent: isOngoingEndDate(item.endDate),
      fontScale,
    });
  });

  const icon = sectionId === 'privateProjects' ? 'rocket' : 'folder';
  const firstTimeline = `#foggy-timeline(rows: (\n${entries[0]}\n))`;
  const remainingTimeline =
    entries.length > 1 ? `\n#foggy-timeline(rows: (\n${entries.slice(1).join('\n')}\n))` : '';
  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels[sectionId] || sectionId)}", "${icon}", is-side: ${isSide})`,
    entries: isSide ? entries : [firstTimeline, remainingTimeline].filter(Boolean),
  });
}

export function serializeVolunteer(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const entries = v.volunteer.map((item) => {
    const date = formatCVDateRange(item.startDate, item.endDate);
    if (isSide) {
      return simpleSideEntry(
        item.position,
        [item.organization, item.location].filter(Boolean).join(' · '),
        date,
        item.url,
        fontScale,
      );
    }
    return timelineRow({
      title: item.position,
      subtitle: item.organization,
      location: item.location,
      date,
      summary: item.summary,
      highlights: item.highlights,
      url: item.url,
      isPresent: isOngoingEndDate(item.endDate),
      fontScale,
    });
  });

  const firstTimeline = `#foggy-timeline(rows: (\n${entries[0]}\n))`;
  const remainingTimeline =
    entries.length > 1 ? `\n#foggy-timeline(rows: (\n${entries.slice(1).join('\n')}\n))` : '';
  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.volunteer || 'volunteer')}", "${context.isCustomSection ? CUSTOM_SECTION_TYPST_ICON : 'heart'}", is-side: ${isSide})`,
    entries: isSide ? entries : [firstTimeline, remainingTimeline].filter(Boolean),
  });
}
