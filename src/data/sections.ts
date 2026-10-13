import { type ComponentType } from 'react';

import { HistoryEduIcon } from '@/components/ui/Icons';
import { type SectionKey, type SectionMetadataKey } from '@/utils/layoutMetadata';
import {
  Award,
  Briefcase,
  FileText,
  Folder,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Heart,
  HeartHandshake,
  IdCard,
  Languages,
  LayoutList,
  Lightbulb,
  Link2,
  Milestone,
  ScrollText,
  Trophy,
  UserCheck,
} from 'lucide-react';

export interface SectionMetadata {
  id: SectionMetadataKey;
  icon: ComponentType<{ className?: string }>;
  group: SectionGroupId;
}

export type SectionGroupId = 'basics' | 'career' | 'knowledge' | 'projects' | 'personal';

/**
 * ⚠️ Generic in its id domain so the four content groups can promise `SectionKey`
 * while `basics` keeps the wider `SectionMetadataKey` — see `GROUP_METADATA`.
 */
export interface GroupMetadata<Ids extends SectionMetadataKey = SectionMetadataKey> {
  id: SectionGroupId;
  icon: ComponentType<{ className?: string }>;
  sectionIds: Ids[];
}

/**
 * The cover letter's glyph, published here because it has **two** call sites and
 * `SECTION_METADATA` cannot hold it: that map is keyed on `SectionMetadataKey`,
 * the layout inventory, which the letter is not part of. The rail row and the AI
 * status view's outcome card both read this — the user clicks the row the card
 * points at, so the two must be the same glyph, and a guard that only compared
 * copies would pass while they diverged.
 */
export const COVER_LETTER_ICON = ScrollText;

/** Every custom section's rail row, panel heading and layout card. */
export const CUSTOM_SECTION_ICON = LayoutList;

/**
 * ⚠️ `Record<SectionMetadataKey, …>`, not `Record<string, …>`. Keyed on the union,
 * a missing entry is `TS2741` and an entry for a non-member is `TS2353` — which is
 * what turns `SectionMetadataKey` from a documentation-grade upper bound that
 * nothing could falsify into a checked one. Both reviewer passes asked for this;
 * it compiles unchanged today (14 keys, 14 members).
 */
export const SECTION_METADATA: Record<SectionMetadataKey, SectionMetadata> = {
  basics: { id: 'basics', icon: IdCard, group: 'basics' },
  work: { id: 'work', icon: Briefcase, group: 'career' },
  education: { id: 'education', icon: GraduationCap, group: 'career' },
  publications: { id: 'publications', icon: FileText, group: 'career' },
  references: { id: 'references', icon: UserCheck, group: 'career' },
  skills: { id: 'skills', icon: Lightbulb, group: 'knowledge' },
  languages: { id: 'languages', icon: Languages, group: 'knowledge' },
  certificates: { id: 'certificates', icon: Award, group: 'knowledge' },
  awards: { id: 'awards', icon: Trophy, group: 'knowledge' },
  projects: { id: 'projects', icon: Folder, group: 'projects' },
  privateProjects: { id: 'privateProjects', icon: Milestone, group: 'projects' },
  volunteer: { id: 'volunteer', icon: HeartHandshake, group: 'personal' },
  interests: { id: 'interests', icon: Gamepad2, group: 'personal' },
  profiles: { id: 'profiles', icon: Link2, group: 'basics' },
};

/**
 * ⚠️ **Only `basics` may hold a non-section id, and the type says so now.** The
 * four content groups were annotated `GroupMetadata` (i.e. `SectionMetadataKey[]`)
 * and then cast — `GROUP_METADATA.career.sectionIds as SectionKey[]` — four times
 * below, which is exactly the "an `as` asserted a domain nothing established"
 * shape already swept out of the layout getters. Measured by a reviewer: adding
 * `'basics'` to the `career` group **typechecked clean** and arrived at
 * `sectionExists` through `ALL_UI_SECTION_ORDER` as a `SectionKey`, caught only by
 * the runtime permutation test in `layout.test.ts`. Now it is `TS2322` here.
 */
export const GROUP_METADATA: {
  basics: GroupMetadata;
  career: GroupMetadata<SectionKey>;
  knowledge: GroupMetadata<SectionKey>;
  projects: GroupMetadata<SectionKey>;
  personal: GroupMetadata<SectionKey>;
} = {
  basics: {
    id: 'basics',
    icon: IdCard,
    sectionIds: ['basics', 'profiles'],
  },
  career: {
    id: 'career',
    icon: HistoryEduIcon,
    sectionIds: ['work', 'education', 'publications', 'references'],
  },
  knowledge: {
    id: 'knowledge',
    icon: Lightbulb,
    sectionIds: ['skills', 'languages', 'certificates', 'awards'],
  },
  projects: {
    id: 'projects',
    icon: FolderKanban,
    sectionIds: ['projects', 'privateProjects'],
  },
  personal: {
    id: 'personal',
    icon: Heart,
    sectionIds: ['volunteer', 'interests'],
  },
};

export const CAREER_SECTIONS = GROUP_METADATA.career.sectionIds;
export const KNOWLEDGE_SECTIONS = GROUP_METADATA.knowledge.sectionIds;
export const PROJECT_SECTIONS = GROUP_METADATA.projects.sectionIds;
export const PERSONAL_SECTIONS = GROUP_METADATA.personal.sectionIds;

export const ALL_UI_SECTION_ORDER: SectionKey[] = [
  ...CAREER_SECTIONS,
  ...KNOWLEDGE_SECTIONS,
  ...PROJECT_SECTIONS,
  ...PERSONAL_SECTIONS,
];
