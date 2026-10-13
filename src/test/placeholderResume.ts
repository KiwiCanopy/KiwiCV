import { type ResumeData, initialResumeState } from '@/types/resume';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';

/**
 * The resume a new user's first PDF is built from — an untouched
 * `initialResumeState` run through the placeholder enrichment, exactly the way
 * `Viewer.tsx` builds it.
 *
 * A different shape from `buildSingleItemResume`: the comma-split sections
 * (skills, languages, certificates, awards, publications) carry several
 * entries, and it is the only fixture in the repository with a **profile
 * image** — `placeholder-fallback.ts` substitutes `/images/mok_image.png`, so
 * it is the only one that reaches `mapProfileImage` and the theme's
 * `image("/profile-image.<ext>")` markup.
 *
 * ⚠️ Its *array* sections are single-entry too (`placeholder-fallback.ts` gives
 * one work, one education, one project, one private project), so it is not a
 * substitute for realistic multi-entry data — nothing in the repository renders
 * two work entries back to back.
 */
export function buildPlaceholderResume(themeId: string): ResumeData {
  const resume = structuredClone(initialResumeState) as ResumeData;
  resume.meta.theme.name = themeId;
  resume.meta.theme.locale = process.env.RENDER_LOCALE ?? 'en';
  return enrichResumeWithPlaceholders(resume);
}
