import { ArrayForm } from '@/components/editor/ArrayForm';
import { withCustomSectionMainColumnHints } from '@/components/editor/mainColumnHints';
import { useCustomSectionForm } from '@/components/editor/useCustomSectionForm';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { type SectionVariant } from '@/components/ui/section/types';
import { CUSTOM_SECTION_TITLE_ATTR } from '@/constants/focusAnchors';
import { CUSTOM_SECTION_ICON } from '@/data/sections';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useLockedFields } from '@/features/dashboard/editor/proposals/useLockedFields';
import { useTranslation } from '@/hooks/useTranslation';
import { type CustomSection } from '@/types/resume';
import { itemTarget } from '@/utils/aiTarget';
import { type CustomSectionToken } from '@/utils/layoutMetadata';
import { Trash2 } from 'lucide-react';

interface CustomSectionFormProps {
  token: CustomSectionToken;
  onDelete: () => void;
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

/**
 * A user-defined section: its title, then its entries. The heading shows
 * the live title but is not where it is edited — it stays the panel's focus
 * anchor (`SECTION_HEADING_ANCHOR_ID`). Improve reaches it through
 * `ArrayForm`'s `aiTarget`, since `sectionId` cannot name a token.
 *
 * A proposed title is reviewed like Basics: one object, so its diff panel sits
 * above the field it locks, under the vId-less `item:<token>` key.
 */
export const CustomSectionForm = ({
  token,
  onDelete,
  variant = 'nested',
  defaultCollapsed = true,
}: CustomSectionFormProps) => {
  const { t, tCV } = useTranslation();
  const { section, title, displayTitle, rename, revertBlankTitle, requestDelete } =
    useCustomSectionForm(token, onDelete);
  const titleTarget = itemTarget(token);
  const lockFor = useLockedFields<CustomSection>(titleTarget);
  const titleLock = lockFor('title');

  if (!section) return null;

  return (
    <ArrayForm
      sectionKey={token}
      title={displayTitle}
      icon={<CUSTOM_SECTION_ICON className="h-6 w-6" />}
      itemTitleKey="name"
      itemSummaryKey="summary"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      defaultCollapsed={defaultCollapsed}
      variant={variant}
      emptyLabel={t('editor.custom_sections.empty')}
      addFirstLabel={t('editor.custom_sections.add_first')}
      extraActions={
        <IconButton
          label={t('editor.custom_sections.delete')}
          title={t('editor.custom_sections.delete')}
          onClick={requestDelete}
          variant="quiet"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      }
      beforeItems={
        <>
          <EntryDiffPanel<CustomSection>
            target={titleTarget}
            fieldLabels={{ title: t('editor.custom_sections.title_label') }}
            entryName={displayTitle}
            className="mx-0 mb-4 sm:mx-0"
          />
          <Input
            label={t('editor.custom_sections.title_label')}
            placeholder={t('editor.custom_sections.title_placeholder')}
            value={title}
            liveUpdate
            onChange={(event) => rename(event.target.value)}
            // Locked, the value is the proposal: a revert would read as a later edit.
            onBlur={titleLock ? undefined : revertBlankTitle}
            containerClassName="mb-6"
            lock={titleLock}
            {...{ [CUSTOM_SECTION_TITLE_ATTR]: '' }}
          />
        </>
      }
      fields={withCustomSectionMainColumnHints(displayTitle, t, [
        // `row`s render before row-less fields, so the title takes row 1.
        { name: 'name', label: t('editor.fields.entry_title'), row: 1 },
        {
          name: 'startDate',
          label: t('editor.fields.start_date'),
          type: 'date',
          row: 2,
          placeholder: tCV('placeholders.common.date_format'),
        },
        {
          name: 'endDate',
          label: t('editor.fields.end_date'),
          type: 'date',
          row: 2,
          placeholder: tCV('placeholders.common.present'),
        },
        {
          name: 'url',
          label: t('editor.fields.website'),
          row: 3,
          placeholder: tCV('placeholders.common.https'),
        },
        { name: 'summary', label: t('editor.fields.summary'), type: 'textarea' },
        { name: 'highlights', label: t('editor.fields.highlights'), type: 'tags' },
      ])}
    />
  );
};
