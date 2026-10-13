import { type SegmentedOption, SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { BRAND_CONFIG } from '@/config/brand';
import { extrasTabs } from '@/features/extras/extrasTabs';
import type { ExtrasTabId } from '@/features/extras/types';
import { cn } from '@/utils/cn';

interface ExtrasTabNavigationProps {
  activeTab: ExtrasTabId;
  onTabChange: (tab: ExtrasTabId) => void;
  t: (key: string) => string;
}

export const ExtrasTabNavigation = ({ activeTab, onTabChange, t }: ExtrasTabNavigationProps) => {
  const options: SegmentedOption<ExtrasTabId>[] = extrasTabs.map((tab) => ({
    value: tab.id,
    label: t(tab.labelKey),
    labelClassName: 'hidden sm:inline',
    icon: tab.isLogo ? (
      <img
        src={BRAND_CONFIG.assets.symbol}
        alt="KiwiCV"
        className={cn(
          'h-5 w-5 object-contain contrast-125 transition-all duration-200',
          activeTab === tab.id ? 'grayscale-0' : 'opacity-70 grayscale transition-all',
        )}
      />
    ) : tab.icon ? (
      <tab.icon className="h-5 w-5 transition-all duration-200" />
    ) : null,
  }));

  return (
    <div className="mb-8 w-full">
      <SegmentedToggle
        className="!h-13"
        options={options}
        value={activeTab}
        onChange={onTabChange}
      />
    </div>
  );
};
