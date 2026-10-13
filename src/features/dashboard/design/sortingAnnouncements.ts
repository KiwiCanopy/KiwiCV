import type { Announcements } from '@dnd-kit/core';

interface SortingAnnouncementOptions {
  items: string[];
  getLabel: (id: string) => string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

/**
 * Screen-reader announcements for a drag, as whole translated sentences — the
 * item's name inside each locale's own frame, not glued on after a colon.
 */
export function createSortingAnnouncements({
  items,
  getLabel,
  t,
}: SortingAnnouncementOptions): Announcements {
  const total = items.length;
  const place = (id: string) => {
    const index = items.indexOf(id);
    return index >= 0 ? index + 1 : total;
  };
  const moving = (activeId: string, overId: string) =>
    t('common.moving_named', { name: getLabel(activeId), position: place(overId), total });

  return {
    onDragStart({ active }) {
      return moving(String(active.id), String(active.id));
    },
    onDragOver({ active, over }) {
      return moving(String(active.id), String(over ? over.id : active.id));
    },
    onDragEnd({ active, over }) {
      return over
        ? t('common.moved_named', {
            name: getLabel(String(active.id)),
            position: place(String(over.id)),
            total,
          })
        : // Dropped outside the list: the item stays where it was.
          t('common.move_cancelled_named', { name: getLabel(String(active.id)) });
    },
    onDragCancel({ active }) {
      return t('common.move_cancelled_named', { name: getLabel(String(active.id)) });
    },
  };
}
