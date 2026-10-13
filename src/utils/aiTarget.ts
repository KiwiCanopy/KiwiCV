import { CUSTOM_SECTION_PREFIX } from '@/utils/layout/customSections';

/**
 * The kinds of AI target. `cv` is the whole key; every other kind is a prefix
 * `<kind>:` followed by a section key. The builders, the predicates and the
 * parser below spell the prefixes from this list and nowhere else;
 * `ai-target-keys.test.mjs` fails on a prefix or key spelled outside this file.
 */
export const AI_TARGET_KINDS = ['cv', 'section', 'item'] as const;
export type AITargetKind = (typeof AI_TARGET_KINDS)[number];

type PrefixKind = Exclude<AITargetKind, 'cv'>;

/**
 * A target the app builds: `cv`, or a prefix kind followed by a section key.
 * Typed so a misspelled key (`'CV'`, `'items:work'`) fails to compile.
 * A `string` from outside — a persisted store, an import — enters through
 * `isAITargetKey`; `aiTargetKey.typecheck.test.ts` fails if this widens.
 */
export type AITargetKey = 'cv' | `${PrefixKind}:${string}`;

const prefix = <K extends PrefixKind>(kind: K) => `${kind}:` as const;
const ITEM_PREFIX = prefix('item');
const SECTION_PREFIX = prefix('section');

/**
 * An AI target string, split: `cv`, `section:<key>` or
 * `item:<key>[:<vId>]`. `sectionKey` may be a custom-section token
 * (`custom:<uuid>`), which carries its own colon — so no caller may split the
 * string on `:` itself. The backend twin is
 * `netlify/functions/lib/ai/target.js`; `aiTarget.test.ts` runs both.
 */
export interface AITarget {
  /** `unknown` for a kind the app never builds — a persisted or imported string. */
  type: AITargetKind | 'unknown';
  /** Empty for `cv`. */
  sectionKey: string;
  vId: string | undefined;
}

const asKind = (type: string): AITarget['type'] =>
  (AI_TARGET_KINDS as readonly string[]).includes(type) ? (type as AITargetKind) : 'unknown';

export const parseAITarget = (target: string): AITarget => {
  const typeEnd = target.indexOf(':');
  if (typeEnd === -1) return { type: asKind(target), sectionKey: '', vId: undefined };

  const type = asKind(target.slice(0, typeEnd));
  const rest = target.slice(typeEnd + 1);
  const keyStart = rest.startsWith(CUSTOM_SECTION_PREFIX) ? CUSTOM_SECTION_PREFIX.length : 0;
  const keyEnd = rest.indexOf(':', keyStart);

  return keyEnd === -1
    ? { type, sectionKey: rest, vId: undefined }
    : { type, sectionKey: rest.slice(0, keyEnd), vId: rest.slice(keyEnd + 1) || undefined };
};

/**
 * The `item:` proposal key for an object-shaped section (`item:<sectionKey>`),
 * or for one entry of a list when `vId` is given. The store writes it and every
 * form reads it through this one helper.
 */
export const itemTarget = (sectionKey: string, vId?: string): `item:${string}` =>
  vId ? `${ITEM_PREFIX}${sectionKey}:${vId}` : `${ITEM_PREFIX}${sectionKey}`;

/** The `section:` key of a whole-section run and its container proposal. */
export const sectionTarget = (sectionKey: string): `section:${string}` =>
  `${SECTION_PREFIX}${sectionKey}`;

/*
 * ⚠️ The predicates test the prefix, colon included — never `parseAITarget().type`:
 * a bare `item` parses as type `item`, and the `startsWith('item:')` readers these
 * replaced rejected it.
 */
export const isItemTarget = (target: string): target is `item:${string}` =>
  target.startsWith(ITEM_PREFIX);
export const isSectionTarget = (target: string): target is `section:${string}` =>
  target.startsWith(SECTION_PREFIX);

/** Narrows a `string` from outside the app — persisted, imported — to a target it builds. */
export const isAITargetKey = (target: string): target is AITargetKey =>
  target === 'cv' || isItemTarget(target) || isSectionTarget(target);

/**
 * Whether `key` is an `item:` proposal belonging to `sectionKey`.
 *
 * ⚠️ **Two spellings, and forgetting the second has shipped twice.** A list
 * item is `item:work:v1`; a section that is ONE object has no vId and is just
 * `item:basics` or `item:coverLetter`. Three places encode "a `section:`
 * container and its `item:` children are one proposal" — the count the user
 * sees, the container cleanup, and accept-all — and the count matched only the
 * trailing-colon form, so one basics rewrite read as "2 proposals" the moment
 * that path started to apply at all.
 */
export const isItemKeyOf = (key: string, sectionKey: string): key is `item:${string}` =>
  key.startsWith(`${itemTarget(sectionKey)}:`) || key === itemTarget(sectionKey);
