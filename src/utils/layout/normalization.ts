import type { ResumeData, ResumeMeta } from '@/types/resume';
import {
  getDefaultOneColumnLayout,
  getDefaultTwoColumnLayout,
  normalizeTwoColumnLayout,
} from '@/utils/layout/getters';
import { isTwoColumnTheme } from '@/utils/layout/predicates';
import { clearUnusedLayoutMetadata, migrateToNewLayoutStructure } from '@/utils/layout/structure';
import { validateLayoutMetadata } from '@/utils/layout/validation';

/**
 * Resolves conflicts when a section appears in both main and sidebar columns
 * Main column takes priority - removes from sidebar
 */
export const resolveSectionConflicts = (
  main: string[],
  sidebar: string[],
): { main: string[]; sidebar: string[] } => {
  const mainSet = new Set<string>(main);
  const resolvedSidebar = sidebar.filter((s) => !mainSet.has(s));
  return {
    main,
    sidebar: resolvedSidebar,
  };
};

/**
 * Sanitizes layout metadata to ensure it's safe for rendering.
 * Combines validation, conflict resolution, and data filtering.
 * If validation fails (incomplete or invalid), falls back to theme defaults.
 */
export const sanitizeLayoutMetadata = (meta: ResumeMeta, data: ResumeData): ResumeMeta => {
  let sanitized = migrateToNewLayoutStructure(meta);
  sanitized = clearUnusedLayoutMetadata(sanitized);

  const themeName = sanitized.theme.name;
  const errors = validateLayoutMetadata(sanitized, data);

  if (errors.length > 0) {
    // If there ARE errors (missing sections or invalid keys), we reset to defaults for the current layout mode
    if (isTwoColumnTheme(themeName)) {
      sanitized.content.order.twoColumn = normalizeTwoColumnLayout(
        getDefaultTwoColumnLayout(themeName),
        data,
        sanitized,
      );
    } else {
      sanitized.content.order.oneColumn = getDefaultOneColumnLayout(themeName);
    }
  }

  // Final pass to resolve any lingering conflicts and append missing renderable sections.
  if (isTwoColumnTheme(themeName)) {
    const order = sanitized.content.order;
    const normalized = normalizeTwoColumnLayout(
      {
        main: order.twoColumn.main || [],
        sidebar: order.twoColumn.sidebar || [],
      },
      data,
      sanitized,
    );
    order.twoColumn.main = normalized.main;
    order.twoColumn.sidebar = normalized.sidebar;
  }

  return sanitized;
};
