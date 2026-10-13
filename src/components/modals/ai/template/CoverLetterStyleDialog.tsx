import { CoverLetterStyleField } from '@/components/modals/ai/template/CoverLetterStyleField';
import { Button } from '@/components/ui/Button';
import { DialogFrame } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';

interface CoverLetterStyleDialogProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

/**
 * One dialog for one task: paste the prose the cover letter should sound like.
 *
 * ⚠️ **It exists because the AI modal was answering this with the whole config
 * screen.** Choosing the writing style used to call `openAIModal('cv')`, which
 * delivered a 576×722 dialog restating the job description the user had just
 * typed, offering translation and restructure, and putting the actual field
 * below the fold — the heaviest surface in the app for the smallest request in
 * the flow. It also rendered "Match my writing style" twice, 30px apart,
 * meaning two different things.
 *
 * ⚠️ **The DEFAULT shape, via `title`/`description` — not `header`.** Passing
 * `header` opts into the custom branch, which renders header, body and footer
 * flush and unpadded because the caller is then expected to own every inset;
 * a `pt-6` with no `pb` put the description hard against the textarea and the
 * OK button into the corner. Nothing here is part of the composition, so the
 * frame's own `p-4 sm:p-6` / `mb-4` / `mb-6` / `mt-6` is what it should use.
 *
 * ⚠️ `lg`, not `md`. Measured: `md` gives the textarea 47 characters per line,
 * which is the floor of a readable measure — and this field exists to be read
 * back, not just typed into. `lg` gives 55, inside the comfortable 45–75 band.
 * `xl` (63) is closer to the typographic optimum and starts to feel like the
 * heavy modal this dialog replaced. Phones are unaffected: `max-w-[92vw]` caps
 * it below 640px.
 *
 * ⚠️ `z-[80]` is the documented "over a flow" tier (`UI_MODALS.md`), the one
 * `InsufficientPremiumAccessModal` already uses to sit above the AI modal's
 * `z-[70]`. Both surfaces that open this can be behind it.
 *
 * There is no Save. The field is controlled and `useCoverLetterStyle` persists
 * on a debounce, flushing on unmount and on `pagehide`, so the only thing a
 * footer button can honestly do is dismiss.
 */
export function CoverLetterStyleDialog({
  open,
  onClose,
  value,
  onChange,
  onClear,
}: CoverLetterStyleDialogProps) {
  const { t } = useTranslation();

  return (
    <DialogFrame
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      maxWidth="lg"
      zIndexClassName="z-[80]"
      title={t('ai.style_sample_title')}
      description={t('ai.style_sample_desc')}
      footer={
        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            {t('common.ok')}
          </Button>
        </div>
      }
    >
      {/* Plain `--card`, so the field keeps the contrast figures measured for it
          and its Clear button needs no call-site edge. */}
      <CoverLetterStyleField
        value={value}
        onChange={onChange}
        onClear={onClear}
        labelledByHeading={t('ai.style_sample_title')}
      />
    </DialogFrame>
  );
}
