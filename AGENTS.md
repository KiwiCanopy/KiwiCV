# KiwiCV — Agent Entry Point

`AGENTS.md` governs behavior. The [KiwiCV Wiki](.agent/wiki/INDEX.md) governs knowledge — it
carries the sitemap, the task router, and every page below. This file holds only what the wiki
cannot: the gotchas that have shipped real breakage, and the decisions the owner reserves.

## 🚦 Start here

- Read `.agent/temp_instructions/` if it exists — the checklist for the task in flight names the
  active phase, the locked decisions, and the non-goals.
- Route through the wiki's [task router](.agent/wiki/INDEX.md) before inventing a workflow. Most
  process questions are already answered there, and inferring a procedure from reading the scripts
  has produced wrong advice more than once.
- Verify assumptions against the code. The code is the terrain; the wiki is the map.
- Driving a pull request for an outside contributor? [CONTRIBUTING.md](CONTRIBUTING.md) adds the
  contribution rules: issue first, a `### Ruling` before design work, the CLA, signed-off commits.

## Product identity

KiwiCV is the resume product in the KiwiCanopy family. Its north star is **simplicity and
intuitiveness, in that order**, and it is **approachable by default, powerful on demand** — AI
controls, versioning, sync, raw JSON, and design options stay discoverable through progressive
disclosure rather than competing with the primary task.

One constraint is not derivable from the surrounding code:

- **Generated CV templates stay visually independent of the KiwiCV brand.** KiwiCanopy cues belong
  in the product UI, never in a user's exported document.

Everything else — layout, states, control grouping — is in
[Design Language](.agent/wiki/code/DESIGN_LANGUAGE.md).

---

## Core conventions

### 1. Wiki

Update documentation in the same change set as the code, not at end of session — parallel agents and
sudden handovers both read the repo, not your context.

⚠️ **Argue the rule, never log the event.** A durable _why_ goes in the topic page that owns it —
[DESIGN_LANGUAGE.md](.agent/wiki/code/DESIGN_LANGUAGE.md) for a palette or salience ruling,
[UI_PATTERNS.md](.agent/wiki/code/UI_PATTERNS.md) for a control convention, the relevant `ops/` page
for a workflow — or, within the budget §5 sets, in the code comment beside the thing it constrains.
An entry earns its place by
one test: **someone working in that area would otherwise re-litigate it or undo it by mistake.** If
the code already says _what_ and there is no non-obvious _why_, it belongs in git history, not in a
page.

Dated daily logs were retired on 2026-08-29. They had become an event log rather than a design
record: the durable rulings were already in the topic pages and in code comments, and the rest is
recoverable from `git log`. Do not reintroduce a per-day file.

The wiki is edited under [its own rules](.agent/wiki/INDEX.md): newest date wins and stale text gets
deleted.

### 2. Working loop: Read → Plan → Act → Verify → Document → Review

1. **Read** the relevant code and wiki pages, and resolve ambiguity before writing.
2. **Plan** — for anything past a handful of edits, write an `implementation_plan.md` under
   `.agent/plans/<task-name>/`: the approach, affected files, open questions, phase cuts.
   ⚠️ **That directory is gitignored** as of 2026-09-06, like `.agent/temp_instructions/` in §3 —
   a plan is scaffolding for the task in flight and does not reach a reviewer, a clone, or a
   cloud agent. A ruling that survives the task belongs in the page that owns it (§1); the plan
   is where you work it out, never where it ends up.
3. **Act** — implement in atomic commits.
4. **Verify** — run `/verify-gate` (§6). Never describe blocked CI as passing.
5. **Document** — code and docs must never describe different behavior, in the same change set.
6. **Review** — run `/review-change`: `code-reviewer` and `architect-reviewer` in parallel, fresh
   agents, since independence is the point, plus the specialist lanes the diff opens. **Address or
   consciously dismiss every finding before opening a PR.** Both reviewers are read-only — one that
   edits has replaced the diff it was reviewing with an unreviewed one.

**A confirmed finding is never dropped on the floor.** A review that surfaces a real defect and
ends with that defect neither fixed nor filed has bought nothing: the next agent re-derives it, or
builds on top of it. Every finding the reviewer confirms leaves the session in exactly one of three
states, and the PR body says which:

- **fixed in this diff** — everything blocking, plus anything cheap enough that filing costs more
  than fixing;
- **filed as an issue** (`/file-issue`) — real, but its repair belongs to a different change set: a
  structural fix, a sweep across files this diff never touches, a guard that needs its own design.
  Filing is not a softer verdict than fixing; it is how a real defect survives the end of a session;
- **argued down in writing** — the reviewer was wrong, and the counter-argument is recorded where
  the next reader meets the same code, not just asserted in chat.

"Noted for follow-up" is not one of the three. Follow-up is an issue number. This applies to
findings you produce about your own work, not only to a reviewer's — the failure mode is
identical, and self-found defects are the ones most easily talked past.

⚠️ **Step 6 is a step, not a suggestion, and it is not only for big diffs.** This section used to end
at step 5 and mention review afterwards as something that "is worth it" on "a substantial finished
diff". Both qualifiers were an out, and the loop as written was already complete without it — so it
got skipped, in whole sessions at a time.

⚠️ **A green gate is not a review.** On 2026-09-04 nine PRs were opened and merged with no reviewer
run at all. The review that finally happened found a cover-letter Improve button that could not work:
its response schema named two fields `FIELD_DEFS` does not define, so it shipped untyped nodes whose
shape Vertex leaves to the model (measured 2026-09-05: accepted, and answered with a string where an
object was wanted), and `applySectionSuggestion` has no branch for an object-shaped section, so
nothing was ever written back. `npx tsc -b`, 3,169 tests, `lint`, `i18n:check` and `ai:check-sync` were all green,
because nothing exercised the pipeline. §6 proves a change does what you ran; a review is what
notices you ran the wrong thing.

⚠️ **A hook was tried here and removed the same day.** A `PreToolUse` guard on `gh pr create` misfired
twice within ten minutes — once denying `npm test`, once denying its own test — and a guard that
blocks real work is worse than the gap it covers. The sibling repo that never skips this step has no
hook either; it has this numbered loop, ending here.

### 3. Phase governance

- **No plan-approval checkpoint** (owner, 2026-10-05). When the task is clear, execute; the plan in
  §2 is for your own reasoning. Stop at the boundaries listed at the end of this section and at the
  escalations §6 names.
- Keep a self-contained checklist in `.agent/temp_instructions/<task-name>.md` — goal, locked
  decisions, non-goals, phases — that a fresh agent can resume from alone. ⚠️ **That directory is
  gitignored** (the `.agent/temp_instructions/` entry in `.gitignore`; a line number there rots),
  so it never reaches a reviewer, a clone, another machine, or a
  cloud agent. Anything that must survive a clone belongs in the wiki, the PR body, or an
  issue. The checklist is the working copy of that state, never its only copy.
- State where each phase cuts, then continue to the next one by default. Report what shipped and
  what was validated at the boundary; the checklist keeps it handover-ready anyway.

**Measurement lanes open with a measurement.** A few questions the code cannot answer by reading:
what Typst actually renders (page capacity, where a footer lands, whether a letter flows to a second
page), the background-job and poller window in `improve-cv-background.mjs`, and what Vertex's
Schema proto actually accepts. A lane on one of them **opens with a measurement, never a
hypothesis** — if the first move is "I think what happens is", the lane has already gone wrong. One
model runs every lane (owner, 2026-10-06: the per-lane model choice was retired); the discipline is
in the first move, not the model.

⚠️ **The two cases this repo has actually met.** The cover letter's length presets were arithmetic off
geometry constants nobody rendered, and the published table was computed for the layout that is not
the default — a measurement lane by construction. And a cover-letter change shipped a response schema with
untyped nodes: `npx tsc -b`, 3,169 tests, `lint`, `i18n:check` and `ai:check-sync` were all green,
because "what will the provider do with this" is not a question any of them asks — and the
measured answer was not the rejection everyone assumed but a silently model-chosen shape.

- Stop for the owner when the boundary genuinely needs them: an irreversible or public-facing step
  (cutover, merge, push, rename, Live payment or provider changes), an action only they can perform
  (dashboards, DNS, assistive-tech validation), an unresolved scope or design
  decision, or a context-budget limit.
- When handing over, bring the checklist current, then write a copy-pasteable prompt
  naming the next unchecked item, the current commit, validation evidence, blockers, and non-goals.
- When the task is done, fold any durable ruling into the page that owns it, then delete the task's
  `.agent/temp_instructions/` file.

### 4. Delegation

The roster lives in `.claude/agents/` (tracked) and is documented in
[ops/SUBAGENTS.md](.agent/wiki/ops/SUBAGENTS.md) — which agent covers which surface, and the review
protocol. Read that before inventing a delegation pattern; these are hand-written against this
repo's gotchas, not generic personas.

Spin off subagents without being asked where the payoff is clear — broad fan-out searches, parallel
isolated implementation, independent review. Below roughly three files, or where the work is
iterative, the round trip costs more than doing it.

- **The prompt is the entire context.** A subagent starts with zero conversation history, so name
  the paths, the exact commands, and the acceptance criterion. "Review my changes" gives a fresh
  agent nothing. Never delegate work that depends on context you cannot write down.
- **Reviewers are read-only, fresh, and never the agent that wrote the code.** Run them in parallel.
- ⚠️ **An agent with `Bash` shares this worktree.** It can move `HEAD` or revert uncommitted work,
  and has. Commit or stash before spawning one, run `git status -sb` before every commit that
  follows agent work, and use worktree isolation when several agents write at once.
- **A subagent's verification claim is not verification.** Re-run the §6 gate yourself before
  reporting anything as validated — including when the subagent says it already passed.
- **Never delegate**: a decision §3 reserves for the owner, cutting a
  release, or any push, merge, or public-facing step.
- Relay the conclusion, not the agent's transcript.

### 5. Code shape

Write code that reads like the code around it. Complex components split cleanly into logic
(`useX.ts`), UI (`XItem.tsx`), and `types.ts` — reach for that when a file stops being scannable,
not at a line count.

**Comments: state the constraint, cite the ruling, stop.** A comment carries only what the code
cannot show — a non-obvious invariant, a platform trap, the why behind a choice that looks wrong.
Budget: 1–3 lines plus the issue ref (`#NNN`) where an argument exists. ⚠️ Cite only issues in the public
repository, `KiwiCanopy/KiwiCV`. References to the private tracker that preceded it were removed on
2026-10-11 because no reader can open them. Never re-add one from memory or from an old branch: the
public tracker restarts at #1, so an old number would silently resolve to the wrong issue.

**The comment states the constraint; the argument for it lives elsewhere** — in the issue, the
owning [`.claude/rules/`](.claude/rules/) file, or the wiki page that owns the subject (§1). That is
the boundary §1 and [INDEX.md](.agent/wiki/INDEX.md) rule 3 leave open when they name the code
comment as a home for a durable _why_. A comment that has to argue is a comment whose ruling has no
home yet: give it one and cite it in a clause. A regression worth pinning is worth a test — write
the test and let the comment name it.

A docstring states the contract — what it does, its units, its side effects — not the design
history. Never write: how the code got here, alternatives considered and rejected, what the next
line visibly does, or justification aimed at a reviewer.

⚠️ Much of the tree predates this and runs long. **Do not trim it wholesale** — an over-explained
comment is not a defect on its own. This binds on new code, and on a comment you are already editing
for another reason.

### 6. Validation commands

Repeatedly overlooked. Read this before reporting anything as validated.

- **`npm test` is four runners, not one**: `vitest`, `test:functions`, `test:i18n`, and
  `test:lint-baseline`. **`npx vitest run` is a partial run** — confident green while skipping locale
  integrity and the lint baseline entirely. Always finish with `npm test`.
- **`npx tsc --noEmit` typechecks nothing here.** The root `tsconfig.json` is a solution file
  (`"files": []` plus two `references`), so it resolves zero inputs and exits 0 no matter what is
  broken — confirm with `npx tsc --noEmit --listFiles | wc -l`, which prints `0`. **The typecheck is
  `npx tsc -b`**, plus `--force` when a stale `.tsbuildinfo` might be hiding an error. `npm test`
  does not typecheck either — vitest strips types rather than checking them. A type error can
  survive a green `npm test` _and_ a green `npx tsc --noEmit` and surface only at build
  (`RawJsonViewer.tsx`, 2026-07-21).
- **`npm run build` rewrites `public/sitemap.xml`**, which is committed. Running it dirties the
  working tree; stage the sitemap deliberately or restore it. CI runs the full build on every PR to
  `main`, so `npx tsc -b` is the local typecheck of record.
- **Never hand-edit locale keys.** ⚠️ Before removing one, read
  [ops/I18N.md](.agent/wiki/ops/I18N.md) § "Keys reached indirectly" — a key can be referenced
  in four places and only two are findable by grepping `src/`; the handoff catalog is not in
  `src/` at all. Removing one is `node scripts/remove-keys.cjs <module.key>...`
  (all 15 locales, then format; `file:export.key` for a second export); adding or syncing is `npm run i18n:sync`. A hand-rolled
  script leaves the files inconsistent with the tooling that reads them.
- **Translations arrive as files, never as chat text.** Values are written into the generated
  packet under `.agent/temp_instructions/` in the working tree; you then run
  `npm run i18n:handoff:import -- --check` and `--apply`. A value that never entered the packet was
  never validated against its fingerprint, placeholders, protected tokens, or rich-text balance —
  and pasting is what straightens CJK curly quotes and turns `\n` escapes into real line breaks.
- **Author all fifteen locales, through the packet** (owner, 2026-09-07). ⚠️ **This reverses "Author
  English only. Never German."**, which stood while a human translator supplied the other fourteen. A
  placeholder nobody will translate is not safer than a considered value; it just ships English in
  fourteen languages. What does **not** change is the route: values go into the packet files and
  through `i18n:handoff:import`, never into a locale file by hand and never through chat.
  ⚠️ **Derive, do not invent.** Take the verb, the noun and the register from strings already
  shipped in that locale. `common.close_dialog` took its verb from `common.close_menu`, and
  `settings.github.show_token` its noun from `settings.github.personal_token`, so the button and the
  field it labels use one word in every language; `ai.import_max_size` took each locale's own
  unit — `Mo`, `МБ`. A value with no sibling to anchor it
  is the one to raise with the owner rather than guess.
  ⚠️ **The risk the old rule named is accepted, not solved.** A plausible wrong value in a language
  nobody here reads will never be re-examined. `scripts/i18n/check-scripts.cjs` catches a wrong
  writing system and nothing catches wrong meaning.
  ⚠️ **The escape hatch is per-locale and does not reach `main`.** Leaving English is defensible in
  the one or two locales a string genuinely defeats you in; in all fourteen it is not even mergeable,
  since `tests/i18n/untranslated.test.cjs` fires on exactly that and the PR's `Lint & Test` check runs it. That case is
  an owner escalation, never an `untranslated-allowlist.cjs` entry.
- **Read the new English and German critically before applying.** They are the two the owner can
  judge at a glance, and they are now reviewing your work rather than a translator's. If a value
  reads awkwardly or off-register, say so rather than shipping it quietly.
- **Changelog: stage English as you go, translate once before release.** A **user-relevant** change
  gets its entry added to `CHANGELOG_UPDATES` in `scripts/sync-changelog.cjs` in English, then
  `npm run changelog:sync` writes it into all 15 locales and empties the array — it is an inbox, not
  a record. Internal work (refactors, chores, tests, tooling, silent bumps) gets no entry. Do not
  translate per PR; one pass covers the accumulated entries just before release. See
  [ops/CHANGELOG.md](.agent/wiki/ops/CHANGELOG.md).
- **Run `npm run i18n:check` before _and_ after any locale change.** It reports the offending
  `file:line` and key. It is the only check that catches a live file borrowing a key from an
  unrelated subtree — file-level dead-code analysis cannot see that, and has already deleted a key
  still in use (`usePricing.ts` → `problem_generic.auth_desc`, 2026-07-21).
- **`i18n:check` cannot see a string that never calls `t()`.** `npm run i18n:literals` finds that
  class — JSX text, prose-carrying attributes and props, `{cond ? 'a' : 'b'}` children, and
  `addToast(...)` announcers. `tests/lint/bare-literals.test.mjs` runs inside `npm test` and fails on
  anything not frozen in `bare-literal-baseline.js`, so new English copy cannot reach the UI without
  a locale key or a written justification. The baseline only shrinks; a stale entry fails the same
  test.
- **Deleting files is not enough.** Removing a component orphans its locale keys, its analytics
  source strings, and often its entry in `eslint.config.js`, `eslint-legacy-baseline.js`, or
  `bare-literal-baseline.js`. Sweep those in the same change set.
- Also worth the keystrokes: `npm run lint`, `npm run brand:check`.

Full tooling reference: [ops/I18N.md](.agent/wiki/ops/I18N.md) and
[ops/I18N_HANDOFF.md](.agent/wiki/ops/I18N_HANDOFF.md).

### 7. Import conventions

Always use the `@/` alias — never `../` or `./`, including between siblings in a modularized
directory (`@/pages/account/useAccount`, not `./useAccount`). ⚠️ **Nothing enforces this** —
`eslint.config.js` bans specific modules by exact specifier, so a relative spelling of a banned
import slips straight through. That gap is why `preview/__tests__/themeStoreIsolation.test.ts` has to
hand-roll a scan that matches both spellings.

### 8. Skills

`.claude/skills/` holds the **invocable** ones — `/verify-gate`, `/review-change`,
`/file-issue`, `/retranslate-key`. They exist because the conventions in §2, §3 and §6 are prose, and prose gets
skipped under momentum: on 2026-08-26 two PRs merged with no reviewer run at all, and the
independent pass, once it happened, found six blocking defects in a diff already called
verified. Reach for them rather than reconstructing the workflow from memory.

⚠️ `/retranslate-key` exists because changing a shipped string's English is the
one edit where **every check reports success and the work does not happen**.
`i18n:check` passes, the generator says "0 cells await translation", and fourteen
locales keep the previous sentence. Reach for it whenever an English value that
already has translations is edited — not only when a key is added.

`.claude/skills/` holds the repo's own skills — these are the ones Claude Code
actually loads, and as of 2026-09-04 they are the only ones that exist.
`.agent/skills/` is **deleted**: its repo-specific half is superseded by
`.claude/rules/changelog.md`, `.claude/rules/i18n.md` and
`.claude/skills/theme-generator/`, and its other half was a third-party
reference collection that was never KiwiCV's. `.codex/` — one machine's stale
copy of agents from the deleted `install-subagents.sh` — went with it. None of
those paths exists to cite; the live roster is `.claude/agents/` (§4).

### 9. Changelog voice

Public-facing entries should feel premium and user-centric: name the specific UI element rather than
"fixed an issue," state the user benefit rather than the technical change, skip redundant
"Bugfix:"/"Feature:" labels, and use informal `Du/Dein` in German (never `Sie/Ihr`). Full style
guide in [ops/CHANGELOG.md](.agent/wiki/ops/CHANGELOG.md).

---

## 🛠️ Git workflow

Pre-commit refuses a commit on `main` (override: `KIWICV_ALLOW_MAIN_COMMIT=1`), then runs Prettier
and ESLint on staged files, plus a full `npm run i18n:check` when anything under `src/locales/` is
staged. **If Prettier reformats, the commit aborts** — re-stage and commit again. ESLint ignores
`.agent/` entirely.

There is no pre-push hook. **CI is the gate:** `.github/workflows/ci.yml` runs `Lint & Test` (lint,
`ai:check-sync`, the full `npm test`) and `TypeScript & Vite Build` on every PR to `main`, and both are
required checks. Merge only on green checks; `/verify-gate` is how you get the same answer before
pushing.

Commits use Angular format `type(scope): description` — `feat`, `fix`, `docs`, `style`, `refactor`,
`perf`, `test`, `build`, `ci`, `chore`. **Never `fix(test):` or `fix(e2e):`**; test changes are
`test:`. Keep them atomic: never mix a `feat` with a `refactor`, and break a large feature into
standalone pieces. Struggling to write a short accurate description means the commit is too big.
