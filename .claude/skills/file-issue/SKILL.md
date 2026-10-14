---
description: File a KiwiCV GitHub issue the way an agent must — render the chosen .github/ISSUE_TEMPLATE body by hand, apply its labels, and set the Type, the Priority/Effort issue fields and the milestone. Use whenever creating an issue with `gh`.
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

## 4. Set the Type, Priority, Effort and milestone

The KiwiCanopy org defines issue Types and two single-select issue
fields, Priority and Effort; they apply to this repository too. No
template sets them, so every filing
sets them by hand. An `epic` takes a Type and a milestone but no
Priority or Effort: it holds work rather than being work.

**Type** — `Bug` for `bug_report`, `Feature` for `feature_request`,
`Task` for everything else (the org has no Epic
Type — `gh api orgs/KiwiCanopy/issue-types --jq '.[].name'`):

```sh
gh api -X PATCH repos/KiwiCanopy/KiwiCV/issues/<n> -f type=Bug
```

**Priority and Effort** — discover the ids rather than trusting a copy:

```sh
gh api graphql -F owner=KiwiCanopy -F name=KiwiCV -f query='
  query($owner:String!, $name:String!) {
    repository(owner:$owner, name:$name) {
      issueFields(first:20) { nodes {
        ... on IssueFieldSingleSelect { id
          options { id name } } } } } }'
```

⚠️ Do not add `name` beside `id`: the field name needs the
`read:project` scope, and asking for it fails the whole query. Tell
the two apart by their options — Priority has Urgent/High/Medium/Low,
Effort has High/Medium/Low. The inline fragment is required, since
`issueFields` is a union.

Then, with `gh api repos/KiwiCanopy/KiwiCV/issues/<n> --jq .node_id`:

```sh
gh api graphql -f query='mutation($id:ID!,$p:ID!,$e:ID!){
  setIssueFieldValue(input:{issueId:$id, issueFields:[
    {fieldId:"<priority IFSS_ id>", singleSelectOptionId:$p},
    {fieldId:"<effort IFSS_ id>", singleSelectOptionId:$e}]})
  { issue { number } } }' -f id=<node-id> -f p=<IFSSO_ id> -f e=<IFSSO_ id>
```

The option variables are `ID!`, not `String!` — a `String!` fails with
a type mismatch. Field ids start `IFSS_`, option ids `IFSSO_`; an
`IFSSV_` id is a field _value_ and gives `NOT_FOUND`.

- **Priority** — **Urgent**: blocks the next release, or daily use is
  broken now. **High**: an issue on any open
  milestone. **Medium**: a
  real defect or improvement the release does not wait for. **Low**:
  deferred, demand-gated, optional.
- **Effort** — the honest size, not the importance. **Low**: one
  sitting. **Medium**: one subsystem with its tests and review.
  **High**: cross-subsystem, a new surface, or an unscoped
  investigation.

**Milestone** — says which release must not ship without the issue.
It is not a second priority. Set the next open patch or minor
milestone for a defect a user can meet in a shipped surface; leave it
empty for deferred or demand-gated work. Empty is an answer, so decide
it. A released milestone is closed — check `gh api
'repos/KiwiCanopy/KiwiCV/milestones?state=open'` before naming one.

```sh
gh issue edit <n> --milestone "<open milestone>"
```

Read it all back:

```sh
gh api repos/KiwiCanopy/KiwiCV/issues/<n> --jq '{type: .type.name,
  milestone: .milestone.title, fields: [.issue_field_values[]
  | {(.issue_field_name): .single_select_option.name}]}'
```

## 5. After filing

Reference the number in the branch's commits (`Refs #<n>`) and in
the PR body (`Closes #<n>` when the PR completes it). ⚠️ Code comments
and docs cite only issues in `KiwiCanopy/KiwiCV` (AGENTS.md §5): run
`gh repo view --json nameWithOwner` first, and if the issue went to any
other repository, keep its number out of code and docs. The issue is
the durable copy: `.agent/temp_instructions/` is gitignored, so
anything that must survive a clone belongs in the issue, the PR
body, or the wiki.
