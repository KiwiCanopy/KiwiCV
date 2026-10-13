import { SectionHeaderActions } from '@/components/ui/section/SectionHeaderActions';
import { type SectionViewProps } from '@/components/ui/section/types';
import { SECTION_HEADING_ANCHOR_ID } from '@/constants/focusAnchors';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { cn } from '@/utils/cn';

/**
 * The editor rail mounts one section at a time, so this variant is the panel's
 * own heading rather than a card in a stack: no border box, no disclosure, and
 * the icon sits in the filled tile the deleted `SectionGroup` header used to own.
 *
 * Heading ladder (see DESIGN_LANGUAGE.md): editor page title 24px/800 → this
 * header 20px/700 → nested section 16px/600 → accordion entry 14px/500.
 */
export function SectionPage({
  title,
  description,
  children,
  actions,
  itemCount,
  isHidden,
  sectionId,
  aiTarget,
  finalIcon,
  aiAction,
}: SectionViewProps) {
  const { isStandard } = useEditorBreakpoints();

  return (
    <section
      className={cn(
        '@container flex min-w-0 flex-col transition-opacity duration-200',
        isHidden ? 'opacity-50' : 'opacity-100',
      )}
    >
      <header className="border-border flex min-w-0 flex-nowrap items-center gap-3 border-b pb-4 sm:gap-4">
        {finalIcon && (
          <span
            className={cn(
              'bg-muted text-foreground flex shrink-0 items-center justify-center rounded-xl',
              isStandard ? 'h-11 w-11' : 'h-9 w-9',
            )}
            aria-hidden="true"
          >
            {finalIcon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2
            /* The last rung of the proposal flow's focus handoff (UI_PATTERNS.md). `tabIndex={-1}` is focusable programmatically
               without joining the tab order; the id's uniqueness is pinned by
               `tests/lint/section-page-anchor.test.mjs`. */
            id={SECTION_HEADING_ANCHOR_ID}
            tabIndex={-1}
            className={cn(
              'text-foreground leading-tight font-bold',
              // ⚠️ Softer than the app-wide ring, and only here. `tokens.css`
              // draws 3px plus a 2px separator so a control is unmissable on any
              // ground; around a heading that reads as a text input, which is
              // what the owner saw. This is a place marker, not a control:
              // 2px, wider offset, rounded, no separator — the ink is 15:1 on the
              // editor surface, so 1.4.11 never needed the second layer here.
              // ⚠️ Not a colour change. Re-pointing focus tokens locally is what
              // broke the sidebar's ghost buttons (`tokens.css` .bg-nav).
              'focus-visible:border-l-foreground -ml-3 border-l-2 border-l-transparent pl-3 focus-visible:shadow-none focus-visible:outline-none',
              isStandard ? 'text-xl' : 'text-base',
            )}
          >
            <span className="line-clamp-2">{title}</span>
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <SectionHeaderActions
          sectionId={sectionId}
          aiTarget={aiTarget}
          aiAction={aiAction}
          actions={actions}
          itemCount={itemCount}
        />
      </header>

      <div className={cn(isStandard ? 'pt-6' : 'pt-4')}>{children}</div>
    </section>
  );
}
