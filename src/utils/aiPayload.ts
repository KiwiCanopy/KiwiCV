import { type ResumeData } from '@/types/resume';
import { resolveAISection } from '@/utils/aiSection';
import { type AITargetKey, parseAITarget } from '@/utils/aiTarget';

/**
 * The data an AI run on `activeTarget` (`cv`, `section:<key>`, `item:<key>[:<vId>]`,
 * where `<key>` may be a custom-section token)
 * reads, before `sanitizeForAI` strips what the CV can never show. Hidden entries
 * are included: they are content the user can show again (owner, 2026-10-05).
 * `undefined` when the target no longer exists.
 */
export const selectAITargetData = (resume: ResumeData, activeTarget: AITargetKey): unknown => {
  const { type, sectionKey, vId } = parseAITarget(activeTarget);
  if (type === 'cv') return resume;

  // A custom section is sent whole — its heading gives the entries their context.
  const section = resolveAISection(resume, sectionKey);
  if (!section) return undefined;
  if (type === 'item' && vId) {
    return section.kind === 'object'
      ? section.object
      : section.items.find((candidate) => candidate._vId === vId);
  }
  return section.kind === 'list' ? section.items : section.object;
};
