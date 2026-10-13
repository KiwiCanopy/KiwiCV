import { type ResumeData, initialResumeState } from '@/types/resume';

/**
 * Pass-through: top-level blocks of an imported file that KiwiCV does not model
 * Held verbatim in `ResumeData.passthrough`, re-emitted at the top level
 * by `toResumeJson`, never rendered and never sent to AI.
 *
 * ⚠️ A holding area, not a destination. The modelled inventory is derived from
 * `initialResumeState`, so the moment a block gets a field it stops being
 * pass-through and `liftModelledFromPassthrough` moves any stored copy out.
 */

/** Cap on the serialized pass-through, in UTF-8 bytes. */
export const PASSTHROUGH_MAX_BYTES = 256 * 1024;

const MODELLED_KEYS: ReadonlySet<string> = new Set(Object.keys(initialResumeState));

// `JSON.parse` yields `__proto__` as an own key; written back through
// `obj[key] = …` it reaches the prototype setter rather than becoming data. It is
// never a real block, so it is skipped (`constructor`/`prototype` are plain data).
const UNSAFE_KEY = '__proto__';

export const isModelledKey = (key: string): boolean => MODELLED_KEYS.has(key);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const byteLength = (value: unknown): number =>
  new TextEncoder().encode(JSON.stringify(value) ?? '').length;

/**
 * Splits a stored pass-through block into what stays and what KiwiCV now models.
 * Used by the persist migration and by `collectPassthrough`, so a stored store,
 * an old backup and a library restore all lift the same way.
 */
export const liftModelledFromPassthrough = (
  passthrough: unknown,
): { kept: Record<string, unknown>; lifted: Record<string, unknown> } => {
  const kept: Record<string, unknown> = {};
  const lifted: Record<string, unknown> = {};
  if (!isPlainObject(passthrough)) return { kept, lifted };

  for (const [key, value] of Object.entries(passthrough)) {
    if (key === UNSAFE_KEY || value === undefined) continue;
    if (isModelledKey(key)) lifted[key] = value;
    else kept[key] = value;
  }
  return { kept, lifted };
};

export interface CollectedPassthrough {
  /** The capped block to store. */
  passthrough: Record<string, unknown>;
  /** Stored entries KiwiCV now models; the sanitizer reads them where the top level has none. */
  lifted: Record<string, unknown>;
  /** Keys that arrived at the file's top level and were kept. */
  keptFromFile: string[];
  /** Keys dropped by the size cap. */
  dropped: string[];
}

/**
 * Gathers pass-through from an import or a stored resume: the stored block
 * (`data.passthrough`) plus every unmodelled top-level key, top level winning.
 * Values are cloned; keys are admitted in order until `PASSTHROUGH_MAX_BYTES`.
 */
export const collectPassthrough = (data: Record<string, unknown>): CollectedPassthrough => {
  const { kept: stored, lifted } = liftModelledFromPassthrough(data.passthrough);

  const fromFile: Record<string, unknown> = {};
  const dropped: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (isModelledKey(key) || key === UNSAFE_KEY || value === undefined) continue;
    fromFile[key] = value;
  }

  const candidates = { ...stored, ...fromFile };
  const passthrough: Record<string, unknown> = {};
  const keptFromFile: string[] = [];
  // Braces and commas of the enclosing object.
  let budget = PASSTHROUGH_MAX_BYTES - 2;

  for (const [key, value] of Object.entries(candidates)) {
    const cost = byteLength(key) + byteLength(value) + 2;
    if (cost > budget) {
      dropped.push(key);
      continue;
    }
    budget -= cost;
    passthrough[key] = structuredClone(value);
    if (Object.hasOwn(fromFile, key)) keptFromFile.push(key);
  }

  return { passthrough, lifted, keptFromFile, dropped };
};

/**
 * The resume as an exported JSON object: modelled keys first, pass-through
 * blocks after them at the top level, and no `passthrough` key. Every writer of
 * a file meant for other tools (download, ZIP, Drive, GitHub, Raw Data) goes
 * through this; the migration backup deliberately dumps the raw store.
 */
export const toResumeJson = (resume: ResumeData): Record<string, unknown> => {
  const { passthrough, ...modelled } = resume;
  const { kept } = liftModelledFromPassthrough(passthrough);
  return { ...modelled, ...kept };
};

/**
 * `toResumeJson`, serialized the way every export writes it. A destination that
 * may be public writes `getFilteredResumeData(…, 'reduced')` instead.
 */
export const stringifyResume = (resume: ResumeData): string =>
  JSON.stringify(toResumeJson(resume), null, 2);
