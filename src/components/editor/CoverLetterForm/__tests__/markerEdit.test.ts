import {
  insertLink,
  isSymmetricMarkerActive,
  toggleSymmetricMarker,
} from '@/components/editor/CoverLetterForm/markerEdit';
import { describe, expect, it } from 'vitest';

const BOLD = '**';
const ITALIC = '_';

describe('toggleSymmetricMarker', () => {
  it('wraps an unmarked selection', () => {
    const r = toggleSymmetricMarker('hello world', 6, 11, BOLD);
    expect(r.text).toBe('hello **world**');
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe('world');
  });

  it('unwraps when markers are inside the selection', () => {
    // Selection covers the whole `**world**`.
    const r = toggleSymmetricMarker('hello **world**', 6, 15, BOLD);
    expect(r.text).toBe('hello world');
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe('world');
  });

  it('unwraps when markers sit just outside the selection', () => {
    // Selection covers only `world`, markers are the neighbours.
    const r = toggleSymmetricMarker('hello **world**', 8, 13, BOLD);
    expect(r.text).toBe('hello world');
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe('world');
  });

  it('drops an empty marker pair at a collapsed caret', () => {
    const r = toggleSymmetricMarker('ab', 1, 1, ITALIC);
    expect(r.text).toBe('a__b');
    expect(r.selectionStart).toBe(2);
    expect(r.selectionEnd).toBe(2);
  });

  it('nests distinct markers rather than colliding', () => {
    const r = toggleSymmetricMarker('_x_', 0, 3, BOLD);
    expect(r.text).toBe('**_x_**');
  });
});

describe('isSymmetricMarkerActive', () => {
  it('detects markers inside the selection', () => {
    expect(isSymmetricMarkerActive('hello **world**', 6, 15, BOLD)).toBe(true);
  });

  it('detects markers outside the selection', () => {
    expect(isSymmetricMarkerActive('hello **world**', 8, 13, BOLD)).toBe(true);
  });

  it('is false for an unmarked selection', () => {
    expect(isSymmetricMarkerActive('hello world', 6, 11, BOLD)).toBe(false);
  });

  it('does not treat a bare marker pair as active', () => {
    expect(isSymmetricMarkerActive('****', 0, 4, BOLD)).toBe(false);
  });
});

describe('insertLink', () => {
  it('uses the selection as the label', () => {
    const r = insertLink('see docs here', 4, 8, 'https://x.dev', 'link');
    expect(r.text).toBe('see [docs](https://x.dev) here');
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe('docs');
  });

  it('falls back to a label at a collapsed caret', () => {
    const r = insertLink('', 0, 0, 'https://x.dev', 'link');
    expect(r.text).toBe('[link](https://x.dev)');
    expect(r.text.slice(r.selectionStart, r.selectionEnd)).toBe('link');
  });
});
