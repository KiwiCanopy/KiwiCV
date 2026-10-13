const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  DYNAMIC_CALL_ALLOWLIST,
  DYNAMIC_PREFIXES,
  ROOT_DIR,
} = require('../../scripts/i18n/config.cjs');
const { checkUsage } = require('../../scripts/i18n/check-usage.cjs');
const { englishKeys } = require('../../scripts/i18n/check-locales.cjs');
const {
  dynamicPrefixCallSites,
  forEachTranslatorCall,
} = require('../../scripts/i18n/translator-calls.cjs');

// `DYNAMIC_PREFIXES` registers the template heads a `t()` call may compose keys
// under. `check-usage.cjs` reads it in one direction only — an *unregistered*
// head is an error — so a registration blesses nothing the moment its call site
// goes, and says so to nobody. Ten of twenty-five entries were in that state
// when last measured.
//
// ⚠️ **The first version of this file asked the wrong question.** It checked
// that a prefix named a live *locale namespace*, which is a correlate: six dead
// registrations passed it, and so did `'landing.'` — a blanket widening over 67
// keys that would let a future author silence an "unregistered dynamic prefix"
// error by broadening the allowance instead of justifying it. Both reviewer
// passes found that independently. The load-bearing assertion is the call-site
// one; the key one is kept beside it because a head with no keys behind it is
// also wrong, in the other direction.
//
// ⚠️ **What the call-site scan still cannot see, written down rather than
// implied.** It is textual: `walkSource` visits every `.ts`/`.tsx` under `src/`
// whether or not anything imports it, so an orphan module carrying one template
// `t()` call keeps a registration alive forever. That is not hypothetical here —
// `src/constants/landing.ts` survived months as an unimported file, and had it
// held such a call these ten deletions could not have been measured. Reachability
// is a different tool. It is also blind to a translator **alias**: a callee not
// in `TRANSLATORS` composing a dynamic key is invisible, which is exactly why
// `common.date.` scored zero (see the note in `config.cjs`).
//
// ⚠️ The key set is deliberately the checker's own `englishKeys()` rather than a
// second walk of `src/locales/en` — a private copy has to reproduce the
// `changelog/v_*.ts` → `changelog.entries.*` remapping, and getting that wrong
// scores the largest live prefix (210 keys) at zero, i.e. it reports a live
// registration as dead.

const keys = englishKeys();
const matches = (prefix) => [...keys].filter((key) => key.startsWith(prefix)).length;
const callSites = dynamicPrefixCallSites();

test('the English key set is populated, so a zero score means the prefix and not the walk', () => {
  assert.ok(keys.size > 1000, `expected the full en bundle, got ${keys.size} keys`);
});

test('the call-site scan finds heads, so an empty score means the prefix and not the walk', () => {
  // Both halves of this file compare against a computed set. If either walk
  // silently returned nothing, every assertion below would pass vacuously.
  assert.ok(callSites.size > 5, `expected several dynamic heads, got ${callSites.size}`);
  assert.ok(callSites.has('seo.'));
});

test('every registered prefix is produced by a real call site', () => {
  // ⚠️ Production sites only. `walkSource` scans all of `src/`, tests included —
  // correctly, since a test with a bad static key should still error — but that
  // makes a decoy `t(`monetization.passes.${k}`)` in any `__tests__` file
  // enough to resurrect a registration this commit deletes as dead. Measured: 0
  // of 15 heads are test-only today, so the narrowing costs nothing and closes
  // the loophole.
  const productionSites = (prefix) =>
    (callSites.get(prefix) ?? []).filter((site) => !/__tests__|\.test\.|\.spec\./.test(site));
  const unused = DYNAMIC_PREFIXES.filter((prefix) => productionSites(prefix).length === 0);

  assert.deepEqual(
    unused,
    [],
    'a registered prefix that no production t() call composes permits nothing — delete the entry',
  );
});

test('every head a call site produces is registered', () => {
  // The direction `check-usage.cjs` already enforces, asserted here too so this
  // file describes the whole relationship rather than half of it.
  const unregistered = [...callSites.keys()].filter((head) => !DYNAMIC_PREFIXES.includes(head));

  assert.deepEqual(unregistered, []);
});

test('every registered prefix matches at least one English key', () => {
  const dead = DYNAMIC_PREFIXES.filter((prefix) => matches(prefix) === 0);

  assert.deepEqual(
    dead,
    [],
    'a registered prefix whose namespace no longer exists blesses nothing — delete the entry',
  );
});

test('a prefix naming no namespace scores zero, so the key check can fail', () => {
  assert.equal(matches('zzz.no.such.namespace.'), 0);
  assert.ok(matches('seo.') > 0);
});

test('every registered prefix ends at a key boundary', () => {
  // A forward constraint on the source. Exact-equality registration means a
  // legitimate `` t(`seo_${v}.title`) `` yields the head `seo_`, which
  // `check-usage` would accept and this forbids. No such call site exists — the
  // scan above enumerates every head and all end in a dot — so revisit the rule
  // rather than working around it. (It once also protected a second consumer,
  // `audit-translations.cjs`, which read the list with `startsWith`; that script
  // is gone, leaving the source constraint as the whole reason.)
  assert.deepEqual(
    DYNAMIC_PREFIXES.filter((prefix) => !prefix.endsWith('.')),
    [],
  );
});

test('no prefix subsumes another', () => {
  // The dangerous direction. `'landing.'` alongside `'landing.proof.'` is not a
  // duplicate and not vacuous — it is a widening that blesses a whole namespace,
  // and the exact-`Set` uniqueness check below cannot see it. The call-site test
  // catches it today; this names it.
  //
  // ⚠️ Like the boundary rule above, this constrains the **source**, not just
  // the config: one legitimate call whose head subsumes another produced head
  // (`` t(`landing.${section}.${key}.title`) ``) has no passing configuration —
  // unregistered it fails `check-i18n` and "every head a call site produces is
  // registered", registered it fails here. A non-empty head cannot reach
  // `DYNAMIC_CALL_ALLOWLIST` either, since `checkUsage` returns early in the
  // prefix branch. Restructuring the call is the intended pressure; obfuscating
  // the head to empty routes it to the weaker mechanism, which has no key check
  // at all. Revisit the rule rather than working around it.
  const subsuming = DYNAMIC_PREFIXES.filter((prefix) =>
    DYNAMIC_PREFIXES.some((other) => other !== prefix && other.startsWith(prefix)),
  );

  assert.deepEqual(subsuming, []);
});

test('no prefix is registered twice', () => {
  assert.equal(new Set(DYNAMIC_PREFIXES).size, DYNAMIC_PREFIXES.length);
});

test('the registration is actually enforced: an unregistered head is an error', () => {
  // ⚠️ Everything above reads the *list*. None of it touches the mechanism the
  // list feeds, and a reviewer deleted `check-usage.cjs`'s
  // `DYNAMIC_PREFIXES.includes(prefix)` test outright with all of it green — a
  // raw `bogus.namespace.de` would then render in fifteen locales with nothing
  // in the repo objecting. `locale-parity.test.cjs` does call `checkUsage()`,
  // but it asserts the error list is *empty*, so neutering the check makes it
  // pass harder.
  //
  // The fixture is written to a temp directory rather than into `src/` or
  // `tests/`: a source file that exists to be rejected is one an author can trip
  // over, and a crashed run must not leave it behind.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwicv-i18n-prefix-'));
  const declare = 'declare function t(k: string): string;\n';

  try {
    // ⚠️ All four translators, not just `t`. The walk's `TRANSLATORS` set is not
    // pinned anywhere else: dropping `tCV`/`tCVObject` from it silences every CV
    // translator call in `src/`, static keys included, and a `t`-only fixture
    // stays green through it. `tObject` resolves a subtree, so it gets a head
    // that has children.
    fs.writeFileSync(
      path.join(dir, 'registered.ts'),
      `${declare}declare function tObject(k: string): unknown;\ndeclare function tCV(k: string): string;\ndeclare function tCVObject(k: string): unknown;\nexport const a = (p: string) => t(\`seo.\${p}\`);\nexport const b = (p: string) => tObject(\`legal.\${p}\`);\nexport const c = (p: string) => tCV(\`languages.\${p}\`);\nexport const d = (p: string) => tCVObject(\`examples.\${p}\`);\n`,
    );
    // The concatenation form `dynamicPrefix` also accepts. It has no call site
    // in `src/`, so without this the branch can be deleted with no signal.
    fs.writeFileSync(
      path.join(dir, 'concatenated.ts'),
      `${declare}export const e = (p: string) => t('roadmap.items.' + p);\n`,
    );
    assert.deepEqual(checkUsage(dir), [], 'a registered head must not be reported');

    // ⚠️ Two negatives, and the second is the one that matters. A head far from
    // every registration (`zzz.bogus.`) catches *deletion* of the registration
    // check but not its *widening*: relaxing `DYNAMIC_PREFIXES.includes(prefix)`
    // to `.some((p) => prefix.startsWith(p))` passed every case in this file,
    // after which any narrowing of a registered namespace is silently blessed.
    fs.writeFileSync(
      path.join(dir, 'unregistered.ts'),
      `${declare}export const bad = (p: string) => t(\`zzz.bogus.\${p}\`);\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'narrowed.ts'),
      `${declare}export const worse = (p: string) => t(\`seo.brand_new.\${p}\`);\n`,
    );

    const errors = checkUsage(dir);
    assert.equal(errors.length, 2, errors.join('\n'));
    assert.ok(errors.some((error) => /unregistered dynamic prefix zzz\.bogus\.$/.test(error)));
    assert.ok(errors.some((error) => /unregistered dynamic prefix seo\.brand_new\.$/.test(error)));
    assert.ok(errors.some((error) => /unregistered\.ts:2:/.test(error)));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every dynamic-call allowance still blesses a translator call that exists', () => {
  // The adjacent list, and the stronger allowance of the two: it blesses an
  // arbitrary expression at one site with no key check at all. Nothing checked
  // it was current. Zero are stale today, which is the moment to assert it.
  //
  // ⚠️ **An AST fact, not a substring.** The first version read
  // `source.includes(entry.expression)`, and the entry
  // `{ useDatePicker.ts, 'key' }` is then satisfied by any file containing the
  // letters `key` — deleting the only `t(key)` call it exists for left the test
  // green. `'level.label'`, `'labelKey'`, `'item.label'` and
  // `'warning.message'` are all satisfiable by a comment. The mention-is-not-a-call
  // rule (`.claude/rules/testing.md`), one list over: a source scan proves a
  // *mention*, and a mention is not a call.
  const calls = new Map();
  forEachTranslatorCall(path.join(ROOT_DIR, 'src'), ({ argument, sourceFile, relativeFile }) => {
    if (!calls.has(relativeFile)) calls.set(relativeFile, new Set());
    calls.get(relativeFile).add(argument.getText(sourceFile));
  });

  const stale = DYNAMIC_CALL_ALLOWLIST.filter(
    (entry) => !calls.get(entry.file)?.has(entry.expression),
  ).map((entry) => `${entry.file} :: ${entry.expression}`);

  assert.deepEqual(stale, []);
});
