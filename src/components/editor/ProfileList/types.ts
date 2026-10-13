import { type SectionVariant } from '@/components/ui/section/types';
import { type ResumeData } from '@/types/resume';

export type LocalProfile = ResumeData['basics']['profiles'][0] & {
  _id: string;
  _vId?: string;
};

export interface ProfileListProps {
  profiles: ResumeData['basics']['profiles'];
  onChange: (profiles: ResumeData['basics']['profiles']) => void;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  variant?: SectionVariant;
}

export interface ProfileItemProps {
  profile: LocalProfile;
  index: number;
  isHidden: boolean;
  activeSuggestionIndex?: number | null;
  setActiveSuggestionIndex?: (index: number | null) => void;
  suggestionRef?: React.RefObject<HTMLDivElement | null>;
  updateProfile?: (index: number, updates: Partial<ResumeData['basics']['profiles'][0]>) => void;
  handleToggleVisibility?: (profile: LocalProfile) => void;
  removeProfile?: (index: number) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  tCV: (path: string) => string;
  dragHandleProps?: Record<string, unknown>;
  setNodeRef?: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
  forceCollapsed?: boolean;
  onNetworkLocalChange?: (index: number, value: string) => void;
  localNetworkValue?: string;
  moveProfile?: (index: number, direction: -1 | 1) => void;
  total?: number;
}
