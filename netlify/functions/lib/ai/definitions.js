/**
 * Field Definition Registry for Vertex AI
 * This is the single source of truth for how resume fields are presented to the AI.
 */
export const FIELD_DEFS = {
  // Generic & Identity
  name: { type: 'STRING', description: 'The name of the item, company, skill, or person.' },
  label: { type: 'STRING', description: 'Professional title or label (e.g. "Software Engineer").' },
  email: { type: 'STRING', description: 'Contact email address.' },
  phone: { type: 'STRING', description: 'Contact phone number.' },
  url: { type: 'STRING', description: 'URL link (https://...).' },
  summary: { type: 'STRING', description: 'A concise professional summary or description.' },
  description: { type: 'STRING', description: 'A detailed description.' },

  // Dates (Preserving input precision)
  startDate: {
    type: 'STRING',
    description: 'ISO format (YYYY-MM-DD or YYYY-MM). Match original precision.',
  },
  endDate: {
    type: 'STRING',
    description:
      "ISO format (YYYY-MM-DD or YYYY-MM). Match original precision. Leave empty ('') for Present.",
  },
  date: { type: 'STRING', description: 'Event date (YYYY-MM-DD or YYYY-MM).' },
  releaseDate: { type: 'STRING', description: 'Publication release date (YYYY-MM-DD or YYYY-MM).' },

  // Role & Location
  position: { type: 'STRING', description: 'Job title or role name.' },
  organization: { type: 'STRING', description: 'Organization name.' },
  institution: { type: 'STRING', description: 'Educational institution name.' },
  area: { type: 'STRING', description: 'Field of study or area of expertise.' },
  studyType: { type: 'STRING', description: "Degree or certification type (e.g. 'Bachelor')." },
  score: { type: 'STRING', description: 'Grade, GPA, or result.' },
  address: { type: 'STRING' },
  postalCode: { type: 'STRING' },
  city: { type: 'STRING' },
  countryCode: { type: 'STRING', description: 'ISO alpha-2 country code.' },
  region: { type: 'STRING' },
  entryLocation: {
    type: 'STRING',
    description: 'City, region, or remote indicator (e.g. "Berlin", "Remote").',
  },

  // Location & Profiles (Grouped)
  location: {
    type: 'OBJECT',
    properties: {
      address: { type: 'STRING' },
      postalCode: { type: 'STRING' },
      city: { type: 'STRING' },
      countryCode: { type: 'STRING', description: 'ISO alpha-2 country code.' },
      region: { type: 'STRING' },
    },
  },
  profiles: {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        network: { type: 'STRING', description: 'Social network (e.g. LinkedIn).' },
        username: { type: 'STRING' },
        url: { type: 'STRING' },
      },
    },
  },

  // Arrays (No internal commas)
  highlights: {
    type: 'ARRAY',
    items: { type: 'STRING' },
    description: 'Achievement list.',
  },
  keywords: {
    type: 'ARRAY',
    items: { type: 'STRING' },
    description: 'List of keywords or tags',
  },
  courses: {
    type: 'ARRAY',
    items: { type: 'STRING' },
    description: 'List of courses',
  },
  // ⚠️ The paragraph COUNT is asked for in prose, not bound by the schema.
  // `minItems`/`maxItems` would bind it, but only against the source length,
  // which this builder does not receive. The net under it is that Discard
  // restores an object section field by field (`lifecycle.ts`), so a merged
  // paragraph is recoverable rather than lost.
  paragraphs: {
    type: 'ARRAY',
    items: { type: 'STRING' },
    description:
      'Cover letter body, one entry per paragraph. The FIRST entry is the salutation and the LAST is the closing. Return exactly as many entries as were given, in the same order.',
  },

  // Levels & Skills (Context-Aware)
  skillLevel: {
    type: 'INTEGER',
    minimum: 0,
    maximum: 4,
    description:
      'Skill proficiency level: 0 (Not Specified), 1 (Basic), 2 (Intermediate), 3 (Advanced), 4 (Expert).',
  },
  languageLevel: {
    type: 'INTEGER',
    minimum: 0,
    maximum: 5,
    description:
      'Fluency Level: 0 (Not Specified), 1 (Elementary), 2 (Intermediate), 3 (Professional), 4 (Fluent), 5 (Native).',
  },
  language: { type: 'STRING', description: 'Language name.' },
  certificate: { type: 'STRING', description: 'Certification or test name.' },

  // Projects & References
  entity: { type: 'STRING', description: 'The organization or employer the project was for.' },
  type: { type: 'STRING', description: 'The type of project or work.' },
  reference: { type: 'STRING', description: 'Recommendation or reference text.' },
  awarder: { type: 'STRING' },
  issuer: { type: 'STRING' },
  publisher: { type: 'STRING' },
  title: { type: 'STRING', description: 'The title of an award, certificate, or publication.' },
  subject: { type: 'STRING', description: 'Cover letter subject line.' },
  network: { type: 'STRING', description: 'Social network (e.g. LinkedIn).' },
  username: { type: 'STRING' },
};

/**
 * Mapping of Resume Sections to their required field definitions for AI Improvement.
 * We EXCLUDE 'url', 'email', 'phone' here to keep the AI focused on content
 * and ensure these static fields are maintained by the store's merge logic.
 */
export const SECTION_COMPOSITION = {
  basics: ['label', 'summary'],
  work: ['name', 'position', 'startDate', 'endDate', 'summary', 'highlights'],
  volunteer: ['organization', 'position', 'startDate', 'endDate', 'summary', 'highlights'],
  education: ['institution', 'area', 'studyType', 'startDate', 'endDate', 'score', 'courses'],
  awards: ['title', 'date', 'awarder', 'summary'],
  certificates: ['name', 'date', 'issuer'],
  publications: ['name', 'publisher', 'releaseDate', 'summary'],
  skills: ['name', 'skillLevel', 'keywords'],
  languages: ['language', 'certificate', 'languageLevel'],
  interests: ['name', 'keywords'],
  projects: ['name', 'description', 'highlights', 'startDate', 'endDate', 'entity', 'type'],
  privateProjects: ['name', 'description', 'highlights', 'startDate', 'endDate', 'entity', 'type'],
  // Subject and paragraphs only. The recipient fields are contact facts, which
  // improvement strips by convention, and `date` is set client-side.
  coverLetter: ['subject', 'paragraphs'],
};

/**
 * A custom section's entries: the fields a theme renders for one,
 * minus `url`. Not a `SECTION_COMPOSITION` key — a custom section is addressed
 * by its token (`custom:<uuid>`), never by a fixed name, and a whole-CV run
 * carries them all under `CUSTOM_SECTIONS_KEY`. The same fields translate.
 */
export const CUSTOM_SECTION_ITEM_COMPOSITION = [
  'name',
  'startDate',
  'endDate',
  'summary',
  'highlights',
];

/** Where a whole-CV payload and response carry the custom sections. */
export const CUSTOM_SECTIONS_KEY = 'customSections';

/**
 * Sections whose resume value is ONE object rather than an array of items —
 * the backend's only inventory of that shape. One answers on both the
 * `section:` and the whole-CV path with `buildSingletonSchema`:
 * `improvedFields` alone, with no `_vId`, since there is no item to identify.
 * The store and `requiredSectionsFor` read the payload's own shape rather than
 * this list, and `aiImprovableSections.test.ts` pins the list to the store's shape.
 */
export const SINGLETON_SECTIONS = ['basics', 'coverLetter'];

/**
 * What a whole-CV run carries — its targets, its `required` list and its input
 * turn. The letter is not a member: it gets a call of its own, drafted after the
 * CV it echoes. A fact about the run, not about the letter's shape.
 */
export const WHOLE_CV_SECTIONS = [
  ...Object.keys(SECTION_COMPOSITION).filter((section) => section !== 'coverLetter'),
  CUSTOM_SECTIONS_KEY,
];

/**
 * Tailored composition for full CV parsing/import.
 * Includes ALL fields including URLs and contact details that are stripped during improvement.
 */
export const PARSING_COMPOSITION = {
  basics: ['name', 'label', 'email', 'phone', 'url', 'summary', 'location', 'profiles'],
  work: [...SECTION_COMPOSITION.work, 'url', 'entryLocation'],
  volunteer: [...SECTION_COMPOSITION.volunteer, 'url', 'entryLocation'],
  education: [...SECTION_COMPOSITION.education, 'url', 'entryLocation'],
  awards: [...SECTION_COMPOSITION.awards, 'url', 'entryLocation'],
  certificates: [...SECTION_COMPOSITION.certificates, 'url'],
  publications: [...SECTION_COMPOSITION.publications, 'url'],
  skills: SECTION_COMPOSITION.skills,
  languages: SECTION_COMPOSITION.languages,
  interests: SECTION_COMPOSITION.interests,
  projects: [...SECTION_COMPOSITION.projects, 'url', 'entryLocation'],
  privateProjects: [...SECTION_COMPOSITION.privateProjects, 'url', 'entryLocation'],
  references: ['name', 'reference'],
};

/**
 * What the cover-letter call reads. The other compositions bound the
 * response schema; this one bounds the REQUEST — the CV reaches that call only
 * through `projectForCoverLetter`. `basics.name` is here although the prompt
 * forbids writing it: inflected languages need the candidate's gendered forms.
 * What is sent and why is on docs/ai-data-flow.md.
 */
export const COVER_LETTER_COMPOSITION = {
  basics: ['name', 'label', 'summary'],
  work: ['position', 'name', 'startDate', 'endDate', 'highlights'],
  skills: ['name', 'keywords'],
  education: ['institution', 'area', 'studyType'],
  projects: ['name', 'description'],
};

/**
 * Tailored composition for AI Translation.
 * Includes entryLocation so that city names and locations can be translated,
 * unlike normal AI improvement where they are excluded.
 */
export const TRANSLATION_COMPOSITION = {
  basics: SECTION_COMPOSITION.basics,
  work: [...SECTION_COMPOSITION.work, 'entryLocation'],
  volunteer: [...SECTION_COMPOSITION.volunteer, 'entryLocation'],
  education: [...SECTION_COMPOSITION.education, 'entryLocation'],
  awards: [...SECTION_COMPOSITION.awards, 'entryLocation'],
  certificates: SECTION_COMPOSITION.certificates,
  publications: SECTION_COMPOSITION.publications,
  skills: SECTION_COMPOSITION.skills,
  languages: SECTION_COMPOSITION.languages,
  interests: SECTION_COMPOSITION.interests,
  projects: [...SECTION_COMPOSITION.projects, 'entryLocation'],
  privateProjects: [...SECTION_COMPOSITION.privateProjects, 'entryLocation'],
  // Same fields as improvement. Present so a translating `section:coverLetter`
  // run resolves a composition at all — an absent key yields `fields = []`, and
  // the schema then asks the model for an object with nothing in it.
  coverLetter: SECTION_COMPOSITION.coverLetter,
};
