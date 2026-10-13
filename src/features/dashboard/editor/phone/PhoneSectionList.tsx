import { PhoneGroupRow } from '@/features/dashboard/editor/phone/PhoneGroupRow';
import { RAIL_GROUPS } from '@/features/dashboard/editor/rail/railSections';
import { type EditorSectionKey, type RailRowState } from '@/features/dashboard/editor/rail/types';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight, Plus } from 'lucide-react';

interface PhoneSectionListProps {
  rows: RailRowState[];
  customRows: RailRowState[];
  onSelect: (key: EditorSectionKey) => void;
  onAddCustomSection: () => void;
}

/**
 * The phone stand-in for the rail. A 246px sidebar beside a 375px viewport is
 * not a layout, so the list and the section take turns: the list is the editor's
 * home screen and picking a row replaces it with that section, which offers
 * "All sections" to come back. Same rows, same order, same badges.
 */
export function PhoneSectionList({
  rows,
  customRows,
  onSelect,
  onAddCustomSection,
}: PhoneSectionListProps) {
  const { t } = useTranslation();
  const rowsByKey = new Map(rows.map((row) => [row.sectionKey, row]));

  return (
    <nav aria-label={t('editor.rail.title')} className="space-y-5">
      {RAIL_GROUPS.map((group) => (
        <div key={group.id}>
          {group.labelKey && (
            <h2 className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
              {t(group.labelKey)}
            </h2>
          )}
          <ul className="space-y-2">
            {group.sections.map((sectionKey) => {
              const row = rowsByKey.get(sectionKey);

              return (
                <PhoneGroupRow
                  key={sectionKey}
                  sectionKey={sectionKey}
                  entryCount={row?.entryCount}
                  proposalCount={row?.proposalCount ?? 0}
                  onSelect={() => onSelect(sectionKey)}
                />
              );
            })}
          </ul>
        </div>
      ))}

      <div>
        <h2 className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
          {t('editor.custom_sections.group_title')}
        </h2>
        <ul className="space-y-2">
          {customRows.map((row) => (
            <PhoneGroupRow
              key={row.sectionKey}
              sectionKey={row.sectionKey}
              label={row.label}
              entryCount={row.entryCount}
              proposalCount={row.proposalCount}
              onSelect={() => onSelect(row.sectionKey)}
            />
          ))}
          <li>
            <button
              type="button"
              onClick={onAddCustomSection}
              className="border-input bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200"
            >
              <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {t('editor.custom_sections.add')}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
