import type { ResumeData, VisibilitySection } from '@/types/resume';

/**
 * Generates a stable hash/ID for a resume item based on its identifying fields.
 * This allows tracking visibility even if items are reordered or other fields change.
 */

export function getSectionItemHash(
  section: VisibilitySection,
  item: Record<string, unknown>,
): string {
  // Prioritize stable visibility ID if present
  if (item._vId && typeof item._vId === 'string') {
    return `${section}:${item._vId}`;
  }

  let key: string;

  switch (section) {
    case 'work':
      key = `${item.name}|${item.startDate}`;
      break;
    case 'education':
      key = `${item.institution}|${item.studyType}`;
      break;
    case 'skills':
      key = `${item.name}`;
      break;
    case 'projects':
      key = `${item.name}|${item.startDate}`;
      break;
    case 'privateProjects':
      // Same item shape as `projects` (see `createEmptyItem`), so same identity fields.
      key = `${item.name}|${item.startDate}`;
      break;
    case 'certificates':
      key = `${item.name}|${item.issuer}`;
      break;
    case 'volunteer':
      key = `${item.organization}|${item.position}`;
      break;
    case 'awards':
      key = `${item.title}|${item.awarder}`;
      break;
    case 'publications':
      key = `${item.name}|${item.publisher}`;
      break;
    case 'languages':
      key = `${item.language}`;
      break;
    case 'interests':
      key = `${item.name}`;
      break;
    case 'references':
      key = `${item.name}`;
      break;
    case 'profiles':
      key = `${item.network}|${item.username}`;
      break;
    case 'basics:image':
      // Special case for profile picture visibility which is not part of an array
      return 'basics:image';
    default:
      // A custom-section token lands here; its entries always carry a
      // `_vId` (minted at creation, backfilled by the sanitizer for foreign input),
      // so the early return above handles them.
      // ⚠️ **No built-in section reaches this any more**, and this comment used to
      // name `basics`, `meta` and `coverLetter` as the cases that reach it —
      // `VisibilitySection` no longer admits any of them. It stays because
      // `section` still arrives from persisted JSON at the callers that narrow
      // with `isSectionKey` rather than from a literal, and a `switch` should
      // not fall off its end. Every array section in `ALL_SECTION_KEYS` has an
      // explicit case above, enforced by hash.test.ts —
      // without one an item would hash over its whole JSON, so editing any field
      // would change its id and orphan the entry in `meta.content.hiddenIds`.
      key = JSON.stringify(item);
  }

  // Simple Jenkins One-at-a-Time hash or FNV-1a would be better, but for this use case,
  // a base64 string of the identifier is sufficient and readable-ish.
  // We add the section prefix to avoid collisions across sections (though unlikely).
  return `${section}:${btoa(encodeURIComponent(key))}`;
}

/**
 * SHA-256 of the whole resume as lowercase hex. It only answers "changed since
 * the last sync?", and it is what the sync-hash keys store, so it must stay a
 * one-way digest: those keys outlive the resume they describe.
 */
export function getResumeHash(resume: ResumeData): Promise<string> {
  return sha256Hex(JSON.stringify(resume));
}

/** SHA-256 of the UTF-8 text, lowercase hex. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Whether a stored sync-hash value has the shape `sha256Hex` produces. */
export const isResumeDigest = (value: string): boolean => /^[0-9a-f]{64}$/.test(value);
