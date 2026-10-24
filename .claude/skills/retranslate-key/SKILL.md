---
description: Change the English of an existing locale key and get the other 14 retranslated. Use whenever an already-shipped string's English source is edited — the handoff tooling will otherwise keep the stale translations and report nothing to do.
argument-hint: '[module.path.to.key]'
---

Change a shipped string's English and drive the other fourteen locales
through a real retranslation.

**The whole reason this skill exists:** editing the English of a key that
already has translations leaves those translations in place, and every
piece of tooling reports success. `i18n:check` passes, the generator says
"0 cells await translation", and the fourteen locales quietly keep saying
the old thing. Nothing fails. You just ship the previous sentence in every
language but English.

## The three traps, in the order you hit them

1. **The generator recovers from `src/locales`.** It fills any cell whose
   locale file holds a non-English value. A drifted source does not clear
   it — the translation is "present", so it is kept. Blanking cells in the
   packet by hand does not survive the next generate.
2. **Regeneration also preserves the existing packet.** Even after the
   locale files are cleaned, `i18n:handoff:generate` merges with whatever
   the packet directory already holds. The directory has to be deleted.
3. **A recorded English stops applying when the English changes.** Locales
   whose value legitimately equals the English are recorded in `ENGLISH_IN`
   (`handoff-catalog.cjs`) against that English. Change the key's English and
   those locales reopen — correctly, since the old approval was for the old
   words — and `english-in-locales.test.cjs` fails until the entry is updated
   or dropped (#39).

## The sequence

Run it in this order. Steps 1 and 2 are what make the retranslation real;
step 5 is what stops it asking for nonsense.

1. **Drop the key from all 15.**

   ```bash
   node scripts/remove-keys.cjs <module>.<path.to.key>
   ```

   This is the step that cannot be skipped. It is what leaves the generator
   nothing to recover. A key in a file's second export takes the catalog's
   spelling, `themes:theme_translations.sections.x`.

2. **Re-add the new English to all 15.** The other fourteen get their real
   values in the packet at step 6 — since 2026-09-07 you write those too
   (`.claude/rules/i18n.md`), derived from strings the locale already ships.
   English and German remain the two the owner reads at a glance.

3. **Update the catalog source** in `scripts/i18n/handoff-catalog.cjs` so it
   matches the new English exactly, and put the reasoning a translator needs
   into its `context` — what the sentence must not claim, which tags must
   survive, which tokens are product names. `i18n:check` fails on drift
   between the catalog and English, so this is enforced.

4. **Delete the packet directory, then generate.**

   ```bash
   rm -rf .agent/temp_instructions/translation-handoff
   npm run i18n:handoff:generate
   ```

5. **Check the packet asks for your key only.** A clean tree's packet opens no
   cell (`english-in-locales.test.cjs` pins that), so every blank is yours:

   ```bash
   python3 -c "
   import json, glob
   D='.agent/temp_instructions/translation-handoff'
   keys={k for f in glob.glob(f'{D}/*.json') for k,v in json.load(open(f)).items() if v.get('translation','')==''}
   print('blank keys:', keys)"
   ```

   It must print your key and nothing else. If your key had an `ENGLISH_IN`
   entry, decide per locale whether the new English is still right there, and
   update the entry's `english` or drop it in the same change.

6. **Hand over the packet**, then `--check`, then `--apply`:

   ```bash
   npm run i18n:handoff:import -- --check
   npm run i18n:handoff:import -- --apply
   ```

## ⚠️ Never trust "recovered"

The generator reports how many translations it recovered. Recovered means
_found_, never _still correct_. On 2026-08-28 it recovered `it` and `tr`
hero subtitles that were translations of the **previous** English sentence,
with the required `<strong>` tags missing — non-empty, so every blank-cell
check passed them, and a human scanning for empty strings would skip right
past. Two locales would have shipped the wrong sentence.

If a cell is filled but its source changed, it is stale. Drop the key.

## Verify by reading, not by exit code

Before `--apply`, check the cells yourself rather than trusting the
importer's verdict:

- no cell equals its English `source` (except where the word genuinely is
  the English one, which you restored in step 5);
- `rich` entries keep their tags, balanced, and wrapping **the same clause**
  — word order moves, and the emphasis has to move with it;
- protected tokens survive with their exact capitalisation;
- the claim did not widen. A translator will smooth a hedge into a promise
  if the context does not forbid it.

## After applying

Run the gate (`/verify-gate`). `i18n:check` and `test:i18n` both read these
files, and `test:i18n` is the one that catches a protected token listed for
a string that does not contain it.

⚠️ None of these checks can see **wrong meaning**. A valid string, correctly
keyed, in the right file, passes everything — including when it is the wrong
sentence, or belongs to a different section. Read the diff.
