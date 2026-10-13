/**
 * The bold heading of an education entry, and the muted line under it.
 *
 * ⚠️ **Shared because the two copies had drifted apart, not to save lines.**
 * `main/Education.tsx` and `side/Education.tsx` each built this pair
 * inline, and the sidebar's copy was wrong in **both** branches of
 * `boldHeaderEducation`:
 *
 * - `'position'` (the default): the heading was `area` alone, where every other
 *   education renderer in the repo — soft's own main column, `elegant`,
 *   `plain2` — writes `studyType` followed by `area`. `studyType` reached the
 *   PDF and not the screen (`soft education.studyType export-only`).
 * - `'company'`: the heading was the **empty string**. Not a fallback, not a
 *   different field — nothing. `institution` appears nowhere else in the
 *   sidebar entry either, so a user who picked "bold the institution" in the
 *   design panel got a blank heading and lost the institution from the preview
 *   entirely, while the PDF kept it.
 *
 * The sweep could only ever see one of those at a time: it renders the default
 * `'position'` mode, so it reported the missing `studyType` and was structurally
 * blind to the missing `institution`. One broken construction, two symptoms,
 * and picking either symptom off on its own would have left the other.
 */
export const educationHeading = (
  cvLocale: { boldHeaderEducation?: string } | undefined,
  item: { institution?: string; studyType?: string; area?: string },
): string =>
  cvLocale?.boldHeaderEducation === 'company'
    ? item.institution || ''
    : [item.studyType, item.area].filter(Boolean).join(' ');

/** The muted line under {@link educationHeading} — whichever fields it did not take. */
export const educationSubheading = (
  cvLocale: { boldHeaderEducation?: string } | undefined,
  item: { institution?: string; studyType?: string; area?: string },
): string =>
  cvLocale?.boldHeaderEducation === 'company'
    ? `${item.studyType ?? ''}${item.area ? ` — ${item.area}` : ''}`
    : item.institution || '';
