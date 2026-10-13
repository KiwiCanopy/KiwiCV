import { memo, useEffect, useRef } from 'react';

import { getThemeList } from '@/components/preview/ThemeRegistry';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { ThemeCard } from '@/features/dashboard/design/helpers/ThemeCard';
import { Columns2, Square } from 'lucide-react';

interface ThemeSelectorProps {
  themeList: ReturnType<typeof getThemeList>;
  localThemeId: string;
  layoutFilter: 'one-column' | 'two-column';
  setLayoutFilter: (filter: 'one-column' | 'two-column') => void;
  handleThemeChange: (id: string) => void;
  t: (path: string) => string;
}

export const ThemeSelector = memo(
  ({
    themeList,
    localThemeId,
    layoutFilter,
    setLayoutFilter,
    handleThemeChange,
    t,
  }: ThemeSelectorProps) => {
    const activeCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Small timeout to ensure the grid is rendered and filter applied
      const timer = setTimeout(() => {
        if (activeCardRef.current) {
          activeCardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }, [layoutFilter, localThemeId]);

    return (
      <div className="space-y-5">
        {/* Layout Filter Toggle */}
        <div className="flex w-full flex-col items-start justify-center">
          <SegmentedToggle
            value={layoutFilter}
            onChange={setLayoutFilter}
            options={[
              {
                value: 'one-column',
                label: t('design.design_filter.one_column'),
                // Longer locales ("Twee kolommen", "Deux colonnes") need more
                // than the ~150px a segment gets at 375px and were clipped by
                // the track. Below the panel's own @sm the label drops a step
                // instead of losing its tail — the label stays whole in every
                // locale rather than becoming icon-only.
                labelClassName: 'text-xs @sm:text-sm',
                hint: t('design.design_filter.one_column'),
                icon: <Square size={14} className="shrink-0" />,
              },
              {
                value: 'two-column',
                label: t('design.design_filter.two_column'),
                labelClassName: 'text-xs @sm:text-sm',
                hint: t('design.design_filter.two_column'),
                icon: <Columns2 size={14} className="shrink-0" />,
              },
            ]}
            className="w-full"
          />
        </div>

        {/* Templates Grid */}
        <div className="-mx-1 space-y-0">
          <div className="clean-scrollbar snap-x overflow-x-auto px-1 py-2">
            <div className="flex w-fit gap-3">
              {themeList
                .filter(
                  (theme: ReturnType<typeof getThemeList>[0]) => theme.layout === layoutFilter,
                )
                .map((theme: ReturnType<typeof getThemeList>[0]) => {
                  const isActive = localThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      ref={isActive ? activeCardRef : null}
                      className="min-w-[128px] snap-center"
                    >
                      <ThemeCard
                        theme={theme}
                        isActive={isActive}
                        onSelect={handleThemeChange}
                        t={t}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ThemeSelector.displayName = 'ThemeSelector';
