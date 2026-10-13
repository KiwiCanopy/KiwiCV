# Changelog & Feature Discovery Architecture

> **Last Updated: 2026-08-29**
> Changelog management is split between a **Technical Registry** (metadata) and **Localized Translations** (content).

## Core Components

### 1. Technical Registry (`src/data/changelog.ts`)

The single source of truth for version metadata. Each entry includes:

- `id`, `version`, `date`
- `highlights`: An array of objects containing technical IDs (`id`) and tour `target` IDs.
- **Why Decoupled?** Technical metadata (like DOM selectors for the tour) is kept out of translation files to prevent redundant updates across 15 languages.

### 2. Localized Translations (`src/locales/{lang}/changelog/*.ts`)

Contains human-readable strings. For major versions, a `_highlights` object is used:

- Keyed by the `id` defined in the technical registry.
- Contains `badge`, `title`, and `content`.
- **Dynamic Merging**: The `VersionUpdateModal` merges registry metadata with these localized strings at runtime.

### 3. Translation Key Prefixes

To ensure the UI correctly categorizes and assigns icons to changelog entries, all translation keys (except `_highlights`) **MUST** use one of the following prefixes:

| Prefix      | Type          | UI Icon  |
| :---------- | :------------ | :------- |
| `feat_`     | New Feature   | Sparkles |
| `ui_`       | UI / Style    | Palette  |
| `perf_`     | Performance   | Zap      |
| `fix_`      | Bugfix        | Bug      |
| `refactor_` | Refactor      | Hammer   |
| `chore_`    | Maintenance   | Wrench   |
| `docs_`     | Documentation | FileText |
| `other_`    | Miscellaneous | Package  |

Keys without a valid prefix will be categorized as "other" but may lose their semantic grouping.

### 4. Dynamic Icon System (`{wardsymbol}`)

To maintain a premium feel, descriptions can use the `{wardsymbol}` placeholder.

- **Component Injection**: `TourOverlay` and `VersionUpdateModal` parse this placeholder and inject a live, golden Lucide `Wand2` icon component.
- **Consistency**: This ensures the description matches the actual tool icon in the editor without hardcoding React components in translation strings.

## Maintenance Workflow

1. **Adding Entries (CLI or Inbox)**: Run `npm run changelog:add` to stage new changelog entries in English across all 15 locales:
   - **Standard Entry**: `npm run changelog:add -- ui_ai_composer_auto_hide "The composer field automatically collapses during optimization."`
   - **Highlight Entry**: `npm run changelog:add -- highlight ai_composer_polish "AI 🤖" "Smoother AI" "Improving with AI is now smoother..."`
   - ⚠️ The slug rule and the prefix requirement are in
     `.claude/rules/changelog.md`. `npm run changelog:add -- --help` prints the
     live accepted form, so it cannot go stale.
   - **Batch Multi-Entry**: Pass multiple pairs/highlights in a single command call. Run `npm run changelog:add -- --help` for full CLI syntax.
2. **Automated Release & Safeguards**: Run `npm run release [patch|minor|major]` to bump the version, create the registry entry, and validate translation status:
   - **Translation Safeguard**: `release.cjs` checks that non-English changelog entries are translated and not 1:1 English placeholders before cutting a release.
   - **Dependency Updates**: The release script automatically detects dependency changes in `package.json` since the last release tag and runs `npm run changelog:deps` to inject a standard, localized changelog entry (`chore_dependency_updates`) across all 15 languages.
   - **Minor dependency updates run by default.** `update:minor` executes at the
     start of every release; pass `--no-update-deps` to skip it. This was opt-in
     via `--update-deps` until 2026-08-28, and opt-in meant it almost never ran,
     so the tree drifted until a routine bump became a large one. `--update-deps`
     is still accepted and ignored.
   - **Why defaulting is safe**: the full gate runs _after_ the update and
     _before_ anything is written or tagged (`release.cjs`), so a breaking bump
     fails the release instead of shipping inside one. There is no half-released
     state to unpick — which is the objection this ordering answers.
   - ⚠️ **What the gate does not tell you**: it proves nothing _crashed_, not
     that nothing _changed_. A `lucide-react` bump can reshape an icon and a
     `posthog-js` bump can shift event semantics; both pass all four runners.
     After a release that moved a UI-visible package, look at the app. The
     auto-injected `chore_dependency_updates` entry is what tells a reader the
     versions moved.
   - **Other flags**: `--allow-untranslated` if releasing with English
     placeholders intentionally, `--legal` to refresh the legal pages.

> [!IMPORTANT]
> **What binds when you write an entry is in `.claude/rules/changelog.md`**,
> which loads when you edit the registry, a changelog locale file, or a
> changelog script: that `CHANGELOG_UPDATES` is an inbox and not a record, which
> changes earn an entry at all, who the panel's readers are, why a model is
> never named, and the staging cadence.
>
> Deliberately not restated here. This page had grown four sections of standing
> rules that no one read while writing a changelog entry, which is the failure
> this split exists to end.

## Deployment Checklist

- [ ] Semantic version updated automatically via `npm run release` (do not manually edit `package.json`).
- [ ] Technical `target` matches a `data-tour` attribute in the UI.
- [ ] Full coverage (15 languages) verified via `changelog:sync`.
- [ ] Writing tone follows user-centric guidelines (no "Fixed issue", focus on benefit).

## Writing Style & Tone

The mandates — never "Fixed an issue", German informal lowercase `du`, no
repeated category prefix — are in `.claude/rules/changelog.md`. What is worth
keeping here is the shape of a good entry:

1. **Focus on user benefit** — state the improvement, not the change.
   - ❌ "Updated the profile editor layout."
   - ✅ "A cleaner, more focused profile editor to help you manage your personal
     details with ease."
2. **Action-oriented** — strong verbs. _Launch, Introduce, Unlock, Discover,
   Empower_ for features; _Resolve, Eliminate, Restore, Stabilize, Polish_ for
   fixes.
3. **Be concrete** — name the element or behaviour. Avoid "properly",
   "correctly", "smoothly" unless a specific detail backs them.
   - ❌ "Long names are now properly truncated."
   - ✅ "Long titles in drag-and-drop items are now automatically shortened to
     prevent cards from overflowing the screen."
4. **Frame refactors as outcomes** — stability, speed, reliability. No internal
   jargon.
