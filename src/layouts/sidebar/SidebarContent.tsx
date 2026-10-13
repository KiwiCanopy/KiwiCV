import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BRAND_CONFIG } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { InterfaceLanguageSelect } from '@/layouts/sidebar/InterfaceLanguageSelect';
import { SidebarUserSection } from '@/layouts/sidebar/SidebarUserSection';
import {
  type SidebarNavItem,
  learnNavItems,
  moreNavItems,
  primaryNavItems,
} from '@/layouts/sidebar/navigation';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

interface SidebarContentProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

function NavigationItem({ item, isCollapsed }: { item: SidebarNavItem; isCollapsed?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname.endsWith(`/${item.path}`);

  return (
    <Link
      to={item.path}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
        isActive
          ? 'bg-nav-active text-nav-foreground-strong'
          : 'text-nav-foreground hover:bg-nav-active hover:text-nav-foreground-strong',
        isCollapsed && 'justify-center px-0',
      )}
      title={isCollapsed ? t(item.label) : undefined}
    >
      {isActive && (
        <span className="bg-kiwi absolute left-0 h-5 w-1 rounded-r" aria-hidden="true" />
      )}
      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {!isCollapsed && <span>{t(item.label)}</span>}
    </Link>
  );
}

function NavLabel({ children }: { children: string }) {
  return <p className="text-nav-foreground px-3 pt-3 pb-1 text-xs font-semibold">{children}</p>;
}

export function SidebarContent({ isCollapsed, onToggle, isMobile }: SidebarContentProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const [moreOpen, setMoreOpen] = useState(() =>
    moreNavItems.some((item) => location.pathname.endsWith(`/${item.path}`)),
  );
  const compact = isCollapsed && !isMobile;

  return (
    <div className="bg-nav text-nav-foreground flex h-full flex-col">
      <div className="border-nav-border flex h-16 shrink-0 items-center border-b px-3">
        <Link
          to="."
          className={cn('flex min-h-11 min-w-11 items-center', compact && 'justify-center')}
          // Only the icon-only rail needs a name; otherwise the visible "KiwiCV" is it (WCAG 2.5.3).
          aria-label={compact ? t('sidebar.home') : undefined}
        >
          <img src={BRAND_CONFIG.assets.symbol} alt="" className="h-8 w-8 object-contain" />
          {!compact && (
            <span className="text-nav-foreground-strong ml-3 text-lg font-semibold tracking-tight">
              KiwiCV
            </span>
          )}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost hover:bg-nav-active hover:text-nav-foreground-strong ml-auto h-11 w-11 p-0"
            aria-label={t('common.close_menu')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          !compact && (
            <button
              type="button"
              onClick={onToggle}
              className="btn-ghost hover:bg-nav-active hover:text-nav-foreground-strong ml-auto h-11 w-11 p-0"
              aria-label={t('header.toggle_sidebar')}
            >
              <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label={t('header.toggle_sidebar')}>
        {compact && (
          <button
            type="button"
            onClick={onToggle}
            className="btn-ghost hover:bg-nav-active hover:text-nav-foreground-strong mb-2 h-11 w-full p-0"
            aria-label={t('header.toggle_sidebar')}
          >
            <ChevronsRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <div className="space-y-1">
          {primaryNavItems.map((item) => (
            <NavigationItem key={item.path} item={item} isCollapsed={compact} />
          ))}
        </div>

        {!compact && <NavLabel>{t('sidebar.learn')}</NavLabel>}
        <div className={cn('space-y-1', compact && 'border-nav-border mt-3 border-t pt-3')}>
          {learnNavItems.map((item) => (
            <NavigationItem key={item.path} item={item} isCollapsed={compact} />
          ))}
        </div>

        {compact ? (
          <button
            type="button"
            onClick={onToggle}
            className="text-nav-foreground hover:bg-nav-active hover:text-nav-foreground-strong mt-1 flex h-11 w-full items-center justify-center rounded-lg"
            aria-label={t('sidebar.more')}
            title={t('sidebar.more')}
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="text-nav-foreground hover:bg-nav-active hover:text-nav-foreground-strong flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-medium"
              aria-expanded={moreOpen}
              aria-controls="sidebar-more-navigation"
            >
              {t('sidebar.more')}
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', moreOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            {moreOpen && (
              <div id="sidebar-more-navigation" className="mt-1 space-y-1 pl-2">
                {moreNavItems.map((item) => (
                  <NavigationItem key={item.path} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="border-nav-border space-y-2 border-t p-3">
        <InterfaceLanguageSelect isCollapsed={compact} />
      </div>
      <SidebarUserSection isCollapsed={compact} />
    </div>
  );
}
