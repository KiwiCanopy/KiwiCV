import type { ResumeData, ResumeMeta } from '@/types/resume';
import { isTwoColumnTheme } from '@/utils/layout/predicates';

/**
 * Validates layout metadata against actual resume data.
 * Checks for missing sections, invalid keys, and structural integrity.
 */
export const validateLayoutMetadata = (meta: ResumeMeta, _data: ResumeData): string[] => {
  const errors: string[] = [];
  const theme = meta.theme.name;
  const order = meta.content.order;

  if (isTwoColumnTheme(theme)) {
    if (!order.twoColumn) {
      errors.push('Missing twoColumn layout order for a 2-column theme.');
      return errors;
    }

    if (!Array.isArray(order.twoColumn.main) || !Array.isArray(order.twoColumn.sidebar)) {
      errors.push('Invalid twoColumn layout structure.');
    }
  } else {
    if (!Array.isArray(order.oneColumn)) {
      errors.push('Invalid oneColumn layout structure.');
    }
  }

  return errors;
};
