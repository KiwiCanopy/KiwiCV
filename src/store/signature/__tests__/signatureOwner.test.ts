// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { beforeEach, describe, expect, it } from 'vitest';

/** Owner ruling 2026-11-12 (#108): sign-out keeps it, a different account clears it. */
const SIGNATURE: StoredSignature = { kind: 'typed', id: 'sig', faceId: 'great-vibes', text: 'Ada' };
const store = () => useSignatureStore.getState();

beforeEach(() => {
  store().bindToUser(null);
  localStorage.clear();
  useSignatureStore.setState({ signature: null, ownerUserId: null });
});

describe('the signature across accounts on one browser', () => {
  it('survives sign-out and the same account signing back in', () => {
    store().bindToUser('a');
    store().setSignature(SIGNATURE);
    store().bindToUser(null);
    expect(store().signature).toEqual(SIGNATURE);
    store().bindToUser('a');
    expect(store().signature).toEqual(SIGNATURE);
  });

  it('is cleared, on the device too, when a different account signs in', () => {
    store().bindToUser('a');
    store().setSignature(SIGNATURE);
    store().bindToUser(null);
    store().bindToUser('b');
    expect(store().signature).toBeNull();
    expect(localStorage.getItem(BRAND_STORAGE_KEYS.signature) ?? '').not.toContain('Ada');
  });

  it('a signed-out edit keeps the owner, so the next account cannot inherit it', () => {
    store().bindToUser('a');
    store().setSignature(SIGNATURE);
    store().bindToUser(null);
    store().setSignature({ ...SIGNATURE, faceId: 'alex-brush' });
    expect(store().ownerUserId).toBe('a');
    store().bindToUser('b');
    expect(store().signature).toBeNull();
  });

  it("an auth event in a stale tab never writes that tab's old signature back", () => {
    store().bindToUser('a');
    store().setSignature(SIGNATURE);
    // Another tab of the same account replaced it; this tab's memory is old.
    const newer = { ...SIGNATURE, id: 'newer', text: 'Ada L.' };
    localStorage.setItem(
      BRAND_STORAGE_KEYS.signature,
      JSON.stringify({ state: { signature: newer, ownerUserId: 'a' }, version: 1 }),
    );
    store().bindToUser('a'); // a token refresh
    expect(localStorage.getItem(BRAND_STORAGE_KEYS.signature)).toContain('Ada L.');
    expect(store().signature).toEqual(newer);
  });

  it('one saved signed out goes to whoever signs in, and is then theirs', () => {
    store().setSignature(SIGNATURE);
    store().bindToUser('a');
    expect(store().signature).toEqual(SIGNATURE);
    expect(store().ownerUserId).toBe('a');
    store().bindToUser('b');
    expect(store().signature).toBeNull();
  });

  it('a stored owner survives a reload, so a switch after one is still caught', async () => {
    store().bindToUser('a');
    store().setSignature(SIGNATURE);
    const saved = localStorage.getItem(BRAND_STORAGE_KEYS.signature)!;
    // A reload: memory is empty, storage is what the last tab wrote.
    useSignatureStore.setState({ signature: null, ownerUserId: null });
    localStorage.setItem(BRAND_STORAGE_KEYS.signature, saved);
    await useSignatureStore.persist.rehydrate();
    expect(store().ownerUserId).toBe('a');
    store().bindToUser('b');
    expect(store().signature).toBeNull();
  });
});
