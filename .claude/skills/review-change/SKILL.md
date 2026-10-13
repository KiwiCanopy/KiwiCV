---
description: Run KiwiCV's review workflow — code-reviewer and architect-reviewer in parallel, plus the specialist lanes the diff opens — as AGENTS.md §2 and §4 describe. Use on a finished, verified, committed change before opening a PR.
argument-hint: '[optional: base ref, e.g. main or a commit]'
---

Run the review pass AGENTS.md §2 calls for on a substantial finished
diff. Precondition: the change is finished, verified
(`/verify-gate`), and **committed**. If it plainly is not, say so
and stop.

## Why this is a skill and not a habit

AGENTS.md states the convention in prose, and prose gets skipped
under momentum. On 2026-08-26 two PRs merged with no reviewer run
at all; the one outside opinion that _was_ sought — a `ui-engineer`
consultation on a badge placement — changed the outcome
substantially. Independence is the point, and it is the first thing
to go when the author is confident.

## 1. Establish the diff

Take the range from `$ARGUMENTS` if given, else the merge base with
`main`.

!`BASE="$ARGUMENTS"; BASE="${BASE:-$(git merge-base HEAD main)}"; echo "--- vs $BASE ---"; git diff --stat "$BASE"...HEAD; echo "--- names ---"; git diff --name-only "$BASE"...HEAD`

## 2. Commit or stash first

⚠️ **Every reviewer here has `Bash` and shares this worktree.** One
can move `HEAD` or revert uncommitted work, and has. Confirm the
tree is clean before spawning anything, and run `git status -sb`
again before the next commit.

## 3. First round — parallel, one message

Spawn `code-reviewer` and `architect-reviewer` **in the same
message**, plus every specialist lane the diff earns. They are
independent; serialising only costs time.

The lane gate is a property of the diff, not a judgement call:

| The diff…                                                                                                        | also spawn             |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------- |
| touches `src/locales/**` beyond generated changelog placeholders, adds a `t()` call site, or adds English copy   | `i18n-steward`         |
| touches `src/components/preview/themes/**`, a serializer, a shared theme helper, or fonts                        | `typst-parity-auditor` |
| adds or changes an interactive component — modal, menu, drag-and-drop, toast, a new control                      | `a11y-auditor`         |
| touches `SEO.tsx`, `JsonLd`, `index.html`, `robots.txt`, the sitemap generator, or `seo.*` keys                  | `seo-auditor`          |
| adds a data flow, a third-party processor, a retention window, or an analytics event; or touches the legal pages | `privacy-compliance`   |
| adds a structure keyed by section, theme, palette or locale, or claims to pin an invariant                       | `guard-engineer`       |
| changes an editor/dashboard/sync/checkout flow and you have not driven it                                        | `ux-flow-tester`       |

**A copy-only diff still earns a lane.** When the entire content is
locale values or prose, the pair has little to bite on, but
`i18n-steward` is then _the_ review rather than a supplement — the
failure mode is wrong content, which lint cannot see.

⚠️ **`npm run changelog:add` is not a locale change.** It writes the
English source into all 15 files via `stageEnglish()`, so a diff can
show 30 touched files under `src/locales/` with nothing in them a
steward can read — they are byte-identical placeholders, and the
handoff generator reopens them as translation work precisely because
they still equal English. What earns the lane is the **English copy**
in the entry and any **new `t()` call site**, not the file count. A
new call site is worth it on its own: a label key that does not
resolve renders as its own path instead of failing, which neither
`i18n:check` nor `tsc` catches (`SectionHeaderActions.tsx:34`).

## 4. Brief each one properly

**The prompt is the entire context.** A subagent starts with zero
history. Name the range, the paths, the specific question, and the
acceptance criterion. "Review my changes" gives a fresh agent
nothing.

Say **READ-ONLY** explicitly and forbid `checkout`, `reset`,
`stash`, `commit` and `rebase`. `code-reviewer` and
`architect-reviewer` are read-only by role, but the reminder is
what keeps a helpful agent from "just fixing" the thing it found —
which replaces the diff under review with an unreviewed one.

Point each lane at what only it can judge:

- `code-reviewer` — correctness, repo conventions, the sweeps this
  codebase forgets. Give it the riskiest file first.
- `architect-reviewer` — module boundaries, import cycles,
  duplicated sources of truth, whether the change adds a copy where
  it should delete one.

## 5. Read the findings against the code

A reviewer can be confidently wrong. Verify each finding before
acting, and say so when one does not survive. Relay the
**conclusion**, never the transcript.

## 6. Second round — only when it earns one

Re-review when the fixes are themselves substantial. A one-line
correction does not need a fresh pair.

## What this skill cannot give you

Neither reviewer reads a non-English locale value for register or
naturalness, and neither opens a browser. The browser stays with
`/verify-gate`; register in the twelve locales the owner does not read is
uncovered by anything, which is the accepted cost of `.claude/rules/i18n.md`'s
2026-09-07 ruling — say so in the PR rather than implying review covered it.
