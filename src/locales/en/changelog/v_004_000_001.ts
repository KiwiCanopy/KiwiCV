export const v_004_000_001 = {
  chore_dependency_updates:
    'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  fix_migration_notice:
    'If you still reach KiwiCV through its previous web address, the notice there now tells you exactly when that address stops working: 31 October 2026.',
  fix_mobile_checkout:
    'Swiping through the pricing cards on a phone no longer opens checkout by accident. Only the button starts a purchase.',
  fix_preview_reliability:
    'The preview no longer gets stuck on an endless spinner. A blocked popup now tells you that is what happened, a render that stalls stops with a readable explanation, and the preview keeps working even when an outside service is slow or unreachable.',
  fix_save_status:
    'The "saved on this device" note now reflects what has really been stored, instead of showing the same reassurance whatever happened.',
  fix_translations:
    'Repaired thirteen texts that had picked up letters from the wrong alphabet — Cyrillic characters inside Spanish and Turkish words, Korean and Japanese ones inside Chinese — and closed the last gaps across all fifteen languages.',
  perf_preview_speed:
    'The first preview appears far sooner. KiwiCV used to load every typeface it might ever need before it could draw anything, including two very large Chinese and Japanese ones. Those now load only if your CV actually uses those characters.',
  ui_polish:
    'A round of visual polish: headings use a genuine extra-bold typeface rather than one the browser thickens artificially, form labels and placeholders are easier to read, and section cards share one consistent accent instead of each picking its own colour.',
};
