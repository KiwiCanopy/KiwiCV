import { createDefaultCoverLetter } from '@/types/resume';
import { isImageVisible } from '@/utils/visibility';

/**
 * Zustand persist migration for the resume store. Extracted from the store
 * config so the individual version steps can be unit-tested in isolation.
 *
 * Each block is written as `if (version <= N)` so a store several versions
 * behind runs every step in order up to the current version.
 */
export const migrateResumeStore = (persistedState: unknown, version: number): unknown => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = persistedState as any;
  if (version === 0) {
    // Migration from v0 to v1: Ensure new fields exist
    if (state && state.resume) {
      if (!state.resume.privateProjects) {
        state.resume.privateProjects = [];
      }
      if (state.resume.meta && state.resume.meta.content) {
        if (!state.resume.meta.content.hiddenIds) {
          state.resume.meta.content.hiddenIds = [];
        }
      }
    }
  }

  if (version <= 1) {
    // Migration to v2: Move sync from resume.meta to top-level
    if (state && state.resume?.meta?.sync) {
      state.sync = state.resume.meta.sync;
      delete state.resume.meta.sync;
    }

    // Ensure default sync config exists and contains all required services
    if (state) {
      if (!state.sync) {
        state.sync = {
          github: { enabled: false },
          googleDrive: { enabled: false },
        };
      } else {
        // Patch missing service properties if state.sync already exists
        if (!state.sync.github) {
          state.sync.github = { enabled: false };
        }
        if (!state.sync.googleDrive) {
          state.sync.googleDrive = {
            enabled: false,
            lastSync: '',
          };
        } else {
          // Ensure new fields exist even if the service was already part of the state
          if (!state.sync.googleDrive.lastSync) state.sync.googleDrive.lastSync = '';
        }
      }
    }
  }
  if (version <= 2) {
    // Migration to v3: Move meta.ui settings to theme params and temporary migration key
    if (state && state.resume?.meta?.ui) {
      const ui = state.resume.meta.ui;

      // Ensure theme structure exists
      if (!state.resume.meta.theme) state.resume.meta.theme = {};
      if (!state.resume.meta.theme.params) state.resume.meta.theme.params = {};

      // Move imageShape to theme params
      if (ui.imageShape) {
        state.resume.meta.theme.params.imageShape = ui.imageShape;
      }

      // Save other UI settings to temporary migration key for UIStore to pick up
      try {
        localStorage.setItem(
          'cv_canvas_migration_ui',
          JSON.stringify({
            appLanguage: ui.language,
            appTheme: ui.theme,
            sidebarCollapsed: ui.sidebarCollapsed,
          }),
        );
      } catch (e) {
        console.error('Migration failed to save UI settings', e);
      }

      delete state.resume.meta.ui;
    }
  }
  if (version <= 4) {
    // Migration to v5: Migrate skills level 0-100 to 1-4 scale
    if (state && state.resume && Array.isArray(state.resume.skills)) {
      state.resume.skills.forEach((skill: { level?: number | string | null }) => {
        if (skill.level !== undefined && skill.level !== null && skill.level !== '') {
          const val = typeof skill.level === 'number' ? skill.level : parseFloat(skill.level);
          if (!isNaN(val) && val > 0) {
            if (val >= 1 && val <= 4) {
              skill.level = Math.round(val);
            } else if (val <= 39) {
              skill.level = 1;
            } else if (val <= 69) {
              skill.level = 2;
            } else if (val <= 89) {
              skill.level = 3;
            } else if (val <= 100) {
              skill.level = 4;
            } else {
              skill.level = undefined;
            }
          } else {
            skill.level = undefined;
          }
        } else {
          skill.level = undefined;
        }
      });
    }
  }
  if (version <= 5) {
    // Migration to v6: Seed the cover letter block (disabled, with defaults) so
    // stores created before the feature have a well-formed object to edit.
    if (state && state.resume && !state.resume.coverLetter) {
      state.resume.coverLetter = createDefaultCoverLetter();
    }
  }

  if (version <= 6) {
    // Migration to v7: seed the pass-through block and the JSON Resume
    // project fields now on the item shape. No lift here — no v6 store has a
    // pass-through block; a later step for a newly modelled key lifts first and
    // seeds its default only when absent (ops/DATAMODEL.md).
    const resume = state?.resume;
    if (resume) {
      if (!resume.passthrough || typeof resume.passthrough !== 'object') resume.passthrough = {};

      for (const section of ['projects', 'privateProjects']) {
        if (!Array.isArray(resume[section])) continue;
        for (const item of resume[section]) {
          if (!item || typeof item !== 'object') continue;
          if (!Array.isArray(item.roles)) item.roles = [];
          if (!Array.isArray(item.keywords)) item.keywords = [];
        }
      }
    }
  }

  if (version <= 7) {
    // Migration to v8: `customSections` is modelled now. Lift a copy held in
    // pass-through FIRST, then seed the default only if still absent — seeding
    // first would let `[]` win and lose the user's sections (ops/DATAMODEL.md).
    const resume = state?.resume;
    if (resume) {
      const held = resume.passthrough?.customSections;
      if (resume.customSections === undefined && Array.isArray(held)) {
        resume.customSections = held;
      }
      if (resume.passthrough && typeof resume.passthrough === 'object') {
        delete resume.passthrough.customSections;
      }
      if (!Array.isArray(resume.customSections)) resume.customSections = [];
    }
  }

  if (version <= 8) {
    // Migration to v9: a hidden photo has one store, `basics:image` in
    // `hiddenIds`. Fold a stored `basics.imageVisible: false` into it, then drop
    // the field, which nothing writes.
    const resume = state?.resume;
    if (resume?.basics && typeof resume.basics === 'object') {
      if (resume.basics.imageVisible === false) {
        // Created rather than skipped: dropping the flag with nowhere to fold it
        // would unhide the photo.
        if (!resume.meta || typeof resume.meta !== 'object') resume.meta = {};
        if (!resume.meta.content || typeof resume.meta.content !== 'object')
          resume.meta.content = {};
        const content = resume.meta.content;
        if (!Array.isArray(content.hiddenIds)) content.hiddenIds = [];
        if (isImageVisible(content.hiddenIds)) content.hiddenIds.push('basics:image');
      }
      delete resume.basics.imageVisible;
    }
  }

  if (version <= 9) {
    // Migration to v10: a pending proposal no longer carries
    // `isOriginalActive`, which only the retired `toggleAISuggestion` read.
    const suggestions = state?.ai?.suggestions;
    if (suggestions && typeof suggestions === 'object') {
      for (const suggestion of Object.values(suggestions)) {
        if (suggestion && typeof suggestion === 'object') {
          delete (suggestion as Record<string, unknown>).isOriginalActive;
        }
      }
    }
  }

  return state;
};
