export const v_004_004_000 = {
  _highlights: {
    ai_cover_letters: {
      badge: 'AI',
      content:
        'KiwiCV writes your cover letter now. Paste the job ad and get a letter drawn from the CV you already have — set its length and tone, or hand over a sample of your own writing and have it match your voice instead. It arrives as a proposal you can read beside your draft and accept paragraph by paragraph.',
      title: 'Cover Letters, Written for You',
    },
  },
  chore_dependency_updates:
    'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  feat_ai_cover_letters:
    'Your cover letter can be written for you, from a job ad and the CV you already have. Choose a length and a tone, or hand over a sample of your own writing and KiwiCV matches that voice instead. The letter comes back as a proposal you can read beside your draft and accept paragraph by paragraph — offered whether the letter is empty or already started. The section now opens on the letter itself, rather than on five fields of recipient addressing for something you have not written yet.',
  fix_ai_large_cv_wait:
    'Improving or translating a large CV no longer stops with an error after a minute — the wait now grows with the size of the CV.',
  fix_dates:
    'Dates behave themselves again. One you entered could move back a day outside Europe, and a year on its own could lose the year entirely; the picker let a stray click near the edge of the grid jump you into the neighbouring month, and year, without saying so; and "Sort entries chronologically" could not read day-first dates like 15.03.2019 at all, so those entries sank to the bottom as though they had no date.',
  fix_keyboard_navigation:
    'Working with the keyboard no longer drops you at the top of the page. Closing a dialog returns you to the button you opened it from, deleting an entry or a saved CV leaves you on the next one, and answering an AI suggestion keeps you where you were working. Your profile photo can be reached from the keyboard at all now — the tile answered a mouse click only, so Edit, Replace and Delete were out of reach.',
  fix_main_badge_overlaps_label:
    'The "main" badge beside a field label no longer sits on top of the label text. It was rendered inside a box sized for an icon, so a wider badge spilled out of it and back over the words next to it.',
};
