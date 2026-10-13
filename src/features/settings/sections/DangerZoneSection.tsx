import { Button } from '@/components/ui/Button';
import { CircleAlert, Trash2 } from 'lucide-react';

interface DangerZoneSectionProps {
  title: string;
  actionTitle: string;
  description: string;
  buttonLabel: string;
  onClearData: () => void;
}

export const DangerZoneSection = ({
  title,
  actionTitle,
  description,
  buttonLabel,
  onClearData,
}: DangerZoneSectionProps) => {
  return (
    <div className="border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/15 overflow-hidden rounded-xl border">
      <div className="border-destructive/20 flex items-center justify-between border-b px-6 py-5">
        <h3 className="text-destructive text-lg font-extrabold">{title}</h3>
        <CircleAlert className="text-destructive h-5 w-5" />
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div>
          <p className="text-foreground mb-1 text-sm font-semibold">{actionTitle}</p>
          <p className="text-muted-foreground max-w-md text-sm">{description}</p>
        </div>
        <Button
          variant="danger"
          onClick={onClearData}
          className="px-6 py-3 font-bold whitespace-nowrap"
        >
          <Trash2 className="h-5 w-5" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
