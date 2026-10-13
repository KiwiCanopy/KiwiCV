# KiwiCV LLM Wiki

> **Last Updated: 2026-09-07**

Internal knowledge base for KiwiCV (formerly CVCanvas), written for AI agents and developers.

**Before proposing a workflow, search this wiki for the topic — check `ops/` as well as `code/`.** Most process questions (translations, releases, testing, deployment) are already answered here; inferring a procedure from reading scripts instead has produced wrong advice.

## 📌 Rules of the Wiki

1. **Recency Wins**: If you find contradictory information, the most recent entry (check the date) is the ground truth. **Proactively delete or archive the outdated information** once the new truth is verified.
2. **Code-First Truth**: Always verify logic against the active codebase. Documentation is a map, the code is the terrain. If they disagree, update the map.
3. **Argue the Rule, Never Log the Event**: A durable _why_ goes in the topic page that owns it, or — within the budget [AGENTS.md](../../AGENTS.md) §5 sets — in the code comment beside what it constrains. An entry earns its place by one test: **someone working in that area would otherwise re-litigate it or undo it by mistake.** If the code already says _what_ and there is no non-obvious _why_, it belongs in git history. Dated daily logs were retired 2026-08-29; do not reintroduce a per-day file.
4. **Agent-Centric Management**: This wiki is managed by AI agents for AI agents. You have full autonomy to restructure and optimize information for speed.
5. **Keep a page whole; make it findable**: There is **no page-length limit**. A page covers one subject and stays one page; split it only when it starts covering two, and add the new page to the sitemap below. **The converse is also a rule: when two pages cover one subject, merge them.** File count is no more the measure than line count is — what a reader loses to a bad split is having to hold two pages to get one answer. `code/RENDERING.md` and `code/RENDERING_SECTIONS.md` were that: split at an altitude rather than a subject, cross-linking each other on line 3, with the overview page carrying a "Section Logic Overview" heading whose detail lived in the other file. Merged 2026-08-29.
   - **A page carries a `## Contents` index, directly under its `Last Updated` line, once it reaches 200 lines with 4+ sections, or 8+ sections at any length.** Thirteen pages qualify today and all thirteen have one. That index is what makes a long page navigable, and it is the discoverability the old rule was reaching for by proxy.
   - ⚠️ This rule demanded "under 300 lines" until 2026-08-29. Four pages had passed it with nothing enforcing it and no reader worse off — and **none of the four had a contents index**, which is what was actually missing. `ops/I18N.md` made the point: 287 lines and 17 sections, harder to navigate than a 427-line page with 7. Length was a proxy for the wrong thing.
   - ⚠️ Splitting is not the remedy for a long page. `code/DESIGN_LANGUAGE.md` is one continuous argument about palette and salience, and its rulings are only persuasive together; fragmenting it to satisfy a number would have cost the thing that makes it work.
   - ⚠️ Not to be confused with the **source-file** 300-line limit in [code/CONVENTIONS.md](code/CONVENTIONS.md), which governs `src/`, is a different rule, and is unchanged here — it sits at 97.9% compliance and is working.
6. **When in Doubt, Ask**: If you find contradictions you cannot resolve, ask the user before finalizing wiki changes.
7. **Every Page Is Listed Here**: A page not in the sitemap below is invisible in practice. When you add one, add its row. When you archive one, move it to `history/` with a banner saying what replaced it.

## 🧭 Two kinds of knowledge

This wiki is **reference**. What _binds_ lives in `.claude/`:

- **`.claude/rules/*.md`** load automatically when you edit a matching path.
  They are obligations — sentences that can only be violated, never quietly
  outdated. Each declares its own scope in frontmatter, so `.claude/rules/` is
  the list — a count here would be the exact kind of state claim the rules
  themselves are written to avoid.
- **`.claude/skills/*/SKILL.md`** are procedures you invoke: `release`,
  `review-change`, `verify-gate`, `retranslate-key`, `file-issue`,
  `theme-generator`.

The split exists because a page nobody opens at the moment of the edit teaches
nobody. A rule arrives _because_ you touched the file.

`tests/lint/rule-citations.test.mjs` resolves every path and npm script those
files cite, so a rule cannot quietly point at something that moved.

**Writing one:** state obligations, not state. "Steps are written `<= N`" can
only be violated; "there are five migration steps" rots the moment a sixth
lands, and it loads as an instruction. State a fact once — if it is in a rule,
the wiki page points at it rather than repeating it.

## 🚦 Task Router

The rule loads on its own; the page is what you read when you need the _why_.

| If you are about to…              | Loads automatically   | Read for the reasoning                                                                             |
| --------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| Add or change a translation key   | `rules/i18n.md`       | [ops/I18N.md](ops/I18N.md)                                                                         |
| Decide if a word stays English    | `rules/i18n.md`       | [ops/I18N_TERMINOLOGY.md](ops/I18N_TERMINOLOGY.md)                                                 |
| Fill the translation packet       | `rules/i18n.md`       | [ops/I18N_HANDOFF.md](ops/I18N_HANDOFF.md); `/retranslate-key` for shipped English                 |
| Write a changelog entry           | `rules/changelog.md`  | [ops/CHANGELOG.md](ops/CHANGELOG.md)                                                               |
| Change colors, spacing, or tokens | `rules/ui.md`         | [code/DESIGN_LANGUAGE.md](code/DESIGN_LANGUAGE.md)                                                 |
| Build or restyle a component      | `rules/ui.md`         | [code/UI_PATTERNS.md](code/UI_PATTERNS.md), [code/UI_MODALS.md](code/UI_MODALS.md)                 |
| Touch a CV theme or PDF output    | `rules/themes.md`     | [code/THEME_SYSTEM.md](code/THEME_SYSTEM.md), [code/PDF_ENGINE_TYPST.md](code/PDF_ENGINE_TYPST.md) |
| Add a whole new theme             | —                     | the `theme-generator` skill                                                                        |
| Add or change store state         | `rules/data-model.md` | [code/STATE.md](code/STATE.md), [ops/DATAMODEL.md](ops/DATAMODEL.md)                               |
| Write or change a test            | `rules/testing.md`    | [ops/TESTING.md](ops/TESTING.md)                                                                   |
| Verify a change before pushing    | —                     | the `verify-gate` skill; [ops/PREFLIGHT.md](ops/PREFLIGHT.md)                                      |
| Cut a release                     | —                     | the `release` skill; [ops/RELEASE_PROCESS.md](ops/RELEASE_PROCESS.md)                              |
| Work on sync/auth                 | `rules/cloud-sync.md` | [ops/SYNC_FLOWS.md](ops/SYNC_FLOWS.md), [code/CLOUD_SYNC.md](code/CLOUD_SYNC.md)                   |
| Work on AI / background jobs      | `rules/ai-backend.md` | [ops/AI_LOGIC.md](ops/AI_LOGIC.md)                                                                 |
| Edit the database / schema        | `rules/database.md`   | [ops/DATAMODEL.md](ops/DATAMODEL.md)                                                               |
| Work on SEO / metadata            | `rules/seo.md`        | [code/SEO.md](code/SEO.md)                                                                         |
| Add an analytics event            | `rules/analytics.md`  | [code/ANALYTICS.md](code/ANALYTICS.md)                                                             |
| Review a finished diff            | —                     | the `review-change` skill                                                                          |
| File an issue                     | —                     | the `file-issue` skill                                                                             |
| Delegate work to a subagent       | —                     | [ops/SUBAGENTS.md](ops/SUBAGENTS.md)                                                               |
| Run or debug a script             | —                     | [ops/SCRIPTS.md](ops/SCRIPTS.md)                                                                   |

### Pages that stay reference, deliberately

A written "no" is worth as much as a rule. These were assessed and kept
whole, because they describe rather than bind — a rule extracted from them would
be a state claim that rots:

| Page                   | Why it stays                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `ops/SYNC_FLOWS.md`    | Describes flows and z-index order; almost no obligations to violate                                    |
| `ops/DEPLOYMENT.md`    | Runbook and env reference; the deploy gate is in `netlify.toml`'s own comments and the `release` skill |
| `ops/SCRIPTS.md`       | An index of scripts — a catalogue, not a contract                                                      |
| `ops/SUBAGENTS.md`     | The roster; changes with the agent set, not with a code path                                           |
| `code/ARCHITECTURE.md` | Orientation for a new reader                                                                           |
| `code/JSON_EXPORT.md`  | Describes export tiers; the import contract is in `rules/data-model.md`                                |
| `code/CONVENTIONS.md`  | General principles; the enforced ones are in `AGENTS.md` and ESLint                                    |
| `CORE_IDENTITY.md`     | Vision and pillars                                                                                     |
| `history/*`            | Past tense; cannot rot                                                                                 |

## 🗺️ Sitemap

### Project

| Page                                         | Covers                          | Updated    |
| -------------------------------------------- | ------------------------------- | ---------- |
| [CORE_IDENTITY.md](CORE_IDENTITY.md)         | Vision, pillars, current status | 2026-07-24 |
| [history/DECISIONS.md](history/DECISIONS.md) | Architecture decision record    | 2026-10-11 |

`.agent/plans/` is **gitignored** as of 2026-09-06 and holds working plans for whatever task is in flight on that machine — never a source to cite, and absent in a fresh clone. Plans committed before that date are still readable with `git log -- .agent/plans/`. Anything durable was folded into the pages below; if you find a ruling that was not, that is a gap to fix here rather than a reason to go digging in history.

### Code & Architecture (`code/`)

How the app works internally.

| Page                                                      | Covers                                                                                                                                       | Updated    |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [ARCHITECTURE.md](code/ARCHITECTURE.md)                   | Project structure and module boundaries                                                                                                      | 2026-07-24 |
| [STATE.md](code/STATE.md)                                 | Zustand stores, slices, persistence                                                                                                          | 2026-07-24 |
| [CONVENTIONS.md](code/CONVENTIONS.md)                     | Naming and code conventions                                                                                                                  | 2026-07-24 |
| [DESIGN_LANGUAGE.md](code/DESIGN_LANGUAGE.md)             | Brand tokens, color/spacing/radius rules, heading weight, what an exported document may carry                                                | 2026-09-07 |
| [UI_PATTERNS.md](code/UI_PATTERNS.md)                     | Component and interaction patterns                                                                                                           | 2026-10-12 |
| [UI_MODALS.md](code/UI_MODALS.md)                         | Modal & dialog patterns (DialogFrame)                                                                                                        | 2026-07-24 |
| [THEME_SYSTEM.md](code/THEME_SYSTEM.md)                   | CV-document theme architecture — HTML preview + Typst serializer, `ThemeId`-keyed registries, shared helpers, zero-optional palette contract | 2026-09-05 |
| [RENDERING.md](code/RENDERING.md)                         | Rendering principles and per-section detail                                                                                                  | 2026-07-24 |
| [PDF_ENGINE_TYPST.md](code/PDF_ENGINE_TYPST.md)           | **The** PDF engine: Typst WASM worker, eager + lazy fonts, compile flow, per-theme compile smoke test, letter-capacity calibration           | 2026-09-05 |
| [TYPST_THEME_AUTHORING.md](code/TYPST_THEME_AUTHORING.md) | Authoring a theme serializer — directory layout, coordinating shell, layout conventions                                                      | 2026-07-24 |
| [JSON_EXPORT.md](code/JSON_EXPORT.md)                     | JSON export tiers + import sanitization, migration-backup safety net                                                                         | 2026-08-09 |
| [CLOUD_SYNC.md](code/CLOUD_SYNC.md)                       | Google Drive compatibility details                                                                                                           | 2026-08-29 |
| [ANALYTICS.md](code/ANALYTICS.md)                         | Anonymous cookieless PostHog analytics                                                                                                       | 2026-10-11 |
| [SEO.md](code/SEO.md)                                     | SEO strategy, metadata, noindex routes, JSON-LD                                                                                              | 2026-09-08 |

### Operations (`ops/`)

Manuals for maintaining the ecosystem.

| Page                                           | Covers                                                                                               | Updated    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| [I18N.md](ops/I18N.md)                         | 15 locales, sync route, validation, wrong-script guard                                               | 2026-09-07 |
| [I18N_HANDOFF.md](ops/I18N_HANDOFF.md)         | Packet workflow — agents write all 15, into the packet                                               | 2026-10-06 |
| [I18N_TERMINOLOGY.md](ops/I18N_TERMINOLOGY.md) | Which words stay English, which get translated, and the owner rulings (Pass, token, German Template) | 2026-10-06 |
| [SCRIPTS.md](ops/SCRIPTS.md)                   | What each `scripts/` utility does                                                                    | 2026-09-07 |
| [PREFLIGHT.md](ops/PREFLIGHT.md)               | Local verification checklist before a PR; CI is the gate                                             | 2026-10-13 |
| [TESTING.md](ops/TESTING.md)                   | Test layout and how to run each suite                                                                | 2026-10-06 |
| [DEPLOYMENT.md](ops/DEPLOYMENT.md)             | Netlify deployment and environment                                                                   | 2026-09-08 |
| [RELEASE_PROCESS.md](ops/RELEASE_PROCESS.md)   | Cutting a release, and choosing the version bump                                                     | 2026-08-29 |
| [CHANGELOG.md](ops/CHANGELOG.md)               | Changelog & feature-discovery architecture                                                           | 2026-08-29 |
| [SYNC_FLOWS.md](ops/SYNC_FLOWS.md)             | Cloud sync & auth flows                                                                              | 2026-10-13 |
| [AI_LOGIC.md](ops/AI_LOGIC.md)                 | Vertex AI integration, AI features, the import job end to end                                        | 2026-09-08 |
| [DATAMODEL.md](ops/DATAMODEL.md)               | Data model migration & versioning                                                                    | 2026-07-24 |
| [MONETIZATION.md](ops/MONETIZATION.md)         | Passes, Stripe & fulfillment                                                                         | 2026-10-11 |
| [SUBAGENTS.md](ops/SUBAGENTS.md)               | The `.claude/agents/` roster, when to use which, review protocol                                     | 2026-09-07 |

### Archived (`history/`)

Superseded, kept for context. Never cite as current behaviour.

| Page                                                       | Why archived                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| [PDF_ENGINE_REACT_PDF.md](history/PDF_ENGINE_REACT_PDF.md) | `@react-pdf/renderer` was replaced by Typst and is no longer a dependency |

### Agent Skills & Tooling

Everything lives under `.claude/`. `.agent/skills/` was deleted on 2026-09-04:
its repo-specific skills are superseded by `.claude/rules/` and
`.claude/skills/theme-generator/`, and the rest was a third-party collection
nothing here cited.

#### Project Skills (`.claude/skills/`)

Loaded by Claude Code. Invoke with `/<name>`.

| Skill             | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `release`         | Cutting a release, and the six traps in doing it                 |
| `review-change`   | The independent review pass a finished diff earns                |
| `verify-gate`     | Running the real gate and reporting what actually ran            |
| `retranslate-key` | Changing shipped English and driving 14 locales through it again |
| `file-issue`      | Filing an issue the templates' way                               |
| `theme-generator` | Scaffolding a new CV theme (HTML + Typst) and registering it     |

Standing obligations live in `.claude/rules/*.md` and load by path rather than
being invoked.

## Workflow Conventions

- **Phased Implementation**: For multi-step tasks, maintain a `temp_instructions/` checklist.
- **Modular Editor**: All forms must follow the decomposition pattern (Hook/Item/Field).
