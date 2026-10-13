# Contributing to KiwiCV

Thanks for helping! KiwiCV is set up so that both humans and AI
coding agents can contribute safely: written conventions, a
strict test gate, and guards that fail when an inventory drifts.

## Getting Started

```sh
git clone https://github.com/KiwiCanopy/KiwiCV.git
cd KiwiCV
nvm use          # the Node version pinned in .nvmrc
npm ci                       # also installs the git hooks (husky)
cp .env.example .env.local   # placeholder values
npm run dev                  # http://localhost:5173
```

With the placeholder values, the editor, the preview and the PDF
export work without any account. Sign-in, the Pass, the AI
features and cloud backup need their services; the
[README](README.md#local-setup) lists which variable unlocks
what. The tests and the typecheck need no environment at all.

## Ground Rules

The binding style and workflow rules live in
[AGENTS.md](AGENTS.md), the per-subsystem guardrails one level
down in [`.claude/rules/`](.claude/rules/), and the design and
operations knowledge in the
[wiki](.agent/wiki/INDEX.md). Start with AGENTS.md and follow the
link for the area you're touching. The short version:

- **Run the gate before you open a PR.** The pre-commit hook
  only lints what you stage; CI runs everything below on the PR,
  and those checks must be green before a merge.

  ```sh
  npx tsc -b            # the typecheck (npx tsc --noEmit checks nothing here)
  npm test              # four runners: vitest, functions, i18n, lint baseline
  npm run lint
  npm run i18n:check
  npm run ai:check-sync
  npm run brand:check
  ```

- **Imports use the `@/` alias**, never a relative path.
- **Every user-visible string goes through `t()`** and ships in
  all fifteen locales. `npm test` fails on bare English in the
  UI and on a new key that is still English in every locale.
- **New strings follow the locale workflow.** Add the key and its
  English value in `src/locales/en/`, run `npm run i18n:sync`,
  register it in `scripts/i18n/handoff-catalog.cjs`, and write the
  other fourteen values into the handoff packet — never into a
  locale file by hand
  ([`.agent/wiki/ops/I18N.md`](.agent/wiki/ops/I18N.md)). If you
  cannot provide the translations, open the PR anyway, expect the
  untranslated check to be red, and say so in the PR; I'll fill
  them in before merging.
- **Code and docs change together.** A change that makes a wiki
  page wrong updates that page in the same PR.

## Licensing Your Contribution

KiwiCV is licensed under the
[GNU Affero General Public License v3.0](LICENSE). Contributions
come in under the [Contributor License Agreement](CLA.md): a
**non-exclusive** grant — you keep your copyright and may reuse
your own work anywhere — that lets the Licensor relicense your
contribution together with the rest of the project, including
under commercial license terms. Read it before your first pull
request; it is short.

Signing happens in the pull request: a bot comments on your
first PR, you post the sentence it asks for, and the check turns
green. It asks **once** per GitHub account. A statement posted
from your account is yours whether you typed it or an AI agent
acting for you did (CLA § 10) — so read the document before
letting a tool answer the bot. A company contributing through
its employees sends the Licensor a signed copy naming them; each
of them still signs on their own first PR (CLA § 11).

As an outside contributor, sign each commit off with
`git commit -s` as well. That
`Signed-off-by` line certifies the
[Developer Certificate of Origin](https://developercertificate.org)
— a fixed text about _your right to submit the code_, which
grants no relicensing right on its own; the CLA is the grant,
the sign-off is the per-commit provenance record.

## Using AI Assistants

AI coding assistants are **welcome and encouraged** here. Much of
the repo is set up to make them productive: [AGENTS.md](AGENTS.md)
at the root, plus the committed `.claude/rules/` (path-scoped
conventions), `.claude/skills/` (the verify and review workflows)
and `.claude/agents/` (the review and specialist agents). They
teach an assistant KiwiCV's conventions so its output lands
on-style instead of generic. Claude Code picks them up from the
clone; other assistants read `AGENTS.md` and the rule files
directly.

One rule, though: **understand what you submit.** A pull request
is yours regardless of how it was written — know what your
change does and why, and be able to talk through it in review.
Please don't "vibecode" a PR full of generated code you couldn't
explain. Treat the assistant as a fast pair-programmer, not an
author you rubber-stamp.

And before you push, actually run it — start the dev server,
exercise the change, and confirm it behaves the way you intend.
Green tests aren't proof for anything user-facing.

## Before You Start

I'd rather nobody's effort goes to waste, so please agree on the
work in the issue before you write the code.

**Every change starts from an issue.** Please don't send a PR for
a feature or fix that has no issue yet — open one first. A typo
or a broken link is the one exception.

**Settle the design first.** If an issue still needs design —
what it should look like, how it should behave, which approach to
take — discuss it in the issue's comments. It is ready to build
once I've written a `### Ruling` section into the issue body.
A PR for an issue without a ruling may be closed unreviewed,
however good the code is.

**Claim it before you start.** When an issue is clear (a ruled
feature, or a bug whose fix is obvious), leave a comment saying
you're taking it and roughly how long you expect it to take.
I'll assign it to you, so nobody else starts on the same thing.
Opening a draft PR early is the best way to show progress.

**Claims can lapse.** If a claim runs well past its estimate with
no update, I may hand it to someone else. A short "still on it"
comment keeps a claim alive. Please don't take over a claimed
issue yourself — ask in the issue and I'll decide.

**Show what you built.** A PR that changes anything visible
attaches a short screen recording to its "How I verified"
section (a screenshot is enough for a static change). A change
to a CV template shows the preview and the exported PDF.

## Branching & Pull Requests

**Branch naming:** Conventional Commit type plus a kebab-case
description, e.g. `feat/custom-section-icons`,
`fix/pdf-footer-overlap`, `docs/i18n-handoff`.

Branch from `main` and keep one focused change per branch.
Separate refactors from features so each can be reviewed on its
own.

**Pull request process:**

1. Fill in the PR template.
2. Commit messages follow the Angular format
   `type(scope): description` (see [AGENTS.md](AGENTS.md),
   Git workflow). Test changes are `test:`, never `fix(test):`.
3. The gate above passes locally, and CI passes.
4. If you work with Claude Code, run `/review-change` and address
   its findings before opening the PR.

## Reporting Issues

Use the [issue templates](.github/ISSUE_TEMPLATE/) when opening
an issue. A bug report names the browser, the app version (shown
in the changelog), the steps, and what you expected instead.
Never attach a CV with real personal data; the
[`examples/`](examples/) folder has sample files.

## Vulnerability Reports

Not in the issue tracker, please — see
[SECURITY.md](SECURITY.md).
