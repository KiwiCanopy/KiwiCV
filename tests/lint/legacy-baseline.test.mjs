import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  directClsxAndRawRadixDialog,
  directClsxOnly,
  legacyControlClasses,
  rawRadixDialogOnly,
} from '../../eslint-legacy-baseline.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const LEGACY_CONTROL_CLASS = /btn-3d\b|badge-primary-3d/;
const DIRECT_CLSX = /from 'clsx'/;
const RAW_RADIX_DIALOG = /@radix-ui\/react-(alert-)?dialog/;

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const importEntries = [...directClsxOnly, ...rawRadixDialogOnly, ...directClsxAndRawRadixDialog];

// The baseline freezes pre-existing violations of the product-chrome lint guards
// so they can run as errors on new code. It only earns its keep if it shrinks as
// Phase 7 migrates each surface, so these assertions fail on a stale entry: a
// file that moved away, or one already migrated and still carrying an exemption.

test('every baselined file still exists', () => {
  for (const file of [...legacyControlClasses, ...importEntries]) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} is baselined but missing`);
  }
});

test('every legacy-control entry still uses a legacy control class', () => {
  for (const file of legacyControlClasses) {
    assert.match(read(file), LEGACY_CONTROL_CLASS, `${file} no longer needs its exemption`);
  }
});

test('every clsx entry still imports clsx directly', () => {
  for (const file of [...directClsxOnly, ...directClsxAndRawRadixDialog]) {
    assert.match(read(file), DIRECT_CLSX, `${file} no longer needs its exemption`);
  }
});

test('every raw-dialog entry still composes a raw Radix dialog', () => {
  for (const file of [...rawRadixDialogOnly, ...directClsxAndRawRadixDialog]) {
    assert.match(read(file), RAW_RADIX_DIALOG, `${file} no longer needs its exemption`);
  }
});

test('the three import lists stay disjoint and correctly split', () => {
  assert.equal(new Set(importEntries).size, importEntries.length);

  for (const file of directClsxOnly) {
    assert.doesNotMatch(read(file), RAW_RADIX_DIALOG, `${file} belongs in the combined list`);
  }
  for (const file of rawRadixDialogOnly) {
    assert.doesNotMatch(read(file), DIRECT_CLSX, `${file} belongs in the combined list`);
  }
});
