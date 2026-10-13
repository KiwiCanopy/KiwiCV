import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { COVER_LETTER_STYLE_MAX } from '@/constants/ai';

const STORAGE_KEY = BRAND_STORAGE_KEYS.coverLetterStyle;
const FRESH_SIGN_IN_KEY = BRAND_STORAGE_KEYS.coverLetterStyleFreshSignIn;

/** Bumped whenever the stored shape changes. A mismatch discards, never migrates. */
const STYLE_VERSION = 1;

/** The signed-in user every write is stamped with; null while signed out. */
let styleOwner: string | null = null;

/**
 * Live hook instances, so a write in one is not invisible to the others.
 *
 * ⚠️ **Not a cache.** Every listener re-reads `localStorage`, which stays the
 * single source of truth — a module-level copy of the sample would make the
 * "survives a reload" test pass without the value ever reaching storage, which
 * is the vacuity `__tests__/useCoverLetterStyle.test.ts` exists to rule out.
 *
 * This matters because the app mounts the hook TWICE: the AI modal owns the field,
 * the composer band shows a one-line summary of it, and the band's summary must
 * not keep describing the sample the user just replaced.
 */
const listeners = new Set<(origin: symbol) => void>();

/** Origin of a clear no mount asked for; every mount drops its pending write. */
export const EXTERNAL_CLEAR = Symbol('coverLetterStyle.externalClear');

/** Origin of a change of signed-in account; mounts re-read what they may show. */
const OWNER_CHANGED = Symbol('coverLetterStyle.ownerChanged');

export function subscribeCoverLetterStyle(listener: (origin: symbol) => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

const readRecord = (): Record<string, unknown> | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
};

/**
 * The stored sample, clamped; '' when it is stamped for an account other than
 * the signed-in one, signed out included. Never throws — it runs during a
 * render, and the entry is plain text a user can hand-edit.
 */
export function readCoverLetterStyle(): string {
  try {
    const record = readRecord();
    if (!record) return '';
    if (record.v !== STYLE_VERSION || typeof record.sample !== 'string') return '';
    if (record.owner !== undefined && record.owner !== styleOwner) return '';
    return record.sample.slice(0, COVER_LETTER_STYLE_MAX);
  } catch {
    return '';
  }
}

/** The one writer of the record; stamps it with the signed-in account. */
function persist(sample: string): void {
  try {
    if (!sample) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const owner = styleOwner ? { owner: styleOwner } : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STYLE_VERSION, sample, ...owner }));
    }
  } catch {
    // A full or blocked storage is not worth failing a cover-letter run over.
  }
}

const notify = (origin: symbol) => {
  for (const listener of listeners) listener(origin);
};

/** Writes (or, for '', removes) the sample and tells every other mount. */
export function writeCoverLetterStyle(sample: string, origin: symbol): void {
  persist(sample);
  // Even after a refused write: the other mounts must not describe a sample
  // this session no longer holds.
  notify(origin);
}

/**
 * Forgets the stored sample from outside React — sign-out. Mounted hooks
 * empty too, and a debounced write still in flight is cancelled rather than
 * allowed to restore the sample afterwards.
 */
export function clearStoredCoverLetterStyle(): void {
  writeCoverLetterStyle('', EXTERNAL_CLEAR);
}

/**
 * Marks the next session bind in this tab as a fresh sign-in. Set when an
 * OAuth sign-in starts; only that bind, sign-out or a failed start removes it.
 */
export function markCoverLetterStyleFreshSignIn(): void {
  try {
    sessionStorage.setItem(FRESH_SIGN_IN_KEY, '1');
  } catch {
    // Blocked storage: the unstamped sample is adopted, as on any restore.
  }
}

export function forgetCoverLetterStyleFreshSignIn(): void {
  try {
    sessionStorage.removeItem(FRESH_SIGN_IN_KEY);
  } catch {
    // Nothing to forget.
  }
}

const consumeFreshSignIn = (): boolean => {
  try {
    const fresh = sessionStorage.getItem(FRESH_SIGN_IN_KEY) !== null;
    sessionStorage.removeItem(FRESH_SIGN_IN_KEY);
    return fresh;
  } catch {
    return false;
  }
};

/**
 * Sets the account later writes are stamped with, and at a session clears a
 * stored sample stamped for anyone else. An unstamped sample is cleared by the
 * first session after `markCoverLetterStyleFreshSignIn` and adopted by any
 * other: auth event names cannot tell a sign-in from a restore.
 */
export function bindCoverLetterStyleToUser(session: { userId: string } | null): void {
  const previousOwner = styleOwner;
  styleOwner = session?.userId ?? null;
  if (session) {
    const freshSignIn = consumeFreshSignIn();
    let keep = false;
    try {
      const record = readRecord();
      if (!record) {
        keep = true;
      } else if (record.owner === session.userId) {
        keep = true;
      } else if (
        record.owner === undefined &&
        !freshSignIn &&
        record.v === STYLE_VERSION &&
        typeof record.sample === 'string'
      ) {
        persist(record.sample);
        keep = true;
      }
    } catch {
      // Unreadable is unattributable: cleared below.
    }
    if (!keep) {
      clearStoredCoverLetterStyle();
      return;
    }
  }
  if (styleOwner !== previousOwner) notify(OWNER_CHANGED);
}
