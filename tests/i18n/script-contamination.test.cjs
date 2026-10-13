const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { scriptContaminationBaseline } = require('../../script-contamination-baseline.cjs');
const { ROOT_DIR } = require('../../scripts/i18n/config.cjs');
const {
  checkScripts,
  findScriptContamination,
  foreignScripts,
} = require('../../scripts/i18n/check-scripts.cjs');

// `checkLocales` compares key *structure* across locales and never reads a
// translated value, so a string whose text is half Russian passes every other
// i18n check. Thirteen such strings were live on 2026-07-23 — Cyrillic inside
// Polish words, Korean 의 where Japanese needs の, Japanese 送信 inside a Dutch
// compound — and none had been caught, because the reviewer does not read the
// language and the tooling was not looking at the characters.
//
// `i18n:check` runs this via lint-staged on any locale edit; this test keeps it
// in `npm test` too, so a change that skips the hook still gets caught.

const key = (entry) => `${entry.file} ${entry.key}`;

test('every baselined string still exists at its recorded file and key', () => {
  const present = new Set(findScriptContamination().map(key));
  for (const entry of scriptContaminationBaseline) {
    assert.ok(
      fs.existsSync(path.join(ROOT_DIR, entry.file)),
      `${entry.file} is baselined but missing`,
    );
    assert.ok(
      present.has(key(entry)),
      `${key(entry)} is baselined but no longer contaminated — delete the entry`,
    );
  }
});

test('every baseline entry records the offending fragment and what is wrong', () => {
  for (const entry of scriptContaminationBaseline) {
    assert.ok(
      typeof entry.fragment === 'string' && entry.fragment.length > 0,
      `${key(entry)} needs the offending fragment, so a translator can find it`,
    );
    assert.ok(
      typeof entry.note === 'string' && entry.note.length > 15,
      `${key(entry)} needs a note saying what the correct text should be`,
    );
  }
});

test('no locale string carries a writing system that locale does not use', () => {
  assert.deepEqual(
    checkScripts(),
    [],
    'A translated string contains characters from the wrong script. This is broken ' +
      'text, not a style question — repair the translation rather than baselining it.',
  );
});

test('the detector fires on each contamination this repository actually had', () => {
  // A guard that cannot fail is decoration. These are the real 2026-07-23
  // fragments, kept as fixtures: the corpus they came from is clean now, so
  // asserting against it would prove the rule only while a bug was live.
  const cases = [
    ['es', 'KiwiCV solo может acceder', 'Cyrillic'],
    ['pl', 'pozostaлych dni karnetu premium', 'Cyrillic'],
    ['tr', 'Öнizleme ve düzenleyici', 'Cyrillic'],
    ['ja', '自信を持ってアпиールしましょう', 'Cyrillic'],
    ['ja', '無料의静的ホスティング', 'Hangul'],
    ['zh', '已承担此请求의费用', 'Hangul'],
    ['zh', '该权限是完全可选の', 'Kana'],
    ['nl', 'talloze Word-送信-documenten', 'Han'],
  ];

  for (const [locale, value, expected] of cases) {
    assert.ok(
      foreignScripts(locale, value).includes(expected),
      `${locale} should report ${expected} for "${value}"`,
    );
  }
});

test('the detector does not fire on legitimate text', () => {
  // The other half of the guard's worth: it must not cry wolf, or it gets
  // switched off. Latin is attributed to nobody precisely so these pass.
  const cases = [
    ['de', 'Deine Daten sind durch die DSGVO geschützt. KiwiCV speichert nichts zentral.'],
    ['ru', 'Обработка ИИ происходит во Франкфурте, и защищена GDPR.'],
    ['ja', '私的利用を目的としています。KiwiCV がスウェーデン語に対応しました。'],
    ['ja', 'Välkommen! エディターからエクスポートした履歴書まで。'],
    ['zh', '由于您的内容已经完美，KiwiCV 已承担此请求的费用。'],
    ['pl', 'Optymalizuj swoje CV dowolną liczbę razy w ramach naszej polityki.'],
  ];

  for (const [locale, value] of cases) {
    assert.deepEqual(foreignScripts(locale, value), [], `${locale} false positive on "${value}"`);
  }
});

test('the corpus carries no contamination and the baseline is empty', () => {
  assert.deepEqual(findScriptContamination(), []);
  assert.deepEqual(
    scriptContaminationBaseline,
    [],
    'the baseline was emptied on 2026-07-23 and a new entry would record a bug, not a decision',
  );
});
