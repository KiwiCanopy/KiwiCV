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
import {
  type SkylineTimelineRow,
  projectTimelineRow,
  subtitleLine,
  volunteerTimelineRow,
  workTimelineRow,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';
import type { ResumeData } from '@/types/resume';

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
    text(size: ${8 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

function mainTimelineRow({
  title,
  subtitle,
  location,
  date,
  summary,
  highlights,
  url,
  isPresent,
  fontScale,
}: SkylineTimelineRow & { fontScale: number }): string {
  const line = subtitleLine({ subtitle, location });
  const highlightsList = (highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

  return `    (
      isPresent: ${isPresent},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          column-gutter: ${6 * fontScale}pt,
          [
            ${linkTitle(title, url, 9.5 * fontScale)}
            ${
              line
                ? `${getTypstEntrySubheaderGap(fontScale, '            ')}
            #text(size: ${8.5 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(line)}]`
                : ''
            }
          ],
          ${dateBadge(date, fontScale)}
        )
        ${summary ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
        ${
          highlights && highlights.length > 0
            ? `#v(${summary ? 4 * fontScale : 2 * fontScale}pt)\n        #set text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(size: ${7.5 * fontScale}pt, fill: brand-primary)[•], ${highlightsList})`
            : ''
        }
      ]
    ),`;
}

function sideEntry(row: SkylineTimelineRow, fontScale: number): string {
  const { title, date, summary, highlights, url } = row;
  const subtitle = subtitleLine(row);
  const highlightsList = (highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');
  return `#block(width: 100%, breakable: false)[
  ${date ? `#text(size: ${7.5 * fontScale}pt, weight: "medium", fill: brand-primary)[#cv-upper[${escapeTypst(date)}]]\\ ` : ''}
  ${linkTitle(title, url, 8.5 * fontScale)}
  ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(subtitle)}]` : ''}
  ${summary ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${7.25 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
  ${highlights && highlights.length > 0 ? `#v(${summary ? 3 * fontScale : 2 * fontScale}pt)\n  #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n  #list(marker: text(size: ${8 * fontScale}pt, fill: brand-primary)[•], ${highlightsList})` : ''}
]
#v(${12 * fontScale}pt)`;
}

function timelineEntry(row: SkylineTimelineRow, isSide: boolean, fontScale: number): string {
  if (!isSide) return mainTimelineRow({ ...row, fontScale });
  return sideEntry(row, fontScale);
}

function timelineSection(
  label: string,
  icon: string,
  isSide: boolean,
  entries: string[],
  fontScale: number,
): string {
  if (isSide) {
    return keepTypstHeaderWithFirstEntry({
      header: `#skyline-section("${escapeTypstString(label)}", "${icon}", is-side: true)`,
      entries,
    });
  }

  return `#skyline-section("${escapeTypstString(label)}", "${icon}")
#skyline-timeline(rows: (
${entries.join('\n')}
))
#v(${16 * fontScale}pt)`;
}

export function serializeWork(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const entries = v.work.map((item) =>
    timelineEntry(workTimelineRow(item, cvLocale, formatCVDateRange), isSide, fontScale),
  );

  return timelineSection(labels.work || 'work', 'work', isSide, entries, fontScale);
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  isSide: boolean,
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  const items = v[sectionId as keyof typeof v] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const entries = items.map((item) =>
    timelineEntry(projectTimelineRow(item, formatCVDateRange), isSide, fontScale),
  );

  const icon = sectionId === 'privateProjects' ? 'rocket' : 'folder';
  return timelineSection(labels[sectionId] || sectionId, icon, isSide, entries, fontScale);
}

export function serializeVolunteer(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const entries = v.volunteer.map((item) =>
    timelineEntry(volunteerTimelineRow(item, formatCVDateRange), isSide, fontScale),
  );

  const icon = context.isCustomSection ? CUSTOM_SECTION_TYPST_ICON : 'heart';
  return timelineSection(labels.volunteer || 'volunteer', icon, isSide, entries, fontScale);
}
