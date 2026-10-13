import {
  getLanguageLabel,
  getLevelInfo,
  getSkillLevelLabel,
} from '@/components/preview/themes/shared';
import {
  keepTypstHeaderWithFirstEntry,
  keepTypstHeaderWithFirstGridRow,
} from '@/components/preview/themes/shared/typstSectionGuards';
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
  v: Record<string, unknown>;
  cvLocale: { code?: string };
  formatCVDateRange: (start?: string, end?: string) => string;
  fontScale: number;
}

/**
 * ⚠️ **`url` reaches this entry the way it reaches `workLikeEntry` next door,
 * and its absence was the one `preview-only` row in the sweep.** Every
 * other theme renders `education.url` in both outputs and in both columns —
 * eleven of twelve, sixteen runs, no exceptions. Soft rendered it in exactly one
 * of its four education renderers: `side/Education.tsx` linked the heading and
 * `main/Education.tsx`, plus both branches here, had nothing. So a user typed a
 * university URL, watched the sidebar entry become a link, and sent an employer
 * a PDF with no link at all.
 *
 * `main` had the same hole, but as *absent from both* renderers — which
 * `previewExportParity.test.ts` scores as agreement. Only the sidebar surfaced,
 * and fixing only the sidebar would have moved the hole rather than closed it.
 */
function timelineEntry({
  institution,
  details,
  date,
  isSide,
  courses,
  url,
  fontScale,
}: {
  institution: string;
  details: string;
  date: string;
  isSide: boolean;
  courses?: string;
  url?: string;
  fontScale: number;
}): string {
  const validUrl = sanitizeUrl(url);
  const heading = (size: number): string => {
    const label = `#text(size: ${size * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(institution)}]`;
    return validUrl ? `#link("${validUrl}")[${label} #link-icon("external-link")]` : label;
  };

  if (isSide) {
    return `#block(
      width: 100%,
      breakable: false,
      stroke: (left: ${2 * fontScale}pt + brand-border),
      inset: (left: ${10 * fontScale}pt)
    )[
      ${date ? `#text(size: ${7.5 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}]\\\n` : ''}
      ${heading(8.5)}
      ${details ? `${getTypstEntrySubheaderGap(fontScale, '', true)}\n#text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(details)}]` : ''}
    ]`;
  }

  return `#block(
    width: 100%,
    breakable: false,
    stroke: (left: ${2 * fontScale}pt + brand-border),
    inset: (left: ${10 * fontScale}pt)
  )[
    #grid(columns: (1fr, auto), column-gutter: ${8 * fontScale}pt, align: (left + top, right + top),
      [
        ${heading(11)}
        ${details ? `${getTypstEntrySubheaderGap(fontScale, '    ')}\n    #text(size: ${9.25 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(details)}]` : ''}
      ],
      [#box(fill: brand-primary-bg, radius: ${6 * fontScale}pt, inset: (x: ${7 * fontScale}pt, y: ${2.5 * fontScale}pt), text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(date)}])]
    )
    ${courses ? `\n${getTypstEntryDetailsGap(fontScale)}\n#text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(courses)}]` : ''}
  ]`;
}

function levelBar(value: number, fontScale: number, height = 5): string {
  if (value <= 0) return '';
  const cells = [1, 2, 3, 4]
    .map(
      (step) =>
        `rect(width: 100%, height: ${height * fontScale}pt, fill: ${step <= value ? 'brand-primary' : 'soft-primary-10'}, radius: ${height * 0.5 * fontScale}pt)`,
    )
    .join(', ');
  return `#grid(columns: (1fr, 1fr, 1fr, 1fr), column-gutter: ${3 * fontScale}pt, ${cells})`;
}

function softBadge(text: string, fontScale: number): string {
  return `box(
    fill: white,
    stroke: 1pt + brand-border,
    radius: ${8 * fontScale}pt,
    inset: (x: ${8 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(text)}]
  )`;
}

export function serializeEducation(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.education as ResumeData['education'];
  if (!items?.length) return '';
  const entries = items.map((item, idx) => {
    // `location` before `score`, matching `SoftHTML`'s order: it puts the
    // location on the institution line and the score below it. It was missing
    // from the PDF entirely.
    const details = [item.area, item.studyType, item.location, item.score]
      .filter(Boolean)
      .join(' · ');
    return `${timelineEntry({
      institution: item.institution,
      details,
      date: ctx.formatCVDateRange(item.startDate, item.endDate),
      isSide,
      courses: item.courses?.length ? item.courses.join(' · ') : undefined,
      url: item.url,
      fontScale: ctx.fontScale,
    })}${idx < items.length - 1 ? `\n#v(${(isSide ? 10 : 20) * ctx.fontScale}pt)\n` : ''}`;
  });
  return keepTypstHeaderWithFirstEntry({
    header: `#soft-section("${escapeTypstString(ctx.labels.education || 'Education')}", "graduation-cap", is-side: ${isSide})`,
    entries,
  });
}

function skillCard(
  item: NonNullable<ResumeData['skills']>[number],
  isSide: boolean,
  ctx: SoftContext,
): string {
  const { value } = getLevelInfo(item.level, 'skill');
  const levelLabel = getSkillLevelLabel(item.level, ctx.cvLocale?.code);
  const keywords = item.keywords?.length
    ? `\n#v(${8 * ctx.fontScale}pt)\n#box(${item.keywords.map((kw) => softBadge(kw, ctx.fontScale)).join(` + h(${6 * ctx.fontScale}pt) + `)})`
    : '';
  return `block(width: 100%, breakable: false)[
  #layout(size => context {
    let name-content = text(size: ${(isSide ? 8.25 : 10.5) * ctx.fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}]
        let level-content = text(size: ${(isSide ? 7.25 : 8) * ctx.fontScale}pt, style: "italic", fill: brand-text-light)[${escapeTypst(levelLabel)}]
    let name-w = measure(name-content).width
    let level-w = if "${escapeTypstString(levelLabel)}" == "" { 0pt } else { measure(level-content).width }
    if name-w + level-w + ${8 * ctx.fontScale}pt < size.width {
      grid(columns: (1fr, auto), align: (left, right), name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { level-content })
    } else {
      stack(dir: ttb, spacing: ${2 * ctx.fontScale}pt, name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { align(right)[#level-content] })
    }
  })
  ${value > 0 ? `#v(${(isSide ? 4 : 8) * ctx.fontScale}pt)\n  ${levelBar(value, ctx.fontScale, isSide ? 4 : 5)}` : ''}
  ${!isSide ? keywords : ''}
]`;
}

export function serializeSkills(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.skills as ResumeData['skills'];
  if (!items?.length) return '';
  const cards = items.map((item) => skillCard(item, isSide, ctx));
  return keepTypstHeaderWithFirstGridRow({
    header: `#soft-section("${escapeTypstString(ctx.labels.skills || 'Skills')}", "brain", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${(isSide ? 12 : 18) * ctx.fontScale}pt`,
  });
}

export function serializeLanguages(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.languages as ResumeData['languages'];
  if (!items?.length) return '';
  const cards = items.map((item) => {
    const { value } = getLevelInfo(item.level, 'language');
    // ⚠️ `getLanguageLabel`, not `getLanguageLevelLabel`. The level-only helper
    // cannot see `certificate`, so a user typing "C2" into a language's
    // certificate field watched it appear in the preview and exported a PDF
    // without it. Soft was the only theme on the level-only helper —
    // every other serializer, and SoftHTML's own `Languages.tsx`, already call
    // this one — which is what makes it an omission rather than a design choice.
    const levelLabel = getLanguageLabel(item.level, item.certificate, ctx.cvLocale?.code);
    return `block(width: 100%, breakable: false)[
  #text(size: ${(isSide ? 8.25 : 10) * ctx.fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.language)}]
  ${levelLabel ? `#v(${2 * ctx.fontScale}pt)\n  #text(size: ${(isSide ? 7.25 : 8) * ctx.fontScale}pt, style: "italic", fill: brand-text-light)[${escapeTypst(levelLabel)}]` : ''}
  ${value > 0 ? `#v(${(isSide ? 4 : 7) * ctx.fontScale}pt)\n  ${levelBar(value, ctx.fontScale, isSide ? 4 : 5)}` : ''}
]`;
  });
  return keepTypstHeaderWithFirstGridRow({
    header: `#soft-section("${escapeTypstString(ctx.labels.languages || 'Languages')}", "languages", is-side: ${isSide})`,
    cards,
    columns: isSide ? '(1fr,)' : '(1fr, 1fr)',
    firstRowCount: isSide ? 1 : Math.min(2, cards.length),
    columnGutter: `${16 * ctx.fontScale}pt`,
    rowGutter: `${(isSide ? 12 : 16) * ctx.fontScale}pt`,
  });
}
