import type { ReactNode } from 'react';

import type { FieldLock } from '@/components/ui/fieldLock';
import type { LucideIcon } from 'lucide-react';

export type TagFieldControlType = 'input' | 'textarea';

export interface TagFieldProps {
  value?: string[];
  onChange: (value: string[]) => void;
  label?: string;
  singularLabel?: string;
  placeholder?: string;
  layoutHint?: string;
  layoutIcon?: LucideIcon;
  infoHint?: ReactNode;
  infoIcon?: LucideIcon;
  rows?: number;
  type?: TagFieldControlType;
  /**
   * Locks the list: the add field carries the reason, adding, editing, removing
   * and reordering are refused, and an entry typed or edited before the lock
   * arrived goes to the user's side of the proposal.
   */
  lock?: FieldLock | null;
}

export interface TagItem {
  id: string;
  text: string;
}

export interface SortableTagProps {
  id: string;
  text: string;
  index: number;
  onRemove: (id: string) => void;
  /** Opens the edit dialog, which the list owns so it survives the list being replaced. */
  onEdit?: (id: string, text: string) => void;
  isOverlay?: boolean;
  onMove?: (id: string, direction: -1 | 1) => void;
  total?: number;
  /**
   * The locked list's reason element. Set, every control is inert, out of the
   * tab order and described by it: the add field already announced why.
   */
  lockedReasonId?: string;
}
