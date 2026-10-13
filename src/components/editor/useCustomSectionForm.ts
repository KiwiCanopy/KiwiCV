import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { sectionHeadingAnchor } from '@/utils/focus';
import {
  type CustomSectionToken,
  customSectionDisplayTitle,
  findCustomSection,
} from '@/utils/layoutMetadata';

/**
 * The title and delete logic of one custom section. The entries are
 * `ArrayForm`'s; `onDelete` is the caller's, since only the rail knows which row
 * to select once this one is gone.
 */
export function useCustomSectionForm(token: CustomSectionToken, onDelete: () => void) {
  const { t } = useTranslation();
  const section = useResumeStore((state) => findCustomSection(state.resume, token));
  const renameCustomSection = useResumeStore((state) => state.renameCustomSection);
  const confirm = useConfirmStore((state) => state.confirm);

  const title = section?.title ?? '';
  const displayTitle = section ? customSectionDisplayTitle(section, t('common.untitled')) : '';

  // A title cleared and left blank reverts on blur rather than persisting an
  // unnamed section; the heading falls back to "Untitled" only while typing.
  const [lastNonEmptyTitle, setLastNonEmptyTitle] = useState(title);
  if (title.trim() && title !== lastNonEmptyTitle) setLastNonEmptyTitle(title);

  const rename = (next: string) => {
    if (section) renameCustomSection(section.id, next);
  };

  const revertBlankTitle = () => {
    if (section && !section.title.trim() && lastNonEmptyTitle.trim()) {
      renameCustomSection(section.id, lastNonEmptyTitle);
    }
  };

  const requestDelete = async () => {
    if (!section) return;
    // Nothing to lose without entries, so no confirm.
    if (section.items.length > 0) {
      const isConfirmed = await confirm({
        variant: 'destructive',
        title: t('editor.custom_sections.delete_confirm_title', { title: displayTitle }),
        message: t('editor.custom_sections.delete_confirm_message'),
        confirmText: t('common.delete'),
        restoreFocusTo: sectionHeadingAnchor,
      });
      if (!isConfirmed) return;
    }
    onDelete();
  };

  return { section, title, displayTitle, rename, revertBlankTitle, requestDelete };
}
