import { NavLink } from 'react-router-dom';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { User as UserIcon } from 'lucide-react';

export function SidebarUserSection({ isCollapsed }: { isCollapsed?: boolean }) {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslation();
  const name =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  if (loading) {
    return (
      <div
        className={cn(
          'border-nav-border bg-nav border-t transition-all duration-200',
          isCollapsed ? 'p-2' : 'p-3',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl',
            isCollapsed && 'justify-center',
            !isCollapsed && 'bg-nav-active border-nav-border border p-2',
          )}
        >
          <div
            className={cn(
              'bg-nav-active shrink-0 animate-pulse rounded-lg',
              isCollapsed ? 'h-9 w-9' : 'h-10 w-10',
            )}
          />
          {!isCollapsed && (
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="bg-nav-active h-3.5 w-24 animate-pulse rounded-full" />
              <div className="bg-nav-active h-2.5 w-32 animate-pulse rounded-full opacity-60" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-nav-border bg-nav border-t transition-all duration-200',
        isCollapsed ? 'p-2' : 'p-3',
      )}
    >
      {!user ? (
        <NavLink
          to="account"
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3 rounded-xl transition-all',
              isCollapsed
                ? 'justify-center p-2'
                : 'hover:bg-nav-active border-nav-border border p-2',
              isActive && 'bg-nav-active border-nav-border text-nav-foreground-strong',
              'before:bg-primary before:absolute before:top-1/2 before:h-6 before:w-1 before:origin-left before:-translate-y-1/2 before:rounded-r-full before:transition-all before:duration-300 before:content-[""]',
              isCollapsed ? 'before:left-[-8px]' : 'before:left-[-12px]',
              isActive
                ? 'before:scale-y-100 before:opacity-100'
                : 'before:scale-y-0 before:opacity-0',
            )
          }
        >
          <div
            className={cn(
              'border-nav-border bg-nav-active group-hover:bg-nav-active flex shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors',
              isCollapsed ? 'h-9 w-9' : 'h-10 w-10',
            )}
          >
            <UserIcon className="text-nav-foreground h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="text-nav-foreground-strong truncate text-sm leading-tight font-bold">
                {t('auth.not_logged_in')}
              </span>
              <span className="text-nav-foreground-strong truncate text-[10px] leading-tight font-black tracking-widest uppercase">
                {t('auth.sign_in_now')}
              </span>
            </div>
          )}
        </NavLink>
      ) : (
        <NavLink
          to="account"
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl transition-all',
              isCollapsed ? 'justify-center' : 'hover:bg-nav-active border-nav-border border p-2',
              isActive && 'bg-nav-active border-nav-border',
              'before:bg-primary before:absolute before:top-1/2 before:h-6 before:w-1 before:origin-left before:-translate-y-1/2 before:rounded-r-full before:transition-all before:duration-300 before:content-[""]',
              isCollapsed ? 'before:left-[-8px]' : 'before:left-[-12px]',
              isActive
                ? 'before:scale-y-100 before:opacity-100'
                : 'before:scale-y-0 before:opacity-0',
            )
          }
        >
          <div
            className={cn(
              'bg-nav-active border-nav-border relative shrink-0 overflow-hidden rounded-lg border transition-colors',
              isCollapsed ? 'h-9 w-9' : 'h-10 w-10',
            )}
          >
            <UserAvatar url={avatarUrl} name={name} className="h-full w-full" />
          </div>
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="text-nav-foreground-strong truncate text-sm leading-tight font-bold">
                {name}
              </span>
              <span className="text-nav-foreground mt-0.5 truncate text-[10px] leading-tight font-medium">
                {email}
              </span>
            </div>
          )}
        </NavLink>
      )}
    </div>
  );
}
