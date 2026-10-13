import { type ReactNode } from 'react';

import { type AITargetKey } from '@/utils/aiTarget';
import { type SectionMetadataKey } from '@/utils/layoutMetadata';

/**
 * `page` is the editor rail's variant: exactly one section is mounted at a time,
 * so it drops the card chrome and the disclosure and reads as the panel's own
 * heading. `default` and `nested` still serve Extras and the legal pages, where
 * several sections stack and each one has to look like a box.
 */
export type SectionVariant = 'default' | 'nested' | 'page';

export interface SectionProps {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  itemCount?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  isHidden?: boolean;
  icon?: ReactNode;
  onToggle?: (collapsed: boolean) => void;
  variant?: SectionVariant;
  sectionId?: SectionMetadataKey;
  /**
   * Improve for a section `sectionId` cannot name — a custom section.
   * `isEmpty` renders the button refused, with the reason, instead of live.
   */
  aiTarget?: { target: AITargetKey; name: string; isEmpty: boolean };
}

/**
 * The header's Improve button: absent, live, or present but refused because the
 * section holds nothing to improve yet (shown disabled with its reason, never hidden).
 */
export type SectionAIAction = 'none' | 'ready' | 'empty';

/**
 * What the dispatcher resolves once and every variant renders. Keeping the
 * disclosure wiring, the icon fallback and the AI-eligibility test in one place
 * is the point of the split — three copies of the AI-eligibility test is how the badge
 * and the Improve button drifted apart before.
 */
export interface SectionViewProps extends SectionProps {
  finalIcon: ReactNode;
  isCollapsed: boolean;
  isCollapsible: boolean;
  panelId: string;
  aiAction: SectionAIAction;
  headerControlProps: Record<string, unknown>;
}
