import { useEffect, useId, useState } from 'react';

import {
  SIGNATURE_FACES,
  SIGNATURE_INK,
  type SignatureFaceId,
} from '@/components/preview/themes/shared/signature';
import { Input } from '@/components/ui/Input';
import { faceCovers, loadSignatureFace } from '@/features/signature/signatureFonts';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

interface SignatureTypePanelProps {
  text: string;
  onTextChange: (text: string) => void;
  faceId: SignatureFaceId;
  onFaceChange: (faceId: SignatureFaceId) => void;
  coverage: Map<SignatureFaceId, Set<number>> | null;
}

/** The name set in each face; a face missing a letter stays visible, disabled, with the reason. */
export function SignatureTypePanel({
  text,
  onTextChange,
  faceId,
  onFaceChange,
  coverage,
}: SignatureTypePanelProps) {
  const { t } = useTranslation();
  const groupLabelId = useId();
  const [, setLoaded] = useState(0);

  useEffect(() => {
    // Repaint once each face arrives; until then the sample shows the fallback.
    for (const face of SIGNATURE_FACES) {
      loadSignatureFace(face).then(
        () => setLoaded((count) => count + 1),
        () => {},
      );
    }
  }, []);

  const sample = text.trim();

  return (
    <div className="space-y-4">
      <Input
        label={t('design.signature.type_name')}
        value={text}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onTextChange(event.target.value)}
        autoComplete="name"
      />
      <div className="space-y-2">
        <span id={groupLabelId} className="text-foreground text-sm font-medium">
          {t('design.signature.type_style')}
        </span>
        <div role="radiogroup" aria-labelledby={groupLabelId} className="grid gap-2 sm:grid-cols-2">
          {SIGNATURE_FACES.map((face) => {
            const covered = !sample || faceCovers(coverage?.get(face.id), sample);
            const selected = face.id === faceId;
            const reasonId = `${groupLabelId}-${face.id}-reason`;
            return (
              // Native radios: arrow keys, disabled state and names come free.
              <label
                key={face.id}
                className={cn(
                  'relative flex min-h-20 flex-col items-center justify-center overflow-hidden rounded-lg border bg-white px-3 py-2 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
                  selected ? 'border-primary-strong ring-primary-strong ring-1' : 'border-input',
                  covered ? 'hover:border-primary-strong/60 cursor-pointer' : 'cursor-not-allowed',
                )}
              >
                <input
                  type="radio"
                  name={groupLabelId}
                  value={face.id}
                  checked={selected}
                  disabled={!covered}
                  onChange={() => onFaceChange(face.id)}
                  aria-label={face.family}
                  aria-describedby={covered ? undefined : reasonId}
                  className="sr-only"
                />
                {selected && (
                  <Check
                    aria-hidden="true"
                    className="text-primary-strong absolute top-1.5 right-1.5 h-4 w-4"
                  />
                )}
                {/* Script swashes ink past the glyph box (measured up to 0.3em
                    sideways, 0.5em down) and `truncate` clips at the padding edge:
                    the padding gives the ink room, the negative margin keeps the
                    text's width, reaching into the card's own px-3. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    '-mx-[0.35em] -my-[0.4em] max-w-[calc(100%+0.7em)] truncate px-[0.35em] py-[0.4em] text-3xl leading-tight',
                    !covered && 'opacity-30',
                  )}
                  // Ink on white paper in both app themes, as in the PDF.
                  style={{ fontFamily: `'${face.family}', cursive`, color: SIGNATURE_INK }}
                >
                  {sample || face.family}
                </span>
                {!covered && (
                  <span id={reasonId} className="mt-1 text-xs text-zinc-600">
                    {t('design.signature.face_unavailable')}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
