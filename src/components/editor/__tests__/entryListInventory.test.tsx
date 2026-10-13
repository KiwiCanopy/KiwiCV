// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  ALL_ENTRY_LIST_IDS,
  CV_LIBRARY_LIST_ID,
  ENTRY_DELETE_ATTR,
  type EntryListId,
} from '@/constants/focusAnchors';
import { EditorSectionPanel } from '@/features/dashboard/editor/EditorSectionPanel';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { CvLibraryHarness } from '@/test/cvLibraryHarness';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { customSectionToken, isCustomSectionToken } from '@/utils/layout/customSections';
import { lookupTranslation } from '@/utils/translationLookup';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * Every member of `EntryListId` is a list some control actually marks.
 * `entryDeleteAnchor` reads `[data-entry-delete="<list>"]` positionally, so a
 * member nothing renders resolves to `null` and focus falls through to the
 * section heading — plausible, and wrong, with nothing failing.
 *
 * Rendered rather than scanned: ten `ArrayForm` sections and every custom section
 * are valued from one forwarded `sectionKey`, which only the composed surface
 * resolves; skills, languages and profiles name their own id.
 */

const ENTRIES = 3;

/** A resume whose list `id` holds `ENTRIES` distinct entries. */
function resumeWith(id: EntryListId): ResumeData {
  const resume = buildSingleItemResume('lunar');
  // The fixture's entry when it has one, so a delete takes the confirm route.
  const many = <T extends object>(seed: T, name: keyof T & string): T[] =>
    Array.from({ length: ENTRIES }, (_, i) => ({
      ...structuredClone(seed),
      [name]: `Entry ${i + 1}`,
    }));
  if (id === 'profiles') {
    resume.basics.profiles = many(resume.basics.profiles[0], 'username');
  } else if (isCustomSectionToken(id)) {
    resume.customSections[0].items = many(resume.customSections[0].items[0], 'name');
  } else if (id !== CV_LIBRARY_LIST_ID) {
    // `name` is not every section's title field, but distinct entries are all this needs.
    const seed: object = (resume[id] as object[] | undefined)?.[0] ?? createEmptyItem(id);
    Object.assign(resume, { [id]: many(seed as { name?: string }, 'name') });
  }
  return resume;
}

/** The surface a list id lives on, holding `ENTRIES` entries. */
function mountSurface(id: EntryListId) {
  if (id === CV_LIBRARY_LIST_ID) {
    return render(
      <>
        <CvLibraryHarness labels={Array.from({ length: ENTRIES }, (_, i) => `Entry ${i + 1}`)} />
        <ConfirmModal />
      </>,
    );
  }
  useResumeStore.setState({ resume: resumeWith(id) });
  return render(
    <MemoryRouter>
      <EditorSectionPanel section={id} onDeleteCustomSection={() => {}} />
      <ConfirmModal />
    </MemoryRouter>,
  );
}

const marked = (id: EntryListId) => [
  ...document.querySelectorAll<HTMLElement>(`[${ENTRY_DELETE_ATTR}="${id}"]`),
];

const CUSTOM_FIXTURE = customSectionToken(buildSingleItemResume('lunar').customSections[0].id);
const LIST_IDS = [...ALL_ENTRY_LIST_IDS, CUSTOM_FIXTURE];

afterEach(() => {
  act(() => useConfirmStore.getState().close());
  cleanup();
});

describe('every entry list id is marked by a rendered control', () => {
  it('walks a populated inventory', () => {
    expect(ALL_ENTRY_LIST_IDS.length).toBeGreaterThan(10);
    expect(ALL_ENTRY_LIST_IDS).toContain(CV_LIBRARY_LIST_ID);
  });

  it.each(LIST_IDS)('%s marks one control per entry', (id) => {
    mountSurface(id);
    expect(
      marked(id).length,
      `${id}: expected one [${ENTRY_DELETE_ATTR}="${id}"] control per entry (${ENTRIES}); ` +
        'a list id no control renders sends a delete handoff straight to the section heading.',
    ).toBe(ENTRIES);
  });
});

const describeElement = (element: Element | null) =>
  element === null || element === document.body
    ? 'nothing (<body>)'
    : `<${element.tagName.toLowerCase()} "${element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40)}">`;

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

/**
 * Deletes the first entry the way a keyboard user does: its marked control,
 * then — where that control is a disclosure — the Delete inside what it opened,
 * then the confirm dialog wherever one is raised.
 */
async function deleteFirstEntry(user: UserEvent, id: EntryListId) {
  const control = marked(id)[0];
  await pressWithKeyboard(user, control);
  if (control.getAttribute('aria-expanded') === 'true') {
    const popup = document.getElementById(control.getAttribute('aria-controls') ?? '');
    expect(popup, `${id}: the marked disclosure opened nothing addressable`).toBeTruthy();
    const name = lookupTranslation(en, 'common.delete')!;
    await pressWithKeyboard(user, within(popup!).getByRole('button', { name }));
  }
  await waitFor(() =>
    expect(
      screen.queryByRole('alertdialog') !== null || marked(id).length < ENTRIES,
      `${id}: the delete neither raised a confirm nor removed the entry`,
    ).toBe(true),
  );
  // Answer each dialog in turn: the library rewrites its confirm into a success report.
  for (let dialog = screen.queryByRole('alertdialog'); dialog;) {
    const answered = dialog.textContent;
    const name =
      useConfirmStore.getState().options.confirmText ?? lookupTranslation(en, 'common.confirm')!;
    await pressWithKeyboard(user, within(dialog).getByRole('button', { name }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')?.textContent).not.toBe(answered));
    dialog = screen.queryByRole('alertdialog');
  }
}

/**
 * The marked control must OUTLIVE its entry's removal — `ENTRY_DELETE_ATTR`'s
 * contract, which the file-keyed census cannot see. Two halves,
 * because the two ways to break it fail differently: a control mounted only
 * behind a disclosure, and one that does not survive the delete it reaches.
 */
describe('every marked entry-delete control outlives the entry it deletes', () => {
  /**
   * Opening every disclosure on the surface, including those that only appear
   * once another is open, must not change the count. Depth-first, newest
   * trigger first; `fireEvent` dispatches no outside press, so an opened
   * popover stays open while the walk continues.
   */
  it.each(LIST_IDS)('%s marks nothing that lives behind a disclosure', (id) => {
    mountSurface(id);
    const closed = () => [...document.querySelectorAll<HTMLElement>('[aria-expanded="false"]')];
    const seen = new Set<HTMLElement>(closed());
    const pending = [...seen].reverse();
    expect(pending.length, `${id}: the surface offers no disclosure to open`).toBeGreaterThan(0);

    let opened = 0;
    for (let trigger = pending.pop(); trigger; trigger = pending.pop()) {
      if (!trigger.isConnected || trigger.getAttribute('aria-expanded') !== 'false') continue;
      expect(++opened, `${id}: disclosures keep appearing; the walk does not end`).toBeLessThan(
        200,
      );
      // `fireEvent`, not `user.click`: this asserts what mounts, and user-event's
      // pointer sequence cost ~2x per click, enough to time out under load.
      fireEvent.click(trigger);
      expect(
        marked(id).length,
        `${id}: opening ${describeElement(trigger)} changed how many controls carry ` +
          `[${ENTRY_DELETE_ATTR}="${id}"]. A marked control inside a disclosure is unmounted ` +
          'while it is closed, so it cannot outlive its entry; mark the disclosure trigger instead.',
      ).toBe(ENTRIES);
      const revealed = closed().filter((next) => !seen.has(next));
      revealed.forEach((next) => seen.add(next));
      pending.push(...revealed.reverse());
    }
  });

  it.each(LIST_IDS)(
    '%s hands focus to the marked control of the entry that took the deleted one place',
    async (id) => {
      const user = userEvent.setup();
      mountSurface(id);
      expect(marked(id).length, `${id}: the surface marks no control per entry`).toBe(ENTRIES);

      await deleteFirstEntry(user, id);

      await waitFor(() => {
        expect(marked(id).length).toBe(ENTRIES - 1);
        expect(
          document.activeElement,
          `${id}: after a keyboard delete, focus is on ${describeElement(document.activeElement)} ` +
            `rather than the next entry's [${ENTRY_DELETE_ATTR}="${id}"] control. The marked ` +
            'control must outlive the removal of the entry before it.',
        ).toBe(marked(id)[0]);
      });
    },
  );
});
