# Subagents

> **Last Updated: 2026-09-07** | [Wiki Index](../INDEX.md)

The roster lives in `.claude/agents/` and is **tracked in git** (the `!.claude/agents/**`
re-include in `.gitignore`). Each file is
hand-written against this repo — its inventories, its scripts, and the gotchas that have shipped
real breakage. They are not generic personas, and they are not interchangeable with an off-the-shelf
catalog.

Behaviour rules are [AGENTS.md §4](../../../AGENTS.md); this page is the roster and the protocol.

## Roster

| Agent                  | Use it for                                                                             | Writes? |
| ---------------------- | -------------------------------------------------------------------------------------- | ------- |
| `code-reviewer`        | Independent review of a finished diff: correctness, conventions, missed sweeps         | no      |
| `architect-reviewer`   | Structure: module boundaries, import cycles, a fact that now lives in two places       | no      |
| `typst-parity-auditor` | Preview ↔ PDF agreement for any theme, serializer or shared-helper change              | no      |
| `guard-engineer`       | Writing or auditing the compile-time / test-time guards that stop inventories drifting | yes     |
| `i18n-steward`         | Anything under `src/locales/`, any new user-visible string, any changelog entry        | yes     |
| `i18n-auditor`         | Reviewing locale VALUES — register, terminology, derivation, the catalog brief         | no      |
| `preflight-verifier`   | Running the real gate and reporting evidence before a commit, push or PR               | no      |
| `ai-backend-engineer`  | `netlify/functions/`, Vertex prompts and schemas, Stripe, Drive, `supabase/schema.sql` | yes     |
| `wiki-scribe`          | Updating `.agent/wiki/` and the sitemap                                                | yes     |
| `ui-engineer`          | Product UI: editor, dashboard, modals, pages, layout, design language                  | yes     |
| `ux-flow-tester`       | Driving the running app through real user flows and reporting defects                  | no      |
| `a11y-auditor`         | WCAG 2.2 AA on the product UI (not on the generated CV)                                | no      |
| `privacy-compliance`   | GDPR/CCPA, and whether the code still matches the published policy                     | no      |
| `copywriter`           | Landing, pricing and changelog-highlight copy: variants that persuade and stay true    | no      |

## Which one, when

- **A theme, a serializer, `themes/shared/`, or fonts changed** → `typst-parity-auditor`. Preview and
  PDF are twenty-four independent implementations of twelve designs; a change to one side without
  the other is a regression until proven otherwise.
- **A new structure keyed by section, theme, palette or locale** → `guard-engineer`, to bind it at
  the definition site rather than discover the drift at runtime.
- **Any locale key, or a component being deleted** → `i18n-steward`. Deletion orphans keys,
  analytics strings and lint-baseline entries.
- **Non-English VALUES added or reworded** → `i18n-auditor`, and never the steward that wrote them.
  Since the 2026-09-07 ruling the agent authors all fifteen, so this is the surface that would
  otherwise have an author and no reviewer. The tooling reads structure, the writing system and
  all-fourteen-identical; nothing reads meaning, register or terminology.
- **About to say "typechecked" or "tests pass"** → `preflight-verifier`. `npx tsc --noEmit`
  typechecks zero files here and `npm test` is four runners; the wrong command going green is the
  most-repeated mistake in this repo.
- **A finished, substantial diff** → `code-reviewer` **and** `architect-reviewer`, in parallel.
- **Something visual or interactive** → `ux-flow-tester`, then `a11y-auditor` if it is a new
  interactive pattern.
- **Landing, pricing or other persuasive copy written or reworded** → `copywriter` before the
  English is settled, so the fourteen translations start from the chosen words.
- **A new data flow, processor, or retention window** → `privacy-compliance`, and check whether
  `LAST_LEGAL_UPDATE` needs a bump.

## Protocol

**The prompt is the entire context.** A subagent starts with none of the conversation. Name the
paths, the exact commands, and the acceptance criterion. "Review my changes" hands a fresh agent
nothing and gets a generic answer back.

**Review independence.** Reviewers are read-only, spawned fresh, run in parallel, and are never the
agent that wrote the code. A reviewer that edits has replaced the diff under review with an
unreviewed one.

⚠️ **Worktree hazard — recorded, not hypothetical.** Any agent with `Bash` shares this working tree.
Read-only review agents have moved `HEAD` here, and an external agent in the same tree has reverted
**all** uncommitted work. So:

- Commit or stash before spawning an agent with `Bash`.
- Run `git status -sb` before every commit that follows agent work.
- Use worktree isolation when several agents write at once.
- Every agent file forbids `checkout`/`restore`/`reset`/`stash`/`add`/`commit` explicitly — but the
  caller is the one holding the uncommitted work, so the caller carries the check.

**A subagent's verification claim is not verification.** Re-run the [AGENTS.md §6](../../../AGENTS.md)
gate yourself before reporting anything as validated, including when the subagent reports green.

**Never delegate**: a decision AGENTS.md §3 reserves for the owner, cutting a release, or any push,
merge, or public-facing step. (A translated value was on this list until 2026-09-07; it is now
`i18n-steward`'s job — `.claude/rules/i18n.md`.)

**Relay the conclusion**, not the transcript.

## Editing the roster

- One job per agent. The `description` names the trigger, not a persona — it is what the model
  matches on when choosing an agent.
- Grant the fewest tools that do the job. Auditors and reviewers get no `Edit`/`Write`, and their
  bodies also close the `Bash` workarounds (`sed -i`, `>`, `patch`, `git apply`).
- **No invented thresholds.** Every number in an agent file must be one this repo actually checks,
  named with its command. The previous roster asserted coverage and complexity gates that do not
  exist here, which produced confident review verdicts about nothing.
- Every agent ends with a report contract that includes a **"not checked"** line. Silence reading as
  coverage is how a partial sweep gets reported as a clean one.
- Point at wiki pages and source paths rather than restating them — a copy in an agent file is one
  more thing that drifts.

## History

Until 2026-08-02 the roster was thirteen files fetched by `scripts/install-subagents.sh` from
`VoltAgent/awesome-claude-code-subagents`. They were replaced wholesale, and the script deleted.
Twelve of thirteen opened by querying a `context-manager` agent that does not exist here, several
granted tools that do not resolve, none knew a single one of this repo's verification traps, and the
roster covered Vue, Angular, Oracle and survey design while covering none of the preview/PDF, i18n
or wiki work that makes up most of the commit history. The measurements behind the replacement were
in `.agent/plans/subagent-revamp/`, deleted 2026-09-04 once the roster had shipped.

`.agent/skills/` and `.codex/`, the other leftovers of that script, were deleted on 2026-09-04.
