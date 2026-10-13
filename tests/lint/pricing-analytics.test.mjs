import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const DIALOG = 'src/components/monetization/PricingDialog.tsx';
const LANDING = 'src/pages/LandingPage/sections/pricing/usePricing.ts';
const CARD = 'src/components/monetization/pricing/PricingPlanCard.tsx';

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// Phase 7.6 promoted one pricing catalog and one card component out of the
// landing directory so both surfaces render the same thing. The two surfaces'
// analytics deliberately did **not** converge: the landing section attributes
// the purchase to a page section, the dialog does not claim one.
// `PricingPlanCard` calls only `handlePurchase(plan.id)`, which is what let both
// orchestrations survive the merge.
//
// Nothing asserted that until now. The next refactor of the shared card is
// exactly the change that would quietly collapse them into one payload, and the
// loss would be silent — analytics keeps reporting, just not what anyone thinks.
//
// ⚠️ The dialog's half of this used to pin five tab-switching properties —
// `tab`, `initialTab`, `switchedTabs`, `switchCount`, `boughtOtherThanInitial`.
// Passes shared the dialog with a credits tab, and those measured which family
// a buyer arrived on versus bought from. The credits removal left one family, so
// there is no switch to measure and the properties are gone rather than
// unmeasured. What survives is the divergence itself.

test('the dialog identifies the package and claims no source', () => {
  const source = read(DIALOG);
  assert.match(source, /\bpackageId\b/, `${DIALOG} lost packageId`);
  assert.doesNotMatch(
    source,
    /source:\s*'landing_pricing_section'/,
    `${DIALOG} must not adopt the landing section's attribution`,
  );
});

/**
 * ⚠️ Scoped to the CHECKOUT_STARTED payload, not the whole file. `usePricing.ts`
 * spells `landing_pricing_section` twice — once on AUTH_MODAL_OPENED and once on
 * the checkout — so a whole-file match stayed green with the attribution deleted
 * from the payload this test is named for, propped up by the auth line.
 */
function checkoutPayload(file) {
  const source = read(file);
  const at = source.indexOf('ANALYTICS_EVENTS.CHECKOUT_STARTED');
  assert.notEqual(at, -1, `${file} has no CHECKOUT_STARTED call at all`);
  return source.slice(at, source.indexOf(');', at));
}

test('the landing section attributes its purchases and the dialog does not', () => {
  assert.match(
    checkoutPayload(LANDING),
    /source:\s*'landing_pricing_section'/,
    `${LANDING} lost its attribution`,
  );
  assert.doesNotMatch(checkoutPayload(DIALOG), /\bsource\s*:/, `${DIALOG} must not claim a source`);
});

test('the shared card stays out of analytics entirely', () => {
  // The moment the card tracks anything itself, the two payload shapes above
  // stop being separable.
  assert.doesNotMatch(read(CARD), /analytics\./, `${CARD} must leave tracking to its callers`);
});
