import {
  CUSTOM_SECTIONS_KEY,
  CUSTOM_SECTION_ITEM_COMPOSITION,
  FIELD_DEFS,
  PARSING_COMPOSITION,
  SECTION_COMPOSITION,
  SINGLETON_SECTIONS,
  TRANSLATION_COMPOSITION,
  WHOLE_CV_SECTIONS,
} from './definitions.js';
import { isCustomSectionKey } from './target.js';

/**
 * The `improvedFields` properties for a section, keyed as the store stores them.
 * @param {string} section - The section key.
 * @returns {object} A property map for an OBJECT schema node.
 */
function buildImprovedFieldProperties(section, isTranslating) {
  const composition = isTranslating ? TRANSLATION_COMPOSITION : SECTION_COMPOSITION;
  return fieldProperties(
    isCustomSectionKey(section) ? CUSTOM_SECTION_ITEM_COMPOSITION : composition[section] || [],
  );
}

/**
 * Field names mapped to their schema nodes, keyed as the store stores them.
 * @param {string[]} fields - Composition entries.
 * @returns {object} A property map for an OBJECT schema node.
 */
function fieldProperties(fields) {
  return fields.reduce((acc, fieldKey) => {
    let definition = { ...FIELD_DEFS[fieldKey] };

    // Map level-specific and entry-level location fields back to their storage keys
    let targetKey = fieldKey;
    if (fieldKey === 'skillLevel' || fieldKey === 'languageLevel') {
      targetKey = 'level';
    } else if (fieldKey === 'entryLocation') {
      targetKey = 'location';
    }

    acc[targetKey] = definition;
    return acc;
  }, {});
}

/**
 * Builds the schema for a single section item.
 * @param {string} section - The section key.
 * @returns {object} The schema for the item.
 */
function buildItemSchema(section, isTranslating = false) {
  return itemSchemaFor(buildImprovedFieldProperties(section, isTranslating));
}

/** The item shape around an `improvedFields` property map. */
function itemSchemaFor(properties) {
  return {
    type: 'OBJECT',
    properties: {
      _vId: {
        type: 'STRING',
        description: 'The unique identifier of the item being improved.',
      },
      improvedFields: {
        type: 'OBJECT',
        properties: properties,
        required: Object.keys(properties),
        description: 'Object containing the improved versions of the provided fields.',
      },
    },
    required: ['_vId', 'improvedFields'],
  };
}

/**
 * Builds the schema for a section that is ONE object rather than a list of
 * items — `SINGLETON_SECTIONS`.
 *
 * The difference from `buildItemSchema` is the missing `_vId`: that field asks
 * the model to echo the identifier of the item it improved, and a section with
 * no items has none to echo. Requiring it produced a schema that could only be
 * satisfied with an invented value, which then matched nothing on the way back.
 */
function buildSingletonSchema(section, isTranslating = false) {
  const properties = buildImprovedFieldProperties(section, isTranslating);

  return {
    type: 'OBJECT',
    properties: {
      improvedFields: {
        type: 'OBJECT',
        properties: properties,
        required: Object.keys(properties),
        description: 'Object containing the improved versions of the provided fields.',
      },
    },
    required: ['improvedFields'],
  };
}

/**
 * Builds a flat schema for reorganizable sections (e.g. skills).
 * Items are returned WITHOUT the _vId/improvedFields wrapper,
 * with a _sourceVIds field for tracking provenance.
 */
function buildReorgItemSchema(section, isTranslating = false) {
  const composition = isTranslating ? TRANSLATION_COMPOSITION : SECTION_COMPOSITION;
  const fields = composition[section] || [];
  const properties = fields.reduce((acc, fieldKey) => {
    let targetKey = fieldKey;
    if (fieldKey === 'skillLevel' || fieldKey === 'languageLevel') {
      targetKey = 'level';
    } else if (fieldKey === 'entryLocation') {
      targetKey = 'location';
    }
    acc[targetKey] = { ...FIELD_DEFS[fieldKey] };
    return acc;
  }, {});

  properties._sourceVIds = {
    type: 'ARRAY',
    items: { type: 'STRING' },
    description:
      'Original _vId(s) this item was derived from. Use an empty array [] if entirely new.',
  };

  const requiredFields = Object.keys(properties).filter((key) =>
    ['name', 'keywords', '_sourceVIds'].includes(key),
  );

  return { type: 'OBJECT', properties, required: requiredFields };
}

/**
 * A custom section's heading. Returned only by a translation: Improve rewrites
 * entries, never the name the user gave the section.
 */
const CUSTOM_SECTION_TITLE = {
  type: 'STRING',
  description: "The section's heading, translated. Keep it as short as the original.",
};

/**
 * One custom section on a `section:custom:<uuid>` run: its entries in the item
 * shape, plus the heading when translating.
 */
function buildCustomSectionSchema(isTranslating) {
  const properties = {
    ...(isTranslating ? { title: CUSTOM_SECTION_TITLE } : {}),
    items: {
      type: 'ARRAY',
      items: itemSchemaFor(fieldProperties(CUSTOM_SECTION_ITEM_COMPOSITION)),
      description: 'Array of improved entries of this custom section.',
    },
  };
  return { type: 'OBJECT', properties, required: Object.keys(properties) };
}

/**
 * Every custom section on a whole-CV run, matched back by `id` — a section has
 * no `_vId`, and the entries inside keep theirs.
 */
function buildCustomSectionsCvSchema(isTranslating) {
  const section = buildCustomSectionSchema(isTranslating);
  return {
    type: 'ARRAY',
    items: {
      ...section,
      properties: {
        id: { type: 'STRING', description: 'The id of the section, copied unchanged.' },
        ...section.properties,
      },
      required: ['id', ...section.required],
    },
    description: 'Array of the improved user-defined sections, one per input section.',
  };
}

/**
 * Generates a tailored Vertex AI response schema based on granularity mode.
 *
 * @param {'item' | 'section' | 'cv'} mode - The improvement granularity.
 * @param {string[]} targets - Array of section keys (e.g. ['work'] or all active sections for 'cv').
 * @returns {object} The Vertex AI compatible response schema.
 */
/**
 * Generates a response schema for full CV parsing/import.
 * Unlike improvement modes, this does not use _vId or improvedFields wrapping.
 *
 * @param {string[]} sections - Array of section keys to include in the schema.
 * @returns {object} The Vertex AI compatible response schema for full parsing.
 */
/**
 * Recursively marks every property of an OBJECT schema (and of ARRAY item
 * schemas) as required. Gemini's structured output treats non-required
 * properties as freely omittable, and models omit them wholesale — the prompt
 * rule "set missing fields to an empty string" only works when the field must
 * be emitted at all.
 */
function markAllRequired(schema) {
  if (schema.type === 'OBJECT' && schema.properties) {
    schema.required = Object.keys(schema.properties);
    Object.values(schema.properties).forEach(markAllRequired);
  } else if (schema.type === 'ARRAY' && schema.items) {
    markAllRequired(schema.items);
  }
  return schema;
}

export function getParsingSchema(sections) {
  const properties = {};

  sections.forEach((section) => {
    const fields = PARSING_COMPOSITION[section] || [];
    const itemProperties = fields.reduce((acc, fieldKey) => {
      let targetKey = fieldKey;
      if (fieldKey === 'skillLevel' || fieldKey === 'languageLevel') {
        targetKey = 'level';
      } else if (fieldKey === 'entryLocation') {
        targetKey = 'location';
      }
      // Deep-clone so markAllRequired never mutates the shared FIELD_DEFS
      // (they are also used by the improvement schemas).
      acc[targetKey] = structuredClone(FIELD_DEFS[fieldKey]);
      return acc;
    }, {});

    if (SINGLETON_SECTIONS.includes(section)) {
      properties[section] = {
        type: 'OBJECT',
        properties: itemProperties,
        description: 'Basic contact and summary information.',
      };
    } else {
      properties[section] = {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: itemProperties,
        },
        description: `List of ${section} entries.`,
      };
    }
  });

  return markAllRequired({
    type: 'OBJECT',
    properties: properties,
    description: 'The extracted and structured resume data.',
  });
}

export function getVertexResponseSchema(
  mode,
  targets = [],
  allowReorg = false,
  requiredSections = [],
  isTranslating = false,
) {
  if (mode === 'item') {
    // Single item improvement (e.g., one work entry)
    return buildItemSchema(targets[0], isTranslating);
  }

  if (mode === 'section') {
    if (isCustomSectionKey(targets[0])) {
      return buildCustomSectionSchema(isTranslating);
    }

    // An object-valued section returns its fields directly, with no items array.
    if (SINGLETON_SECTIONS.includes(targets[0])) {
      return buildSingletonSchema(targets[0], isTranslating);
    }

    // Reorg mode for skills: flat schema without _vId/improvedFields wrapper
    if (allowReorg && targets[0] === 'skills') {
      return {
        type: 'OBJECT',
        properties: {
          items: {
            type: 'ARRAY',
            items: buildReorgItemSchema('skills', isTranslating),
            description: 'Restructured skill items.',
          },
        },
        required: ['items'],
      };
    }

    // Full section improvement (e.g., all work entries)
    return {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          items: buildItemSchema(targets[0], isTranslating),
          description: `Array of improved items for the ${targets[0]} section.`,
        },
      },
      required: ['items'],
    };
  }

  if (mode === 'cv') {
    // Full CV improvement
    const properties = {};
    const required = [];

    targets.forEach((section) => {
      // Membership is the caller's, read off `WHOLE_CV_SECTIONS`; anything else
      // here is a programming error, not a section to skip.
      if (!WHOLE_CV_SECTIONS.includes(section)) {
        throw new Error(`NOT_A_WHOLE_CV_SECTION: ${section}`);
      }

      if (section === CUSTOM_SECTIONS_KEY) {
        properties[section] = buildCustomSectionsCvSchema(isTranslating);
        required.push(section);
        return;
      }

      if (section === 'skills' && allowReorg) {
        // Reorg schema for skills within full CV
        properties.skills = {
          type: 'ARRAY',
          items: buildReorgItemSchema('skills', isTranslating),
          description: 'Restructured skill items.',
        };
        required.push('skills');
      } else if (SINGLETON_SECTIONS.includes(section)) {
        // One shape per object section on every path; measured 2026-10-12, AI_LOGIC.md.
        properties[section] = buildSingletonSchema(section, isTranslating);
        required.push(section);
      } else {
        properties[section] = {
          type: 'ARRAY',
          items: buildItemSchema(section, isTranslating),
          description: `Array of improved items for the ${section} section.`,
        };
        required.push(section);
      }
    });

    // The caller's content-aware list wins. A name in it that this schema lacks
    // would reach the wire as a `required` with no property: refuse it.
    const unknown = requiredSections.filter((section) => !(section in properties));
    if (unknown.length > 0) {
      throw new Error(`UNKNOWN_REQUIRED_SECTION: ${unknown.join(', ')}`);
    }

    return {
      type: 'OBJECT',
      properties: properties,
      required: requiredSections.length > 0 ? requiredSections : required,
    };
  }

  throw new Error(`Unsupported improvement mode: ${mode}`);
}

/**
 * The sections a whole-CV run must answer for: the `WHOLE_CV_SECTIONS` the
 * payload carries, read off its shape — a list when it has entries, an object
 * when it is present.
 * @param {object} resumeData - The resume as the request carried it, `meta` stripped.
 * @returns {string[]} Composition keys, in composition order.
 */
export function requiredSectionsFor(resumeData) {
  if (!resumeData || typeof resumeData !== 'object') return [];
  return WHOLE_CV_SECTIONS.filter((section) => {
    const val = resumeData[section];
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val) && typeof val === 'object';
  });
}

/**
 * The response schema of the cover-letter call: the same two fields
 * Improve returns, so both letter paths share one apply shape. No recipient —
 * the addressee's name belongs in the salutation, and the recipient block is
 * the user's to fill (owner, 2026-09-05). Standalone: no `_vId`, and no
 * composition — `COVER_LETTER_COMPOSITION` bounds the request instead. Measured against Vertex on 2026-09-05; what the
 * endpoint accepts and rejects is on ops/AI_LOGIC.md § The cover-letter call,
 * and `vertex-request.test.mjs` walks every schema for the rejections.
 */
export function getCoverLetterSchema() {
  return {
    type: 'OBJECT',
    properties: {
      subject: { type: 'STRING', description: 'Subject line naming the role specifically.' },
      paragraphs: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description:
          'The letter, one entry per paragraph. The FIRST entry is the salutation alone and the LAST is the closing formula alone.',
      },
    },
    required: ['subject', 'paragraphs'],
  };
}
