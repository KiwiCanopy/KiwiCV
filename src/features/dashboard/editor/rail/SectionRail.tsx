import { IconButton } from '@/components/ui/IconButton';
import { AddSectionRailRow } from '@/features/dashboard/editor/rail/AddSectionRailRow';
import { SectionRailRow } from '@/features/dashboard/editor/rail/SectionRailRow';
import { RAIL_GROUPS } from '@/features/dashboard/editor/rail/railSections';
import { type EditorSectionKey, type RailRowState } from '@/features/dashboard/editor/rail/types';
import {
  EDITOR_RAIL_COLLAPSED_WIDTH,
  EDITOR_RAIL_WIDTH,
} from '@/features/dashboard/layout/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SectionRailProps {
  rows: RailRowState[];
  /** One per custom section, in `resume.customSections` order. */
  customRows: RailRowState[];
  activeSection: EditorSectionKey;
  isCollapsed: boolean;
  onSelect: (key: EditorSectionKey) => void;
  onAddCustomSection: () => void;
  onToggleCollapsed: () => void;
}

/**
 * The editor's persistent section list. It replaces the five collapsible
 * `SectionGroup` accordions: the groups survive as headings, but only one
 * section is ever mounted, so "where am I" is answered by the rail rather than
 * by how far the user has scrolled.
 *
 * It is a flex sibling of the section panel and sits *outside*
 * `EditorLayoutProvider`, so the width the forms are told they have is the
 * column's, not the pane's. Collapsing the rail therefore does widen the entry
 * column, and a form may legitimately switch to a roomier layout — which is the
 * honest answer: the space really did change.
 */
export function SectionRail({
  rows,
  customRows,
  activeSection,
  isCollapsed,
  onSelect,
  onAddCustomSection,
  onToggleCollapsed,
}: SectionRailProps) {
  const { t } = useTranslation();
  const rowsByKey = new Map(rows.map((row) => [row.sectionKey, row]));

  return (
    <nav
      data-editor-rail=""
      aria-label={t('editor.rail.title')}
      className="border-border bg-rail flex h-full min-h-0 shrink-0 flex-col border-r transition-[width] duration-200"
      style={{ width: isCollapsed ? EDITOR_RAIL_COLLAPSED_WIDTH : EDITOR_RAIL_WIDTH }}
    >
      <div
        className={cn(
          'flex min-h-11 items-center gap-2 px-2 pb-2',
          isCollapsed ? 'justify-center' : 'justify-between pl-3',
        )}
      >
        {!isCollapsed && (
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('editor.rail.title')}
          </h2>
        )}
        <IconButton
          label={isCollapsed ? t('editor.rail.expand') : t('editor.rail.collapse')}
          title={isCollapsed ? t('editor.rail.expand') : t('editor.rail.collapse')}
          onClick={onToggleCollapsed}
          variant="quiet"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </IconButton>
      </div>

      <div className="clean-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-6">
        {RAIL_GROUPS.map((group, index) => (
          <div key={group.id} className="mb-3 last:mb-0">
            {/* A collapsed rail shows icons only, so the headings go with the
                labels; a rule keeps the grouping legible without them. The
                cover letter has no heading at either width — it is one row, and
                a heading repeating its own label would be noise.

                ⚠️ The cover letter leads the rail, so its rule sits *below* it:
                above the first row it would separate nothing. Only when
                expanded — a collapsed rail already draws a rule above every
                group after the first, which is the same line, and drawing both
                would double it. */}
            {isCollapsed || !group.labelKey
              ? index > 0 && (
                  <div className="border-border/60 mx-3 mt-2 mb-1 border-t" aria-hidden="true" />
                )
              : group.labelKey && (
                  <h3 className="text-muted-foreground px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                    {t(group.labelKey)}
                  </h3>
                )}
            <ul className="space-y-0.5">
              {group.sections.map((sectionKey) => {
                const row = rowsByKey.get(sectionKey);

                return (
                  <SectionRailRow
                    key={sectionKey}
                    sectionKey={sectionKey}
                    entryCount={row?.entryCount}
                    proposalCount={row?.proposalCount ?? 0}
                    isActive={sectionKey === activeSection}
                    isCollapsed={isCollapsed}
                    onSelect={() => onSelect(sectionKey)}
                  />
                );
              })}
            </ul>
            {!isCollapsed && !group.labelKey && index === 0 && (
              <div className="border-border/60 mx-3 mt-2 mb-1 border-t" aria-hidden="true" />
            )}
          </div>
        ))}

        {/* Always shown, even with no custom section yet: its Add row is the
            only way to create one. */}
        <div className="mb-3 last:mb-0">
          {isCollapsed ? (
            <div className="border-border/60 mx-3 mt-2 mb-1 border-t" aria-hidden="true" />
          ) : (
            <h3 className="text-muted-foreground px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
              {t('editor.custom_sections.group_title')}
            </h3>
          )}
          <ul className="space-y-0.5">
            {customRows.map((row) => (
              <SectionRailRow
                key={row.sectionKey}
                sectionKey={row.sectionKey}
                label={row.label}
                entryCount={row.entryCount}
                proposalCount={row.proposalCount}
                isActive={row.sectionKey === activeSection}
                isCollapsed={isCollapsed}
                onSelect={() => onSelect(row.sectionKey)}
              />
            ))}
            <AddSectionRailRow isCollapsed={isCollapsed} onAdd={onAddCustomSection} />
          </ul>
        </div>
      </div>
    </nav>
  );
}
