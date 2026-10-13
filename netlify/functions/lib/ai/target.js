/** How the layout and AI targets name a custom section: `custom:<uuid>`. */
export const CUSTOM_SECTION_PREFIX = 'custom:';

/** The target kinds the frontend's `AI_TARGET_KINDS` lists; anything else parses as `unknown`. */
const AI_TARGET_KINDS = ['cv', 'section', 'item'];

/** @param {string} type */
const asKind = (type) => (AI_TARGET_KINDS.includes(type) ? type : 'unknown');

/**
 * An AI target string, split: `cv`, `section:<key>` or `item:<key>[:<vId>]`.
 * `sectionKey` may be a custom-section token, which carries its own colon, so
 * nothing here may split the string on `:` itself. The frontend twin is
 * `src/utils/aiTarget.ts`; `aiTarget.test.ts` runs both.
 * @param {string} target
 * @returns {{ type: 'cv' | 'section' | 'item' | 'unknown', sectionKey: string, vId: string | undefined }}
 */
export function parseAITarget(target) {
  const typeEnd = target.indexOf(':');
  if (typeEnd === -1) return { type: asKind(target), sectionKey: '', vId: undefined };

  const type = asKind(target.slice(0, typeEnd));
  const rest = target.slice(typeEnd + 1);
  const keyStart = rest.startsWith(CUSTOM_SECTION_PREFIX) ? CUSTOM_SECTION_PREFIX.length : 0;
  const keyEnd = rest.indexOf(':', keyStart);

  return keyEnd === -1
    ? { type, sectionKey: rest, vId: undefined }
    : { type, sectionKey: rest.slice(0, keyEnd), vId: rest.slice(keyEnd + 1) || undefined };
}

/**
 * Whether a target's section key names a custom section.
 * @param {string} sectionKey
 */
export const isCustomSectionKey = (sectionKey) =>
  typeof sectionKey === 'string' &&
  sectionKey.startsWith(CUSTOM_SECTION_PREFIX) &&
  sectionKey.length > CUSTOM_SECTION_PREFIX.length;
