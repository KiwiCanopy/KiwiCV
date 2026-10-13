# Utility Scripts

> **Last Updated: 2026-09-07**

## Overview

KiwiCV keeps its CLI tooling in `scripts/`. Everything here is either wired to
an `npm run` alias (used by CI or the release flow) or a hand-run maintenance
utility. This page lists every script in the folder; if you add or remove one,
update this table.

| Script                          | Command                         | Purpose                                                                                                           |
| ------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `sync-modular-translations.cjs` | `npm run i18n:sync`             | Propagate new keys to all 15 locales (see below)                                                                  |
| `check-i18n.cjs`                | `npm run i18n:check`            | Validate locale structure + wrong-script guard                                                                    |
| `find-bare-literals.cjs`        | `npm run i18n:literals`         | Find user-visible English strings that never pass through `t()`                                                   |
| `generate-i18n-handoff.cjs`     | `npm run i18n:handoff:generate` | Build the translation packet (see [I18N_HANDOFF](I18N_HANDOFF.md))                                                |
| `import-i18n-handoff.cjs`       | `npm run i18n:handoff:import`   | Import a translated packet (`--check` / `--apply`)                                                                |
| `sort-locales.cjs`              | manual                          | Sort keys in every modular locale file, then Prettier                                                             |
| `remove-keys.cjs`               | manual                          | Remove a translation key from all 15 locales through the TypeScript AST                                           |
| `add-modular-module.cjs`        | manual                          | Scaffold a new locale module (`<name>.ts` + `index.ts` wiring) across all languages                               |
| `changelog-file.cjs`            | library                         | ⚠️ The **only** reader/writer of a changelog locale file — `readEntryObject`, `writeEntryFile`, the entry-id rule |
| `sync-changelog.cjs`            | `npm run changelog:sync`        | Synchronize changelog entries across all locales                                                                  |
| `changelog-deps.cjs`            | `npm run changelog:deps`        | Emit the templated "dependency updates" changelog entry                                                           |
| `changelog-fold.cjs`            | called by `release.cjs`         | ⚠️ Merge the staged `feat_*`/`ui_*`/… entries into the release's `v_*` file and **delete** the originals          |
| `remove-changelog-key.cjs`      | manual                          | Remove a specific changelog entry from all locales                                                                |
| `generate-sitemap.cjs`          | `npm run sitemap:generate`      | Canonical static + Sanity blog URLs for all 15 languages                                                          |
| `generate-font-info.mjs`        | `npm run fonts:generate-info`   | Typst font metadata for the lazily-loaded CJK faces                                                               |
| `model-snapshot.cjs`            | `npm run model:snapshot`        | Versioned snapshot of the resume data model into `examples/`                                                      |
| `release.cjs`                   | `npm run release`               | Automated release workflow wrapper                                                                                |
| `update-minor.cjs`              | `npm run update:minor`          | Apply minor dependency updates; runs install + license check only if any landed                                   |
| `check-brand-migration.cjs`     | `npm run brand:check`           | Fail on unexpected former-brand references in active files                                                        |
| `check-licenses.cjs`            | `npm run check-licenses`        | Rebuild production dependency notices in `src/assets/licenses.json`                                               |
| `check-ai-constants-sync.cjs`   | `npm run ai:check-sync`         | Verify AI prompt/constant consistency (a release pre-flight guard)                                                |
| `languages.cjs`                 | module                          | Canonical language list imported by the other i18n scripts — not run directly                                     |

The longer notes below cover the scripts with behaviour worth knowing before
you run them.

## Translation & i18n

These work in tandem with the [Translation System](I18N.md). English is authored
by hand; the other 14 are seeded from it and given real values in the packet.

### `sync-modular-translations.cjs`

Adds new key-value pairs to all 15 supported locales.

- **Usage**: Add the key/path/translations to the script's `FIELDS_TO_SYNC`
  config and run it (`npm run i18n:sync`).
- **Traversal**: AST-based, through `updateModuleSource` in
  `scripts/i18n/locale-ast.cjs`. Quoted, numeric and hyphenated segments
  (`privacy.sections.4.title`, `dashboard-view`) resolve like any other, and a
  key it has to create is quoted when it is not a valid identifier.
- **Sorting**: Sorts the one object literal that received a new key, and leaves
  every nested block byte-identical. A pure value replacement sorts nothing.
- **Multiple exports**: `themes.ts` exports both `themes` and
  `theme_translations`; prefix the path with the export name to pick one.
- **Refusals**: Overwriting an object or array with a string throws instead of
  destroying the subtree, and a failed field exits non-zero.
- **Benefit**: No locale is missed; file structure stays consistent.

Until 4.2.0 the traversal was a set of regexes of the shape
`\b<key>:\s*\{`, which no quoted key can match — the closing quote sits between
the key and the colon. `privacy.sections.4.…` therefore looked absent and the
parent-ensure step injected a duplicate, unquoted `4: {},` into all 15 locale
files. The leaf replacement was a _global_ regex over the parent block, so
writing `sections.4.title` also rewrote `sections.4.github.title`. Both are
pinned in `tests/i18n/sync-modular-translations.test.cjs`, including a
read-only dry run over the real `src/locales/en/legal.ts`.

### `sort-locales.cjs`

Global maintenance: sorts all keys in all modular translation files
alphabetically, then runs Prettier.

- **Safety**: Run from the repo root or `scripts/`; internal path resolution
  ensures correct Prettier execution.

### `remove-keys.cjs`

Removes a translation key from all 15 locales by cutting it out of the
TypeScript AST (`removeModuleProperty` in `scripts/i18n/locale-ast.cjs`): a
second export takes the catalog's `file:export` spelling, a `changelog.*` key
resolves to `changelog/meta.ts`, and a cut that would change any other key or
break the parse is refused. Exits non-zero when a spec removes nothing.

## Changelog

### `sync-changelog.cjs`

Synchronizes changelog entries across all locales. **Workflow**: add the entry
to the script first, then run it.

### `changelog-file.cjs`

Not a command — the library every changelog writer goes through. It owns
`readEntryObject` / `readEntryKeys`, `writeEntryFile` / `serializeEntry`,
`isVersionFile`, `isStagedEntryFile`, `formatVersionId` and the entry-id rule
(`isValidEntryId`).

⚠️ **Do not re-implement any of these locally.** The serializer once had
three copies and the reader eight, and each of the three fixes they had
accumulated — the `isVersionFile` guard, the nested-object branch, backslash
escaping — existed in exactly one copy, so the same file round-tripped
differently depending on which script wrote it last. `changelog-index.cjs` was
extracted for the same reason one layer up.

Two contracts worth knowing before calling it:

- **`readEntryObject` returns `null` for "could not read", never for "empty".**
  `readEntryObject(f) || {}` turns an unreadable file into an empty base, and
  writing that back deletes every key it held. Refuse instead.
- **`serializeEntry` throws on an id that cannot be a binding.** It writes
  `export const <id>`, and for a `v_*` file `changelog-index.cjs` then writes
  `import { <id> }`, so id = filename = binding across the directory.

## Data & Build Tools

### `generate-sitemap.cjs`

- **Command**: `npm run sitemap:generate`.
- **Purpose**: Generates canonical static and Sanity blog URLs for all 15
  languages, plus `xhtml:link` hreflang alternates.
- **Two different alternate rules.** Static routes get all 15 locales, derived
  from `languages.cjs`. **Blog posts do not**: a post exists only in the
  languages it was written in, with a different slug in each, so its set is read
  from Sanity's `translation.metadata` and names only those. The set must match
  what `<SEO />` emits for the same post — see `code/SEO.md`.
- **Offline safety**: Preserves existing blog entries if Sanity cannot be
  reached, while rewriting their former origin to the KiwiCV origin. This is
  silent, so a build without `VITE_SANITY_PROJECT_ID` keeps whatever slugs are
  committed — **and now keeps the previous run's hreflang alternates with them**,
  which can outlive a translation being unlinked in Sanity. See `code/SEO.md`
  for when to regenerate by hand.

### `check-brand-migration.cjs`

- **Command**: `npm run brand:check`.
- **Purpose**: Fails on unexpected former-brand references across active
  product/repository files.
- **Compatibility**: Necessary old hosts, storage keys, Drive roots, provider
  handles, migration copy, and published slugs use narrow path/line allowances.

### `release.cjs`

Automated release workflow wrapper.

- **Command**: `npm run release [patch|minor|major] [-- --legal]`
- **Options**: `--legal` updates `LAST_LEGAL_UPDATE` in `src/constants/auth.ts`
  to trigger a global re-consent modal.
- **Workflow**: Runs pre-flight quality checks, bumps version numbers, injects
  the changelog entry, calls changelog synchronization, runs model snapshotting,
  builds the production bundle, and commits/tags git.

### `model-snapshot.cjs`

Creates a versioned snapshot of the current resume data model.

- **Command**: `npm run model:snapshot`
- **Purpose**: Keeps `examples/` up to date during migrations.

### `check-licenses.cjs`

- **Command**: `npm run check-licenses`.
- **Purpose**: Rebuilds production dependency notices in
  `src/assets/licenses.json`. KiwiCV's own entry gets its copyright line from
  the script itself: the AGPL `LICENSE` has none for the checker to extract.
- **Requirement**: Its `license-checker-rseidelsohn` command runs via `npx`, so
  the package registry must be reachable when it is not cached.

## Maintenance

- Always run `npm run brand:check` and `npm run lint` after rebrand-related
  scripts that modify source files.
- Scripts are designed to be safe but should be used with a clean git state.
