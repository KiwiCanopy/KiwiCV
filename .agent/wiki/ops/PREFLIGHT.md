# Pre-flight Check

> **Last Updated: 2026-10-13**

## Overview

Before committing any code or submitting a PR, run these checks to ensure the codebase remains stable and consistent.

> [!TIP]
> **Build check is handled by CI** — the full `npm run build` is automatically run on every pull request via the `CI` workflow's `TypeScript & Vite Build` job. You do **not** need to run it locally before committing.

## 1. Lint Check

Validates code style and identifies potential bugs. Run this before committing.

```bash
npm run lint
```

> [!NOTE]
> The pre-commit hook (Husky + lint-staged) also runs Prettier + ESLint automatically on staged files. Manual lint is useful for a broader pre-flight scan.

## 2. Test Check

Runs unit and migration tests. Especially important when editing `validation.ts`, store logic, or shared utilities.

```bash
npm run test
```

> [!NOTE]
> `npm run test` is also run automatically on every push via the `Test` CI workflow.

## 3. Translation Integrity

If any locale keys were added or modified:

- **UI strings**: `npm run i18n:sync`
- **Changelog**: `npm run changelog:sync`
- **Integrity**: `npm run i18n:check`

> [!IMPORTANT]
> Why `i18n:check` is run **before** the change as well as after, and why a key
> is never removed by hand, are in `.claude/rules/i18n.md`, which loads when you
> edit a locale file.

## 4. Git Commit Process

Husky is configured to run `lint-staged` (`.lintstagedrc.cjs`) on pre-commit: Prettier + ESLint on staged `.js/.cjs/.mjs/.jsx/.ts/.tsx`, Prettier only on `.json/.md/.css/.html`, and — only when a staged file is under `src/locales/`— a full `npm run i18n:check` (parity/keys/plurals/placeholders across all locales, not just the staged file).

- **Warning**: If Prettier reformats files, the commit will abort.
- **Solution**: Re-stage the changed files and commit again.

### CI

There is no pre-push hook. `.github/workflows/ci.yml` is the last-mile gate, on every PR to `main`:

```bash
# Lint & Test
npm run lint
npm run ai:check-sync   # frontend/backend AI constants (src/constants/ai.ts vs netlify/functions/lib/ai/constants.js) stay in sync
npm run test            # the same full chain as section 2 — vitest + functions + i18n + lint-baseline
# TypeScript & Vite Build
npm run build           # includes tsc -b
```

Both jobs are required checks: merge only once they are green. Run section 2 locally first so the PR is not where you find out.

### Commit Messages

Angular format `type(scope): description`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Examples: `feat(tasks): add recurring task support`, `fix(sync): handle network timeout`. **Never** `fix(test):` or `fix(e2e):` — test changes use `test:`.

### Commit Size and Scope

Keep commits small, **atomic**, and focused on a single logical change.

- **Do not mix unrelated changes**: Never combine a new feature (`feat`) and a refactoring (`refactor`) in the same commit.
- **Commit by logic package**: If a feature is large, break it down into smaller, standalone pieces (e.g., database schema update, API endpoint, UI component).
- If you struggle to write a short, accurate description, your commit is likely too big.

```bash
git add .
git commit -m "feat(tasks): add recurring task support"
```

## 5. Wiki Maintenance

**Mandatory**: If logic or project structure changed, update the relevant Wiki page in the same change set. There is no daily log — a durable _why_ goes in the topic page that owns it, and everything else stays in `git log`. See [INDEX.md](../INDEX.md) rule 3.

---

## CI Summary

| Trigger                 | Workflow | Checks                       |
| ----------------------- | -------- | ---------------------------- |
| Every push (any branch) | `Test`   | Lint + Vitest tests          |
| PR targeting `main`     | `Build`  | Full TypeScript + Vite build |

---

_Derived from legacy ops/preflight.md_
