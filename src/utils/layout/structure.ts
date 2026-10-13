import type { ResumeMeta } from '@/types/resume';

/**
 * Ensures basic layout structure exists in metadata.
 */
export const clearUnusedLayoutMetadata = (meta: ResumeMeta): ResumeMeta => {
  const updated = JSON.parse(JSON.stringify(meta));

  if (!updated.content) {
    updated.content = {
      hiddenIds: [],
      hiddenSections: [],
      order: {
        oneColumn: [],
        twoColumn: { main: [], sidebar: [] },
      },
    };
    return updated;
  }

  if (!updated.content.order) {
    updated.content.order = {
      oneColumn: [],
      twoColumn: { main: [], sidebar: [] },
    };
  }

  // Ensure oneColumn is an array
  if (!Array.isArray(updated.content.order.oneColumn)) {
    updated.content.order.oneColumn = [];
  }

  // Ensure twoColumn structure is valid
  if (!updated.content.order.twoColumn) {
    updated.content.order.twoColumn = { main: [], sidebar: [] };
  }
  if (!Array.isArray(updated.content.order.twoColumn.main)) {
    updated.content.order.twoColumn.main = [];
  }
  if (!Array.isArray(updated.content.order.twoColumn.sidebar)) {
    updated.content.order.twoColumn.sidebar = [];
  }

  return updated;
};

/**
 * Migrates old layout metadata structure to the new 'order' nested structure.
 * Also serves as a safety initializer for brand-new data (e.g., from AI extraction)
 * that may be missing the 'meta' or 'content' blocks entirely.
 * Removes deprecated fields: sectionOrder, mainSections, sideSections.
 */
export const migrateToNewLayoutStructure = (meta: ResumeMeta): ResumeMeta => {
  const updated = JSON.parse(JSON.stringify(meta));
  // Ensure content exists (Safety for brand-new data, e.g. AI extraction results)
  if (!updated.content) {
    updated.content = {
      hiddenIds: [],
      hiddenSections: [],
      order: {
        oneColumn: [],
        twoColumn: { main: [], sidebar: [] },
      },
    };
    return updated;
  }

  const content = updated.content as unknown as {
    sectionOrder?: string[];
  } & typeof updated.content;

  // Initialize new structure if missing
  if (!content.order) {
    (content as Record<string, unknown>).order = {
      oneColumn: [],
      twoColumn: { main: [], sidebar: [] },
    };
  }
  const order = content.order;

  // 1. Migrate 1-column order
  // Check if old sectionOrder exists and new oneColumn is empty
  if (content.sectionOrder && order.oneColumn.length === 0) {
    order.oneColumn = [...content.sectionOrder];
  }

  // 2. Cleanup deprecated fields
  delete (content as Record<string, unknown>).sectionOrder;

  return updated;
};
