import { memo } from 'react';

import { TwoColumnLayoutColumn } from '@/features/dashboard/design/layout/TwoColumnLayoutColumn';
import { useTwoColumnLayoutEditor } from '@/features/dashboard/design/layout/useTwoColumnLayoutEditor';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { cn } from '@/utils/cn';
import { FlipHorizontal, FlipVertical } from 'lucide-react';

export const TwoColumnLayoutEditor = memo(() => {
  const { isStandard } = useEditorBreakpoints();
  const {
    t,
    isValidLayout,
    isAllEmpty,
    mainSections,
    sideSections,
    hiddenSections,
    labels,
    pageBreaks,
    sidebarPosition,
    sideColRef,
    mainColRef,
    middleRef,
    moveToSide,
    moveToMain,
    handleReorderMain,
    handleReorderSide,
    handleToggleVisibility,
    handleEditSection,
    handleFlip,
    togglePageBreak,
  } = useTwoColumnLayoutEditor();

  if (!isValidLayout) return null;

  const commonColumnProps = {
    labels,
    hiddenSections,
    canSwapItems: true,
    onToggleVisibility: handleToggleVisibility,
    onEdit: handleEditSection,
    showLabel: t('common.show'),
    hideLabel: t('common.hide'),
    editLabel: t('common.edit'),
    isAllEmpty,
  };

  return (
    <div className="clean-scrollbar -mx-2 space-y-6 overflow-x-auto px-2">
      <div
        className={cn(
          'relative flex min-h-[200px] w-full min-w-fit flex-col items-stretch gap-6 px-1 pt-2 pb-4',
          isStandard && '@3xl:flex-row @3xl:gap-0',
        )}
      >
        <div
          ref={sideColRef}
          className={cn(
            'w-full px-1',
            isStandard ? '@3xl:flex-1' : '',
            sidebarPosition === 'right' ? 'order-3' : 'order-1',
          )}
        >
          <TwoColumnLayoutColumn
            {...commonColumnProps}
            title={t('design.layout_side_column')}
            items={sideSections}
            onSwap={moveToMain}
            onReorder={handleReorderSide}
            pageBreaks={pageBreaks.sidebar || []}
            onTogglePageBreak={(id) => togglePageBreak('sidebar', id)}
          />
        </div>

        <div
          ref={middleRef}
          className={cn(
            'relative order-2 flex w-full flex-shrink-0 items-center justify-center py-2 @3xl:py-0',
            isStandard ? '@3xl:w-20' : 'w-full',
          )}
        >
          <div
            className={cn(
              'bg-border/50 pointer-events-none absolute left-1/2 z-0 -ml-[0.5px] hidden h-full w-[1px]',
              isStandard && '@3xl:block',
            )}
          />
          <div
            className={cn(
              'bg-border/50 pointer-events-none absolute top-1/2 z-0 -mt-[0.5px] block h-[1px] w-full',
              isStandard && '@3xl:hidden',
            )}
          />
          <div className="relative z-20 flex h-full min-h-[50px] flex-col items-center justify-center p-0">
            <button
              type="button"
              onClick={handleFlip}
              title={t('design.layout_flip')}
              aria-label={t('design.layout_flip')}
              className="bg-background hover:bg-muted text-primary-strong hover:text-foreground group border-input rounded-full border p-2.5 shadow-md transition-all active:scale-95"
            >
              <FlipHorizontal
                size={20}
                className={cn(
                  'hidden transition-transform duration-500',
                  isStandard && '@3xl:block',
                  sidebarPosition === 'right' && 'rotate-180',
                )}
                strokeWidth={2}
              />
              <FlipVertical
                size={20}
                className={cn(
                  'transition-transform duration-500',
                  isStandard && '@3xl:hidden',
                  sidebarPosition === 'right' && 'rotate-180',
                )}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        <div
          ref={mainColRef}
          className={cn(
            'w-full px-1',
            isStandard ? '@3xl:flex-1' : '',
            sidebarPosition === 'right' ? 'order-1' : 'order-3',
          )}
        >
          <TwoColumnLayoutColumn
            {...commonColumnProps}
            title={t('design.layout_main_column')}
            items={mainSections}
            onSwap={moveToSide}
            onReorder={handleReorderMain}
            pageBreaks={pageBreaks.main || []}
            onTogglePageBreak={(id) => togglePageBreak('main', id)}
            isMain={true}
          />
        </div>
      </div>
    </div>
  );
});

TwoColumnLayoutEditor.displayName = 'TwoColumnLayoutEditor';
