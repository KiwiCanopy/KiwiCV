import {
  type SerializeContext,
  type SignatureFaceId,
  type TypstSignature,
  getSignatureFace,
} from '@/components/preview/themes/shared/signature';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * The document signature, stored on this device only (#103).
 *
 * ⚠️ Never move it into `ResumeData`. The résumé leaves the device through
 * Drive and GitHub sync, the JSON export and AI calls; the signature must not
 * travel with any of them. `signaturePrivacy.test.tsx` pins that.
 */
export type StoredSignature =
  | {
      kind: 'image';
      /** Names the compile-time file, so a new signature never reuses a cached one. */
      id: string;
      /** A PNG data URL with a transparent background. */
      dataUrl: string;
      source: 'draw' | 'upload';
    }
  | { kind: 'typed'; id: string; faceId: SignatureFaceId; text: string };

interface SignatureStore {
  signature: StoredSignature | null;
  /**
   * The account the signature was saved under, or `null` when it was saved
   * signed out. A different account signing in clears it (#108).
   */
  ownerUserId: string | null;
  /** The signed-in account right now; not persisted. */
  sessionUserId: string | null;
  setSignature: (signature: StoredSignature) => void;
  removeSignature: () => void;
  /** Called on every session change, from `AuthProvider`. */
  bindToUser: (userId: string | null) => void;
}

const STORE_VERSION = 1;

const PNG_PREFIX = 'data:image/png;base64,';
/** Base64 of the 8-byte PNG signature, so a corrupt value fails here, not in every compile. */
const PNG_MAGIC_BASE64 = 'iVBORw0KGgo';

const isPngDataUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.startsWith(PNG_PREFIX + PNG_MAGIC_BASE64)) return false;
  try {
    atob(value.slice(PNG_PREFIX.length));
    return true;
  } catch {
    return false;
  }
};

/** Drops anything this version cannot render, rather than trusting storage. */
export function parseStoredSignature(value: unknown): StoredSignature | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || !/^[a-z0-9-]{1,64}$/i.test(v.id)) return null;

  if (v.kind === 'image' && isPngDataUrl(v.dataUrl)) {
    return {
      kind: 'image',
      id: v.id,
      dataUrl: v.dataUrl,
      source: v.source === 'draw' ? 'draw' : 'upload',
    };
  }
  if (v.kind === 'typed' && typeof v.faceId === 'string' && typeof v.text === 'string') {
    const face = getSignatureFace(v.faceId);
    const text = v.text.trim();
    if (face && text) return { kind: 'typed', id: v.id, faceId: face.id, text };
  }
  return null;
}

export const newSignatureId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const useSignatureStore = create<SignatureStore>()(
  persist(
    (set, get) => ({
      signature: null,
      ownerUserId: null,
      sessionUserId: null,
      setSignature: (signature) => set({ signature, ownerUserId: get().sessionUserId }),
      removeSignature: () => set({ signature: null, ownerUserId: null }),
      bindToUser: (userId) => {
        // Owner ruling 2026-11-12 (#108): sign-out keeps the signature, like the
        // résumé beside it; a different person signing in does not inherit it,
        // like the GitHub token. One saved signed out goes to whoever signs in.
        const { signature, ownerUserId } = get();
        if (userId && signature && ownerUserId && ownerUserId !== userId) {
          set({ signature: null, ownerUserId: null, sessionUserId: userId });
          return;
        }
        set({
          sessionUserId: userId,
          ownerUserId: userId && signature ? userId : ownerUserId,
        });
      },
    }),
    {
      name: BRAND_STORAGE_KEYS.signature,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ signature: state.signature, ownerUserId: state.ownerUserId }),
      merge: (persisted, current) => {
        const stored = persisted as { signature?: unknown; ownerUserId?: unknown } | undefined;
        const signature = parseStoredSignature(stored?.signature);
        return {
          ...current,
          signature,
          ownerUserId:
            signature && typeof stored?.ownerUserId === 'string' ? stored.ownerUserId : null,
        };
      },
    },
  ),
);

/** The virtual path an image signature is mapped at inside the Typst compile. */
const signatureImagePath = (signature: Extract<StoredSignature, { kind: 'image' }>) =>
  `/signature/${signature.id}.png`;

export function toTypstSignature(signature: StoredSignature | null): TypstSignature | undefined {
  if (!signature) return undefined;
  if (signature.kind === 'image') return { kind: 'image', path: signatureImagePath(signature) };
  return { kind: 'typed', faceId: signature.faceId, text: signature.text };
}

/** What every compile call site passes: the serializer context and the image bytes. */
export interface SignatureCompileInputs {
  ctx: SerializeContext;
  /** Virtual path to data URL, mapped into the compile by the worker. */
  images: Record<string, string> | undefined;
}

export function signatureCompileInputs(signature: StoredSignature | null): SignatureCompileInputs {
  return {
    ctx: { signature: toTypstSignature(signature) },
    images:
      signature?.kind === 'image'
        ? { [signatureImagePath(signature)]: signature.dataUrl }
        : undefined,
  };
}
