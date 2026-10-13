import { memo, useState } from 'react';

import type { ThemeMeta } from '@/components/preview/ThemeRegistry';

interface ThemeMiniatureProps {
  theme: ThemeMeta;
}

export const ThemeMiniature = memo(({ theme }: ThemeMiniatureProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="bg-muted/20 relative h-full w-full overflow-hidden">
      {/* The actual preview image */}
      <img
        src={theme.previewImage}
        alt=""
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`pointer-events-none h-full w-full object-cover object-top transition-all duration-700 ${
          isLoaded ? 'opacity-100' : 'scale-105 opacity-0'
        }`}
      />

      {/* Decorative overlay ("Glass" layer) */}
      <div
        className="bg-background/5 pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)`,
        }}
      />

      {/* Placeholder/Loading skeleton.
          The bars are drawn in `muted-foreground` on an opaque `muted` plate.
          They used to be 10–30% `muted` on a translucent surface, which
          measured 1.09–1.15:1 over the near-black dark `--background`: the
          gallery read as a blank flash rather than as loading. These alphas
          are the weaker theme's numbers — light 1.97–2.7:1, dark 3.2–4.9:1. */}
      {!isLoaded && (
        <div className="bg-muted absolute inset-0 flex animate-pulse flex-col space-y-2 p-3 motion-reduce:animate-none">
          <div className="bg-muted-foreground/70 h-2 w-3/4 rounded"></div>
          <div className="space-y-1.5 pt-1">
            <div className="bg-muted-foreground/50 h-1 w-full rounded-full"></div>
            <div className="bg-muted-foreground/50 h-1 w-full rounded-full"></div>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="bg-muted-foreground/60 h-1.5 w-1/2 rounded"></div>
            <div className="bg-muted-foreground/50 h-1 w-full rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
});

ThemeMiniature.displayName = 'ThemeMiniature';
