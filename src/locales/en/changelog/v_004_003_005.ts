export const v_004_003_005 = {
  chore_dependency_updates:
    'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  fix_ai_proposal_diff:
    'AI proposals are easier to read and to answer. Added and removed lines now carry their own tint instead of a colour alone, the two choices stay legible in dark mode, and they sit under the wording they belong to — keep yours on the left, take the proposal on the right.',
  fix_ai_stuck_dialog:
    'A hung AI run no longer traps its progress window open. The window refused to close while a run was stuck, and reloading brought it straight back and started the same run again — so the one way out made it worse. It stays closable now, and a reload leaves it shut.',
  fix_ai_translate_addon:
    'Ticking "Also translate my CV" now actually translates it. The language box beside it opened on the language the CV was already in, which the run read as "nothing to translate" — so the CV came back tailored to the job ad but still in its original language, with no sign that the request had been dropped.',
  fix_cover_letter_footer:
    'The signature line under your cover letter follows your PDF Footer settings now, the same way the one under your CV does. It used to copy the date field at the top of the letter, so clearing that field emptied the signature too and the two could never differ.',
  fix_cvs_connect_button:
    'Connecting cloud storage from My CVs works end to end again. The "Connect cloud storage" button did nothing at all when you were signed in without a provider connected, and the dialog behind it led with a button that only returned you to the page you were already on.',
};
