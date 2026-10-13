import { named, sourceFiles } from '@/test/sourceFiles';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * **`template/` is a leaf of the AI modal tree.** Two rules, over its
 * non-test files:
 *
 * 1. No import into `components/modals/ai/` outside `template/` — `edit/` and
 *    `import/` compose `template/`, never the reverse.
 * 2. No import that leads back into `template/` through any chain of app
 *    modules — the cycle `AIConfigView → AICoverLetterControl →
 *    CoverLetterStyleField` was one such chain, and a non-AI hop between them
 *    would hide it from rule 1.
 *
 * Like `statusTypesImportsNothing.test.ts`, this imports nothing from the app it
 * scans. `preProcessFile` sees `import`, `export … from`, `import()` and
 * `require`, and both the `@/` and the relative spelling are resolved.
 */

const SELF = fileURLToPath(import.meta.url);
const TEMPLATE = resolve(dirname(SELF), '..');
const SRC = resolve(TEMPLATE, '..', '..', '..', '..');
const AI_TREE = join(SRC, 'components', 'modals', 'ai');

const EXTENSION = /(\/index)?\.(ts|tsx)$/;

const walk = (dir: string): string[] =>
  sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [named('__tests__')] });

const specifiers = (file: string): string[] =>
  ts
    .preProcessFile(readFileSync(file, 'utf8'), true, true)
    .importedFiles.map((ref) => ref.fileName);

/** An absolute, extensionless path for an app module; `null` for a package. */
const resolveSpecifier = (from: string, specifier: string): string | null => {
  if (specifier.startsWith('@/')) return join(SRC, specifier.slice(2)).replace(EXTENSION, '');
  if (specifier.startsWith('.')) return resolve(dirname(from), specifier).replace(EXTENSION, '');
  return null;
};

/** The source file behind a module path; `null` for CSS, JSON and the like. */
const toFile = (module: string): string | null =>
  [`${module}.ts`, `${module}.tsx`, join(module, 'index.ts'), join(module, 'index.tsx')].find(
    (candidate) => existsSync(candidate),
  ) ?? null;

const inside = (path: string, dir: string) => !relative(dir, path).startsWith('..');
const name = (file: string) => relative(SRC, file).split(sep).join('/');

/** Rule 1: direct imports from `template/` into the rest of the AI modal tree. */
const layeringViolations = (): string[] =>
  walk(TEMPLATE).flatMap((file) =>
    specifiers(file)
      .filter((spec) => {
        const target = resolveSpecifier(file, spec);
        return target !== null && !inside(target, TEMPLATE) && inside(target, AI_TREE);
      })
      .map((spec) => `${name(file)} → ${spec}`),
  );

/**
 * Rule 2: breadth-first from everything `template/` imports outside itself;
 * each module that imports back into `template/` is reported with its chain.
 */
const cyclesBackIntoTemplate = (): { reached: number; cycles: string[] } => {
  const cameFrom = new Map<string, string>();
  const queue: string[] = [];
  for (const file of walk(TEMPLATE)) {
    for (const spec of specifiers(file)) {
      const module = resolveSpecifier(file, spec);
      const target = module && !inside(module, TEMPLATE) ? toFile(module) : null;
      if (target && !cameFrom.has(target)) {
        cameFrom.set(target, file);
        queue.push(target);
      }
    }
  }

  const chain = (file: string): string[] => {
    const hops = [name(file)];
    for (let at = cameFrom.get(file); at; at = cameFrom.get(at)) hops.unshift(name(at));
    return hops;
  };

  const cycles: string[] = [];
  for (let next = queue.shift(); next; next = queue.shift()) {
    for (const spec of specifiers(next)) {
      const module = resolveSpecifier(next, spec);
      if (!module) continue;
      if (inside(module, TEMPLATE)) {
        cycles.push([...chain(next), spec].join(' → '));
        continue;
      }
      const target = toFile(module);
      if (target && !cameFrom.has(target)) {
        cameFrom.set(target, next);
        queue.push(target);
      }
    }
  }
  return { reached: cameFrom.size, cycles };
};

describe('template/', () => {
  it('imports nothing from the AI modal tree outside itself', () => {
    expect(layeringViolations()).toEqual([]);
  });

  it('reaches nothing that imports template/ again', () => {
    expect(cyclesBackIntoTemplate().cycles).toEqual([]);
  });

  /** The scans are only worth anything if they can see an edge at all. */
  it('resolves both spellings and walks past the first hop', () => {
    const from = join(TEMPLATE, 'AICoverLetterControl.tsx');
    for (const spec of ['@/components/modals/ai/edit/types', '../edit/types']) {
      const target = resolveSpecifier(from, spec)!;
      expect(inside(target, AI_TREE) && !inside(target, TEMPLATE)).toBe(true);
    }
    // `template/` imports a handful of modules directly; the closure is wider.
    const direct = new Set(
      walk(TEMPLATE).flatMap((file) =>
        specifiers(file).filter((spec) => {
          const module = resolveSpecifier(file, spec);
          return module !== null && !inside(module, TEMPLATE);
        }),
      ),
    );
    expect(cyclesBackIntoTemplate().reached).toBeGreaterThan(direct.size);
  });
});
