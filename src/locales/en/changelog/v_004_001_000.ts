export const v_004_001_000 = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Cover Letters',
      content:
        "Cover letters arrive in KiwiCV. Write one that shares your CV's exact design and export both together as a single, polished application package — no more mismatched documents.",
      title: 'Cover Letters, Perfectly Matched',
    },
  },
  chore_ai_model_upgrade:
    "KiwiCV's AI now runs on Google's newest Gemini generation (Gemini 3.1) for noticeably better suggestions. Privacy is unchanged: processing stays exclusively in the EU, GDPR-compliant, and your data is never used to train AI models.",
  chore_dependency_updates:
    'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  feat_matching_cover_letters:
    "Craft a cover letter that matches your CV's design and export both together as one application package. Style the text with bold, italics, and links, choose a classic DIN 5008 or a theme-matched layout, and show or hide the sender, recipient, and signature blocks to fit each role.",
  fix_design_settings_reset:
    'Your design settings now stay put while you edit. The bold-header choice for Work and Education, a custom address layout, and the GitHub hosting target path used to snap back to their defaults the moment you added, reordered, or edited an entry in any list section — with no warning and nothing to undo. Custom section headings carried in an imported CV survive every edit now too.',
  fix_elegant_page_breaks:
    'Manual page breaks now work on the Elegant theme. Ticking one had no effect on the exported PDF; it now starts a new page exactly where you asked, like every other theme.',
  fix_empty_custom_address_layout:
    'A custom address layout with nothing usable left in it no longer wipes your address. Removing every field from the custom layout in Design used to drop the address from your CV and your PDF completely, with nothing on screen to explain why. KiwiCV now falls back to the standard layout for your country instead.',
  fix_footer_date_round_trip:
    'Switching the CV footer date off now survives an export and re-import, and a date you typed yourself is kept exactly as written instead of being cleared.',
  fix_import_list_warnings:
    'Import warnings now cover lists. When KiwiCV has to drop something it cannot read from the highlights of a job, the courses of a degree or the keywords of a skill, it names the entry and the field in the import summary instead of quietly leaving the list shorter than the file you gave it.',
  fix_import_warning_headings:
    'Import warnings now name the part of your CV they came from, including your personal details, instead of showing an internal label.',
  fix_imported_list_fields:
    'A CV file whose bullet lists are not quite right no longer breaks your preview. If an imported JSON wrote the highlights of a job, the courses of a degree, or the keywords of a skill as a single line of text instead of a list, the preview and the PDF stopped rendering entirely. KiwiCV now reads what it can and quietly skips the rest.',
  fix_imported_text_fields:
    'Contact details that arrive in the wrong shape no longer break your CV. If an imported file wrote your name, website, phone or city as something other than plain text, the preview or the PDF could stop rendering completely. KiwiCV now reads what it can, and it tidies stray spaces around your name and address so themes that split the name across two lines no longer show a blank first line.',
  fix_imported_theme_name:
    'A CV imported with an unrecognised design name now renders all of its sections instead of coming back nearly blank.',
  fix_missing_sections_single_column:
    'Sections you filled in after rearranging your layout no longer go missing on single-column themes — every section with content appears in the preview and the exported PDF.',
  fix_pdf_special_characters:
    "Special characters and links in your CV now export reliably across every theme's PDF.",
  fix_preview_pdf_parity:
    'What you see now matches what you export. Renamed section headings, per-theme details, the icons beside them, and project sections on several two-column themes could differ between the on-screen preview and the exported PDF — the two now render identically.',
  fix_reload_repairs_cv:
    'Reloading a CV built from an unusual import no longer breaks it. KiwiCV repairs an out-of-shape value when you reopen the app — the same way it already did on import — instead of failing to render.',
  fix_signature_footer:
    'The signature footer is fixed: it now leaves room to actually sign, no longer pushes an empty final page onto longer CVs, and appears on the Elegant, Plain and Plain 2 themes that were missing it.',
  fix_stackoverflow_page_breaks:
    'Manual page breaks work again on the StackOverflow theme. Setting one used to stop the PDF from being produced at all; the preview and the export now break exactly where you asked.',
  fix_theme_fonts:
    'Elegant, Timeless and JavaScript now preview in the typefaces they were designed with. The preview had been falling back to a generic system font, and the Timeless PDF was exporting in a different one again — all three now look the same on screen as they do in the finished document.',
  fix_two_column_stray_breaks:
    'On the Lunar, Misty and Swiss Grid themes, a section whose entries you have all hidden no longer drags its manual page break into the exported PDF, so there is no empty column where the section used to be.',
  other_discord_community:
    'KiwiCV now has a Discord community — a place to swap feedback, request templates, and support each other through the job hunt. A link waits in the footer and on the landing page.',
  other_export_no_google_fonts:
    'Opening an exported HTML CV no longer contacts Google for fonts. It uses the same font files KiwiCV already serves, so the page renders identically without telling anyone else that you opened it.',
  other_import_clear_warning:
    "When an imported value has to be cleared because it isn't text, KiwiCV now tells you in the import summary instead of doing it silently.",
  other_kiwicanopy_family:
    'Meet the rest of the KiwiCanopy family — KiwiCV now links to KiwiCanopy and KiwiDesk from the About page.',
};
