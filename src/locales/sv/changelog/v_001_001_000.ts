import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Ensured ATS-friendly format for generated PDF files',
  feat_github_backup:
    'On push to GitHub (from the preview tab) your configuration will also be updated according to the current state',
  feat_mock_data_preview:
    'If no data is provided, mock data will be used to fill the preview templates, allowing you to see a preview immediately',
  feat_onboarding_flow: 'Enhanced the onboarding experience with an improved welcome flow',
  fix_link_references: 'several link references in PDF and HTML themes optimized',
  fix_lunar_sidebar_header:
    'Fixed an issue where the sidebar headers were not displayed in the Lunar theme',
  fix_netlify_routing: 'Fixed an issue where refreshing subpages on Netlify caused a 404 error',
  fix_welcome_modal_scroll:
    'Fixed an issue where the welcome modal was not scrollable on smaller screens',
};
