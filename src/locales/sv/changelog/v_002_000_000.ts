import type { Translations } from '@/locales/en';

export const v_002_000_000: Translations['changelog']['entries']['v_002_000_000'] = {
  _highlights: {
    'dashboard-view': {
      badge: 'Dashboard',
      content:
        'Inget mer växlande mellan förhandsgranskning och redigerare! Den helt nya dashboard-vyn samlar allt i ett sömlöst gränssnitt sida vid sida.',
      title: 'Allt-i-ett-dashboard',
    },
  },
  feat_chronological_sort:
    'Smart Chronology: Automatically sort any section containing date fields chronologically with a single click.',
  feat_dashboard_available_sections_add:
    'Add previously empty sections with a single click directly from the Design tab.',
  feat_dashboard_raw_json_tab_memory:
    'Dashboard and Raw JSON tabs now remember the selected view after reloading',
  feat_design_direct_edit_hide:
    'You can now hide individual sections of your resume directly from the layout order tab or jump straight to the correct spot in the editor for refinement.',
  feat_flexible_layout:
    'Template Engine Revamp — Comprehensive upgrade of all themes to support fully dynamic section placement and layout flexibility',
  feat_image_editor_reset: 'You can now reset zoom and rotation levels separately',
  feat_image_visibility_toggle: 'Ability to hide the profile photo on the resume',
  feat_layout_editor_hints:
    'Added descriptive hints for all sections in the Layout Editor to help you organize your content effortlessly.',
  feat_layout_hints_sparkles:
    'Introduced Layout Hints (✨) across all forms to clearly indicate fields that are only visible in the main column',
  feat_manual_page_breaks:
    'Take control of your layout with manual page breaks for perfect multi-page resumes',
  feat_mobile_support:
    'Build & Refine Anywhere: Introducing Mobile Support. Create and perfect your resume on the go with our new touch-optimized interface.',
  feat_sidebar_flip_transition:
    'Finally, you can choose the sidebar position for all two-column layouts yourself - left or right, with a smooth mirror animation.',
  feat_social_profile_iconography:
    'Precision-matched social profile iconography for GitHub, LinkedIn, and Portfolio types',
  feat_theme_miniatures:
    'High-fidelity theme miniatures: Get a perfect first impression of every design before you even select it.',
  fix_preview_loading_hang:
    'Hardened preview rendering system to prevent loading hangs and handle complex edge cases',
  fix_reduced_json_internal_ids: 'Reduced JSON exports no longer include internal visibility IDs',
  ui_categorized_changelog:
    'Redesigned the changelog with categorized sections for better readability',
  ui_image_editor_visuals: 'A fresh look for the image editor',
  ui_layout_column_filter:
    'Enhanced the template selection experience with an intuitive new One and Two-column layout filter.',
  ui_localized_editor_placeholders:
    'Placeholders in the editor and resume preview for completely empty resumes now match the resume language instead of the UI language',
};
