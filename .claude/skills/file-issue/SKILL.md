---
description: File a KiwiCV GitHub issue the way an agent must — render the chosen .github/ISSUE_TEMPLATE body by hand and apply the labels the web form would have applied. Use whenever creating an issue with `gh`.
argument-hint: '[template: bug_report|feature_request|refactor|design|conception|discussion|epic]'
---

File a GitHub issue for this repository.

`gh issue create --body-file` does **not** apply
`.github/ISSUE_TEMPLATE/*.md`: the body lands exactly as given, and
the template's `title:` prefix and `labels:` never run. Reproduce
by hand what the web form gives a human for free.

## 1. Pick the template

`$ARGUMENTS` if given, else by what the issue _is_:

| Template          | For                                   |
| ----------------- | ------------------------------------- |
| `bug_report`      | something behaves wrongly             |
| `feature_request` | new capability or improvement         |
| `refactor`        | cleanup, tech debt, optimisation      |
| `design`          | visual or interaction design work     |
| `conception`      | shaping a problem before solving it   |
| `discussion`      | an open question                      |
| `epic`            | a body of work holding several issues |

## 2. Render it

Read `.github/ISSUE_TEMPLATE/$ARGUMENTS.md` and reproduce the body
below its frontmatter:

- keep every `##` section **in declared order**, answered honestly —
  an internal issue answers the user-shaped questions from the dev
  machine rather than dropping them;
- keep the checklists as checklists; they are the plan;
- put the frontmatter `title:` prefix on the title (`bug:`, `feat:`,
  `refactor:`, `epic:` …);
- pass the frontmatter `labels:` on the command line — nothing else
  applies them. Two categories have no label of their own and borrow
  one: `conception` → `enhancement`, `discussion` → `question`.

Check every label exists first, and **stop** if one does not — do not
guess a substitute; a missing label is a template to fix, not an
issue to file around:

```sh
gh label list --limit 200 --json name --jq '.[].name' | grep -qx "<label>" \
  || { echo "label <label> is missing — stop"; exit 1; }
gh issue create --title "<prefix> <short description>" \
  --label "<from the template frontmatter>" \
  --body-file <rendered.md>
```

Write the body to your scratchpad, not into the repo.

## 3. Say what you actually know

The value of an agent-filed issue is the evidence a human would
have had to dig for. Put it in the body:

- the **file:line** where the behaviour lives;
- what you **measured**, not what you assume — the command you ran
  and what it printed;
- what you checked that turned out **not** to be the cause;
- the **non-goals**, so the next reader does not re-litigate scope.

An issue that says "the dropdown is limited" is worth less than one
that says which component gates it, what the gate is reading, and
which of the three things it feeds is not prompt-only.

## 4. Do not invent process fields

KiwiCV's templates are plain `.md` with `name`, `about`, `title`,
`labels`, `assignees`. There is **no** issue Type and no
Priority/Effort project field to set — that is a sibling repo's
convention. Setting labels is the whole of it.

## 5. After filing

Reference the number in the branch's commits (`Refs #<n>`) and in
the PR body (`Closes #<n>` when the PR completes it). ⚠️ Code comments
and docs cite only issues in `KiwiCanopy/KiwiCV` (AGENTS.md §5): run
`gh repo view --json nameWithOwner` first, and if the issue went to any
other repository, keep its number out of code and docs. The issue is
the durable copy: `.agent/temp_instructions/` is gitignored, so
anything that must survive a clone belongs in the issue, the PR
body, or the wiki.
