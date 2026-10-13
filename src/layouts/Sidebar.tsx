import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Sheet } from '@/components/ui/Sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTranslation } from '@/hooks/useTranslation';
import { SidebarContent } from '@/layouts/sidebar/SidebarContent';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const {
    isSidebarOpen,
    setSidebarOpen,
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed,
  } = useUIStore();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // At `lg` the Sheet is CSS-hidden but Radix keeps the page inert
  // (`pointer-events: none` on body), e.g. a tablet rotated with the menu open.
  // `64rem` is Tailwind v4's `lg` itself; a px query drifts from it under a larger default font.
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  const toggleSidebar = () => setSidebarCollapsed(!isCollapsed);
  const collapseSidebar = () => {
    if (!isCollapsed) setSidebarCollapsed(true);
  };

  return (
    <>
      <div className="hidden shrink-0 lg:flex">
        <div className="h-screen w-[68px] shrink-0" />
        {!isCollapsed && (
          <div
            className="fixed inset-0 z-[30] bg-black/20 transition-opacity"
            onClick={collapseSidebar}
          />
        )}
        <div
          className={cn(
            'border-nav-border fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-[68px]' : 'w-[256px] shadow-[var(--elevation-2)]',
          )}
        >
          <SidebarContent isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        </div>
      </div>

      <Sheet
        open={isSidebarOpen}
        onOpenChange={setSidebarOpen}
        title={t('sidebar.menu_title')}
        description={t('sidebar.menu_description')}
        overlayClassName="lg:hidden"
        className="w-[min(20rem,88vw)] lg:hidden"
      >
        <SidebarContent isMobile />
      </Sheet>
    </>
  );
}
