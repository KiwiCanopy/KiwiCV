import { SectionHeaderActions } from '@/components/ui/section/SectionHeaderActions';
import { type SectionViewProps } from '@/components/ui/section/types';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export function SectionNested({
  title,
  description,
  children,
  actions,
  itemCount,
  isHidden,
  sectionId,
  aiTarget,
  finalIcon,
  isCollapsed,
  isCollapsible,
  panelId,
  aiAction,
  headerControlProps,
}: SectionViewProps) {
  const { isStandard } = useEditorBreakpoints();
  const HeaderControl = isCollapsible ? 'button' : 'div';

  return (
    <div
      className={cn(
        '@container last:mb-0',
        isStandard ? 'mb-4' : 'mb-3',
        isHidden ? 'opacity-50' : 'opacity-100',
      )}
    >
      {/* The box IS the field-holder, and it keeps its border: that plus the
          chevron is what reads as collapsible. Do not move the card to the
          body instead — that draws a second frame inside this one with a
          canvas gutter between them, and a borderless header leaves the user
          nothing to read as collapsible at all. */}
      <div
        className={cn(
          'transition-colors duration-200',
          isStandard && 'bg-card border-border/70 rounded-xl border shadow-[var(--elevation-1)]',
        )}
      >
        <div
          className={cn(
            'group flex min-w-0 flex-wrap items-start',
            isStandard ? 'px-3 py-3 sm:px-4 sm:py-4' : 'py-2',
            isCollapsible && 'select-none',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Narrow editor column: the action cluster is `shrink-0` and can
                run to five 44px controls, which squeezed the title to zero
                width and left the row unlabelled. Wrap the actions onto their
                own line instead, the way AccordionItem already does. */}
            <div
              className={cn(
                'flex min-h-[40px] min-w-0 items-center gap-x-2 gap-y-2 sm:gap-4',
                isStandard ? 'flex-nowrap' : 'flex-wrap',
              )}
            >
              <HeaderControl
                {...headerControlProps}
                // gap-2 below the sm viewport: the wide variant reaches
                // phone widths only on pages that pin the layout wide (the
                // Extras tabs) — inside the editor this branch requires a
                // >560px container, where sm: always applies.
                className="flex min-h-11 min-w-0 flex-auto shrink items-center gap-2 text-left sm:gap-4"
              >
                {/* Bare, not in a filled tile. The page variant one level up
                    uses a `bg-muted` rounded tile, and repeating it here made
                    the two headers rhyme instead of rank. */}
                {finalIcon && (
                  <div
                    className={cn(
                      'text-muted-foreground group-hover:text-foreground flex shrink-0 items-center justify-center transition-colors',
                      isStandard ? 'h-10 w-10' : 'h-8 w-8',
                    )}
                  >
                    {finalIcon}
                  </div>
                )}
                <div className="min-w-0 flex-auto shrink">
                  {/* 16px/600 at every width. The level below (AccordionItem)
                      is 14px/500 and the level above (the page header) 20px/700,
                      so size and weight both fall as nesting deepens. */}
                  <h3 className="text-foreground line-clamp-2 flex items-center gap-2 text-base leading-tight font-semibold break-words">
                    {title}
                  </h3>
                </div>
                {isCollapsible && (
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-transform duration-200',
                      !isCollapsed && 'rotate-180 transform',
                    )}
                    aria-hidden="true"
                  />
                )}
              </HeaderControl>

              <SectionHeaderActions
                sectionId={sectionId}
                aiTarget={aiTarget}
                aiAction={aiAction}
                actions={actions}
                itemCount={itemCount}
                badgeSize="sm"
                className={cn('gap-2 sm:gap-4', !isStandard && 'w-full justify-end')}
              />
            </div>

            {description && (
              <div className={cn('mt-0.5 pr-4', finalIcon && (isStandard ? 'pl-14' : 'pl-12'))}>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
        {!isCollapsed && (
          // A narrow column has no bordered box around this level, so the
          // left rule is the only thing showing that the items below belong
          // to this section rather than sitting beside it.
          <div
            id={panelId}
            className={cn(
              'pb-6',
              isStandard ? 'px-6 pt-0' : 'border-border/60 border-l-2 pt-2 pl-3',
            )}
          >
            <div className="border-border/50 border-t pt-4">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
