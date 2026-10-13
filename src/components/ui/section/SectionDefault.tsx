import { SectionHeaderActions } from '@/components/ui/section/SectionHeaderActions';
import { type SectionViewProps } from '@/components/ui/section/types';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export function SectionDefault({
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
        // Container root so header actions can size their labels against the
        // editor column rather than the viewport. A wide side-by-side preview
        // narrows this column while the page stays wide.
        '@container transition-colors duration-200',
        isStandard
          ? 'bg-card border-border mb-8 rounded-xl border shadow-[var(--elevation-1)]'
          : 'border-border/20 mb-0 border-b py-2 last:border-b-0',
        isHidden ? 'opacity-50' : 'opacity-100',
      )}
    >
      <div
        className={cn(
          // Never wrap: the title truncates instead, so the actions stay on the
          // title's line rather than dropping to a second row and leaving a
          // tall empty header.
          'flex min-w-0 flex-nowrap items-center gap-x-4 gap-y-3',
          isStandard
            ? 'border-border rounded-t-xl border-b px-4 py-4 sm:px-6 sm:py-5'
            : 'px-0 py-2',
        )}
      >
        <HeaderControl
          {...headerControlProps}
          className={cn(
            'group flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left',
            isCollapsible && 'select-none',
          )}
        >
          {finalIcon && <div className="text-muted-foreground shrink-0">{finalIcon}</div>}
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                'text-foreground line-clamp-2 flex min-w-0 items-center gap-2 leading-tight font-semibold',
                isStandard ? 'text-lg' : 'text-sm opacity-90',
              )}
            >
              <span className="truncate">{title}</span>
            </h2>
            {description && isStandard && (
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            )}
          </div>
          {isCollapsible && (
            <ChevronDown
              className={cn(
                'text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200',
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
        />
      </div>
      {!isCollapsed && (
        <div id={panelId} className={cn(isStandard ? 'p-4 sm:p-6' : 'px-0 py-4')}>
          {children}
        </div>
      )}
    </div>
  );
}
