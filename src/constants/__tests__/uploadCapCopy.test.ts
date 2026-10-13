import { AI_MAX_UPLOAD_BYTES, AI_MAX_UPLOAD_MB } from '@/constants/ai';
import { type LocaleCode, locales } from '@/locales';
import { describe, expect, it } from 'vitest';

/**
 * The upload cap is single-sourced into the copy now: `{{size}}` is fed from
 * `AI_MAX_UPLOAD_MB` at both call sites, so no locale can name a number the
 * code does not enforce.
 *
 * ⚠️ **What replaced the old failure.** Until 2026-09-07 these strings were
 * hand-written prose carrying "5MB" in fifteen languages, and this file compared
 * each against the constant. Interpolation makes that drift impossible — and
 * introduces a new silent failure in its place: `t()` substitutes only the vars
 * it is handed, so a call site that forgets `size`, or renames the property,
 * ships the literal `{{size}}` to the user with `tsc`, `lint`, `i18n:check` and
 * every runner green. `uploadCapCallSites.test.tsx` is the half that binds that;
 * this half binds the strings.
 *
 * ⚠️ `npm run ai:check-sync` covers neither: it compares the two constants files
 * to each other, so raising both leaves it green.
 *
 * ⚠️ Scope: the two strings the PICKER shows. The server refuses oversized
 * payloads itself (`parse-cv-background.mjs`, `PAYLOAD_TOO_LARGE`) and nothing
 * under `src/` renders that path's message, so this file does not reach it.
 */
const KEYS = ['import_error_file_too_large', 'import_max_size'] as const;
const CODES = Object.keys(locales) as LocaleCode[];

/**
 * User-facing strings that still state a byte cap as a literal, each with the
 * reference to the change that removes it. ⚠️ **Only shrinks** — the scan below
 * fails on a stale entry as well as on a new offender, so an exemption cannot
 * outlive the string it covers.
 */
const LITERAL_CAP_ALLOWLIST: Record<string, string> = {};

/** A digit adjacent to a size unit: "5MB", "10 MB", ">10MB". */
const LITERAL_CAP = /\d\s*(?:MB|KB|GB)\b/;

function englishStringsNamingASize(node: unknown, path: string[] = []): string[] {
  if (typeof node === 'string') return LITERAL_CAP.test(node) ? [path.join('.')] : [];
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    englishStringsNamingASize(value, [...path, key]),
  );
}

describe('the upload cap the user is told', () => {
  /**
   * Non-vacuity. An empty locale list makes `it.each` register no cases at all,
   * silently, which is the failure mode this whole file exists to prevent.
   */
  it('has locales to check and a whole number to state', () => {
    expect(CODES.length, 'no locales to check, so every case below is vacuous').toBeGreaterThan(0);

    expect(
      Number.isInteger(AI_MAX_UPLOAD_MB) && AI_MAX_UPLOAD_MB > 0,
      `AI_MAX_UPLOAD_MB is ${AI_MAX_UPLOAD_MB}; the copy interpolates it as a bare integer, so a fraction would read as "4.8 MB" in every language at once`,
    ).toBe(true);
  });

  /**
   * ⚠️ Floors, and understates. A cap of 5.5 MiB must render "5", never "6" —
   * a message permitting more than `AI_MAX_UPLOAD_BYTES` enforces sends the user
   * to shrink a file to a size that is still refused.
   */
  it('never claims a larger cap than the bytes actually enforced', () => {
    expect(AI_MAX_UPLOAD_MB * 1024 * 1024).toBeLessThanOrEqual(AI_MAX_UPLOAD_BYTES);
  });

  /**
   * ⚠️ The invariant, not this diff's two keys. Keyed to a fixed pair, this file
   * would guard `ai.*` and stay green while `editor.photo.file_too_large` states
   * a cap no constant enforces — the same defect one namespace over, which is
   * how the original defect arose. Scanning the tree turns the sweep from
   * an intention into a test that goes green when someone lands it.
   */
  it('leaves no English string naming a size the code does not single-source', () => {
    const offenders = englishStringsNamingASize(locales.en);

    for (const key of offenders) {
      expect
        .soft(
          LITERAL_CAP_ALLOWLIST[key],
          `${key} states a byte cap as a literal. Interpolate it from the constant that enforces it, or add an allowlist entry naming the issue that will.`,
        )
        .toBeTruthy();
    }

    // ⚠️ Stale entries fail too. An exemption must not outlive its string.
    for (const key of Object.keys(LITERAL_CAP_ALLOWLIST)) {
      expect
        .soft(
          offenders,
          `${key} is allowlisted but no longer states a literal cap — delete the entry in the same change set that fixed it`,
        )
        .toContain(key);
    }
  });

  it.each(CODES)('states the cap through the placeholder, not as a digit (%s)', (code) => {
    for (const key of KEYS) {
      const value = locales[code].ai[key];

      // ⚠️ Soft, so one run reports both keys in all 15 languages. A throwing
      // assertion stops at the first key and hides the second until it is fixed.
      expect.soft(typeof value, `${code}.ai.${key} is missing or not a string`).toBe('string');

      /**
       * English only. `scripts/i18n/check-locales.cjs:89-94` requires each
       * locale's placeholder SET to equal English's, for every key, and runs in
       * `i18n:check` and `npm test` — so the other fourteen are already bound,
       * and a second copy here would be a rule that can disagree with the tool.
       * English is the one it cannot catch: drop the token from the source and
       * parity happily requires all fourteen to drop it too.
       */
      if (code === 'en') {
        expect
          .soft(
            value,
            `en.ai.${key} is "${value}", which does not carry {{size}} — and locale parity will now require every other language to drop it too`,
          )
          .toContain('{{size}}');
      }

      /**
       * ⚠️ This is the rule that keeps the fix from being undone. Re-hardcoding
       * the number — "max 5 MB" beside the token, or instead of it — is exactly
       * the drift the fix removed, and containment above cannot see it.
       *
       * ⚠️ `\p{Nd}`, not `\d`. `\d` is ASCII-only, so a fullwidth "５" — which is
       * exactly what a ja or zh translator would write — returns `null`, and
       * `null ?? []` satisfies `toEqual([])`. The rule passed on the one case it
       * most needed to catch.
       */
      expect
        .soft(
          value.match(/\p{Nd}/gu) ?? [],
          `${code}.ai.${key} contains a literal digit. The size comes from {{size}}; writing the number back into the sentence reintroduces the drift this key exists to prevent.`,
        )
        .toEqual([]);

      /**
       * The unit is prose, not part of the placeholder — French says "Mo",
       * Russian "МБ" (owner ruling). So the value has to be more than the
       * token alone, or the user is told a bare number.
       */
      expect
        .soft(
          value.replace('{{size}}', '').trim().length,
          `${code}.ai.${key} is only the placeholder, so it names a number with no unit`,
        )
        .toBeGreaterThan(0);
    }
  });
});
