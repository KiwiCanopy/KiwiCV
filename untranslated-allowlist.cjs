/**
 * Keys that are legitimately identical in all fifteen locales.
 *
 * Unlike `script-contamination-baseline.cjs`, which must stay empty because an
 * entry there records a bug, an entry here records a **decision**: this string
 * is a name, a URL or an address and is not translated anywhere. Closer in
 * spirit to `bare-literal-baseline.js`.
 *
 * Anything that reads as a sentence does not belong here. If a key is on this
 * list because "nobody has translated it yet", that is the defect the check
 * exists to find — translate it instead.
 *
 * Values under 10 characters never reach the check, so `PDF`, `ZIP` and `EN`
 * need no entry. Neither does a `VERBATIM` row in `handoff-catalog.cjs`.
 */
const untranslatedAllowlist = [
  // Product and company names.
  'extras.howto.hosting.github_pages_title',

  // Example language names, shown as the placeholder of the AI import's "other
  // language" field. The hint above that field asks for the English name of the
  // CV's language, so translating the examples would contradict the very
  // instruction they illustrate.
  'ai.import_language_other_placeholder',

  // URLs and URL-shaped placeholder text.
  'legal.privacy.sections.4.github.link.url',
];

module.exports = { untranslatedAllowlist };
