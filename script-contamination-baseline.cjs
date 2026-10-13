/**
 * Locale strings carrying characters from a writing system that locale does not
 * use — the class `scripts/i18n/check-scripts.cjs` guards against.
 *
 * **This list is empty, and should stay empty.**
 *
 * Thirteen such strings were live on 2026-07-23 and were all repaired the same
 * day: Cyrillic inside Polish, Spanish and Turkish words (`pozostaлych`,
 * `solo может`, `Öнizleme`), Korean 의/적 where Japanese needed の/的, Japanese
 * の inside Chinese, and Japanese 送信 spliced into a Dutch compound.
 *
 * The failure mode is worth recognising, because it will recur: a wrong-language
 * particle or homoglyph substituted for the right one. It is what a multilingual
 * model produces when it loses the target language mid-string, and it survives
 * review because a reader who does not know the language sees plausible text.
 *
 * Unlike `bare-literal-baseline.js`, where an entry records a defensible
 * decision, **an entry here would record a bug**. Nothing about broken text is
 * defensible, so the correct response to a new finding is to fix the string,
 * not to list it. Add an entry only to unblock an unrelated change you cannot
 * hold, and open an issue in the same breath.
 *
 * `checkScripts()` fails on a stale entry as well as on an unlisted finding, so
 * an exemption cannot outlive the string it covers.
 *
 * Matched on file and key, not line number: a string that moves within its file
 * is the same decision.
 */
const scriptContaminationBaseline = [];

module.exports = { scriptContaminationBaseline };
