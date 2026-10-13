import { ArrayForm } from '@/components/editor/ArrayForm';
import { withMainColumnHints } from '@/components/editor/mainColumnHints';
import { type SectionVariant } from '@/components/ui/section/types';
import { useTranslation } from '@/hooks/useTranslation';

interface ProjectsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

/**
 * ⚠️ The badges are attached by `withMainColumnHints` from
 * `MAIN_COLUMN_ONLY_FIELDS`, not written out per field. `entity`, `type`,
 * `description` and `highlights` all carry the promise, and the last of those had
 * been blanked by the side projection for as long as the projection existed while
 * the editor said nothing about it.
 */
const useProjectFields = () => {
  const { t, tCV } = useTranslation();

  const rawProjectFields = [
    {
      name: 'startDate' as const,
      label: t('editor.fields.start_date'),
      placeholder: tCV('placeholders.common.date_format'),
      type: 'date' as const,
      row: 1,
    },
    {
      name: 'endDate' as const,
      label: t('editor.fields.end_date'),
      placeholder: tCV('placeholders.common.present'),
      type: 'date' as const,
      row: 1,
    },
    {
      name: 'name' as const,
      label: t('editor.fields.project_name'),
      placeholder: tCV('placeholders.projects.name'),
      row: 2,
    },
    {
      name: 'location' as const,
      label: t('editor.fields.location'),
      placeholder: tCV('placeholders.common.location'),
      row: 2,
    },
    {
      name: 'entity' as const,
      label: t('editor.fields.entity'),
      placeholder: tCV('placeholders.projects.entity'),
      row: 3,
    },
    {
      name: 'type' as const,
      label: t('editor.fields.project_type'),
      placeholder: tCV('placeholders.projects.type'),
      row: 3,
    },
    {
      name: 'description' as const,
      label: t('editor.fields.summary'),
      placeholder: tCV('placeholders.work.summary'),
      type: 'textarea' as const,
      row: 4,
    },
    {
      name: 'highlights' as const,
      label: t('editor.fields.highlights'),
      placeholder: tCV('placeholders.projects.highlights'),
      type: 'tags' as const,
      row: 5,
    },
    {
      name: 'url' as const,
      label: t('editor.fields.website'),
      placeholder: tCV('placeholders.common.https'),
      row: 7,
    },
  ];

  // ⚠️ Derived from the *unbadged* list, then badged as `privateProjects`. The
  // old shape mapped the already-badged `projects` fields and re-issued the hint
  // wherever it found one (`if (field.layoutHint)`), which made the private
  // section's badge inventory a consequence of the public one's — correct only
  // as long as the two sections' badged fields stayed identical, and silent if
  // they ever did not.
  return {
    projectFields: withMainColumnHints('projects', t, rawProjectFields),
    privateProjectFields: withMainColumnHints(
      'privateProjects',
      t,
      rawProjectFields.map((field) => {
        if (field.name === 'name') {
          return { ...field, placeholder: tCV('placeholders.private_projects.name') };
        }
        if (field.name === 'type') {
          return { ...field, placeholder: tCV('placeholders.private_projects.type') };
        }
        return field;
      }),
    ),
  };
};

/**
 * ⚠️ Two components, not one with two lists. The editor rail gives `projects` and
 * `privateProjects` a row each, so mounting both from one component would make
 * `?section=privateProjects` scroll to the public list — the reason the old
 * `normalizedTargetSection` fudge in `EditorTab` existed at all.
 */
export const ProjectsForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: ProjectsFormProps) => {
  const { t } = useTranslation();
  const { projectFields } = useProjectFields();

  return (
    <ArrayForm
      sectionKey="projects"
      title={t('editor.sections.projects')}
      itemTitleKey="name"
      itemSubtitleKey="description"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      fields={projectFields}
      variant={variant}
      emptyLabel={t('editor.modules.projects.empty')}
      addFirstLabel={t('editor.modules.projects.add_first')}
      defaultCollapsed={defaultCollapsed}
    />
  );
};

export const PrivateProjectsForm = ({
  variant = 'nested',
  defaultCollapsed = true,
}: ProjectsFormProps) => {
  const { t } = useTranslation();
  const { privateProjectFields } = useProjectFields();

  return (
    <ArrayForm
      sectionKey="privateProjects"
      title={t('editor.sections.privateProjects')}
      itemTitleKey="name"
      itemSubtitleKey="description"
      itemStartDateKey="startDate"
      itemEndDateKey="endDate"
      fields={privateProjectFields}
      variant={variant}
      emptyLabel={t('editor.modules.projects.private_empty')}
      addFirstLabel={t('editor.modules.projects.add_first')}
      defaultCollapsed={defaultCollapsed}
    />
  );
};
