---
paths:
  - 'src/types/resume.ts'
  - 'src/store/resume/**'
  - 'src/utils/validation.ts'
---

# Resume data model

`ops/DATAMODEL.md` is the reference — the seven-step workflow, the versioning
policy, the current migration ladder. This is what binds, and it binds harder
than most: **the migration steps are the only thing between a returning user and
a corrupt editor.**

## Changing the shape obliges a version bump and a migration step

Increment `version` in `src/store/resume/useResumeStore.ts` and add a step to
`src/store/resume/migrations.ts`. A shape change without both is a silent data
loss for everyone who already has a store.

Steps are written `if (version <= N)` — **never `=== N`** — so a store several
versions behind runs every step in order. `=== N` works perfectly for the user
who is one version behind and skips the migration entirely for the one who is
three behind, which is the harder case to notice and the worse one to ship.

⚠️ **A gap in the ladder is not a missing step.** There is deliberately no
`version <= 3` block; v3 → v4 needed no data change. Do not "restore" it.

Add the case to `src/store/resume/__tests__/migrations.test.ts`. The steps were
extracted out of the store config specifically so they can be tested without a
store — use that.

**Verify an old store actually migrates**, not just that a fresh one loads. A
new store never runs a migration step, so a broken ladder looks perfect on your
machine.

## There is no Zod

`sanitizeResumeData` in `src/utils/validation.ts` is a hand-rolled,
defaults-driven picker: it coerces each field to the type its **default** has.

**A field with no default is silently dropped on import.** That is the
mechanism, not a bug — so add the default first, then the field. Nothing warns
you, and the field will look fine everywhere except on the import path.

The per-section shapes live in the local `schemas` object; `ResumeMeta` is
`schemas.meta`.

## No optional top-level properties on `ResumeData`

`ArraySectionKeys` in `src/components/editor/ArrayForm/types.ts` is a
homomorphic mapped type over `keyof ResumeData`, so one `?` propagates
`| undefined` into files that never referenced the field.

`coverLetter` is required-but-backfilled for exactly this reason — the note
above its declaration says so. Follow that pattern rather than reaching for `?`.

**Prefer a factory over a shared const** for any nested default object
(`createDefaultCoverLetter()`), so two resumes never alias the same objects
under immer.

## The snapshot is the release's job

`npm run model:snapshot` writes `examples/resume_{version}.json`, and
`scripts/release.cjs` runs it as part of `npm run release` — after the new
`package.json` version is written. Run it by hand only when you deliberately
want the snapshot ahead of a release.

Keep the old `examples/*.json`. They are the only evidence that a CV exported by
an older version still opens, and `src/utils/__tests__/validation.test.ts` runs
against all of them.

## A shape change reaches the themes

If the prop structure changed, audit every theme — each is an HTML component
_and_ a Typst serializer. `.claude/rules/themes.md` covers that side.
