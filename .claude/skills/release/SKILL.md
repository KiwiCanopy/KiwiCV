---
description: Cut a KiwiCV release — bump, changelog fold, PR, tag and the manual deploy trigger. Use for any `npm run release`, and whenever asked to ship, release, or publish a version.
argument-hint: 'patch | minor | major, plus --legal if the Terms or Privacy Policy changed'
---

Cut a release the way `ops/RELEASE_PROCESS.md` and `ops/DEPLOYMENT.md` describe.
**Read `ops/RELEASE_PROCESS.md` before starting** — this skill is the operator,
that page is the reference, and it carries the detail this file deliberately
does not repeat.

## The six traps

Every one of these has cost a release, and **not one of them fails loudly**.
That is the whole reason this is a skill and not a page someone might open.

1. **`npm run release patch --legal` silently drops the flag.** npm swallows
   unknown options, `process.argv` never sees `--legal`, and
   `LAST_LEGAL_UPDATE` does not move — so nobody is re-prompted, and the release
   looks completely normal. **Always `npm run release -- patch --legal`**, with
   the `--`.

2. **The script is not idempotent, and an aborted run leaves a loaded gun.** It
   bumps from whatever `package.json` currently says. An interrupted run leaves
   the bump on disk uncommitted; retrying bumps _again_ and you ship a version
   whose changelog holds only the dependency line. **Before any retry:
   `git checkout main && git status`** and confirm the tree is clean. Note that
   `RELEASE_PROCESS.md`'s Safety Rule says "fix the issues before retrying"
   without mentioning this.

3. **Translate the changelog BEFORE running.** The script halts on any
   non-English entry still equal to English — but it halts at step 5.6, _after_
   step 5.4 has emptied the `CHANGELOG_UPDATES` inbox and step 5.5 has folded
   the staged entries into the version file. So an
   untranslated run leaves a half-applied release to unpick. Check first:
   compare each staged `src/locales/*/changelog/<entry>.ts` against `en`
   (`_highlights` blocks included), and confirm no `CHANGELOG_UPDATES` entry in
   `scripts/sync-changelog.cjs` still uses `stageEnglish`. If it halts anyway,
   recover with `git checkout -- . && git clean -fd` — only on a tree that was
   clean before the run.

4. **Tag only after the merge, never on the release branch.** `main` takes
   squash merges, so the script's commit never reaches `main` as itself. A tag
   made now points at an object outside `main`'s history — it pushes, it
   resolves, and it is wrong. The damage lands _later_: the next release runs
   `git diff v<previous> -- package.json` to decide whether to write a
   dependency changelog line, and against an off-mainline tag that diff is
   meaningless.

5. **Merging deploys nothing.** `netlify.toml`'s `ignore` cancels any build
   whose commit has no exact-match tag. The automatic build fires on the merge,
   when the tag does not exist yet, and cancels itself. **And pushing the tag
   does not build either** — Netlify triggers on branch pushes, never on tag
   refs. A deploy has to be triggered by hand, _after_ the tag is in place:
   `npx netlify deploy --build --prod`, or the UI button. Trigger before
   tagging and it just cancels again.

6. **The cancelled build reports as `error`.** "Canceled build due to no content
   change" is the gate working, and every untagged `main` push leaves one in the
   deploy list. Judge production by the newest deploy that is `ready` with
   `published: yes` — never by the absence of red, and never by the presence of
   it.

## The sequence

Run the gate first (`/verify-gate`). Then:

1. **Translate any staged changelog entries** — English is authored with
   `npm run changelog:add`; the other fourteen go through one translation pass at
   release time, German included.
2. `npm run release -- <patch|minor|major> [--legal]` — **once**. Minor
   dependency updates run by default; `--no-update-deps` opts out.
3. `git push -u origin release/vX.Y.Z` and open the PR.
4. Merge once CI is green.
5. `git checkout main && git pull && git tag vX.Y.Z && git push origin vX.Y.Z`
6. **Trigger the deploy by hand.** Nothing is live until this runs.
7. Verify: production actually serves the change, and the newest deploy is
   `ready` / `published: yes`.

## When `--legal` is warranted, and when it is a trap

`--legal` bumps `LAST_LEGAL_UPDATE`, which fires a **blocking** re-consent modal
for every signed-in user. It renders `legal.update.intro` and
`legal.update.changes_desc`.

⚠️ **Those two strings must describe _this_ change before you pass the flag.**
They are the only explanation any user gets. Shipping `--legal` while they still
describe a previous update re-prompts everyone, in fifteen languages, about
something that did not happen.

Do not pass it for a change that only _narrows_ what is collected or removes
clauses about a retired product — re-consent exists for expanded or worsened
processing, not for good news.

## Do not automate further

The manual tag and the manual deploy trigger are deliberate. They are the last
two points where a human decides that this actually goes in front of users.
