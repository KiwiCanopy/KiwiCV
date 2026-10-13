/**
 * The cover-letter call's prompt, schema and projection.
 *
 * Everything here was first measured against Vertex on 2026-09-05 and then
 * pinned: the shape the endpoint accepts, the formulas per language, the length
 * phrasing that came back nearest its target, and the carve-out from
 * GLOBAL_FORMATTING_RULES rule 2 that lets the letter be new prose without
 * being new facts.
 *
 * What the formula table's tests can and cannot see: a locale missing, a pair
 * out of its slot, a copy-pasted duplicate and a wrong script all red here; a
 * unique wrong-language string in the right script does not, and the
 * all-locales snapshot in `prompt-snapshot-configs.mjs` is the net for that —
 * it turns the edit into a PROMPT_VERSION bump someone reads. Whether the
 * German letter received German restraint is not pinnable at all, and that gap
 * is accepted rather than tested.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  COVER_LETTER_CHARACTER_LANGS,
  COVER_LETTER_MAX_WORDS,
  COVER_LETTER_MIN_WORDS,
} from '../../netlify/functions/lib/ai/constants.js';
import {
  COVER_LETTER_COMPOSITION,
  SECTION_COMPOSITION,
} from '../../netlify/functions/lib/ai/definitions.js';
import { getCoverLetterSchema } from '../../netlify/functions/lib/ai/generator.js';
import {
  BASE_ROLE_PROMPTS,
  COVER_LETTER_TONES,
  GLOBAL_FORMATTING_RULES,
  PROMPT_LANGUAGES,
  buildCoverLetterUserPrompt,
  getCoverLetterPrompt,
  getSystemPrompt,
} from '../../netlify/functions/lib/ai/prompts.js';
import { projectForCoverLetter, sanitizeResumeData } from '../../netlify/functions/lib/ai/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const EXAMPLE_CV = JSON.parse(readFileSync(path.join(ROOT, 'examples/resume_4_3_5.json'), 'utf8'));

/**
 * The locales the app ships, read off `src/locales/index.ts` as text — that
 * file is inside the app's tsconfig and this suite is not, so importing it
 * would test the bundler.
 */
const APP_LOCALES = (() => {
  const source = readFileSync(path.join(ROOT, 'src/locales/index.ts'), 'utf8');
  const block = source.match(/export const locales = \{([^}]*)\}/)?.[1];
  assert.ok(block, 'src/locales/index.ts no longer declares `export const locales = {…}`');
  const codes = block.match(/\b[a-z]{2}\b/g);
  assert.ok(codes && codes.length >= 15, 'the locale inventory parsed as fewer than 15 codes');
  return [...codes].sort();
})();

/** Never in a letter request: contact facts, links, the picture, identifiers. */
const NEVER_SENT = ['email', 'phone', 'url', 'location', 'recipient', 'image', 'profiles', '_vId'];

const prompt = (overrides = {}) =>
  getCoverLetterPrompt({ targetLang: 'en', wordTarget: 300, ...overrides });

const languageRules = (targetLang) =>
  prompt({ targetLang })
    .split('\n\n')
    .find((block) => block.startsWith('### LANGUAGE RULES'));

// ---------------------------------------------------------------------------
// The schema
// ---------------------------------------------------------------------------

test('the letter schema is subject and paragraphs[] — all required, the fields Improve returns', () => {
  const schema = getCoverLetterSchema();

  assert.equal(schema.type, 'OBJECT');
  assert.deepEqual(Object.keys(schema.properties).sort(), ['paragraphs', 'subject']);
  assert.deepEqual([...schema.required].sort(), ['paragraphs', 'subject']);
  assert.equal(schema.properties.subject.type, 'STRING');
  assert.equal(schema.properties.paragraphs.type, 'ARRAY');
  assert.equal(schema.properties.paragraphs.items.type, 'STRING');

  // One apply shape for both letter paths.
  assert.deepEqual(
    Object.keys(schema.properties).sort(),
    [...SECTION_COMPOSITION.coverLetter].sort(),
  );
  // Not item-diffed, so no identifier for the model to invent; and no
  // recipient — the addressee is a third party and the block is the user's.
  assert.ok(!JSON.stringify(schema).includes('_vId'));
  assert.ok(!('recipient' in schema.properties));
});

test('the letter schema is a fresh object on every call', () => {
  const a = getCoverLetterSchema();
  a.properties.subject.type = 'MUTATED';
  assert.equal(getCoverLetterSchema().properties.subject.type, 'STRING');
});

// ---------------------------------------------------------------------------
// The composition and the projection — this composition bounds the REQUEST
// ---------------------------------------------------------------------------

test('every composed field exists on the section it names, and none is a field never sent', () => {
  for (const [section, fields] of Object.entries(COVER_LETTER_COMPOSITION)) {
    assert.ok(section in SECTION_COMPOSITION, `${section} is not a section the store knows`);
    const value = EXAMPLE_CV[section];
    const records = Array.isArray(value) ? value : [value];
    assert.ok(records.length > 0, `example CV has no ${section} to project`);
    for (const field of fields) {
      assert.ok(!NEVER_SENT.includes(field), `${section}.${field} is on the never-sent list`);
      assert.ok(
        records.some((record) => field in record),
        `${section}.${field} is named by the composition and exists on no ${section} record`,
      );
    }
  }
});

test('the projection keeps only composed keys and drops empty sections and empty items', () => {
  const sanitized = sanitizeResumeData(EXAMPLE_CV);
  const projection = projectForCoverLetter(sanitized);

  assert.deepEqual(Object.keys(projection).sort(), Object.keys(COVER_LETTER_COMPOSITION).sort());
  for (const [section, fields] of Object.entries(COVER_LETTER_COMPOSITION)) {
    const records = Array.isArray(projection[section])
      ? projection[section]
      : [projection[section]];
    for (const record of records) {
      assert.ok(Object.keys(record).length > 0, `${section} projected an empty record`);
      for (const key of Object.keys(record)) {
        assert.ok(fields.includes(key), `${section}.${key} leaked into the projection`);
      }
    }
  }

  const text = JSON.stringify(projection);
  for (const never of NEVER_SENT) {
    assert.ok(!text.includes(`"${never}"`), `"${never}" reached the letter call`);
  }

  // The epic estimated half; the example CV measures a third. Bound it at the estimate.
  assert.ok(
    text.length < JSON.stringify(sanitized).length / 2,
    'the projection is not a reduction',
  );

  const emptied = projectForCoverLetter({
    ...sanitized,
    projects: [{ url: 'https://example.com' }],
    skills: undefined,
    education: [],
  });
  assert.ok(!('projects' in emptied), 'an item with no composed field must not project to {}');
  assert.ok(!('skills' in emptied));
  assert.ok(!('education' in emptied));
});

// ---------------------------------------------------------------------------
// The prompt
// ---------------------------------------------------------------------------

test('the language table is the app inventory, and each pair sits in its slot', () => {
  assert.deepEqual(Object.keys(PROMPT_LANGUAGES).sort(), APP_LOCALES);

  for (const locale of APP_LOCALES) {
    const { label, salutation, closing } = PROMPT_LANGUAGES[locale];
    assert.match(label, /^[A-Z][a-z]+$/, `${locale} label is not an English language name`);
    assert.ok(salutation.trim().length > 0 && closing.trim().length > 0, locale);

    const rules = languageRules(locale);
    assert.ok(rules, `${locale}: no LANGUAGE RULES block`);
    assert.ok(rules.includes(`Write the entire letter in ${label}:`), `${locale} label not used`);
    assert.ok(
      rules.includes(`the first entry is exactly "${salutation}"`),
      `${locale} salutation not in its slot`,
    );
    assert.ok(
      rules.includes(`The last entry is exactly "${closing}"`),
      `${locale} closing not in its slot`,
    );
    assert.equal(rules.split('is exactly "').length - 1, 2, `${locale}: a third formula slot`);
    assert.ok(!rules.includes('undefined'), `${locale}: a table value is missing`);
  }
});

test('no two formulas are the same string, and each is written in its own script', () => {
  const strings = Object.values(PROMPT_LANGUAGES).flatMap((l) => [l.salutation, l.closing]);
  assert.equal(new Set(strings).size, strings.length, 'a copy-pasted formula');

  const SCRIPT = {
    bg: /^[\p{Script=Cyrillic}\p{P}\s]+$/u,
    ru: /^[\p{Script=Cyrillic}\p{P}\s]+$/u,
    uk: /^[\p{Script=Cyrillic}\p{P}\s]+$/u,
    ja: /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{P}\s]+$/u,
    zh: /^[\p{Script=Han}\p{P}\s]+$/u,
  };
  const latin = /^[\p{Script=Latin}\p{P}\s]+$/u;
  for (const [locale, { salutation, closing }] of Object.entries(PROMPT_LANGUAGES)) {
    const script = SCRIPT[locale] ?? latin;
    assert.match(salutation, script, `${locale} salutation is in the wrong script`);
    assert.match(closing, script, `${locale} closing is in the wrong script`);
  }
});

test('paragraphs[0] is the salutation and the last entry the closing — there is no other field', () => {
  const text = prompt();
  assert.match(text, /The FIRST entry of "paragraphs" IS the salutation/);
  assert.match(text, /The LAST entry IS the closing formula/);
  assert.match(text, /Never write the sender's name, a signature, or contact details/);
  assert.match(text, /The addressee's name belongs in the salutation only/);
  // The body's paragraph count is the LENGTH block's to plan, not a second figure here.
  assert.match(text, /as many paragraphs as the LENGTH rules plan/);
});

test('the ad chooses the manner and never the language; only the posted title is kept verbatim', () => {
  const text = prompt({ targetLang: 'en' });
  assert.match(text, /never taken from the job description/);
  assert.match(text, /an English letter answering a German ad is written in English/);
  assert.match(text, /Write the entire letter in English: the subject/);
  assert.match(
    text,
    /Keep only the posted job title and any reference number exactly as the ad spells them/,
  );
  assert.match(text, /whatever the employer's country/);
});

test('the no-invention mandate is the last block, and rule 2 of the CV rules is absent', () => {
  const text = prompt();
  const blocks = text.split('\n\n');
  assert.match(blocks.at(-1), /^FINAL MANDATE — THE PROSE IS NEW, THE FACTS ARE NOT/);
  assert.match(text, /never write a number the CV does not contain/);
  assert.match(text, /No salary, notice period or availability date/);

  // The carve-out is real: none of the rewrite rules ride along.
  assert.ok(!text.includes('Do not invent facts, dates, companies, numbers'));
  assert.ok(!text.includes('Max 400 characters'));
  assert.ok(!text.includes('PRESERVE INLINE MARKDOWN'));
  assert.ok(GLOBAL_FORMATTING_RULES.includes('Do not invent facts, dates, companies, numbers'));
});

test('a tone is a behaviour; a sample replaces it and is scoped to manner', () => {
  assert.deepEqual(Object.keys(COVER_LETTER_TONES).sort(), [
    'confident',
    'formal',
    'professional',
    'warm',
  ]);
  assert.equal(new Set(Object.values(COVER_LETTER_TONES)).size, 4, 'two tones read the same');

  for (const tone of Object.keys(COVER_LETTER_TONES)) {
    const text = prompt({ tone });
    assert.ok(text.includes(`### TONE\n${COVER_LETTER_TONES[tone]}`), tone);
    assert.ok(!text.includes('### WRITING SAMPLE'));
  }

  const sampled = prompt({ tone: 'warm', hasStyleSample: true });
  assert.ok(!sampled.includes('### TONE'));
  assert.match(sampled, /### WRITING SAMPLE/);
  assert.match(sampled, /do not quote, translate or paraphrase any sentence of it/);
  assert.match(sampled, /never take a fact, claim, employer, number or date from it/);
  assert.match(
    sampled,
    /It may be in any language; write the letter in the target language regardless/,
  );

  // The sample block sits above the mandate: style may change the voice, never the claims.
  assert.ok(sampled.indexOf('### WRITING SAMPLE') < sampled.indexOf('FINAL MANDATE'));

  assert.throws(() => prompt({ tone: 'custom' }), /UNKNOWN_LETTER_TONE/);
  assert.throws(() => prompt({ targetLang: 'da' }), /UNSUPPORTED_LETTER_LANGUAGE/);
});

test('the length is a floor and a ceiling with the body planned in paragraphs that reach the floor', () => {
  assert.match(prompt({ wordTarget: 300 }), /between 300 and 336 words/);
  assert.match(prompt({ wordTarget: 300 }), /Plan the body as 3 paragraphs of about 98 words each/);
  assert.match(prompt({ wordTarget: 100 }), /Plan the body as 1 paragraph of about 92 words/);
  assert.match(
    prompt({ wordTarget: 1000 }),
    /Plan the body as 6 paragraphs of about 166 words each/,
  );
  assert.match(prompt({ wordTarget: 300 }), /salutation and closing included/);

  // The plan handed to the model never sums to below the floor it is told is a failure.
  for (const target of [100, 150, 200, 250, 300, 420, 600, 700, 1000]) {
    const [, paragraphs, each] = prompt({ wordTarget: target }).match(
      /Plan the body as (\d+) paragraphs? of about (\d+) words/,
    );
    assert.ok(Number(paragraphs) * Number(each) + 8 >= target, `${target}: the plan sums short`);
  }

  // The client clamps too, but the server cannot trust it.
  assert.match(prompt({ wordTarget: 5000 }), new RegExp(`between ${COVER_LETTER_MAX_WORDS} and`));
  assert.match(prompt({ wordTarget: 10 }), new RegExp(`between ${COVER_LETTER_MIN_WORDS} and`));
  assert.match(prompt({ wordTarget: 299.6 }), /between 300 and/);
  assert.throws(() => prompt({ wordTarget: Number.NaN }), /INVALID_WORD_TARGET/);
  assert.throws(() => prompt({ wordTarget: undefined }), /INVALID_WORD_TARGET/);
});

test('the letter role is not in the request-indexed role table', () => {
  assert.ok(!('cover_letter' in BASE_ROLE_PROMPTS));
  assert.ok(prompt().startsWith('You are an expert Cover Letter Writer.'));
  // A request naming the mode gets the ordinary fallback, never the letter mandate under CV rules.
  const scaffolded = getSystemPrompt('cover_letter', 'cv', 'en', undefined, false, null);
  assert.ok(!scaffolded.includes('Cover Letter Writer'));
  assert.ok(!scaffolded.includes('THE PROSE IS NEW'));
  assert.ok(scaffolded.includes(BASE_ROLE_PROMPTS.professional));
});

test('the user turn is ad, then sample, then the CV last', () => {
  const projection = { basics: { name: 'Jane' } };
  const plain = buildCoverLetterUserPrompt({ jobDescription: 'AD TEXT', projection });
  assert.match(plain, /^JOB DESCRIPTION:\nAD TEXT/);
  assert.ok(!plain.includes('WRITING SAMPLE'));
  assert.ok(plain.endsWith(`CV DATA (the only source of facts):\n${JSON.stringify(projection)}`));

  const sampled = buildCoverLetterUserPrompt({
    jobDescription: 'AD TEXT',
    styleSample: 'my voice',
    projection,
  });
  assert.ok(sampled.indexOf('JOB DESCRIPTION') < sampled.indexOf('WRITING SAMPLE'));
  assert.ok(sampled.indexOf('WRITING SAMPLE') < sampled.indexOf('CV DATA'));
  assert.match(sampled, /WRITING SAMPLE \(manner only, never facts\):\nmy voice/);

  // A blank sample is no sample.
  assert.ok(
    !buildCoverLetterUserPrompt({ jobDescription: 'x', styleSample: '   ', projection }).includes(
      'WRITING SAMPLE',
    ),
  );
});

// A word is not a unit in an unspaced script. The client resolves a
// character target for `zh`/`ja`; these pin the prompt end of that contract.

test('every character-counted language is a real language-table key', () => {
  // ⚠️ The guard for a typo that fails CLOSED. `'jp'`, `'zh-CN'` or `'zh_Hans'`
  // would be written identically into both constants files, so `ai:check-sync`
  // compares two matching wrong values and passes — and the language then falls
  // through to the word branch and ships the 31-word letter the character unit fixes.
  // Nothing else compares the inventory to the census it indexes.
  for (const lang of COVER_LETTER_CHARACTER_LANGS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(PROMPT_LANGUAGES, lang),
      `${lang} is in COVER_LETTER_CHARACTER_LANGS but is not a PROMPT_LANGUAGES key`,
    );
  }
});

test('a CJK letter is asked for characters, and never for words', () => {
  for (const targetLang of ['zh', 'ja']) {
    const prompt = getCoverLetterPrompt({ targetLang, wordTarget: 1400, tone: 'professional' });
    const length = prompt.slice(prompt.indexOf('### LENGTH'));
    const block = length.slice(
      0,
      length.indexOf('###', 10) === -1 ? undefined : length.indexOf('###', 10),
    );

    assert.match(block, /characters in total/, `${targetLang} asks for characters`);
    assert.doesNotMatch(
      block,
      /whitespace-separated words/,
      `${targetLang} must not carry the word rule`,
    );
    assert.match(block, /does not separate them with spaces/, `${targetLang} says why`);
  }
});

test('a Latin letter keeps the measured word block byte for byte', () => {
  // ⚠️ The word block was chosen by a measured sweep and carries a standing
  // instruction not to re-word it without re-running that sweep. This
  // asserts a block was added rather than an existing one edited.
  const prompt = getCoverLetterPrompt({ targetLang: 'en', wordTarget: 400, tone: 'professional' });
  assert.match(prompt, /counted as whitespace-separated words across every entry of "paragraphs"/);
  assert.doesNotMatch(prompt, /characters in total/);
});

test('a character target is not capped by the word ceiling', () => {
  // COVER_LETTER_MAX_WORDS is 1000; `long` on a roomy theme resolves above that
  // in characters. Clamping there would silently halve the letter.
  const prompt = getCoverLetterPrompt({ targetLang: 'zh', wordTarget: 1700, tone: 'professional' });
  assert.match(prompt, /between 1700 and/, 'the character target survives the re-clamp');

  const clamped = getCoverLetterPrompt({
    targetLang: 'en',
    wordTarget: 1700,
    tone: 'professional',
  });
  assert.match(clamped, /between 1000 and/, 'a word target is still clamped to the word ceiling');
});
