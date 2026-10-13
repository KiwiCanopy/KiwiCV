import { Link } from 'react-router-dom';

import { BRAND_CONFIG } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { Menu } from 'lucide-react';

/** `showBrand` adds the logo and name beside the drawer trigger; the dashboard bar has no room for it. */
export function Header({
  className,
  showBrand = false,
}: {
  className?: string;
  showBrand?: boolean;
}) {
  const { setSidebarOpen } = useUIStore();
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'bg-card border-border flex h-16 shrink-0 items-center justify-between border-b px-3 transition-colors lg:px-6',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 lg:gap-4" id="header-tabs">
        {/* A menu glyph, not the logo: the logo read as brand, not as a drawer.
            Off the dashboard the brand sits beside it. */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-foreground hover:bg-secondary active:bg-secondary -ml-1 flex h-11 w-11 items-center justify-center rounded-lg transition-colors lg:hidden"
          aria-label={t('header.toggle_sidebar')}
          title={t('header.toggle_sidebar')}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        {showBrand && (
          <Link to="." className="flex min-h-11 items-center gap-2 lg:hidden">
            <img src={BRAND_CONFIG.assets.symbol} alt="" className="h-7 w-7 object-contain" />
            <span className="text-foreground text-lg font-semibold tracking-tight">KiwiCV</span>
          </Link>
        )}
      </div>

      {/* Portal target for PreviewHeader actions */}
      <div className="flex shrink-0 flex-nowrap items-center gap-3">
        <div className="flex shrink-0 flex-nowrap items-center gap-3" id="header-actions" />
      </div>
    </header>
  );
}
