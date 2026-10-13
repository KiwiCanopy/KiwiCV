const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const LOCALES = require('../../scripts/languages.cjs');
const {
  buildUpdateLiteral,
  helpText,
  isValidHighlightKey,
} = require('../../scripts/add-changelog.cjs');
const { serializeEntry, suggestEntryId } = require('../../scripts/changelog-file.cjs');

/**
 * The invariant: **every highlight slug this tool accepts produces an
 * `export const highlight_<slug>` that JavaScript can parse.**
 *
 * `add-changelog.cjs` emits `id: 'highlight_<slug>'` and `sync-changelog.cjs`
 * writes `export const <id> = { … }`, so a hyphenated slug becomes
 * `export const highlight_ai-composer-polish` — subtraction, not a declaration.
 * The help text shipped `ai-composer-polish` as its own example. It stayed
 * invisible because staged entries were never folded into the release's version
 * file, so the broken file was written and then ignored; once the fold was added,
 * the next highlight anyone stages reaches `tsc -b`.
 *
 * The decision is **reject, never normalise**: the slug is embedded verbatim in
 * three `_highlights.<slug>.*` locale keys, so rewriting it behind the author's
 * back ships keys they never typed.
 *
 * ⚠️ Three of these run the real CLI as a subprocess *because* the unit-level
 * exports cannot see the call site — `validateHighlightKey` can be deleted from
 * `main()`'s validation loop and every pure test below stays green.
 *
 * They run it against a **copy of `scripts/` in a temp directory**, not against
 * the repo. That is not tidiness: deleting the validation call and running this
 * file against the real tree stages the entry for real, writing fifteen
 * `highlight_ai-composer-polish.ts` files into `src/locales/`. A guard whose
 * failure mode is corrupting the working tree does not get run twice. The
 * sandbox also lets the acceptance case go all the way through `changelog:sync`
 * and assert on the `export const` that actually lands on disk — the exact
 * artefact that broke.
 */

const ROOT = path.resolve(__dirname, '..', '..');
/** Wherever `export const <id>` is emitted — moved here from `sync-changelog.cjs`. */
const SERIALIZER = path.join(ROOT, 'scripts', 'changelog-file.cjs');

/** A no-op stands in for a shelled-out npm script the case under test does not need. */
const NOOP = 'node -e ""';

/**
 * Runs `add-changelog.cjs` against a throwaway copy of `scripts/`.
 *
 * `cwd` decides which `package.json` the CLI's `npm run changelog:sync` finds,
 * and `__dirname` decides which `sync-changelog.cjs` it rewrites — both point
 * into the sandbox. `node_modules` is symlinked so the scripts' `npx prettier`
 * resolves locally instead of reaching for the network.
 */
function runCli(args, { sync = NOOP, sort = NOOP, locales = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-slug-'));
  try {
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(dir, 'scripts'), { recursive: true });

    // Empty the sandbox copy's inbox rather than inheriting the repo's.
    // `add-changelog.cjs` only splices into `const CHANGELOG_UPDATES = [];`, so
    // on a branch that legitimately has an entry staged — the documented state
    // in AGENTS.md §6, and the state this file has been committed in before —
    // the splice is a no-op and these tests fail claiming "the entry was staged
    // anyway" and "no file was written", which is the opposite of what happened.
    // `npm test` runs in CI, so that reds an unrelated PR with three
    // misleading messages. The fixture has to be known-good, not inherited.
    const sandboxSync = path.join(dir, 'scripts', 'sync-changelog.cjs');
    fs.writeFileSync(
      sandboxSync,
      fs
        .readFileSync(sandboxSync, 'utf8')
        .replace(/const CHANGELOG_UPDATES = \[[\s\S]*?\n\];/, 'const CHANGELOG_UPDATES = [];'),
    );
    fs.copyFileSync(path.join(ROOT, '.prettierrc'), path.join(dir, '.prettierrc'));
    // The `node_modules` that holds prettier, found by module resolution — a
    // nested worktree has none at ROOT (`ops/TESTING.md` § Paths in tests).
    const modules = path.dirname(path.dirname(require.resolve('prettier/package.json')));
    fs.symlinkSync(modules, path.join(dir, 'node_modules'), 'dir');
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'add-changelog-sandbox',
        private: true,
        scripts: { 'changelog:sync': sync, 'i18n:sort': sort },
      }),
    );
    for (const locale of locales) {
      fs.mkdirSync(path.join(dir, 'src', 'locales', locale, 'changelog'), { recursive: true });
    }

    const result = spawnSync(
      process.execPath,
      [path.join(dir, 'scripts', 'add-changelog.cjs'), ...args],
      { cwd: dir, encoding: 'utf8' },
    );

    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      staged: fs.readFileSync(path.join(dir, 'scripts', 'sync-changelog.cjs'), 'utf8'),
      // Read out before the sandbox is removed: every file the run produced
      // under src/locales, keyed by path relative to that directory.
      written: readTree(path.join(dir, 'src', 'locales')),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function readTree(root, base = root, out = new Map()) {
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) readTree(full, base, out);
    else out.set(path.relative(base, full), fs.readFileSync(full, 'utf8'));
  }
  return out;
}

/** Does `export const <name> = {}` actually parse? Not a restatement of the regex. */
function compilesAsDeclaration(name) {
  try {
    new vm.Script(`const ${name} = {};`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Highlight invocations in a block of docs, scoped by the CLI's *arity* — a slug
 * followed by three quoted arguments — rather than by a filename, a directory or
 * the words around it. Prose that happens to contain "highlight foo" does not
 * match; a new doc page that shows the command does, the day it is written.
 * `<slug_key>` placeholders are dropped: they are syntax, not examples.
 */
function highlightExamples(text) {
  return [...text.matchAll(/highlight\s+([^\s"']+)\s+"[^"]*"\s+"[^"]*"\s+"/g)]
    .map((m) => m[1])
    .filter((slug) => !slug.startsWith('<'));
}

test('the CLI rejects a hyphenated slug, naming the slug and the valid form', () => {
  const result = runCli(['highlight', 'ai-composer-polish', 'AI 🤖', 'T', 'x']);

  assert.equal(result.status, 1, `expected a rejection, got:\n${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /ai-composer-polish/, 'the message must name the offending slug');
  assert.match(result.stderr, /ai_composer_polish/, 'the message must state the valid form');

  // Rejected at input means rejected before anything is written. Staging first
  // and failing later would leave the entry in the inbox, where the next sync
  // by anyone picks it up.
  assert.match(result.staged, /const CHANGELOG_UPDATES = \[\];/, 'the entry was staged anyway');
  assert.equal(result.written.size, 0, 'the rejected run still wrote locale files');
});

test('the CLI rejects a hyphenated slug given through --key too', () => {
  // The flag path normalises `_highlights.` off the front and then reaches the
  // same emission. A rule enforced on only one of the two argument shapes is
  // half a rule.
  const result = runCli([
    '--highlight',
    '--key',
    '_highlights.ai-composer-polish',
    '--badge',
    'AI 🤖',
    '--title',
    'T',
    '--text',
    'x',
  ]);

  assert.equal(result.status, 1, `expected a rejection, got:\n${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /Invalid highlight slug "ai-composer-polish"/);
});

test('an underscore slug stages, and the file it produces declares a real identifier', () => {
  // The whole chain in one run: CLI → CHANGELOG_UPDATES → changelog:sync →
  // `export const …` on disk. This is the broken artefact itself, so this is
  // the test that would have caught it.
  const result = runCli(['highlight', 'ai_composer_polish', 'AI 🤖', 'T', 'x'], {
    sync: 'node scripts/sync-changelog.cjs',
    locales: LOCALES,
  });

  assert.equal(result.status, 0, `expected success, got:\n${result.stdout}${result.stderr}`);
  // The inbox is emptied by `clearAppliedUpdates` once the sync succeeds, so an
  // empty array here is the evidence the entry made it all the way through.
  assert.match(result.staged, /const CHANGELOG_UPDATES = \[\];/);

  for (const locale of LOCALES) {
    const key = path.join(locale, 'changelog', 'highlight_ai_composer_polish.ts');
    const content = result.written.get(key);
    assert.ok(content, `${locale}: no file was written (saw ${[...result.written.keys()]})`);

    // Compile it, rather than matching a regex that restates the rule.
    assert.doesNotThrow(
      () => new vm.Script(content.replace(/^export /gm, '')),
      `${locale}: the generated file is not parseable JavaScript:\n${content}`,
    );
    // The inner locale key keeps the slug verbatim — which is why the rule
    // rejects rather than rewrites.
    assert.match(content, /ai_composer_polish/);
  }
});

test('every accepted slug yields an export name JavaScript can parse', () => {
  // The property, over the emitted id rather than a re-derived string: whatever
  // `buildUpdateLiteral` writes as `id:` is what `sync-changelog.cjs` turns into
  // an `export const`. `vm` compiles it; nothing here restates the regex.
  const candidates = [
    'ai_composer_polish',
    'a',
    '_leading_underscore',
    'mixedCase99',
    'class', // a reserved word is safe: the emitted name is always prefixed
    'ai-composer-polish',
    'ai.composer',
    'ai composer',
    'ai/composer',
    "ai'composer",
    'ai+composer',
    'aï-composer',
    '$dollar', // legal JS, rejected anyway — `sort-locales.cjs` cannot read it
    '',
  ];

  const accepted = candidates.filter((slug) => isValidHighlightKey(slug));
  // A floor with headroom, not a pin on today's count: it only guards against
  // the accepted set collapsing to nothing, which would make the loop vacuous.
  assert.ok(accepted.length >= 3, 'the accepted set collapsed — this test would prove nothing');

  for (const slug of accepted) {
    const literal = buildUpdateLiteral({
      type: 'highlight',
      key: slug,
      badge: 'B',
      title: 'T',
      text: 'x',
    });
    const id = literal.match(/id: '([^']*)'/)?.[1];
    assert.equal(id, `highlight_${slug}`, 'the emitted id is no longer highlight_<slug>');
    assert.ok(compilesAsDeclaration(id), `export const ${id} does not parse`);

    // The inner locale keys stay quoted, which is why only the export name is at risk.
    assert.match(literal, new RegExp(`'_highlights\\.${slug.replace(/\$/g, '\\$')}\\.badge'`));
  }
});

test('every slug carrying a character JavaScript cannot spell is rejected', () => {
  // The other direction. Leading digits are rejected too even though
  // `highlight_1x` would parse — deliberately stricter, so the slug reads as an
  // identifier on its own.
  for (const slug of ['ai-composer-polish', 'ai.composer', 'ai composer', 'ai/composer']) {
    assert.ok(!isValidHighlightKey(slug), `"${slug}" must be rejected`);
    assert.ok(
      !compilesAsDeclaration(`highlight_${slug}`),
      `"${slug}" is rejected but would have compiled — check the reason`,
    );
  }

  // Rejected for a different reason, so listed apart: `highlight_` and
  // `highlight_1x` both parse, but neither slug names anything.
  assert.ok(!isValidHighlightKey(''));
  assert.ok(!isValidHighlightKey('9lives'));
});

test('the suggested replacement is itself accepted, for every rejected slug', () => {
  // A fix-it message that names an unusable form is worse than none. Driven
  // from the rejected candidates rather than a second hand-written list — the
  // hand-written one omitted the empty string, and `--key _highlights` strips
  // to exactly that, so the tool used to answer `Invalid slug "". Use "" instead.`
  const rejected = [
    'ai-composer-polish',
    'ai.composer',
    'ai composer',
    'ai/composer',
    "ai'composer",
    'ai+composer',
    'aï-composer',
    '$dollar',
    '9lives',
    'a b-c.d',
    '_______'.replace(/_/g, '-'), // reduces to underscores only, still valid
    '',
    '...',
  ];

  for (const slug of rejected) {
    assert.ok(!isValidHighlightKey(slug), `"${slug}" was supposed to be rejected`);
    const suggestion = suggestEntryId(slug);
    assert.ok(
      isValidHighlightKey(suggestion),
      `suggested "${suggestion}" for "${slug}" is itself invalid`,
    );
  }

  assert.equal(suggestEntryId('ai-composer-polish'), 'ai_composer_polish');
});

test('every highlight example in --help is a slug the tool accepts', () => {
  // The help text is the instruction most authors copy, and it is what shipped
  // the bug: it demonstrated `ai-composer-polish` twice.
  const examples = highlightExamples(helpText());
  assert.ok(examples.length >= 2, `expected the help to still show examples, found ${examples}`);

  for (const slug of examples) {
    assert.ok(isValidHighlightKey(slug), `--help demonstrates a slug the CLI rejects: "${slug}"`);
  }
});

test('every documented highlight example in the repo is a slug the tool accepts', () => {
  // Scoped by the CLI's arity — slug plus three quoted arguments — not by a
  // directory or a filename convention, so a new doc page is covered the day it
  // is written.
  //
  // Enumerated with `git ls-files` rather than by walking the tree: a walk also
  // reads gitignored directories, and AGENTS.md §3 names `.agent/temp_instructions/`,
  // which holds one machine's in-flight checklists and handoff packets. An example
  // rotting in there turned this red on that machine and green in CI, over a file
  // no reviewer could even see. Tracked files are the only ones the rule can govern.
  const files = spawnSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .stdout.split('\0')
    .filter(Boolean)
    .map((rel) => path.join(ROOT, rel))
    .filter((full) => {
      const stat = fs.statSync(full, { throwIfNoEntry: false });
      return stat?.isFile() && stat.size < 512 * 1024;
    });

  const found = [];
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (file === __filename) continue; // this file quotes the bad slug on purpose
    for (const slug of highlightExamples(content)) {
      found.push({ file: path.relative(ROOT, file), slug });
    }
  }

  // A floor, not a pinned list: without it, deleting every example would make
  // this test pass by finding nothing.
  assert.ok(
    found.length >= 3,
    `the scan found ${found.length} highlight examples; it used to find at least 3, so either ` +
      'the examples moved or the pattern stopped matching them',
  );

  const bad = found.filter((hit) => !isValidHighlightKey(hit.slug));
  assert.deepEqual(
    bad,
    [],
    `documented examples use slugs the CLI rejects: ${bad.map((h) => `${h.file} → ${h.slug}`).join(', ')}`,
  );
});

test('the serializer still needs the id to be an identifier', () => {
  // The binding the pure tests cannot make: the rule exists because the
  // serializer turns the id into a declaration. Asserted through behaviour
  // rather than by grepping a file for `export const ${id}` — the text version
  // of this once fired on a pure move, with a message describing a semantic
  // change that had not happened, and "delete it, the CLI still validates"
  // reads as reasonable as "repoint it" under refactor momentum.
  //
  // This fires only when the emission genuinely stops caring about the id, and
  // survives the code moving to any file.
  assert.throws(
    () => serializeEntry('highlight_ai-composer-polish', { feat_x: 'v' }, 'en'),
    /must match/,
    'the serializer accepted an id that cannot be a binding — re-check why highlight slugs ' +
      'must be identifiers before relaxing the rule',
  );

  const ok = serializeEntry('highlight_ai_composer_polish', { feat_x: 'v' }, 'en');
  assert.doesNotThrow(() => new vm.Script(ok.replace(/^export /gm, '')));
});

test('the accepted alphabet is one the sibling scripts can also parse', () => {
  // `$` is a legal identifier character, but `sort-locales.cjs` matches
  // `export const (\w+)` and `\w` excludes it — so a `$` in a slug makes that
  // script skip the file with no output at all, and `add-changelog.cjs` runs
  // `i18n:sort` on exactly these files. The alphabet is what the whole
  // toolchain can read, not what `eval` accepts.
  assert.ok(!isValidHighlightKey('dollar$sign'));

  const sortLocales = fs.readFileSync(path.join(ROOT, 'scripts', 'sort-locales.cjs'), 'utf8');
  assert.match(
    sortLocales,
    /export const \(\\w\+\)/,
    'sort-locales.cjs no longer matches `export const (\\w+)` — recheck whether the entry-id ' +
      'alphabet still has to exclude "$"',
  );
});
