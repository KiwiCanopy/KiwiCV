import { CUSTOM_SECTION_ICON } from '@/data/sections';
import { RAIL_ICONS, RAIL_LABEL_KEYS } from '@/features/dashboard/editor/rail/railSections';
import { type RailRowState } from '@/features/dashboard/editor/rail/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { isCustomSectionToken } from '@/utils/layoutMetadata';
import { ChevronRight } from 'lucide-react';

interface PhoneGroupRowProps extends RailRowState {
  onSelect: () => void;
}

/** One tappable section row in the phone section list. */
export function PhoneGroupRow({
  sectionKey,
  label: labelOverride,
  entryCount,
  proposalCount,
  onSelect,
}: PhoneGroupRowProps) {
  const { t } = useTranslation();
  const isCustom = isCustomSectionToken(sectionKey);
  const Icon = isCustom ? CUSTOM_SECTION_ICON : RAIL_ICONS[sectionKey];
  const label = labelOverride ?? (isCustom ? '' : t(RAIL_LABEL_KEYS[sectionKey]));

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="border-border/60 bg-card hover:bg-muted/40 flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200"
      >
        <Icon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{label}</span>

        {proposalCount > 0 ? (
          <>
            <span
              className="bg-kiwi/25 ring-kiwi text-foreground inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ring-1"
              aria-hidden="true"
            >
              {proposalCount}
            </span>
            <span className="sr-only">
              {t('editor.rail.proposals_waiting', { count: proposalCount })}
            </span>
          </>
        ) : (
          entryCount !== undefined && (
            <span
              className={cn(
                'text-muted-foreground bg-muted inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-[10px] font-medium',
                entryCount === 0 ? 'opacity-40 grayscale' : 'opacity-100',
              )}
            >
              {entryCount}
            </span>
          )
        )}

        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}
