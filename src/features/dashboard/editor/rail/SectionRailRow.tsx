import { CUSTOM_SECTION_ICON } from '@/data/sections';
import { RAIL_ICONS, RAIL_LABEL_KEYS } from '@/features/dashboard/editor/rail/railSections';
import { type EditorSectionKey } from '@/features/dashboard/editor/rail/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { isCustomSectionToken } from '@/utils/layoutMetadata';

interface SectionRailRowProps {
  sectionKey: EditorSectionKey;
  /** Required for a custom section; a built-in row resolves its own. */
  label?: string;
  /** `undefined` where the section has no countable entries. */
  entryCount?: number;
  proposalCount: number;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
}

export function SectionRailRow({
  sectionKey,
  label: labelOverride,
  entryCount,
  proposalCount,
  isActive,
  isCollapsed,
  onSelect,
}: SectionRailRowProps) {
  const { t } = useTranslation();
  const isCustom = isCustomSectionToken(sectionKey);
  const Icon = isCustom ? CUSTOM_SECTION_ICON : RAIL_ICONS[sectionKey];
  const label = labelOverride ?? (isCustom ? '' : t(RAIL_LABEL_KEYS[sectionKey]));
  const hasProposals = proposalCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? 'true' : undefined}
        title={isCollapsed ? label : undefined}
        className={cn(
          'group relative flex min-h-11 w-full items-center rounded-xl text-left transition-colors duration-200',
          isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
          isActive ? 'bg-rail-active text-foreground font-semibold' : 'hover:bg-muted/60',
        )}
      >
        {isActive && (
          <span
            className="bg-kiwi absolute top-2 bottom-2 left-0 w-1 rounded-r"
            aria-hidden="true"
          />
        )}
        {isCustom && isCollapsed ? (
          // Collapsed, every custom row would share one icon; its title's first
          // letter tells them apart. The name is in the sr-only label.
          <span
            aria-hidden="true"
            className={cn(
              'border-input flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold uppercase transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            {Array.from(label.trim())[0] ?? ''}
          </span>
        ) : (
          <Icon
            className={cn(
              'h-5 w-5 shrink-0 transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
        )}
        {isCollapsed ? (
          <span className="sr-only">{label}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
        )}

        {/* Either the proposal pill or the neutral count — never both. A row with
            pending AI work is asking to be visited, and the resting entry count
            beside it would only dilute that. */}
        {hasProposals ? (
          <>
            <span
              className={cn(
                'bg-kiwi/25 ring-kiwi text-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ring-1',
                isCollapsed ? 'absolute top-0.5 right-0.5' : 'shrink-0',
              )}
              aria-hidden="true"
            >
              {proposalCount}
            </span>
            <span className="sr-only">
              {t('editor.rail.proposals_waiting', { count: proposalCount })}
            </span>
          </>
        ) : (
          entryCount !== undefined &&
          !isCollapsed && (
            // Lifted from the section header's badge so the two cannot drift.
            <span
              className={cn(
                'text-muted-foreground bg-muted inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-[10px] font-medium transition-colors duration-200',
                entryCount === 0 ? 'opacity-40 grayscale' : 'opacity-100',
              )}
            >
              {entryCount}
            </span>
          )
        )}
      </button>
    </li>
  );
}
