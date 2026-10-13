import React from 'react';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { useTranslation } from '@/hooks/useTranslation';
import type { Profile } from '@/providers/AuthContext';
import type { User } from '@supabase/supabase-js';
import { Calendar, Mail } from 'lucide-react';

interface ProfileSectionProps {
  user: User;
  profile: Profile | null;
  formatUIDate: (date: string) => string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, profile, formatUIDate }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="bg-primary/5 border-primary-strong/10 relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 shadow-inner">
            <UserAvatar
              url={profile?.avatar_url || user.user_metadata?.avatar_url}
              name={profile?.full_name || user.user_metadata?.full_name}
              className="h-full w-full"
            />
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {profile?.full_name ||
                  user.user_metadata?.full_name ||
                  user.email?.split('@')[0] ||
                  t('account.member_fallback')}
              </h2>
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm md:justify-start">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <div className="bg-accent/50 border-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                <span>{t('account.joined_on', { date: formatUIDate(user.created_at) })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
