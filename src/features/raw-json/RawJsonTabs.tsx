import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import type { RawJsonTab, RawJsonTabId } from '@/features/raw-json/types';

interface RawJsonTabsProps {
  tabs: readonly RawJsonTab[];
  activeTab: RawJsonTabId;
  onTabChange: (tab: RawJsonTabId) => void;
}

export const RawJsonTabs = ({ tabs, activeTab, onTabChange }: RawJsonTabsProps) => {
  return (
    <SegmentedToggle
      value={activeTab}
      onChange={(val) => onTabChange(val as RawJsonTabId)}
      options={tabs.map((tab) => ({
        value: tab.id,
        label: tab.label,
      }))}
      className="w-auto"
    />
  );
};
