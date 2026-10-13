import React, { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { ImageCropper } from '@/components/ui/image-cropper';
import { PHOTO_SIZE_LIMIT_BYTES, PHOTO_SIZE_LIMIT_MB } from '@/constants/photo';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { cn } from '@/utils/cn';
import { encodeOpaqueJpegBlob } from '@/utils/image';
import { Camera, CircleUserRound, EyeOff, LoaderCircle, Pencil, Trash2 } from 'lucide-react';

interface PhotoEditorProps {
  image?: string;
  shape?: 'circle' | 'square';
  visible?: boolean;
  onUpdate: (data: { image?: string; shape?: 'circle' | 'square' }) => void;
}

const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'mif1',
  'msf1',
  'heif',
  'miaf',
]);

/** Detect HEIC by reading the file's magic bytes — immune to wrong extensions or MIME types. */
async function isHeicBlob(blob: Blob): Promise<boolean> {
  const mime = (blob instanceof File ? blob.type : '').toLowerCase();
  if (mime === 'image/heic' || mime === 'image/heif') return true;
  if (blob instanceof File && /\.(heic|heif)$/i.test(blob.name)) return true;

  if (blob.size < 12) return false;

  try {
    // Read the first 32 bytes to inspect the ISOBMFF ftyp box
    const header = new Uint8Array(await blob.slice(0, 32).arrayBuffer());
    if (header.length < 12) return false;

    // Bytes 4-7 must be 'ftyp'
    const ftyp = String.fromCharCode(header[4], header[5], header[6], header[7]);
    if (ftyp !== 'ftyp') return false;

    // Check major brand (bytes 8-11)
    const majorBrand = String.fromCharCode(
      header[8],
      header[9],
      header[10],
      header[11],
    ).toLowerCase();
    if (HEIC_BRANDS.has(majorBrand)) return true;

    // Check compatible brands (bytes 16.. end of header, in 4-byte steps)
    for (let offset = 16; offset + 4 <= header.length; offset += 4) {
      const compBrand = String.fromCharCode(
        header[offset],
        header[offset + 1],
        header[offset + 2],
        header[offset + 3],
      ).toLowerCase();
      if (HEIC_BRANDS.has(compBrand)) return true;
    }
  } catch {
    return false;
  }

  return false;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a HEIC blob to a JPEG blob.
 * Strategy: try the browser's native decoder first (createImageBitmap uses the
 * OS-level codec in Safari). Falls back to heic-to (modern WASM-based libheif)
 * for Chrome, Firefox, and platforms without native browser HEIC decoding.
 */
async function convertHeicToJpegBlob(blob: Blob): Promise<Blob> {
  // 1. Try native decoding via createImageBitmap
  try {
    const bitmap = await createImageBitmap(blob);
    try {
      const jpeg = await encodeOpaqueJpegBlob(
        bitmap.width,
        bitmap.height,
        (ctx) => ctx.drawImage(bitmap, 0, 0),
        0.92,
      );
      if (jpeg) return jpeg;
    } finally {
      bitmap.close();
    }
  } catch {
    // Native decoding not available — fall through to heic-to
  }

  // 2. Modern WASM-based decoder (heic-to)
  const { heicTo } = await import('heic-to');
  return await heicTo({
    blob,
    type: 'image/jpeg',
    quality: 0.92,
  });
}

export const PhotoEditor = ({
  image,
  shape = 'square',
  visible = true,
  onUpdate,
}: PhotoEditorProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null); // For the cropper
  const [showPreview, setShowPreview] = useState(false); // For the preview modal
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const confirm = useConfirmStore((state) => state.confirm);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input immediately so the same file can be re-selected
    e.target.value = '';

    if (file.size > PHOTO_SIZE_LIMIT_BYTES) {
      confirm({
        title: t('common.error'),
        message: t('editor.photo.file_too_large', { size: PHOTO_SIZE_LIMIT_MB }),
        confirmText: t('common.ok'),
        cancelText: '', // Hide cancel button for alerts
        variant: 'destructive',
      });
      return;
    }

    let fileToRead: Blob = file;

    if (await isHeicBlob(file)) {
      setIsConverting(true);
      try {
        fileToRead = await convertHeicToJpegBlob(file);
      } catch (err) {
        console.error('HEIC conversion failed:', err);
        setIsConverting(false);
        confirm({
          title: t('common.error'),
          message: t('editor.photo.conversion_failed'),
          confirmText: t('common.ok'),
          cancelText: '',
          variant: 'destructive',
        });
        return;
      }
      setIsConverting(false);
    }

    const dataUrl = await blobToDataUrl(fileToRead);
    setCropImage(dataUrl);
    setIsEditingExisting(false);
    setShowPreview(false); // Close preview if open (start fresh crop)
  };

  const handlePhotoClick = () => {
    if (image) {
      setShowPreview(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleRecrop = () => {
    if (image) {
      setCropImage(image);
      setIsEditingExisting(true);
      setShowPreview(false);
    }
  };

  const handleDelete = async () => {
    // No `restoreFocusTo`: the confirmed delete closes the preview too, and the
    // preview's own opener — the photo tile — survives it, so `DialogFrame`'s
    // first rung already answers this (`code/UI_PATTERNS.md`).
    const shouldDelete = await confirm({
      title: t('common.delete'),
      message: t('editor.photo.delete_confirm'),
      variant: 'destructive',
    });

    if (shouldDelete) {
      onUpdate({ image: '', shape: undefined });
      setShowPreview(false);
    }
  };

  const onCropComplete = (croppedBase64: string, newShape: 'circle' | 'square') => {
    onUpdate({ image: croppedBase64, shape: newShape });
    setCropImage(null);
  };

  return (
    <>
      {/* Invisible Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Main Trigger */}
      {/*
        ⚠️ A real button, not a `div` with an `onClick`. It was once the latter,
        so the photo could not be opened, replaced or deleted from the
        keyboard at all — WCAG 2.1.1 — and the delete inside it had no anchor to
        return focus to. It is also the preview dialog's opener, which is what
        `DialogFrame` restores to once the confirmed delete closes both surfaces.
        Focus is drawn by the app-wide `:focus-visible` rule in `tokens.css`;
        re-pointing it locally is the hazard that broke the sidebar's ghosts.
      */}
      <button
        type="button"
        onClick={handlePhotoClick}
        className={cn(
          'group bg-muted border-border hover:border-primary-strong/50 relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-all',
          !image && 'h-32 w-32', // Placeholder size
          image && 'w-32', // Image width fixed, height auto
          shape === 'circle' && 'rounded-[50%]', // Use 50% for true ellipse
          shape === 'square' && 'rounded-md', // Slightly rounded corners for rectangle
        )}
        title={image ? t('editor.photo.edit_title') : t('editor.photo.upload_title')}
        aria-label={image ? t('editor.photo.edit_title') : t('editor.photo.upload_title')}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={t('editor.photo.alt_profile')}
              className={cn(
                'h-auto w-full object-cover transition-all',
                !visible && 'opacity-40 grayscale',
              )}
            />
            {!visible && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                <EyeOff className="h-8 w-8 text-white drop-shadow-md" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="relative mb-1">
              <CircleUserRound className="text-muted-foreground/40 group-hover:text-muted-foreground/60 h-12 w-12 transition-colors" />
              <div className="bg-background border-border group-hover:bg-accent absolute -right-1 -bottom-1 rounded-full border p-1 shadow-sm transition-colors">
                <Camera className="text-muted-foreground h-3 w-3" />
              </div>
            </div>
            <span className="text-muted-foreground mt-1 text-[10px] font-bold tracking-wider uppercase">
              {t('editor.photo.upload_hint')}
            </span>
          </div>
        )}

        {/* Hover Hint */}
        {!isConverting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-medium text-white">
              {image ? t('editor.photo.view_hint') : t('editor.photo.add_hint')}
            </span>
          </div>
        )}

        {/* Converting Overlay */}
        {isConverting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <LoaderCircle className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </button>

      {/* Cropper Modal */}
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage}
          initialShape={shape}
          isEditMode={isEditingExisting}
          onCancel={() => setCropImage(null)}
          onCropComplete={onCropComplete}
        />
      )}

      {/* Preview Modal */}
      <DialogFrame
        open={showPreview && !!image}
        onOpenChange={setShowPreview}
        maxWidth="lg"
        zIndexClassName="z-[60]"
        closePlacement="bar"
        header={
          <div className="border-border flex items-center gap-2 border-b p-4 pr-14">
            {/* No visible title bar in this preview; the accessible name is the
                one required DialogFrameTitle, kept sr-only as before. */}
            <DialogFrameTitle className="sr-only">
              {t('editor.photo.preview_title')}
            </DialogFrameTitle>
            <button
              type="button"
              onClick={handleRecrop}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" /> {t('common.edit')}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/50 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> {t('common.delete')}
            </button>
          </div>
        }
        footer={
          <div className="bg-muted/20 border-border border-t p-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowPreview(false);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
            >
              <Camera className="h-4 w-4" aria-hidden="true" /> {t('editor.photo.replace_btn')}
            </Button>
          </div>
        }
      >
        {/* Large Preview */}
        <div className="flex items-center justify-center overflow-hidden bg-black/5 p-4 sm:p-8">
          {/* ⚠️ Guarded, not `image!`: a confirmed delete clears `image` one pass
              before the dialog unmounts, which handed the img an empty `src`. */}
          {image && (
            <img
              src={image}
              alt={t('editor.photo.alt_preview')}
              className={cn(
                'max-h-[50vh] max-w-full border-4 border-white object-contain shadow-lg sm:max-h-[60vh] dark:border-zinc-800',
                shape === 'circle' && 'rounded-[50%]',
                shape === 'square' && 'rounded-xl',
              )}
            />
          )}
        </div>
      </DialogFrame>
    </>
  );
};
