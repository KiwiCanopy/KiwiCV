export const raw_json = {
  copy_clipboard: 'Copy to clipboard',
  data_label: 'Raw data',
  download: 'Download JSON',
  full: 'Full',
  full_desc: 'Meta + Visible flags (Best for import to KiwiCV)',
  full_title: 'Full App State',
  passthrough: {
    desc: 'Kept so other tools can still read your file. Included in your JSON exports and in Drive and private GitHub backups; never shown on your CV or sent to AI.',
    remove_confirm_message:
      'Files you export from KiwiCV will no longer contain this block. This cannot be undone.',
    remove_confirm_title: 'Remove “{{name}}”?',
    removed_desc:
      'Your next sync replaces your current backup. Earlier snapshots, and earlier versions kept by Drive and GitHub, still contain it until you delete them there.',
    removed_title: 'Removed “{{name}}” from this browser',
    title: 'Extra data from an imported file',
  },
  reduced: 'Reduced',
  reduced_desc: 'Hidden items removed',
  reduced_title: 'Reduced JSON',
  standard: 'Standard',
  standard_desc: 'No Meta, All Items',
  standard_title: 'Standard JSON',
};
