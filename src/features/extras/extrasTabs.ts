import { ManualIcon } from '@/components/ui/Icons';
import type { ExtrasTabId } from '@/features/extras/types';
import { Clock, Map } from 'lucide-react';

export const extrasTabs: {
  id: ExtrasTabId;
  icon?: React.ComponentType<{ className?: string }>;
  labelKey: string;
  isLogo?: boolean;
}[] = [
  { id: 'howto', icon: ManualIcon, labelKey: 'extras.tabs.howto' },
  { id: 'roadmap', icon: Map, labelKey: 'extras.tabs.roadmap' },
  { id: 'changelog', icon: Clock, labelKey: 'extras.tabs.changelog' },
  { id: 'about', labelKey: 'extras.tabs.about', isLogo: true },
];
