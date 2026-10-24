# Translation Handoff

> **Obligations live in `.claude/rules/i18n.md`**, which loads whenever you edit
> `src/locales/**` or `scripts/i18n/**`. This page is the reference: layout, the
> checker's inventory, pluralization, and adding a language.
> **Last Updated: 2026-10-06**

Split out of [I18N.md](I18N.md) on 2026-07-23, which had grown past the
300-line limit. That page owns the translation _system_ — structure, the `t`
function, validation, pluralization, adding a key or a language. This one owns
the _packet workflow_: who writes which locale, and how their text reaches
`src/locales/`.

**The one-line rule: agents write all 15, into the packet** (owner, 2026-09-07 — this
replaces "agents write `en`, Gemini writes the other 14", which stood while a human
translator was part of the workflow). The packet is still the only route: a value
that never entered one was never validated.

Phase 6 uses an English-first, all-or-nothing workflow:

1. Approved defaults live in `scripts/i18n/handoff-catalog.cjs`. A row's
   `module` names the file; `file:export` names a second export in it —
   `themes:theme_translations` for the CV section headings, whose packet ids
   read `theme_translations.sections.*`. Before that form existed,
   one change had to seed `customSection` through `FIELDS_TO_SYNC`, bypassing the
   packet's validation; do not repeat it.
2. `npm run i18n:handoff:generate` creates canonical `en.json`, 14 translation
   files, and `README.md` under
   `.agent/temp_instructions/translation-handoff/`. Only genuinely new
   or changed entries are blank: the generator preserves anything the previous
   packet translated against the same English, and otherwise **recovers the
   value from `src/locales/`**. A stored value equal to the English is not
   recovered — except on a `VERBATIM` row, one whose correct value is
   the English in all fourteen locales, which is pre-filled from `source`; the
   importer then rejects any other value for it, and
   `tests/i18n/verbatim-rows.test.cjs` fails if a locale drifts. This took a
   fresh packet from 313 blank cells to 173. The rest are rows equal to the
   English in only some locales (cognates, date patterns, local sample
   employers); a per-row marker cannot say that, so they are still refilled
   by hand.
3. Each non-English `translation` value is filled **in place, in the working
   tree** — by the agent since 2026-09-07 (`.claude/rules/i18n.md`), deriving
   from strings the locale already ships. Nothing else in the entry is touched.
   ⚠️ Machine-generated text is never final: a value with no shipped sibling to
   anchor it is an owner escalation, not a guess.
4. `npm run i18n:handoff:import -- --check` validates the complete packet
   without changing locale source.
5. `npm run i18n:handoff:import -- --apply` validates IDs, English
   fingerprints, placeholders, protected tokens, rich text, and non-empty
   values; formats all affected modules in memory; then commits the complete
   locale set atomically.

### The import used to rewrite all 255 locale files. Fixed 2026-07-23.

`--apply` wrote every file with prettier's **defaults** — double quotes against
the repo's `singleQuote: true`, width 80 against 100 — so `git diff --stat`
reported 255 files and ~12,500 changed lines for what was really 42 cells. The
diff only collapsed after a manual `npx prettier --write "src/locales/**/*.ts"`
on top, and that manual step had been passed along as though it were the
workflow.

The cause was one line, `scripts/import-i18n-handoff.cjs:22`:

```js
prettier.format(source, { filepath: path.basename(filePath), parser: 'typescript' });
```

Two bugs at once. **`prettier.format()` never reads `.prettierrc`** — only
`prettier.resolveConfig()` does — and `path.basename()` discarded the directory,
so even a config-aware call would have had nothing to walk up from. It now
resolves the repo config once and spreads it into every `format()` call.

**Do not add a `prettier --write` after `--apply`.** If one is ever needed
again, the importer has regressed — fix it there rather than papering over it,
or the next reader inherits a 255-file diff they cannot tell from a real one.

## After an import, read the new English and German critically

They are the two the owner can judge at a glance, so they have to be right.
Check register, ambiguity and whether the string still fits its UI slot. **If a
value reads awkwardly or you are unsure, ask the owner** — do not ship it, and
do not silently rewrite it yourself, which puts an unvalidated value into
`src/locales/` by the back door.

## The packets are disposable, and untracked

`.agent/temp_instructions/translation-handoff/` is gitignored. It is a
working artifact, not a source: the catalog owns the English, `src/locales/`
owns the translations, and the generator reconstructs the packets from both.
**Delete the directory after an import.** Regenerating restores every
translation.

This was not always true. Until 2026-07-22 the generator's only memory was the
previous packet, so deleting the directory and regenerating produced **1,708
empty cells** — a full re-translation. That made a build-time false positive
into a re-translate-everything problem: Netlify's secret scanner matches short
environment values against the SHA-256 `fingerprint` each entry carries, at
roughly one in 15,000 per hash across ~120 hashes per file and 15 files, and it
failed three deploy previews on 2026-07-21. Deleting the packets was the fix
that kept undoing itself, because the next generate brought them back.

⚠️ **A value that is English on purpose in some locales is recorded in `ENGLISH_IN`**
(`handoff-catalog.cjs`, 2026-10-24, #39) — a cognate, a date pattern, a sample name. The
generator blanks any stored value equal to the English so a placeholder cannot pass for a
translation, and the packet that once remembered the choice is deleted after every import; so
until this record existed every packet reopened ~200 such cells and the importer refused them.
When a translation legitimately equals the English, add the locale there in the same change.
`english-in-locales.test.cjs` fails if a recorded cell stops equalling the English, and if a
packet built from the committed tree would open any cell. All fourteen alike is `VERBATIM`.

One caveat the recovery cannot remove: if the catalog's English changes after an
`--apply`, the value in `src/locales/` is a translation of the **previous**
source. The packet shows the current `source` beside it so a review catches it,
and regenerating straight after any catalog edit closes the window. Generate,
translate, import, delete.

Any validation error reports all actionable failures and leaves
`src/locales/` unchanged. The importer has fixture coverage for missing values,
nested insertion, staging without writes, placeholders, and rich text.
