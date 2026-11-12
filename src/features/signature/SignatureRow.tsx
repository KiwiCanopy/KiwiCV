import { useEffect, useRef, useState } from 'react';

import { SIGNATURE_INK, getSignatureFace } from '@/components/preview/themes/shared/signature';
import { Button } from '@/components/ui/Button';
import { SignatureDialog } from '@/features/signature/SignatureDialog';
import { removeSignature } from '@/features/signature/signatureActions';
import { loadSignatureFace } from '@/features/signature/signatureFonts';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useSignatureStore } from '@/store/signature/useSignatureStore';
import { PenLine, Plus } from 'lucide-react';

/**
 * An entry point to the signature: a row under each document's footer toggle,
 * and a compact one under the photo in Basics (owner, 2026-11-12, for
 * findability). All edit the same device-only signature (#103).
 */
export function SignatureRow({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const signature = useSignatureStore((state) => state.signature);
  const footerShown = useResumeStore(
    (state) => state.resume.meta.theme.params?.showFooter !== false,
  );
  const [open, setOpen] = useState(false);
  const [, setFontReady] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);

  const face = signature?.kind === 'typed' ? getSignatureFace(signature.faceId) : undefined;
  useEffect(() => {
    if (face)
      loadSignatureFace(face).then(
        () => setFontReady(true),
        () => {},
      );
  }, [face]);

  const thumbnail = signature && (
    // White paper in both themes, as the dialog and the PDF.
    <span className="border-input flex h-11 w-28 items-center justify-center overflow-hidden rounded-md border bg-white px-1">
      {signature.kind === 'image' ? (
        <img
          src={signature.dataUrl}
          alt={t('design.signature.preview_alt')}
          className="max-h-9 max-w-full object-contain"
        />
      ) : (
        <span
          role="img"
          aria-label={t('design.signature.preview_alt')}
          className="max-w-full truncate text-xl"
          style={{ fontFamily: `'${face?.family}', cursive`, color: SIGNATURE_INK }}
        >
          {signature.text}
        </span>
      )}
    </span>
  );
  const dialog = open && (
    <SignatureDialog onClose={() => setOpen(false)} restoreFocusTo={() => addRef.current} />
  );

  if (compact) {
    return (
      <div className="flex w-full flex-col items-center gap-1">
        {signature ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('design.signature.edit_label')}
            title={t('design.signature.edit_label')}
            className="hover:border-primary-strong/50 cursor-pointer rounded-md"
          >
            {thumbnail}
          </button>
        ) : (
          <Button ref={addRef} variant="quiet" size="sm" onClick={() => setOpen(true)}>
            <PenLine className="h-4 w-4" aria-hidden="true" />
            {t('design.signature.add')}
          </Button>
        )}
        {!footerShown && (
          <p className="text-muted-foreground text-center text-xs leading-snug">
            {t('design.signature.footer_off')}
          </p>
        )}
        {dialog}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="text-foreground text-sm font-medium">
          {t('design.signature.row_label')}
        </span>
        {!signature && (
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {t('design.signature.row_empty')}
          </p>
        )}
      </div>
      {signature ? (
        <div className="flex shrink-0 items-center gap-1">
          {thumbnail}
          <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>
            {t('design.signature.change')}
          </Button>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => {
              void removeSignature(t);
              requestAnimationFrame(() => addRef.current?.focus());
            }}
          >
            {t('common.remove')}
          </Button>
        </div>
      ) : (
        <Button ref={addRef} variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('design.signature.add')}
        </Button>
      )}
      {dialog}
    </div>
  );
}
