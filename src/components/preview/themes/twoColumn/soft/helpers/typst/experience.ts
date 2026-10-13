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

interface SoftContext {
  labels: Record<string, string>;
  /** A custom section in the volunteer slot: neutral header icon. */
  isCustomSection?: boolean;
  v: ReturnType<typeof import('@/components/preview/themes/shared').getVisibleData>;
  cvLocale: { boldHeaderWork?: string; code?: string };
  formatCVDateRange: (start?: string, end?: string) => string;
  fontScale: number;
}

function entryBlock(content: string, fontScale: number): string {
  return `#block(
    width: 100%,
    breakable: false,
    stroke: (left: ${2 * fontScale}pt + brand-border),
    inset: (left: ${10 * fontScale}pt)
  )[
    ${content}
  ]`;
}

function highlights(items: string[] | undefined, fontScale: number): string {
  if (!items || items.length === 0) return '';
  return `
#v(${6 * fontScale}pt)
#list(marker: [#circle(radius: ${2 * fontScale}pt, fill: soft-primary-40)], ${items
    .map((item) => `[${escapeTypst(item)}]`)
    .join(', ')})`;
}

function workLikeEntry({
  title,
  subtitle,
  date,
  isSide,
  summary,
  highlights: highlightItems,
  url,
  fontScale,
}: {
  title: string;
  subtitle: string;
  date: string;
  isSide: boolean;
  summary?: string;
  highlights?: string[];
  url?: string;
  fontScale: number;
}): string {
  const validUrl = sanitizeUrl(url);
  const titleMarkup = validUrl
    ? `#link("${validUrl}")[#text(size: ${11 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(title)}] #link-icon("external-link")]`
    : `#text(size: ${11 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(title)}]`;

  if (isSide) {
    return entryBlock(
      `
${date ? `#text(size: ${7.5 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}]\\\n` : ''}${titleMarkup}
${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '', true)}\n#text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(subtitle)}]` : ''}
`,
      fontScale,
    );
  }

  return entryBlock(
    `
#grid(
  columns: (1fr, auto),
  align: (left + top, right + top),
  column-gutter: ${10 * fontScale}pt,
  [
    ${titleMarkup}
    ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '    ')}\n    #text(size: ${9.25 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(subtitle)}]` : ''}
  ],
  [#box(fill: brand-primary-bg, radius: ${6 * fontScale}pt, inset: (x: ${7 * fontScale}pt, y: ${2.5 * fontScale}pt), text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(date)}])]
)
${summary ? `${getTypstEntryDetailsGap(fontScale)}\n#text(size: ${9 * fontScale}pt, fill: brand-text-light)[${escapeTypst(summary)}]` : ''}
${highlights(highlightItems, fontScale)}
`,
    fontScale,
  );
}

export function serializeWork(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.work as ResumeData['work'];
  if (!items?.length) return '';
  const entries = items.map((item, idx) => {
    const boldCompany = ctx.cvLocale?.boldHeaderWork === 'company';
    const title = (boldCompany ? item.name : item.position) || '';
    const subtitle = [boldCompany ? item.position : item.name, item.location]
      .filter(Boolean)
      .join(' · ');
    return `${workLikeEntry({ title, subtitle, date: ctx.formatCVDateRange(item.startDate, item.endDate), isSide, summary: item.summary, highlights: item.highlights, url: item.url, fontScale: ctx.fontScale })}${idx < items.length - 1 ? `\n#v(${(isSide ? 12 : 24) * ctx.fontScale}pt)\n` : ''}`;
  });
  return keepTypstHeaderWithFirstEntry({
    header: `#soft-section("${escapeTypstString(ctx.labels.work || 'Work Experience')}", "briefcase-business", is-side: ${isSide})`,
    entries,
  });
}

export function serializeProjects(sectionId: string, isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v[sectionId as 'projects' | 'privateProjects'] as ResumeData['projects'];
  if (!items?.length) return '';
  const label =
    sectionId === 'privateProjects'
      ? ctx.labels.privateProjects || 'Private Projects'
      : ctx.labels.projects || 'Projects';
  const entries = items.map((item, idx) => {
    // ⚠️ `entity` and `type` are both main-column-only, so the side
    // subtitle is the location alone. This was the one project serializer with no
    // side branch at all — the same subtitle once went to both columns.
    // `MAIN_COLUMN_ONLY_FIELDS` is what prints the badge promising both, and
    // `mainColumnOnlyPromise.test.ts` asserts it in both outputs. `entity` once leaked
    // here, and from `side/Projects.tsx` too — the two renderers
    // agreed, so `previewExportParity.test.ts` was green over all ten rows.
    const subtitle = isSide
      ? item.location || ''
      : [item.type, item.entity, item.location].filter(Boolean).join(' · ');
    return `${workLikeEntry({ title: item.name || '', subtitle, date: ctx.formatCVDateRange(item.startDate, item.endDate), isSide, summary: item.description, highlights: item.highlights, url: item.url, fontScale: ctx.fontScale })}${idx < items.length - 1 ? `\n#v(${(isSide ? 12 : 24) * ctx.fontScale}pt)\n` : ''}`;
  });
  return keepTypstHeaderWithFirstEntry({
    header: `#soft-section("${escapeTypstString(label)}", "folder-open", is-side: ${isSide})`,
    entries,
  });
}

export function serializeVolunteer(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.volunteer as ResumeData['volunteer'];
  if (!items?.length) return '';
  const entries = items.map((item, idx) => {
    // `serializeWork` above already appends the location to whichever party is
    // not the title; this section did not, so a volunteer location was on screen
    // and absent from the PDF. Same slot, same separator — the omission
    // was in this one call, not in the theme's design.
    //
    // ⚠️ The title/subtitle pair is the reverse of `SoftHTML`'s, which titles the
    // entry with `position` and subtitles it with `organization`. That is a
    // second, older disagreement about *placement* rather than presence, so the
    // parity walk cannot see it and it is deliberately left alone here.
    // With no organization (a custom section) the position is the title, so
    // no entry opens with an empty bold line.
    const title = item.organization || item.position || '';
    const subtitle = [item.organization ? item.position : '', item.location]
      .filter(Boolean)
      .join(' · ');
    return `${workLikeEntry({ title, subtitle, date: ctx.formatCVDateRange(item.startDate, item.endDate), isSide, summary: item.summary, highlights: item.highlights, url: item.url, fontScale: ctx.fontScale })}${idx < items.length - 1 ? `\n#v(${(isSide ? 12 : 24) * ctx.fontScale}pt)\n` : ''}`;
  });
  return keepTypstHeaderWithFirstEntry({
    header: `#soft-section("${escapeTypstString(ctx.labels.volunteer || 'Volunteer')}", "${ctx.isCustomSection ? CUSTOM_SECTION_TYPST_ICON : 'heart-handshake'}", is-side: ${isSide})`,
    entries,
  });
}
