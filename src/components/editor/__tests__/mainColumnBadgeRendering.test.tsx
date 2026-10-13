// @vitest-environment jsdom
import type { ComponentType } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AwardsForm } from '@/components/editor/AwardsForm';
import { EducationForm } from '@/components/editor/EducationForm';
import { InterestsForm } from '@/components/editor/InterestsForm';
import { PrivateProjectsForm, ProjectsForm } from '@/components/editor/ProjectsForm';
import { PublicationsForm } from '@/components/editor/PublicationsForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { VolunteerForm } from '@/components/editor/VolunteerForm';
import { WorkForm } from '@/components/editor/WorkForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { MAIN_COLUMN_ONLY_FIELDS } from '@/utils/componentVariants';
import type { SectionKey } from '@/utils/layout/constants';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The AI-suggestion affordance on every field reads the signed-in profile. It is
// orthogonal to the badge, and an `AuthProvider` here would pull the whole auth
// stack in to assert a label.
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * **The badge the promise is printed on must actually reach the screen.**
 *
 * `mainColumnOnlyPromise.test.ts` asserts the renderers honour
 * `MAIN_COLUMN_ONLY_FIELDS`, and a source scan there asserts nothing can print
 * the badge behind the table's back. Neither can see the other direction: a table
 * entry whose form never offers the field, or a form that stopped calling
 * `withMainColumnHints` altogether. Both would leave the promise enforced in the
 * themes and invisible in the editor — the user loses the explanation for why a
 * field they typed does not appear, which is the whole reason the badge exists.
 *
 * ⚠️ **This is the half that made the inventory wrong three times, so it is
 * counted rather than spot-checked.** The expected count per form is read off the
 * same table the forms read, so a field entering or leaving the table moves both
 * sides together and a *form* that stops honouring it is what fails.
 *
 * ⚠️ Rendered rather than asserted against `withMainColumnHints`' return value.
 * The helper is pure and its output is easy to check, but "the helper returns a
 * hint" and "the user sees a badge" are two properties: `FieldLabel` only renders
 * `MainColumnBadge` when it is handed a `layoutHint`, and a form that dropped the
 * prop on its way to `ArrayForm` would pass a helper-level test.
 */

const badgeCountFor = (section: SectionKey) => (MAIN_COLUMN_ONLY_FIELDS[section] ?? []).length;

const FORMS: ReadonlyArray<
  readonly [string, ComponentType<Record<string, never>>, ReadonlyArray<SectionKey>]
> = [
  ['WorkForm', WorkForm, ['work']],
  ['VolunteerForm', VolunteerForm, ['volunteer']],
  ['EducationForm', EducationForm, ['education']],
  ['AwardsForm', AwardsForm, ['awards']],
  ['PublicationsForm', PublicationsForm, ['publications']],
  ['InterestsForm', InterestsForm, ['interests']],
  ['SkillsForm', SkillsForm, ['skills']],
  // ⚠️ Two components since the editor rail gave each list its own row, and they
  // are measured separately on purpose: the private list is derived from the
  // *unbadged* field list rather than from the public one's badged output, so a
  // `privateProjects` badge going missing must not be masked by `projects`
  // having its own.
  ['ProjectsForm', ProjectsForm, ['projects']],
  ['PrivateProjectsForm', PrivateProjectsForm, ['privateProjects']],
];

beforeEach(() => {
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
});

afterEach(() => {
  // Unmount first: a reset reaching a still-mounted form re-renders it outside `act`.
  cleanup();
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
});

describe('the editor prints a badge for every main-column-only field', () => {
  it.each(FORMS)('%s', (_name, Form, sections) => {
    const { container } = render(
      <MemoryRouter>
        <Form />
      </MemoryRouter>,
    );

    // ⚠️ **Expanded to a fixed point, not in one pass.** A collapsed card renders
    // none of its fields, and the collapse nests: opening a section reveals item
    // cards that are themselves collapsed, so a single `querySelectorAll` sweep
    // catches only the outer layer. The first draft counted zero badges in every
    // form and still passed its own `toBeGreaterThan(0)` guard, because that guard
    // is on the *expected* side and says nothing about the DOM — the vacuity this
    // whole family of tests keeps having to be defended against.
    //
    // ⚠️ Keyed on `aria-expanded="false"` rather than on `defaultCollapsed`, and
    // that is why this loop replaced a props table: `ProjectsForm` does not take
    // `defaultCollapsed` at all — it takes `defaultCollapsedProjects` and
    // `defaultCollapsedPrivateProjects` — so it silently ignored the prop and was
    // the one form measuring an empty DOM after the others were fixed.
    //
    // `fireEvent`, and popups skipped: only nested cards hide fields, and
    // user-event's pointer sequence plus every calendar it opened timed this out
    // under load.
    for (let pass = 0; pass < 6; pass += 1) {
      const collapsed = [
        ...container.querySelectorAll('button[aria-expanded="false"]:not([aria-haspopup])'),
      ];
      if (collapsed.length === 0) break;
      for (const toggle of collapsed) fireEvent.click(toggle);
    }

    const expected = sections.reduce((total, section) => total + badgeCountFor(section), 0);
    expect(expected).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'main' })).toHaveLength(expected);
  });

  /**
   * ⚠️ The totals control. Nine components cover nine badged sections, and a
   * component dropped from `FORMS` above would silently stop being measured while
   * every remaining row still passed.
   */
  it('covers every badged section exactly once', () => {
    const covered = FORMS.flatMap(([, , sections]) => sections);
    expect(new Set(covered).size).toBe(covered.length);
    expect(new Set(covered)).toEqual(new Set(Object.keys(MAIN_COLUMN_ONLY_FIELDS)));
    expect(covered.reduce((n, s) => n + badgeCountFor(s), 0)).toBe(17);
  });
});
