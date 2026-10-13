/**
 * The targets the improve worker must serve and must refuse,
 * derived from the backend's own inventories so a section added to either
 * list joins the tables without an edit here.
 */
import {
  CUSTOM_SECTIONS_KEY,
  SECTION_COMPOSITION,
  SINGLETON_SECTIONS,
} from '../../netlify/functions/lib/ai/definitions.js';

const CUSTOM = 'custom:3f2b8c1e-0000-4000-8000-000000000001';

const LIST_SECTIONS = Object.keys(SECTION_COMPOSITION).filter(
  (key) => !SINGLETON_SECTIONS.includes(key),
);

/** What the app sends: the whole CV, every composed section, every list entry. */
export const SERVED_TARGETS = [
  'cv',
  ...Object.keys(SECTION_COMPOSITION).map((key) => `section:${key}`),
  `section:${CUSTOM}`,
  ...LIST_SECTIONS.map((key) => `item:${key}:v1`),
  `item:${CUSTOM}:c1`,
];

/** Shapes no composition serves, or whose result the client cannot write back. */
export const REFUSED_TARGETS = [
  ...SINGLETON_SECTIONS.flatMap((key) => [`item:${key}`, `item:${key}:x`]),
  `item:${CUSTOM}`,
  `item:${LIST_SECTIONS[0]}`,
  `item:${LIST_SECTIONS[0]}:`,
  'item:foo:x',
  'item:meta:x',
  `item:${CUSTOM_SECTIONS_KEY}:x`,
  'item:custom::x',
  // Inherited from Object.prototype: present to `in`, absent to `Object.hasOwn`.
  'item:constructor:x',
  'item:__proto__:x',
  'section:foo',
  'section:meta',
  `section:${CUSTOM_SECTIONS_KEY}`,
  'section:custom:',
  'section:toString',
  'cv:x',
  'group:work,skills',
  'foo',
];
