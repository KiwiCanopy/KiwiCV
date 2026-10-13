---
paths:
  - 'src/data/changelog.ts'
  - 'src/data/changelogHighlights.ts'
  - 'src/locales/*/changelog/**'
  - 'scripts/sync-changelog.cjs'
  - 'scripts/add-changelog.cjs'
  - 'scripts/changelog-fold.cjs'
  - 'scripts/changelog-file.cjs'
  - 'scripts/changelog-deps.cjs'
---

# Changelog

`ops/CHANGELOG.md` is the reference — the registry/locale split, the prefix
table, `{wardsymbol}`, and worked tone examples. This is what binds.

`.claude/rules/i18n.md` also loads here, and owns the voice rule (KiwiCV or the
user is the subject, never "we"). Not restated.

## `CHANGELOG_UPDATES` is an inbox, not a record

The array at `scripts/sync-changelog.cjs` is **emptied after a successful
sync**. Empty is its resting state, so anything sitting in it is unapplied work.

- **Never restore entries after a sync.**
- **Never hand-edit a locale changelog file while the array still holds that
  key.** The array is the source, the locale files are derived, and the stale
  copy silently wins the next time anything syncs — including `npm run release`,
  which runs `changelog:sync` as one of its steps.

To correct a translation after a sync: fix it in the array and re-sync, or clear
the array first and then edit the locale file.

During the 4.0.1 release three reviewed German corrections were written straight
into the locale files while the array still held the pre-review text. The
release reverted all three and tagged the result. Nothing failed. It was caught
only because German showed eight changed lines in the release commit where every
other locale showed two.

## A highlight slug must be spellable as a JS identifier

`ai_composer_polish`, never `ai-composer-polish`. The slug becomes
`export const highlight_<slug>` in the generated locale file **and** is embedded
verbatim in the three `_highlights.<slug>.*` keys, so it cannot be rewritten
after the fact.

`npm run changelog:add` rejects a bad slug at input, and `serializeEntry` in
`scripts/changelog-file.cjs` enforces it for every writer including a
hand-written array entry. Without that, a hyphen is a syntax error that
`tsc -b` only surfaces once the release folds the entry in — at the worst
possible moment.

Every other key needs one of the prefixes in the reference table (`feat_`,
`ui_`, `fix_`, …). An unprefixed key does not fail; it renders as "other" and
loses its icon and grouping.

## Not every change earns an entry

**Internal-only work gets none.** Refactors, chores, tests, tooling, silent
dependency bumps — the release injects one localized dependency line by itself.

**The audience is signed in and inside the editor.** `VersionUpdateModal` shows
this to people already using the tool; they do not visit the marketing page. A
landing-page change is noise to every reader of the panel — a rephrased headline
earns nothing, a whole new landing feature earns one short line.

The test is not "is this user-visible" but "would a reader of the What's New
panel notice it in the product they are using". 4.3.0 staged two landing entries
that the curation rule justified individually and still let through, because
that rule says how to group entries and not who reads them. They collapsed to
one line.

**Curate, don't enumerate.** When several PRs fix facets of one user-visible
thing — a dozen preview-vs-PDF parity fixes, a run of import-hardening patches —
write **one** entry telling that story. The reader wants "the preview and the
export now match", not twelve theme-by-theme lines. Git history is the
exhaustive record; the panel is the summary. ~40 merged commits since the last
changelog touch is normal and condenses to a handful of entries.

## Never name a model or a version

Describe the outcome — "sharper suggestions", "imports several times faster".

A named model is a published claim that the backend can invalidate without
touching the entry. 4.1.1 named a model, and one patch later parsing moved to a
lite variant, which read as a downgrade of a shipped promise even though the
original claim stayed true. The model is an implementation detail; the result is
the news. (Decided 2026-08-02. The 4.1.1 entry stands as shipped — its specific
claim is still true.)

## Never open with "Fixed an issue"

Nor "Resolved an issue", nor `Ein Problem wurde behoben`. Describe **what works
now**: "Profile image borders now update with the theme."

German is informal and lowercase — `du`, `dir`, `dein`, never `Du`/`Dein`, never
`Sie`. This is the one place the product speaks in the first person singular
(`stelle ich mich vor`), because it is the creator talking.

Do not repeat the category in the text; the UI already renders it under a
"Bugfix" or "Feature" heading.

## Stage English as you go, translate once before release

Same packet-routed rule as every other locale file, but on a **per-release**
cadence rather than per-key: stage the entry in English, run
`npm run changelog:sync` so it lands in all 15 locales as placeholders, and
leave it. **Do not translate per PR.** One pass before the release covers the
accumulated entries at once; review English and German closely, since those are
the two read at a glance.
