/**
 * The system prompts and response schemas pinned by snapshot. Shared between
 * vertex-request.test.mjs (assertion) and regen-prompt-snapshots.mjs
 * (generation) — importing the test file from the regen script would execute
 * its tests, so the configs live here.
 */
import {
  PARSING_COMPOSITION,
  WHOLE_CV_SECTIONS,
} from '../../netlify/functions/lib/ai/definitions.js';
import {
  getCoverLetterSchema,
  getParsingSchema,
  getVertexResponseSchema,
} from '../../netlify/functions/lib/ai/generator.js';
import {
  PROMPT_LANGUAGES,
  getCoverLetterPrompt,
  getSystemPrompt,
} from '../../netlify/functions/lib/ai/prompts.js';

export const SNAPSHOT_CONFIGS = {
  'parse-professional-en': () =>
    getSystemPrompt('professional', 'cv', 'en', undefined, false, 'cv_parsing'),
  'improve-cv-professional-en': () =>
    getSystemPrompt('professional', 'cv', 'en', undefined, false, null),
  'improve-item-work-professional-en': () =>
    getSystemPrompt('professional', 'item:work', 'en', 'en', false, null),
  // `SECTION_SPECIFIC_INSTRUCTIONS.coverLetter` exists, and without a
  // config rendering it the prompt library can change while all four snapshots
  // stay byte-identical and the version guard never fires.
  'improve-section-coverletter-professional-en': () =>
    getSystemPrompt('professional', 'section:coverLetter', 'en', 'en', false, null),
  // A custom section's advice is keyed once, by `customSections`, not by its uuid.
  'improve-section-custom-professional-en': () =>
    getSystemPrompt(
      'professional',
      'section:custom:11111111-2222-4333-8444-555555555555',
      'en',
      'en',
      false,
      null,
    ),
  // The tailoring role, with its facts clause, on a whole-CV run and nested in an import.
  'tailor-cv-job-description-en': () =>
    getSystemPrompt('job_description', 'cv', 'en', 'en', false, null),
  'parse-job-description-en': () =>
    getSystemPrompt('job_description', 'cv', 'en', undefined, false, 'cv_parsing'),
  'translate-cv-en-de': () => getSystemPrompt('translate_close', 'cv', 'en', 'de', false, null),
  // The cover-letter prompt is its own assembly, so the four configs above cannot
  // see it change. One per voice path: a tone, and a sample replacing the tone.
  'cover-letter-en-professional-300': () =>
    getCoverLetterPrompt({ targetLang: 'en', wordTarget: 300, tone: 'professional' }),
  'cover-letter-de-sample-420': () =>
    getCoverLetterPrompt({ targetLang: 'de', wordTarget: 420, hasStyleSample: true }),
  // Every formula pair in its slot, for all 15 languages: a wrong-language or
  // swapped formula is then a version bump someone reads, not a silent edit.
  'cover-letter-language-rules-all-locales': () =>
    Object.keys(PROMPT_LANGUAGES)
      .map((targetLang) =>
        getCoverLetterPrompt({ targetLang, wordTarget: 300 })
          .split('\n\n')
          .find((block) => block.startsWith('### LANGUAGE RULES')),
      )
      .join('\n\n'),
};

/** The targets the worker passes on a whole-CV run. */
const CV_TARGETS = WHOLE_CV_SECTIONS;

/** Insertion order is what Vertex receives, and the builders fix it, so a reorder reds too. */
const serializeSchema = (schema) => JSON.stringify(schema, null, 2);

/**
 * Representative response schemas: one config per schema builder branch, not
 * every target. A new builder or branch is unpinned until a config is added
 * here, in the same change. Field descriptions are prompt text, so a schema
 * edit bumps PROMPT_VERSION exactly as a prompt edit does.
 */
export const SCHEMA_SNAPSHOT_CONFIGS = {
  'parse-schema': () => serializeSchema(getParsingSchema(Object.keys(PARSING_COMPOSITION))),
  'improve-cv-schema': () =>
    serializeSchema(getVertexResponseSchema('cv', CV_TARGETS, false, [], false)),
  'improve-item-work-schema': () =>
    serializeSchema(getVertexResponseSchema('item', ['work'], false, [], false)),
  // The list-section branch; `section:coverLetter` takes the singleton one.
  'improve-section-work-schema': () =>
    serializeSchema(getVertexResponseSchema('section', ['work'], false, [], false)),
  // `allowReorg` comes off the request for any granularity; both reorg branches.
  'improve-cv-reorg-schema': () =>
    serializeSchema(getVertexResponseSchema('cv', CV_TARGETS, true, [], false)),
  'improve-section-skills-reorg-schema': () =>
    serializeSchema(getVertexResponseSchema('section', ['skills'], true, [], false)),
  'improve-section-coverletter-schema': () =>
    serializeSchema(getVertexResponseSchema('section', ['coverLetter'], false, [], false)),
  'improve-section-custom-schema': () =>
    serializeSchema(
      getVertexResponseSchema(
        'section',
        ['custom:11111111-2222-4333-8444-555555555555'],
        false,
        [],
        false,
      ),
    ),
  'translate-cv-schema': () =>
    serializeSchema(getVertexResponseSchema('cv', CV_TARGETS, false, [], true)),
  'cover-letter-schema': () => serializeSchema(getCoverLetterSchema()),
};

/** Every pinned snapshot, prompts and schemas alike, with the file it lives in. */
export const ALL_SNAPSHOTS = [
  ...Object.entries(SNAPSHOT_CONFIGS).map(([name, build]) => ({
    kind: 'system prompt',
    name,
    file: `${name}.txt`,
    build,
  })),
  ...Object.entries(SCHEMA_SNAPSHOT_CONFIGS).map(([name, build]) => ({
    kind: 'response schema',
    name,
    file: `${name}.json.txt`,
    build,
  })),
];
