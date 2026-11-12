import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { Crop, ImageUp, LoaderCircle } from 'lucide-react';

export type UploadState =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'ready'; dataUrl: string }
  | { status: 'error'; message: string };

interface SignatureUploadPanelProps {
  state: UploadState;
  onFile: (file: File) => void;
  /** Reopens the cropper on the uploaded image. */
  onEdit: () => void;
}

/** A file, or a pasted image (the dialog-wide paste handler lands here too). */
export function SignatureUploadPanel({ state, onFile, onEdit }: SignatureUploadPanelProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const wasWorking = useRef(false);

  // The control the user pressed unmounts while the image is processed, so
  // focus lands on the next one rather than on the dialog itself.
  useEffect(() => {
    if (state.status === 'working') {
      wasWorking.current = true;
      return;
    }
    if (!wasWorking.current) return;
    wasWorking.current = false;
    (state.status === 'ready' ? editRef.current : chooseRef.current)?.focus();
  }, [state.status]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
      <div className="border-input flex min-h-44 items-center justify-center rounded-lg border bg-white p-3">
        {state.status === 'ready' ? (
          <img
            src={state.dataUrl}
            alt={t('design.signature.preview_alt')}
            className="max-h-36 max-w-full object-contain"
          />
        ) : state.status === 'working' ? (
          <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-zinc-500" />
        ) : (
          <Button ref={chooseRef} variant="secondary" onClick={() => inputRef.current?.click()}>
            <ImageUp className="h-4 w-4" aria-hidden="true" />
            {t('design.signature.upload_choose')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-muted-foreground min-w-0 flex-1 text-xs leading-relaxed">
          {t('design.signature.upload_hint')}
        </p>
        {state.status === 'ready' && (
          <div className="flex shrink-0 gap-1">
            <Button ref={editRef} variant="quiet" size="sm" onClick={onEdit}>
              <Crop className="h-4 w-4" aria-hidden="true" />
              {t('common.edit')}
            </Button>
            <Button variant="quiet" size="sm" onClick={() => inputRef.current?.click()}>
              {t('design.signature.upload_another')}
            </Button>
          </div>
        )}
      </div>
      <p role="status" className="text-destructive text-sm empty:hidden">
        {state.status === 'error' ? state.message : ''}
      </p>
      {/* Progress and success have no visible text of their own to announce. */}
      <p role="status" className="sr-only">
        {state.status === 'working'
          ? t('design.signature.upload_working')
          : state.status === 'ready'
            ? t('design.signature.upload_ready')
            : ''}
      </p>
    </div>
  );
}
