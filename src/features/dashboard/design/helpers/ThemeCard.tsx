import { memo } from 'react';

import type { ThemeMeta } from '@/components/preview/ThemeRegistry';
import { ThemeMiniature } from '@/features/dashboard/design/helpers/ThemeMiniature';

interface ThemeCardProps {
  theme: ThemeMeta;
  isActive: boolean;
  onSelect: (id: string) => void;
  t: (path: string) => string;
}

export const ThemeCard = memo(({ theme, isActive, onSelect, t }: ThemeCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      aria-pressed={isActive}
      aria-label={t(theme.nameKey)}
      className="group focus-visible:ring-ring flex w-full snap-start flex-col items-center rounded-xl p-2 transition-colors focus-visible:ring-3 focus-visible:outline-none"
    >
      <div
        className={`relative mb-3 flex h-36 w-28 flex-col overflow-hidden rounded-lg border transition-colors duration-200 ${
          isActive
            ? 'border-primary-strong ring-primary-strong/25 ring-2'
            : 'bg-background border-border hover:border-primary-strong/50'
        }`}
      >
        <ThemeMiniature theme={theme} />
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold tracking-tight transition-colors ${isActive ? 'text-primary-strong' : 'text-muted-foreground group-hover:text-foreground'}`}
        >
          {t(theme.nameKey)}
        </span>
        {isActive && <div className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden="true" />}
      </div>
    </button>
  );
});

ThemeCard.displayName = 'ThemeCard';
