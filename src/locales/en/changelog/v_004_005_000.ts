export const v_004_005_000 = {
  _highlights: {
    custom_sections: {
      badge: 'Custom Sections',
      content:
        'Your CV is no longer limited to the standard sections. Add your own — Conferences, Key Achievements, anything that tells your story — fill it like any other section, and it fits every design, in the preview and the PDF. Improve with AI and translation work on it too.',
      title: 'Sections of Your Own',
    },
  },
  chore_dependency_updates:
    'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  feat_custom_sections:
    'Add your own sections to your CV — Conferences, Key Achievements, or anything the standard sections don\'t cover. Find "Add section" at the end of the section list, give it a title, and fill it with entries just like any other section: name, dates, link, summary and highlights. Custom sections look at home in every design, in the preview and the PDF, and can be moved between columns in the layout editor like the rest. Improve with AI works on them and on each of their entries, and translating your CV translates their titles and entries too.',
  feat_json_round_trip:
    "Importing a CV file from another tool no longer throws away what KiwiCV can't show. Extra blocks in the file, and your projects' roles and keywords, are kept with your CV and come back unchanged when you export it or back it up to Google Drive or a private GitHub repository. They never appear on your CV or reach the AI, and the import tells you which blocks it kept.",
  feat_privacy_by_design:
    'KiwiCV keeps shaping its workflows around your privacy. A GitHub repository anyone can read — public, or published with GitHub Pages — now receives only what your CV shows: hidden entries, address parts you left off and your cover letter stay out. A private repository keeps the complete backup, and the connection dialog tells you which is which. Photos inside an imported CV file lose their camera metadata, GPS location included, before they are saved.',
  fix_hidden_entries_stay_hidden:
    'Anything you hide stays hidden. Editing, moving, sorting or deleting another entry could bring a hidden one back, and so could an AI reorganization of your skills or the sample preview of an empty CV. The same edits no longer quietly accept an AI suggestion you have not answered.',
  fix_keyboard_screen_reader:
    'Smoother with a keyboard and a screen reader: a new first entry opens straight away, the network field works as a proper list, and buttons are announced by name.',
  fix_language_polish:
    'Language polish across the app: corrected section headings in Italian, Bulgarian, Turkish and Portuguese, a dotted capital İ on Turkish CVs, the last English screens translated, and real sample content in an empty CV in twelve languages.',
  fix_reduced_json_hides_sections:
    'The "Reduced" JSON on the Raw JSON page now leaves out everything your CV hides — a whole section you hid and a profile photo you hid — as well as the address parts your CV leaves out and project fields kept only from an imported file.',
};
