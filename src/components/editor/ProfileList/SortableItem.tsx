import React from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { type ProfileItemProps } from './types';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isActive?: boolean;
  forceCollapsed?: boolean;
}

export function SortableItem({ id, children, isActive, forceCollapsed }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 0 : isActive ? 50 : 1, // Lift active item so suggestions stay on top
  };

  return React.cloneElement(children as React.ReactElement<ProfileItemProps>, {
    setNodeRef,
    style,
    dragHandleProps: { ...attributes, ...listeners },
    forceCollapsed: isDragging || forceCollapsed,
  });
}
