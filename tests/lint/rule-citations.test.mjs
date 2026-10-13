import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `.claude/rules` and `.claude/skills` files load as **instructions**,
 * not as documentation. An agent reads a citation in one and reasons from it
 * without opening the file — so a path that has moved does not read as stale, it
 * reads as fact and sends the reader somewhere that no longer exists.
 *
 * This resolves every repo path and every `npm run` script those files name. It
 * proves the citation still **exists**, not that it still guards what the
 * sentence claims: a rename is caught here, gutting a suite and keeping its name
 * is not.
 *
 * ⚠️ The wiki this replaced demonstrated the failure four times in a single day
 * (2026-09-03): `ops/AI_LOGIC.md` and `ops/DATABASE.md` stated the Vertex model
 * and disagreed with each other, with `VERTEX_CONFIG.MODEL` matching neither;
 * `ops/MONETIZATION.md` and `ops/DATABASE.md` disagreed about `package_type`;
 * and a pointer to "the foot of the manual migration" outlived the migration.
 * None of it was checked by anything.
 */

function instructionFiles() {
  const out = [];
  const rules = path.join(ROOT, '.claude/rules');
  if (fs.existsSync(rules)) {
    for (const f of fs.readdirSync(rules).filter((n) => n.endsWith('.md'))) {
      out.push(path.join('.claude/rules', f));
    }
  }
  const skills = path.join(ROOT, '.claude/skills');
  if (fs.existsSync(skills)) {
    for (const d of fs.readdirSync(skills)) {
      const p = path.join('.claude/skills', d, 'SKILL.md');
      if (fs.existsSync(path.join(ROOT, p))) out.push(p);
    }
  }
  return out;
}

const FILES = instructionFiles();
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/** Only inline-code spans. Prose naming a file is not a citation. */
const codeSpans = (text) => [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);

/** Repo-rooted paths we can resolve. Globs and bare filenames are not citations. */
const CITED_PATH = /^(scripts|src|tests|netlify|supabase|\.claude|\.agent|\.github)\/[\w./-]+$/;
const CITED_ABSENT_HAS = (p) => CITED_AS_ABSENT.has(p);

/**
 * ⚠️ A gitignored path is absent from a clone and present on the machine that
 * created it, so resolving it with `existsSync` alone made this test pass
 * locally and fail in CI — which is not a guard, it is a report on the
 * developer's untracked files. `.agent/temp_instructions/` did exactly that.
 *
 * Ignored paths are exempted rather than required-absent: `CITED_AS_ABSENT`
 * asserts the path does NOT exist, which is false on the machine that has it.
 */
const isIgnored = (p) =>
  spawnSync('git', ['check-ignore', '-q', '--', p], { cwd: ROOT }).status === 0;

/**
 * Paths cited in order to say they are **absent**. An entry is a claim that the
 * absence is deliberate and load-bearing, so it carries the reason — and the
 * test fails on a stale entry as well as an unlisted one, so an exemption
 * cannot outlive the sentence it covers.
 */
const CITED_AS_ABSENT = new Map([
  [
    'supabase/migrations/',
    'The database rule says there is none — schema.sql is a destructive rebuild, and that absence is why an edit to it is not a change to the database.',
  ],
  [
    '.agent/skills/project/',
    'Retired 2026-09-03. The theme-generator skill cites it to explain why it was rewritten: three project skills lived there, Claude Code loads only .claude/skills, so nothing read them and nothing corrected them as they went stale.',
  ],
]);

test('every cited-as-absent path is still absent', () => {
  // ⚠️ `isIgnored` applies HERE too, not only to the citation scan below.
  // `.agent/skills/` was added to `.gitignore` precisely so a re-run of a deleted
  // installer cannot commit one machine's copies back — which turned
  // `.agent/skills/project/` into a gitignored path. Asserting a gitignored
  // path is absent is the failure this file's own header documents: red on the
  // machine that has it, green in CI, over a directory no reviewer can see.
  const present = [...CITED_AS_ABSENT.keys()]
    .filter((p) => !isIgnored(p))
    .filter((p) => fs.existsSync(path.join(ROOT, p)));
  assert.deepEqual(present, [], `exempted as absent but now exists:\n  ${present.join('\n  ')}`);

  const cited = new Set(FILES.flatMap((f) => codeSpans(read(f))).map((s) => s.split(/[:\s]/)[0]));
  const unused = [...CITED_AS_ABSENT.keys()].filter((p) => !cited.has(p));
  assert.deepEqual(unused, [], `exemption no longer cited anywhere:\n  ${unused.join('\n  ')}`);
});

test('every repo path cited in a rule or skill resolves', () => {
  const missing = [];
  for (const file of FILES) {
    for (const span of codeSpans(read(file))) {
      const cited = span.split(/[:\s]/)[0];
      if (!CITED_PATH.test(cited) || cited.includes('*')) continue;
      if (CITED_ABSENT_HAS(cited)) continue;
      if (fs.existsSync(path.join(ROOT, cited))) continue;
      if (isIgnored(cited)) continue;
      missing.push(`${file} → ${cited}`);
    }
  }
  assert.deepEqual(missing, [], `cited paths that do not exist:\n  ${missing.join('\n  ')}`);
});

test('every npm script cited in a rule or skill exists', () => {
  const scripts = JSON.parse(read('package.json')).scripts;
  const missing = [];
  for (const file of FILES) {
    for (const m of read(file).matchAll(/npm run ([\w:-]+)/g)) {
      if (!(m[1] in scripts)) missing.push(`${file} → npm run ${m[1]}`);
    }
  }
  assert.deepEqual(missing, [], `cited npm scripts that do not exist:\n  ${missing.join('\n  ')}`);
});

/**
 * A rule scoped to a path that matches nothing never loads. It reads as
 * governing a tree while binding no edit at all — the same failure shape as a
 * registered locale prefix with no keys behind it.
 */
test('every rule path glob matches something in the tree', () => {
  const empty = [];
  for (const file of FILES.filter((f) => f.startsWith('.claude/rules/'))) {
    const fm = read(file).match(/^---\n([\s\S]*?)\n---/);
    assert.ok(fm, `${file} has no frontmatter, so it is scoped to nothing`);

    // ⚠️ Quote-agnostic on purpose. This read only double quotes until
    // 2026-09-03, and lint-staged's Prettier rewrites rule frontmatter to
    // single quotes on commit — so the suite went green locally and red at
    // HEAD, having been verified against files the pre-commit hook then
    // rewrote. A parser for instruction files must accept what the formatter
    // that runs after you emits.
    const globs = [...fm[1].matchAll(/^\s*-\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map((m) => m[1]);
    assert.ok(globs.length > 0, `${file} declares no paths`);

    for (const glob of globs) {
      // ⚠️ No `|| existsSync(dirname(target))` fallback. It was here to tolerate
      // a glob like `netlify/functions/*stripe*`, whose base is a directory —
      // but `dirname` of any top-level path is the repo root, which always
      // exists, so the assertion passed for every possible input. Caught by
      // mutating a rule to scope itself at `does-not-exist/**` and watching
      // nothing fail. Stripping the trailing slash handles the directory case
      // on its own.
      const base = glob.split('*')[0].replace(/\/$/, '');
      if (!fs.existsSync(path.join(ROOT, base))) empty.push(`${file} → ${glob}`);
    }
  }
  assert.deepEqual(empty, [], `rule paths matching nothing:\n  ${empty.join('\n  ')}`);
});

/** Non-vacuity: a regex that stopped matching would pass all three silently. */
test('the scan reads real instruction files', () => {
  assert.ok(FILES.length >= 4, `found only ${FILES.length} instruction files`);
  const spans = FILES.flatMap((f) => codeSpans(read(f)));
  assert.ok(spans.length > 50, `found only ${spans.length} code spans to check`);
  assert.ok(
    spans.some((s) => CITED_PATH.test(s.split(/[:\s]/)[0])),
    'no cited repo paths matched at all — the path pattern has stopped working',
  );
});
