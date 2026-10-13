import { type ReactNode } from 'react';

import { AwardsForm } from '@/components/editor/AwardsForm';
import { BasicsForm } from '@/components/editor/BasicsForm';
import { BasicsProfilesForm } from '@/components/editor/BasicsForm/BasicsProfilesForm';
import { CertificatesForm } from '@/components/editor/CertificatesForm';
import { CoverLetterForm } from '@/components/editor/CoverLetterForm';
import { CoverLetterAIMenu } from '@/components/editor/CoverLetterForm/CoverLetterAIMenu';
import { hasLetterProse } from '@/components/editor/CoverLetterForm/letterProse';
import { CustomSectionForm } from '@/components/editor/CustomSectionForm';
import { EducationForm } from '@/components/editor/EducationForm';
import { InterestsForm } from '@/components/editor/InterestsForm';
import { LanguageForm } from '@/components/editor/LanguageForm';
import { PrivateProjectsForm, ProjectsForm } from '@/components/editor/ProjectsForm';
import { PublicationsForm } from '@/components/editor/PublicationsForm';
import { ReferencesForm } from '@/components/editor/ReferencesForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { VolunteerForm } from '@/components/editor/VolunteerForm';
import { WorkForm } from '@/components/editor/WorkForm';
import { Section } from '@/components/ui/Section';
import { RAIL_ICONS, RAIL_LABEL_KEYS } from '@/features/dashboard/editor/rail/railSections';
import { type EditorSectionKey, type RailSectionKey } from '@/features/dashboard/editor/rail/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type CustomSectionToken, isCustomSectionToken } from '@/utils/layoutMetadata';

interface EditorSectionPanelProps {
  section: EditorSectionKey;
  /** Removes a custom section and moves the selection off it. */
  onDeleteCustomSection: (token: CustomSectionToken) => void;
}

/**
 * Mounts exactly the section the rail has selected, in the `page` variant.
 *
 * ⚠️ Only the active section is mounted. Every form keeps its own local state in
 * a hook that reads the store on mount, so switching rows discards nothing the
 * user typed — the store already has it.
 */
export function EditorSectionPanel({ section, onDeleteCustomSection }: EditorSectionPanelProps) {
  const { t } = useTranslation();
  const coverLetter = useResumeStore((state) => state.resume.coverLetter);

  /**
   * ⚠️ Decided here, not by `Section`: `coverLetter` is not a
   * `SectionMetadataKey`, so `Section` has no `sectionId` to judge it by (see
   * the `coverLetter` panel below).
   *
   * The paragraphs are the letter. `subject` alone is a header, not something a
   * rewrite can act on, so an empty-bodied letter still offers nothing to do.
   */
  const letterHasText = hasLetterProse(coverLetter.paragraphs);

  /**
   * ⚠️ `Record<RailSectionKey, …>` of thunks, not a `switch`. Keyed on the union,
   * a rail row with no panel is `TS2741` and a panel for a row that does not
   * exist is `TS2353`; a `switch` missing a case only returns `undefined` at
   * runtime. Thunks, so exactly one form mounts.
   */
  const panels: Record<RailSectionKey, () => ReactNode> = {
    basics: () => <BasicsForm variant="page" defaultCollapsed={false} />,
    profiles: () => <BasicsProfilesForm variant="page" defaultCollapsed={false} />,
    work: () => <WorkForm variant="page" defaultCollapsed={false} />,
    education: () => <EducationForm variant="page" defaultCollapsed={false} />,
    publications: () => <PublicationsForm variant="page" defaultCollapsed={false} />,
    references: () => <ReferencesForm variant="page" defaultCollapsed={false} />,
    skills: () => <SkillsForm variant="page" defaultCollapsed={false} />,
    languages: () => <LanguageForm variant="page" defaultCollapsed={false} />,
    certificates: () => <CertificatesForm variant="page" defaultCollapsed={false} />,
    awards: () => <AwardsForm variant="page" defaultCollapsed={false} />,
    projects: () => <ProjectsForm variant="page" defaultCollapsed={false} />,
    privateProjects: () => <PrivateProjectsForm variant="page" defaultCollapsed={false} />,
    volunteer: () => <VolunteerForm variant="page" defaultCollapsed={false} />,
    interests: () => <InterestsForm variant="page" defaultCollapsed={false} />,
    // The cover letter is three nested sections with no top-level `Section` of
    // its own, so the panel supplies the heading — and, since the
    // pipeline carries an object-shaped section end to end, its Improve button.
    //
    // ⚠️ Passed through `actions` rather than `sectionId`, which would be the
    // obvious wiring and is the wrong tool. `SectionProps.sectionId` is typed
    // `SectionMetadataKey` (= `EmptyItemKey | 'basics'`), so admitting
    // `coverLetter` would force an entry in `createEmptyItem`'s compile-checked
    // Record — a letter is not an item — and in `SECTION_METADATA`, which feeds
    // the design tab's `EmptySectionsGrid`. That would put the cover letter in
    // the layout designer's section list, where it is not a section at all.
    // `AISuggestButton` takes a plain `string` target, so this needs none of it.
    coverLetter: () => (
      <Section
        title={t(RAIL_LABEL_KEYS.coverLetter)}
        variant="page"
        icon={<RAIL_ICONS.coverLetter className="h-6 w-6" />}
        // ⚠️ No `letterHasText ?` guard any more. The control renders whether or
        // not there is a letter — with none, the section offered no AI
        // affordance at all and the only route to one was a composer nothing
        // pointed at. `letterHasText` now decides what the CHOICE does,
        // not whether a button exists.
        actions={
          <CoverLetterAIMenu
            letterHasText={letterHasText}
            sectionLabel={t(RAIL_LABEL_KEYS.coverLetter)}
          />
        }
      >
        <CoverLetterForm />
      </Section>
    ),
  };

  return (
    <div data-editor-section={section} className="min-w-0">
      {isCustomSectionToken(section) ? (
        <CustomSectionForm
          // Keyed so a draft entry never carries over to another section.
          key={section}
          token={section}
          variant="page"
          defaultCollapsed={false}
          onDelete={() => onDeleteCustomSection(section)}
        />
      ) : (
        panels[section]()
      )}
    </div>
  );
}
