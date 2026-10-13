import React from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Plus } from 'lucide-react';

interface EmptySectionCardProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (id: string) => void;
}

/**
 * A section the resume does not have yet, offered for adding.
 *
 * Every card carries the same treatment. It used to pick one of five raw
 * palette hues from `SECTION_METADATA.color`, which put the entire rainbow on
 * screen at once on a fresh CV — none of those hues is a status, so under
 * DESIGN_LANGUAGE.md none of them earns a colour. The section's own icon is
 * the differentiator, and it survives the change.
 */
export const EmptySectionCard = ({ id, label, icon: Icon, onClick }: EmptySectionCardProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'bg-background/40 group flex h-full w-full items-center gap-2 rounded-lg border border-dashed px-2 py-1.5 transition-all duration-300',
        'border-border/50 text-muted-foreground hover:border-primary-strong/50 hover:bg-primary/5 hover:text-primary-strong',
      )}
    >
      <div
        className={cn(
          'bg-background flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/10 shadow-sm transition-transform duration-300 group-hover:scale-110',
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold select-none">{label}</span>

      <button
        type="button"
        onClick={() => onClick(id)}
        aria-label={t('common.add_named', { name: label })}
        title={t('common.add_named', { name: label })}
        className={cn(
          'text-primary-strong flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/15 bg-current/10 transition-colors hover:bg-current/20 focus-visible:ring-2 focus-visible:ring-current/40 focus-visible:outline-none',
        )}
      >
        <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
};
