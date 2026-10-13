import { memo } from 'react';

import { Slider } from '@/components/ui/Slider';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { RotateCcw, Type } from 'lucide-react';

interface FontSizeScaleProps {
  localFontSize: number;
  setLocalFontSize: (size: number) => void;
  t: (path: string) => string;
}

export const FontSizeScale = memo(({ localFontSize, setLocalFontSize, t }: FontSizeScaleProps) => {
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const { isStandard } = useEditorBreakpoints();

  const handleReset = () => {
    if (resume.meta.theme.params?.fontSizeScale === 1) return;
    setLocalFontSize(1);
    setTimeout(() => {
      updateMeta({
        theme: { ...resume.meta.theme, params: { ...resume.meta.theme.params, fontSizeScale: 1 } },
      });
    }, 0);
  };

  const handleValueChange = (vals: number[]) => {
    setLocalFontSize(vals[0]);
  };

  const handleValueCommit = (vals: number[]) => {
    const val = vals[0];
    const currentScale = resume.meta.theme.params?.fontSizeScale || 1;

    // Only update and sync if the value HAS actually changed
    if (Math.abs(val - currentScale) < 0.001) {
      return;
    }

    // Wrap update in a small timeout to let the "pop in" animation breathe
    setTimeout(() => {
      updateMeta({
        theme: {
          ...resume.meta.theme,
          params: { ...resume.meta.theme.params, fontSizeScale: val },
        },
      });
    }, 50);
  };

  return (
    <div className={cn('w-full pt-2', isStandard ? 'space-y-4' : 'space-y-3')}>
      <div className="space-y-1.5 px-1">
        <SectionLabel
          label={t('settings.components.font_size_scale.label')}
          icon={<Type size={20} strokeWidth={2.5} />}
        />
        <button
          onClick={handleReset}
          className={cn(
            'text-primary-strong hover:text-foreground group flex items-center gap-1.5 text-left text-[11px] font-bold tracking-wide uppercase transition-colors',
            isStandard ? 'pl-7' : 'pt-1 pl-0',
          )}
        >
          <RotateCcw size={12} className="transition-transform group-hover:-rotate-45" />
          {t('common.reset')}
        </button>
      </div>

      <div className="group/container flex w-full items-center gap-4 px-1">
        <div className="text-muted-foreground/25 group-hover/container:text-muted-foreground/50 flex min-w-[24px] items-center justify-end transition-colors">
          <Type size={12} strokeWidth={3} />
        </div>
        <div className="relative flex-1">
          <Slider
            min={0.5}
            max={1.5}
            step={0.01}
            value={[localFontSize]}
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            showTooltip={true}
            formatTooltip={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
        <div className="text-muted-foreground/25 group-hover/container:text-muted-foreground/50 flex min-w-[24px] items-center justify-start transition-colors">
          <Type size={22} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
});

FontSizeScale.displayName = 'FontSizeScale';
