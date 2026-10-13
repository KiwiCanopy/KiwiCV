import assert from 'node:assert/strict';
import test from 'node:test';

import { scanSource } from '../../scripts/find-bare-literals.cjs';

// The scan once unwrapped a prose attribute one level, to a bare literal only,
// so `aria-label={show ? 'Hide token' : 'Show token'}` and
// `alt={name || 'User Avatar'}` shipped English in every locale with the suite
// green. Every prose-carrying position now walks the whole expression.

const scan = (source) =>
  scanSource('fixture.tsx', source).map(({ kind, value }) => `${kind} ${value}`);

test('a ternary inside a prose attribute reports both arms', () => {
  assert.deepEqual(
    scan(
      `export const A = ({ show }) => <button aria-label={show ? 'Hide token' : 'Show token'} />;`,
    ),
    ['attr:aria-label Hide token', 'attr:aria-label Show token'],
  );
});

test('a || or ?? fallback inside a prose attribute reports the literal', () => {
  assert.deepEqual(
    scan(
      `export const A = ({ name, hint }) => (
        <div>
          <img alt={name || 'User Avatar'} />
          <input placeholder={hint ?? ('Type your name')} />
        </div>
      );`,
    ),
    ['attr:alt User Avatar', 'attr:placeholder Type your name'],
  );
});

test('object properties and announcers walk the same expressions', () => {
  assert.deepEqual(
    scan(
      `export const f = (err, ok) => {
        show({ message: err || 'Something went wrong' });
        addToast(ok ? 'Saved your work' : 'Could not save');
      };`,
    ),
    [
      'prop:message Something went wrong',
      'call:addToast Saved your work',
      'call:addToast Could not save',
    ],
  );
});

test('a prose attribute with no literal in it reports nothing', () => {
  assert.deepEqual(
    scan(`export const A = ({ name, t }) => <img alt={name || t('common.avatar_alt')} />;`),
    [],
  );
});

test('a comparison is not a fallback: only ||, ?? and && yield an operand', () => {
  assert.deepEqual(
    scan(
      `export const A = ({ x, y, t }) => (
        <img alt={x === 'Literal Value' && y} title={x + 'Joined Text'} />
      );`,
    ),
    [],
  );
});
