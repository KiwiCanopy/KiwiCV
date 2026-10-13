import React from 'react';

import { GitHubCard } from '@/features/settings/github/GitHubCard';
import { GoogleDriveCard } from '@/features/settings/google/GoogleDriveCard';
import { SettingsCard } from '@/features/settings/shared/SettingsCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Cloud } from 'lucide-react';

export const SyncAndStorageSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingsCard
      title={t('sync.title')}
      icon={<Cloud className="text-muted-foreground h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GoogleDriveCard />
        <GitHubCard />
      </div>
    </SettingsCard>
  );
};
