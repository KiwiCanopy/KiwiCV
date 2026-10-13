import { type ImportStepType } from '@/components/modals/import/types';
import { renderBoldText } from '@/components/modals/import/utils';
import { OptionCard } from '@/components/ui/OptionCard';
import { FileJson, ScanText } from 'lucide-react';

interface ImportChoiceStepProps {
  t: (key: string) => React.ReactNode;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setStep: (step: ImportStepType) => void;
  onLoginRequired?: () => void;
  isLoggedIn?: boolean;
}

export function ImportChoiceStep({
  t,
  onFileUpload,
  setStep,
  onLoginRequired,
  isLoggedIn,
}: ImportChoiceStepProps) {
  return (
    <div className="space-y-4">
      <OptionCard
        onClick={() => {
          if (!isLoggedIn && onLoginRequired) {
            onLoginRequired();
            return;
          }
          setStep('import_ai');
        }}
        title={t('welcome.choice_ai_title')}
        description={renderBoldText(
          (t('welcome.choice_ai_desc') as string) ||
            'Upload a PDF or Word file and let our AI extract the data.',
        )}
        icon={<ScanText className="text-primary-foreground h-6 w-6" aria-hidden="true" />}
        // ⚠️ The kiwi goes on the ICON TILE, not the card. A card-wide
        // `bg-primary` is the strongest step available (1.85 against the white
        // sibling) but it drags `text-muted-foreground` to 3.53:1, under AA — so
        // it would force the description to ink and flatten the two-level
        // hierarchy. On the tile the same colour touches no text: the icon is
        // ink at 8.85:1, far over the 3:1 an icon needs.
        //
        // Tints were measured and rejected: `bg-primary/5` is a 1.03 step
        // against the plain card and `/15` only 1.09 — arithmetically not there.
        // The lift comes from the tile, the shadow and demoting the sibling.
        badge={
          <span className="bg-primary/15 text-primary-strong rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            {t('welcome.choice_ai_badge')} · {t('welcome.choice_ai_paid')}
          </span>
        }
        className="shadow-[var(--elevation-1)] sm:p-6"
        iconClassName="bg-primary border-transparent"
      />

      <OptionCard
        onClick={() => {
          const input = document.getElementById('file-upload') as HTMLInputElement;
          input?.click();
        }}
        title={t('welcome.choice_direct_title')}
        description={t('welcome.choice_direct_desc')}
        icon={<FileJson className="text-muted-foreground h-5 w-5" aria-hidden="true" />}
        // Demoted to a quiet row rather than a second competing card. This path
        // needs a file already in KiwiCV format, so it is the rarer of the two by
        // a wide margin; the hierarchy comes from making this stop shouting, not
        // from making the other one louder.
        //
        // ⚠️ `border-transparent`, not no border: the 1px stays so the row keeps
        // the card's height and padding rhythm. The affordance is the hover fill
        // and the chevron, which is how a list row reads.
        className="border-transparent bg-transparent p-3 shadow-none sm:p-4"
        iconClassName="border-transparent bg-transparent h-9 w-9"
      />
      <input
        id="file-upload"
        type="file"
        accept=".json"
        onChange={onFileUpload}
        className="hidden"
      />

      {/* ⚠️ No back button here, deliberately. `import_choice` is the FIRST step —
          every caller opens the modal on it — so there was nothing to go back
          to, and the control called `onClose`: it said "Back" and did "Close",
          duplicating the X two inches above it. Being `w-full` it was also the
          largest target in a dialog whose whole job is to get someone into one
          of the two cards above.

          `AIImportView` keeps its back, because that one is real: it returns to
          this step. */}
    </div>
  );
}
