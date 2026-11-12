import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';

import {
  DEFAULT_SIGNATURE_FACE,
  SIGNATURE_FACES,
  type SignatureFaceId,
} from '@/components/preview/themes/shared/signature';
import { Button } from '@/components/ui/Button';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { ImageCropper } from '@/components/ui/image-cropper';
import { PHOTO_SIZE_LIMIT_BYTES, PHOTO_SIZE_LIMIT_MB } from '@/constants/photo';
import {
  SignatureDrawPad,
  type SignatureDrawPadHandle,
} from '@/features/signature/SignatureDrawPad';
import { SignatureTypePanel } from '@/features/signature/SignatureTypePanel';
import { SignatureUploadPanel, type UploadState } from '@/features/signature/SignatureUploadPanel';
import { faceCovers, loadSignatureCoverage } from '@/features/signature/signatureFonts';
import { dataUrlToSignaturePng, fileToWorkingDataUrl } from '@/features/signature/signatureImage';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  type StoredSignature,
  newSignatureId,
  useSignatureStore,
} from '@/store/signature/useSignatureStore';
import { type FocusAnchor } from '@/utils/focus';
import { PenLine, Signature } from 'lucide-react';

type Tab = 'draw' | 'type' | 'upload';

interface SignatureDialogProps {
  onClose: () => void;
  /** Where focus goes when the opener is gone, as after Remove. */
  restoreFocusTo: FocusAnchor;
}

type Coverage = Map<SignatureFaceId, Set<number>>;

const firstCoveringFace = (coverage: Coverage, text: string): SignatureFaceId | undefined =>
  SIGNATURE_FACES.find((face) => faceCovers(coverage.get(face.id), text))?.id;

/**
 * Draw, type or upload one signature for both documents' footers (#103).
 * Mounted only while open, so every opening starts from the stored signature.
 */
export function SignatureDialog({ onClose, restoreFocusTo }: SignatureDialogProps) {
  const { t } = useTranslation();
  const name = useResumeStore((state) => state.resume.basics.name).trim();
  const stored = useSignatureStore((state) => state.signature);
  const setSignature = useSignatureStore((state) => state.setSignature);
  const removeSignature = useSignatureStore((state) => state.removeSignature);

  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [tab, setTab] = useState<Tab | null>(null);
  // The text the Type tab opens with; whether it can be typed is decided once,
  // on that text, so the tab and its reason never contradict each other.
  const [initialText] = useState(() => (stored?.kind === 'typed' ? stored.text : name));
  const [text, setText] = useState(initialText);
  const [faceId, setFaceId] = useState<SignatureFaceId>(DEFAULT_SIGNATURE_FACE);
  const [hasInk, setHasInk] = useState(false);
  const [upload, setUpload] = useState<UploadState>(() =>
    stored?.kind === 'image' && stored.source === 'upload'
      ? { status: 'ready', dataUrl: stored.dataUrl }
      : { status: 'idle' },
  );
  const padRef = useRef<SignatureDrawPadHandle>(null);

  const seed = useEffectEvent((loaded: Coverage) => {
    setCoverage(loaded);
    const textFace = initialText ? firstCoveringFace(loaded, initialText) : undefined;
    const defaultCovers = faceCovers(loaded.get(DEFAULT_SIGNATURE_FACE), initialText);
    setFaceId(
      stored?.kind === 'typed' && textFace
        ? stored.faceId
        : defaultCovers
          ? DEFAULT_SIGNATURE_FACE
          : (textFace ?? DEFAULT_SIGNATURE_FACE),
    );
    // Opens on Type when a face covers the name, otherwise on Draw.
    setTab((current) => {
      if (current) return current;
      if (stored?.kind === 'image') return stored.source === 'upload' ? 'upload' : 'draw';
      return textFace ? 'type' : 'draw';
    });
  });

  useEffect(() => {
    let current = true;
    loadSignatureCoverage()
      .catch(() => new Map() as Coverage)
      .then((loaded) => {
        if (current) seed(loaded);
      });
    return () => {
      current = false;
    };
  }, []);

  const typeAvailable = !initialText || !coverage || !!firstCoveringFace(coverage, initialText);
  const typeReasonId = useId();

  // Every upload or paste goes through the cropper first (crop, rotate, flip),
  // then the local background key. `cropSource` keeps the unkeyed image so
  // Edit can crop again from it.
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const handleFile = async (file: Blob) => {
    setTab('upload');
    if (file.size > PHOTO_SIZE_LIMIT_BYTES) {
      setUpload({
        status: 'error',
        message: t('design.signature.upload_too_large', { size: PHOTO_SIZE_LIMIT_MB }),
      });
      return;
    }
    setUpload({ status: 'working' });
    const decoded = await fileToWorkingDataUrl(file);
    if (!decoded.ok) {
      setUpload({ status: 'error', message: t('design.signature.upload_unreadable') });
      return;
    }
    setCropSource(decoded.dataUrl);
    setCropOpen(true);
  };

  const applyCrop = async (cropped: string) => {
    setCropOpen(false);
    setUpload({ status: 'working' });
    const result = await dataUrlToSignaturePng(cropped);
    setUpload(
      result.ok
        ? { status: 'ready', dataUrl: result.dataUrl }
        : {
            status: 'error',
            message:
              result.reason === 'empty'
                ? t('design.signature.upload_empty')
                : t('design.signature.upload_unreadable'),
          },
    );
  };

  const cancelCrop = () => {
    setCropOpen(false);
    setUpload((current) => (current.status === 'working' ? { status: 'idle' } : current));
  };

  const onPastedFile = useEffectEvent((file: Blob) => void handleFile(file));

  // Paste is dialog-wide and has no tab of its own: any pasted image goes
  // through the Upload pipeline. Text pastes into the name field untouched.
  const pasteBlocked = useEffectEvent(() => cropOpen);
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (pasteBlocked()) return;
      // A copy can carry text and an image together; into a text field, the text wins.
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea') && event.clipboardData?.types.includes('text/plain')) {
        return;
      }
      const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith('image/'),
      );
      if (!file) return;
      event.preventDefault();
      onPastedFile(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const typedText = text.trim();
  const typedReady = !!typedText && !!coverage && faceCovers(coverage.get(faceId), typedText);
  const canSave = tab === 'draw' ? hasInk : tab === 'type' ? typedReady : upload.status === 'ready';

  const save = () => {
    let next: StoredSignature | null = null;
    if (tab === 'type' && typedReady) {
      next = { kind: 'typed', id: newSignatureId(), faceId, text: typedText };
    } else if (tab === 'draw') {
      const result = padRef.current?.toPng();
      if (result?.ok) {
        next = { kind: 'image', id: newSignatureId(), dataUrl: result.dataUrl, source: 'draw' };
      }
    } else if (tab === 'upload' && upload.status === 'ready') {
      next =
        stored?.kind === 'image' && stored.dataUrl === upload.dataUrl
          ? stored
          : { kind: 'image', id: newSignatureId(), dataUrl: upload.dataUrl, source: 'upload' };
    }
    if (!next) return;
    setSignature(next);
    onClose();
  };

  return (
    <DialogFrame
      open
      restoreFocusTo={restoreFocusTo}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      maxWidth="xl"
      zIndexClassName="z-[60]"
      icon={<Signature className="h-6 w-6" aria-hidden="true" />}
      title={t('design.signature.dialog_title')}
      footer={
        <div className="border-border flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">{t('design.signature.device_note')}</p>
          <div className="flex justify-end gap-2">
            {stored && (
              <Button
                variant="quiet"
                onClick={() => {
                  removeSignature();
                  onClose();
                }}
              >
                {t('common.remove')}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={save} disabled={!canSave}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 px-6 pb-4">
        <SegmentedToggle<Tab>
          // No segment reads as selected until the opening tab is known.
          value={tab ?? ('' as Tab)}
          onChange={(next) => {
            if (next === 'type' && !typeAvailable) return;
            setTab(next);
          }}
          options={[
            {
              value: 'draw',
              label: t('design.signature.tab_draw'),
              icon: <PenLine className="h-4 w-4" />,
            },
            {
              value: 'type',
              label: t('design.signature.tab_type'),
              disabled: !typeAvailable,
              describedBy: typeAvailable ? undefined : typeReasonId,
            },
            { value: 'upload', label: t('design.signature.tab_upload') },
          ]}
        />
        {!typeAvailable && (
          <p id={typeReasonId} className="text-muted-foreground text-xs">
            {t('design.signature.type_unavailable')}
          </p>
        )}

        {tab === 'draw' && (
          <div className="space-y-2">
            <SignatureDrawPad
              ref={padRef}
              label={t('design.signature.draw_label')}
              onInkChange={setHasInk}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{t('design.signature.draw_hint')}</p>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => padRef.current?.clear()}
                disabled={!hasInk}
              >
                {t('common.clear')}
              </Button>
            </div>
          </div>
        )}
        {tab === 'type' && (
          <SignatureTypePanel
            text={text}
            onTextChange={setText}
            faceId={faceId}
            onFaceChange={setFaceId}
            coverage={coverage}
          />
        )}
        {tab === 'upload' && (
          <SignatureUploadPanel
            state={upload}
            onFile={handleFile}
            onEdit={() => {
              if (upload.status !== 'ready') return;
              // A stored signature has no unkeyed original; its keyed PNG crops fine.
              setCropSource((source) => source ?? upload.dataUrl);
              setCropOpen(true);
            }}
          />
        )}
        {cropOpen && cropSource && (
          <ImageCropper
            purpose="signature"
            imageSrc={cropSource}
            onCancel={cancelCrop}
            onCropComplete={(cropped) => void applyCrop(cropped)}
          />
        )}
      </div>
    </DialogFrame>
  );
}
