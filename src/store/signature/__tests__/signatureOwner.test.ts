// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { beforeEach, describe, expect, it } from 'vitest';

/** Owner ruling 2026-11-12 (#108): sign-out keeps it, a different account clears it. */
const SIGNATURE: StoredSignature = { kind: 'typed', id: 'sig', faceId: 'great-vibes', text: 'Ada' };
const store = () => useSignatureStore.getState();

beforeEach(() => {
  localStorage.clear();
  useSignatureStore.setState({ signature: null, ownerUserId: null, sessionUserId: null });
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
    useSignatureStore.setState({ signature: null, ownerUserId: null, sessionUserId: null });
    localStorage.setItem(BRAND_STORAGE_KEYS.signature, saved);
    await useSignatureStore.persist.rehydrate();
    expect(store().ownerUserId).toBe('a');
    store().bindToUser('b');
    expect(store().signature).toBeNull();
  });
});
