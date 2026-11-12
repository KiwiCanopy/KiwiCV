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
  setSignature: (signature: StoredSignature) => void;
  removeSignature: () => void;
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
    (set) => ({
      signature: null,
      setSignature: (signature) => set({ signature }),
      removeSignature: () => set({ signature: null }),
    }),
    {
      name: BRAND_STORAGE_KEYS.signature,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ signature: state.signature }),
      merge: (persisted, current) => ({
        ...current,
        signature: parseStoredSignature(
          (persisted as { signature?: unknown } | undefined)?.signature,
        ),
      }),
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
