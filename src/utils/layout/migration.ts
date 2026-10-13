import type { ResumeData, ResumeMeta } from '@/types/resume';
import {
  getDefaultOneColumnLayout,
  getDefaultTwoColumnLayout,
  normalizeTwoColumnLayout,
} from '@/utils/layout/getters';
import { isTwoColumnTheme } from '@/utils/layout/predicates';
import { migrateToNewLayoutStructure } from '@/utils/layout/structure';
import { validateLayoutMetadata } from '@/utils/layout/validation';

/**
 * Migrates layout metadata during theme transitions
 */
export const migrateLayoutMetadata = (
  oldMeta: ResumeMeta,
  newThemeName: string,
  data: ResumeData,
): ResumeMeta => {
  const updated = migrateToNewLayoutStructure(oldMeta);
  updated.theme.name = newThemeName;

  const oldThemeName = oldMeta.theme.name;
  const fromTwoCol = isTwoColumnTheme(oldThemeName);
  const toTwoCol = isTwoColumnTheme(newThemeName);

  if (fromTwoCol && toTwoCol) {
    // 2-col → 2-col: Keep existing twoColumn order if valid
    const errors = validateLayoutMetadata(updated, data);
    if (errors.length > 0) {
      // If corrupt, reset to defaults
      const order = updated.content.order;
      const defaults = getDefaultTwoColumnLayout(newThemeName);
      order.twoColumn = normalizeTwoColumnLayout(defaults, data, updated);
    }
  } else if (fromTwoCol && !toTwoCol) {
    // 2-col → 1-col: Use existing oneColumn order if complete, otherwise convert
    const order = updated.content.order;
    const hasExistingOneColumnLayout = (order.oneColumn?.length || 0) > 0;

    if (!hasExistingOneColumnLayout) {
      order.oneColumn = getDefaultOneColumnLayout(newThemeName);
    }
  } else if (!fromTwoCol && toTwoCol) {
    // 1-col → 2-col: Use existing twoColumn order if complete, otherwise use defaults
    const order = updated.content.order;
    const hasExistingTwoColumnLayout =
      (order.twoColumn.main?.length || 0) > 0 || (order.twoColumn.sidebar?.length || 0) > 0;

    if (hasExistingTwoColumnLayout) {
      // Check if the current layout is missing any visible sections
      const errors = validateLayoutMetadata(updated, data);
      if (errors.length > 0) {
        order.twoColumn = normalizeTwoColumnLayout(
          getDefaultTwoColumnLayout(newThemeName),
          data,
          updated,
        );
      }
    } else {
      // No layout at all, use defaults
      order.twoColumn = normalizeTwoColumnLayout(
        getDefaultTwoColumnLayout(newThemeName),
        data,
        updated,
      );
    }
  }

  return updated;
};
