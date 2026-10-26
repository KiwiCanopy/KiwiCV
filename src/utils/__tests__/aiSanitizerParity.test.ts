import { type ResumeData } from '@/types/resume';
import { sanitizeForAI } from '@/utils/ai';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * A fourth cross-boundary inventory, and the only one whose silent failure
 * sends MORE data rather than less.
 *
 * A CV is stripped of the same twelve keys twice on its way to Vertex: once in the
 * browser before the request leaves (`sanitizeForAI`), and again on the server
 * before the model sees it (`sanitizeResumeData`). Two passes is deliberate —
 * the server cannot trust that a request came from the app — but nothing kept
 * the two lists equal. `npm run ai:check-sync` does not: it compares
 * six named scalars, and nothing about which keys are stripped.
 *
 * ⚠️ **The two directions are not symmetric.** A key added to the server only is
 * harmless: the client ships a field the server then drops. A key added to the
 * *client* only means the server keeps forwarding that field for any request
 * that did not come from the app — which is the whole reason the server pass
 * exists. So the drift that fails quietly is the drift that leaks, and
 * `docs/ai-data-flow.md` documents the list as a promise to the user.
 *
 * ⚠️ The lists are compared as **text**, because `keysToStrip` is a local inside
 * each function rather than an export — so reading it is what lets this assertion
 * survive either file being edited by someone who never opens the other. The
 * BEHAVIOUR is compared separately, at the foot of this file, and there the
 * backend is reached by spawning node: it is ESM shipped to Netlify and outside
 * the app's tsconfig, so importing it would make that a test of the bundler,
 * which is why `coverLetterImprove.test.ts` spawns too.
 */

const SOURCES = {
  frontend: {
    path: fileURLToPath(new URL('../ai.ts', import.meta.url)),
    label: 'src/utils/ai.ts (sanitizeForAI)',
  },
  backend: {
    path: fileURLToPath(new URL('../../../netlify/functions/lib/ai/utils.js', import.meta.url)),
    label: 'netlify/functions/lib/ai/utils.js (sanitizeResumeData)',
  },
} as const;

/**
 * Both files declare `const keysToStrip = [ 'a', 'b', … ];` in the same shape,
 * so one parser serves both. It throws rather than returning `[]` when the
 * declaration moves or is renamed: an empty result would make the equality
 * below trivially true, which is the failure mode this whole file exists to
 * prevent.
 */
function strippedKeys(source: keyof typeof SOURCES): string[] {
  const { path, label } = SOURCES[source];
  const text = readFileSync(path, 'utf8');

  const start = text.indexOf('const keysToStrip = [');
  if (start === -1) {
    throw new Error(
      `No \`const keysToStrip = [\` in ${label}. If it was renamed or moved, update this parser — do not delete the assertion.`,
    );
  }

  const end = text.indexOf('];', start);
  if (end === -1) throw new Error(`Unterminated keysToStrip array in ${label}`);

  return [...text.slice(start, end).matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

describe('the keys stripped from a CV before it reaches the AI', () => {
  /**
   * Non-vacuity first, on both halves. A regex that silently matched nothing
   * would make the parity assertion true against two empty sets — a guard that
   * passes hardest exactly when the thing it guards has vanished.
   */
  it.each(['frontend', 'backend'] as const)('parses a real list out of the %s', (source) => {
    const keys = strippedKeys(source);
    expect(keys.length).toBeGreaterThan(5);
    expect(keys).toContain('email');
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('strips the same keys on both sides of the process boundary', () => {
    expect(new Set(strippedKeys('frontend'))).toEqual(new Set(strippedKeys('backend')));
  });

  /**
   * Order is not asserted — the lists are used as membership tests in a `for`
   * loop, so a reordering changes nothing about what is sent. Pinning it would
   * fail a diff that cannot leak, which trains people to edit the test.
   */
  it('names the contact fields the docs promise are removed', () => {
    const keys = strippedKeys('frontend');
    for (const key of ['image', 'email', 'phone', 'url', 'profiles', 'references']) {
      expect(keys).toContain(key);
    }
  });
});

/**
 * ⚠️ **Reading the two lists cannot see the guard beside them.** The
 * loop that consumes `keysToStrip` carries a shape test — `location` is stripped
 * when it is the postal-address OBJECT and kept when it is an entry's city STRING
 * — and that line sits outside the array the parser above reads. Two identical
 * lists can now behave differently, and the direction that fails quietly is still
 * the one that leaks. So the sanitizers are also compared by RUNNING them.
 *
 * ⚠️ **The fixture carries every key the list names, and a test below fails if it
 * stops doing so.** A fixture covering only the keys the shape test was written for would
 * leave a one-sided guard for any of the other eleven passing both halves — the
 * same defect class, one key over.
 *
 * ⚠️ The backend is reached by spawning node rather than importing it: that
 * library is ESM shipped to Netlify and outside the app's tsconfig.
 * `coverLetterImprove.test.ts` spawns for the same reason.
 */

/**
 * ⚠️ **Typed, because the shape guard's whole premise is this type.** If
 * `basics.location` were ever flattened to a string — a plausible JSON-Resume
 * simplification — the postal address would silently start leaking again with
 * every assertion here green. The annotation is what makes `tsc -b` the guard on
 * the premise.
 */
const POSTAL_ADDRESS: ResumeData['basics']['location'] = {
  address: 'Sample Street 123',
  postalCode: '10115',
  city: 'Berlin',
  countryCode: 'DE',
  region: 'Berlin',
};

/** A value that exists only in fields the CV never shows. */
const UNDISPLAYED_SENTINEL = 'undisplayed-field-sentinel';

/** A value that exists only inside the pass-through block. */
const PASSTHROUGH_SENTINEL = 'passthrough-sentinel-95000-EUR';

/** The other `location`: an entry's city, and a string. Typed for the same reason. */
const ENTRY_CITY: NonNullable<ResumeData['work'][number]['location']> = 'Berlin';

const CV_WITH_BOTH_LOCATIONS = {
  basics: {
    name: 'Alex Rivera',
    label: 'Payments Engineer',
    summary: 'Builds payment systems.',
    image: 'data:image/png;base64,iVBORw0KGgo=',
    imageVisible: true,
    _imageVId: 'image',
    email: 'alex@example.com',
    phone: '+49 30 1234',
    url: 'https://example.com',
    location: POSTAL_ADDRESS,
    profiles: [{ network: 'GitHub', url: 'https://github.com/example' }],
  },
  work: [
    {
      _vId: 'w1',
      name: 'Northwind',
      position: 'Engineer',
      location: ENTRY_CITY,
      summary: 'Ran reconciliation.',
      visible: true,
      _isNew: false,
    },
  ],
  education: [
    { _vId: 'e1', institution: 'TU Berlin', area: 'Computer Science', location: 'Munich' },
  ],
  references: [{ _vId: 'r1', name: 'Dana Fischer', reference: 'Ran our reconciliation work.' }],
  // Shown on the CV: skill keywords. Not shown, so never sent: a project's
  // roles and keywords.
  skills: [{ _vId: 's1', name: 'Payments', keywords: ['SEPA'] }],
  projects: [
    {
      _vId: 'p1',
      name: 'Ledger',
      description: 'Double-entry ledger.',
      roles: [UNDISPLAYED_SENTINEL],
      keywords: [UNDISPLAYED_SENTINEL],
    },
  ],
  coverLetter: {
    subject: 'Application',
    paragraphs: ['Dear Hiring Team,'],
    recipient: { name: 'Dana Fischer', company: 'Northwind', address: '1 Docks Road' },
    draftedFor: 'a'.repeat(64),
    outdated: true,
  },
  // Blocks another tool exported and KiwiCV does not model: never sent.
  passthrough: { kiwitalents: { salaryExpectation: PASSTHROUGH_SENTINEL } },
};

/** Every field of the postal block, as `ResumeData['basics']['location']` spells them. */
const ADDRESS_KEYS = Object.keys(POSTAL_ADDRESS);

const everyKeyIn = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(everyKeyIn);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [
    key,
    ...everyKeyIn(child),
  ]);
};

const backendSanitized = (): unknown => {
  const backendUrl = new URL('../../../netlify/functions/lib/ai/utils.js', import.meta.url).href;
  // ⚠️ The fixture travels in the environment rather than interpolated into the
  // source. `JSON.stringify` escapes quotes but NOT a backtick or a ${, so a
  // future fixture value carrying either would break the child as a syntax error
  // instead of failing an assertion.
  const script = `
    import { sanitizeResumeData } from '${backendUrl}';
    process.stdout.write(JSON.stringify(sanitizeResumeData(JSON.parse(process.env.CV_FIXTURE))));
  `;

  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: { ...process.env, CV_FIXTURE: JSON.stringify(CV_WITH_BOTH_LOCATIONS) },
  });

  if (run.status !== 0) {
    throw new Error(`the backend sanitizer could not be run:\n${run.stderr || run.stdout}`);
  }

  return JSON.parse(run.stdout);
};

describe('what the two sanitizers do to a CV, not just what they list', () => {
  const frontend = sanitizeForAI(structuredClone(CV_WITH_BOTH_LOCATIONS)) as {
    basics: Record<string, unknown>;
    work: Array<Record<string, unknown>>;
    education: Array<Record<string, unknown>>;
  };
  const backend = backendSanitized() as typeof frontend;

  /**
   * ⚠️ The assertion that keeps the two below honest as the list grows. Add a key
   * to `keysToStrip` without adding it to the fixture and this reds, rather than
   * the comparison quietly covering eleven keys out of twelve.
   */
  it('starts from a CV carrying every key the strip list names', () => {
    const present = new Set(everyKeyIn(CV_WITH_BOTH_LOCATIONS));
    expect(strippedKeys('frontend').filter((key) => !present.has(key))).toEqual([]);
  });

  /**
   * Non-vacuity on the values, not just the keys. Every assertion below is
   * satisfied by a CV that never held an address or a city — which is exactly
   * what a well-meaning edit to this fixture would produce.
   */
  it('starts from a CV that holds a postal address and two entry cities', () => {
    expect(CV_WITH_BOTH_LOCATIONS.basics.location.postalCode).toBe('10115');
    expect(CV_WITH_BOTH_LOCATIONS.work[0].location).toBe('Berlin');
    expect(CV_WITH_BOTH_LOCATIONS.education[0].location).toBe('Munich');
  });

  it('reaches the same result on both sides of the process boundary', () => {
    expect(frontend).toEqual(backend);
  });

  /**
   * ⚠️ `location` and `keywords` are the listed keys expected to SURVIVE: an
   * entry's city, and a skill's keywords (a project's are stripped). Spelling the survivors out is what makes this fail in both
   * directions: a strip that stopped working leaves more, and the naive fix the
   * issue prescribed leaves none.
   */
  it.each(['frontend', 'backend'] as const)(
    'strips every listed key but the city and skill keywords (%s)',
    (side) => {
      const sanitized = side === 'frontend' ? frontend : backend;
      const listed = new Set(strippedKeys('frontend'));
      const survivors = [...new Set(everyKeyIn(sanitized).filter((key) => listed.has(key)))];

      expect(survivors.sort()).toEqual(['keywords', 'location']);
    },
  );

  it.each(['frontend', 'backend'] as const)('sends no field the CV never shows (%s)', (side) => {
    const sanitized = side === 'frontend' ? frontend : backend;
    expect(JSON.stringify(CV_WITH_BOTH_LOCATIONS)).toContain(UNDISPLAYED_SENTINEL);
    expect(JSON.stringify(sanitized)).not.toContain(UNDISPLAYED_SENTINEL);
    expect(
      (sanitized as unknown as { skills: Array<{ keywords: string[] }> }).skills[0].keywords,
    ).toEqual(['SEPA']);
  });

  it.each(['frontend', 'backend'] as const)('sends no pass-through data (%s)', (side) => {
    const sanitized = side === 'frontend' ? frontend : backend;
    expect(JSON.stringify(CV_WITH_BOTH_LOCATIONS)).toContain(PASSTHROUGH_SENTINEL);
    expect(JSON.stringify(sanitized)).not.toContain(PASSTHROUGH_SENTINEL);
  });

  it.each(['frontend', 'backend'] as const)('sends no postal address (%s)', (side) => {
    const sanitized = side === 'frontend' ? frontend : backend;
    expect(sanitized.basics).not.toHaveProperty('location');
    // The whole payload, not just the basics block: the strip is recursive and an
    // address nested anywhere else would be the same leak.
    expect(everyKeyIn(sanitized).filter((key) => ADDRESS_KEYS.includes(key))).toEqual([]);
  });

  /**
   * ⚠️ The half a name-based strip gets wrong, and gets wrong silently.
   * `TRANSLATION_COMPOSITION` gives `entryLocation` to every section that has a
   * city, and `generator.js` marks composed fields required — so a stripped city
   * is not an omission, it is a mandatory field the model must fill without having
   * seen the input, written back over the real one.
   */
  it.each(['frontend', 'backend'] as const)('still sends the entry cities (%s)', (side) => {
    const sanitized = side === 'frontend' ? frontend : backend;
    expect(sanitized.work[0].location).toBe('Berlin');
    expect(sanitized.education[0].location).toBe('Munich');
  });

  /** What survives has to be the CV, not an empty object that passes every strip. */
  it.each(['frontend', 'backend'] as const)('leaves the content alone (%s)', (side) => {
    const sanitized = side === 'frontend' ? frontend : backend;
    expect(sanitized.basics.summary).toBe('Builds payment systems.');
    expect(sanitized.work[0].position).toBe('Engineer');
  });
});
