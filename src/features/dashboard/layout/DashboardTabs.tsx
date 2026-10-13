import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { Eye, Palette, SquarePen } from 'lucide-react';

export type DashboardTabMode = 'editor' | 'design' | 'preview';

interface DashboardTabsProps {
  activeTab: DashboardTabMode;
  onTabChange: (tab: DashboardTabMode) => void;
  showPreview?: boolean;
}

export const DashboardTabs = ({ activeTab, onTabChange, showPreview }: DashboardTabsProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedToggle
      value={activeTab}
      onChange={onTabChange}
      className="w-auto sm:min-w-[190px]"
      options={[
        {
          value: 'editor',
          label: t('dashboard.edit'),
          labelClassName: 'hidden sm:inline',
          hint: t('dashboard.edit'),
          icon: <SquarePen size={16} className="shrink-0" />,
        },
        {
          value: 'design',
          label: t('dashboard.design'),
          labelClassName: 'hidden sm:inline',
          hint: t('dashboard.design'),
          icon: <Palette size={16} className="shrink-0" />,
        },
        ...(showPreview
          ? [
              {
                value: 'preview' as const,
                label: t('dashboard.preview'),
                labelClassName: 'hidden sm:inline',
                hint: t('dashboard.preview'),
                icon: <Eye size={16} className="shrink-0" />,
              },
            ]
          : []),
      ]}
    />
  );
};
