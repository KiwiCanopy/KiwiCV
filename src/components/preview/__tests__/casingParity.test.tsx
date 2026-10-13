// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import {
  ALL_SECTION_LABEL_KEYS,
  getBoundFormatters,
} from '@/components/preview/themes/shared/translations';
import { TYPST_CV_UPPER } from '@/components/preview/themes/shared/typstUtils';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import { initTypstCompiler, mapIcons, queryDocument } from '@/test/typstCompile';
import type { ResumeData } from '@/types/resume';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * **An element is uppercased in both outputs or in neither**.
 *
 * The other parity sweeps use ALL-CAPS sentinels, so they cannot see casing, and
 * jsdom does not apply `text-transform`. Here every probe is mixed-case and each
 * side's casing is read off the mechanism rather than the glyphs:
 *
 * - **preview** — an ancestor with `text-transform: uppercase` (or the Tailwind
 *   `uppercase` class), or text that already arrives uppercased;
 * - **PDF** — `cv-upper` is swapped for a probe that tags what passes through it,
 *   so the compiled document reports which probes it would have uppercased.
 *
 * Probes are a mixed-case sentinel per user string field and per section label,
 * plus a distinct date per date field ("Mar 1991"), since no sentinel survives
 * date formatting. Distinct, so one section's regression cannot hide behind another's.
 * Presence is not compared here — that is `previewExportParity.test.ts`.
 */

const PROBE_RE = 'zq[a-p]{3}zq|\\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\b \\d{4}';
const TYPST_PROBE_RE = `(?i)${PROBE_RE.replace(/\\/g, '\\\\')}`;

let n = 0;
let d = 0;
/** Sentinel → the field it was seeded into, so a mismatch names the field. */
const FIELD_OF = new Map<string, string>();
const nextSentinel = (field: string) => {
  const code = [8, 4, 0].map((shift) => String.fromCharCode(97 + ((n >> shift) & 15))).join('');
  n += 1;
  FIELD_OF.set(`zq${code}zq`, field);
  return `Zq${code}Zq`;
};

/** A date only the given field carries; it formats as "Mar <year>" in English. */
const nextDate = (field: string) => {
  const year = 1990 + d;
  d += 1;
  FIELD_OF.set(`mar ${year}`, field);
  return `${year}-03`;
};

const SKIPPED_FIELD = /^url$|^image$|^_vId$|^visible$|^level$/i;

function seedStrings(record: Record<string, unknown>, section: string): void {
  for (const [field, value] of Object.entries(record)) {
    if (SKIPPED_FIELD.test(field)) continue;
    if (/date/i.test(field)) {
      // An empty end date means "Present" and stays so.
      if (typeof value === 'string' && value) record[field] = nextDate(`${section}.${field}`);
      continue;
    }
    if (typeof value === 'string') record[field] = nextSentinel(`${section}.${field}`);
    else if (Array.isArray(value) && value.every((v) => typeof v === 'string'))
      record[field] = [nextSentinel(`${section}.${field}`)];
  }
}

function seeded(themeId: ThemeId, placement: Placement): ResumeData {
  n = 0;
  d = 0;
  const data = buildSingleItemResume(themeId);
  applyPlacement(data, placement);
  // PDF-only surfaces: the preview renders neither the cover letter nor the footer.
  data.coverLetter = { ...data.coverLetter, enabled: false };

  const sectionLabels: Record<string, string> = {};
  for (const key of ALL_SECTION_LABEL_KEYS) sectionLabels[key] = nextSentinel(`label:${key}`);
  data.meta.theme.params = { ...data.meta.theme.params, sectionLabels, showFooter: false };

  const { location, profiles, ...basics } = data.basics;
  seedStrings(basics as unknown as Record<string, unknown>, 'basics');
  seedStrings(location as unknown as Record<string, unknown>, 'basics.location');
  for (const profile of profiles)
    seedStrings(profile as unknown as Record<string, unknown>, 'profiles');
  data.basics = { ...data.basics, ...basics };

  for (const [section, value] of Object.entries(data as unknown as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (item && typeof item === 'object') seedStrings(item as Record<string, unknown>, section);
    }
  }
  return data;
}

type Casing = 'upper' | 'asis';
type Census = Map<string, Set<Casing>>;

const record = (census: Census, probe: string, casing: Casing) => {
  const key = probe.toLowerCase();
  census.set(key, (census.get(key) ?? new Set()).add(casing));
};

const isUpper = (text: string) => text === text.toUpperCase();

function previewCensus(themeId: ThemeId, data: ResumeData): Census {
  const bound = getBoundFormatters(data);
  document.body.innerHTML = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );

  const census: Census = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    let transformed = false;
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (el.style.textTransform === 'uppercase' || el.classList.contains('uppercase')) {
        transformed = true;
        break;
      }
    }
    for (const match of (node.textContent ?? '').matchAll(new RegExp(PROBE_RE, 'gi'))) {
      record(census, match[0], transformed || isUpper(match[0]) ? 'upper' : 'asis');
    }
  }
  return census;
}

/**
 * Replaces `cv-upper` with a probe: inside it every match is tagged `upper`,
 * everywhere else `asis` — unless the serializer already uppercased the string.
 */
const PROBED_CV_UPPER = `
#let cv-upper-str(s, lang) = s
#let cv-upper(body) = {
  show regex("${TYPST_PROBE_RE}"): it => [#metadata(("upper", it.text))<casing-probe>]
  body
}`;
const DOCUMENT_PROBE = `#show regex("${TYPST_PROBE_RE}"): it => [#metadata((if upper(it.text) == it.text { "upper" } else { "asis" }, it.text))<casing-probe>]\n`;

async function pdfCensus(themeId: ThemeId, data: ResumeData): Promise<Census> {
  const typst = SERIALIZERS[themeId](data);
  if (!typst.includes(TYPST_CV_UPPER)) throw new Error(`${themeId} does not define cv-upper`);
  await mapIcons(
    serializeIconsMap(data, paletteIconFills(themeId, data.meta.theme.params?.palette)),
  );
  const probes = await queryDocument<Array<[Casing, string]>>(
    DOCUMENT_PROBE + typst.replace(TYPST_CV_UPPER, PROBED_CV_UPPER),
    '<casing-probe>',
    'value',
  );

  const census: Census = new Map();
  for (const [casing, probe] of probes) record(census, probe, casing);
  return census;
}

const show = (casings?: Set<Casing>) => (casings ? [...casings].sort().join('+') : 'absent');

interface Outcome {
  mismatches: string[];
  compared: number;
}

async function measure(themeId: ThemeId, placement: Placement): Promise<Outcome> {
  const data = seeded(themeId, placement);
  const preview = previewCensus(themeId, data);
  const pdf = await pdfCensus(themeId, data);

  const mismatches: string[] = [];
  let compared = 0;
  for (const [probe, casings] of preview) {
    const other = pdf.get(probe);
    if (!other) continue; // presence is previewExportParity's axis, not this one
    compared += 1;
    if (show(casings) !== show(other))
      mismatches.push(
        `${themeId} ${FIELD_OF.get(probe) ?? `"${probe}"`} preview:${show(casings)} pdf:${show(other)} (${placement})`,
      );
  }
  return { mismatches, compared };
}

/**
 * ⚠️ **A shrinking baseline, not an allowlist**, asserted with `toEqual` so a
 * fixed theme fails it too. Each entry is a decision someone still owes.
 */
const KNOWN_MISMATCHES: string[] = [];

describe('the preview and the export agree about what is uppercased', () => {
  const outcomes = new Map<string, Outcome>();

  beforeAll(async () => {
    await initTypstCompiler();
    for (const [id, placement] of PLACEMENT_RUNS) {
      outcomes.set(`${id}:${placement}`, await measure(id, placement));
    }
  }, 300000);

  it('disagrees in exactly the places it already disagreed', () => {
    const all = [...outcomes.values()].flatMap((o) => o.mismatches).sort();
    expect(all).toEqual(KNOWN_MISMATCHES);
  });

  it.each(PLACEMENT_RUNS)('%s (%s) compares most of what it renders', (id, placement) => {
    expect(outcomes.get(`${id}:${placement}`)?.compared).toBeGreaterThanOrEqual(20);
  });
});
