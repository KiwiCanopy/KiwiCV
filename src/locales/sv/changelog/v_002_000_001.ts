import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Stay informed: Added a 'What's New' modal that highlights the latest features and improvements after an update.",
  fix_html_preview_scrolling:
    'Resolved an issue where the HTML preview panel could become unscrollable in certain browsers.',
  fix_onboarding_tour_mobile_overlay:
    'Resolved a positioning issue where the onboarding tour card could overlay the spotlighted elements on small screens.',
  fix_sidebar_position_placeholders:
    'Fixed an issue where the sidebar position could not be swapped when previewing with example data.',
  fix_ui_header_action_bubbling:
    'Seamless editor actions: Toggling visibility or adding new items in section headers no longer triggers unwanted expanding or collapsing.',
  perf_ats_rendering_optimization:
    'ATS Optimization: Content in the main column is now always prioritized by screen readers and scanners in all two-column themes.',
  refactor_backend_cleanup:
    'Cleaned up backend and metadata by removing deprecated keys from generated JSON files for a tighter data structure.',
  refactor_package_upgrades:
    'Major under-the-hood optimization with an upgrade to Node 24 (from Node 22) and Vite 8 for a more secure and modern experience.',
  ui_interactive_3d_buttons:
    'Design Unification: Unified the tactile 3D button system across the entire application for a more consistent and premium feel.',
  ui_section_field_ordering:
    'Reorganized editor form fields to align with the visual hierarchy of the rendered CV.',
};
