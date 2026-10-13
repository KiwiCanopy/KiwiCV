import { type ResumeData } from '@/types/resume';
import { findCustomSection, isCustomSectionToken } from '@/utils/layout/customSections';

type Fields = Record<string, unknown>;

/** Replaces the object with `{ ...object, ...patch }` — never mutates it in place. */
type PatchObject = (patch: Fields) => void;

/**
 * What an AI target's section key addresses in the resume — the one place that
 * answers it, for the request (`selectAITargetData`) and every write-back path.
 * A built-in key names a top-level `list` or `object`; a custom-section token
 * names a `custom` section, whose `items` are its entries and whose own fields
 * (`title`) are what an `item:custom:<uuid>` proposal edits.
 *
 * Inside a producer, `items` is the live draft.
 */
export type AISection =
  | { kind: 'list'; items: Fields[] }
  | { kind: 'object'; object: Fields; patchObject: PatchObject }
  | { kind: 'custom'; items: Fields[]; object: Fields; patchObject: PatchObject };

export const resolveAISection = (resume: ResumeData, sectionKey: string): AISection | undefined => {
  if (isCustomSectionToken(sectionKey)) {
    const section = findCustomSection(resume, sectionKey);
    if (!section) return undefined;
    const index = resume.customSections.indexOf(section);
    return {
      kind: 'custom',
      items: section.items as unknown as Fields[],
      object: section as unknown as Fields,
      patchObject: (patch) => {
        resume.customSections[index] = { ...resume.customSections[index], ...patch };
      },
    };
  }

  const record = resume as unknown as Record<string, unknown>;
  const value = record[sectionKey];
  if (sectionKey === 'meta' || !value || typeof value !== 'object') return undefined;
  if (Array.isArray(value)) return { kind: 'list', items: value as Fields[] };

  return {
    kind: 'object',
    object: value as Fields,
    patchObject: (patch) => {
      record[sectionKey] = { ...(record[sectionKey] as Fields), ...patch };
    },
  };
};

/**
 * What an `item:` target edits: an entry of a list (it carries a vId) or an
 * object — a custom section's heading when it carries none.
 */
export const aiItemScope = (
  section: AISection | undefined,
  vId: string | undefined,
): Exclude<AISection, { kind: 'custom' }> | undefined => {
  if (!section || section.kind !== 'custom') return section;
  return vId
    ? { kind: 'list', items: section.items }
    : { kind: 'object', object: section.object, patchObject: section.patchObject };
};
