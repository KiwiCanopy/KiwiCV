// @vitest-environment jsdom
import { useArrayForm } from '@/components/editor/ArrayForm/useArrayForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { type ResumeData, type VisibilitySection } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { createCustomSectionItem } from '@/utils/items';
import { customSectionToken } from '@/utils/layoutMetadata';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Every write through `useArrayForm` must keep each entry's `_vId`, since
 * `meta.content.hiddenIds` addresses entries by it. Stripping it let the
 * sanitizer mint new ones, so a hidden entry reappeared after an edit to a
 * *different* entry. Driven through the hook, the call site, not the util.
 */
type WorkItem = ResumeData['work'][number];

const work = (vId: string, name: string, startDate: string): WorkItem =>
  ({ _vId: vId, name, position: 'Dev', startDate, endDate: '' }) as WorkItem;

const SEED = [
  work('first', 'First Corp', '2019-01'),
  work('secret', 'Secret Corp', '2021-01'),
  work('third', 'Third Corp', '2020-01'),
];

let initialState: ReturnType<typeof useResumeStore.getState>;

beforeEach(() => {
  initialState = useResumeStore.getState();
  const resume = initialState.resume;
  useResumeStore.setState({
    resume: {
      ...resume,
      work: SEED,
      meta: {
        ...resume.meta,
        content: { ...resume.meta.content, hiddenIds: ['work:secret'], hiddenSections: [] },
      },
    },
  });
});

afterEach(() => {
  useResumeStore.setState(initialState, true);
});

const resume = () => useResumeStore.getState().resume;
const vIds = (items: { _vId?: string }[]) => items.map((item) => item._vId).sort();
const isHidden = (section: VisibilitySection, item: Record<string, unknown>) =>
  resume().meta.content.hiddenIds.includes(getSectionItemHash(section, item));
const secret = () => resume().work.find((item) => item.name === 'Secret Corp')!;

const renderWorkForm = () =>
  renderHook(() =>
    useArrayForm({ sectionKey: 'work', itemStartDateKey: 'startDate', itemEndDateKey: 'endDate' }),
  );

describe('useArrayForm keeps entry ids', () => {
  it('editing another entry leaves the hidden one hidden', () => {
    const { result } = renderWorkForm();
    act(() => result.current.updateItem(0, { location: 'Berlin' }));

    expect(resume().work[0].location).toBe('Berlin');
    expect(vIds(resume().work)).toEqual(['first', 'secret', 'third']);
    expect(isHidden('work', secret())).toBe(true);
  });

  it('moving and sorting keep every id', () => {
    const { result } = renderWorkForm();
    act(() => result.current.moveItem(0, 1));
    expect(resume().work.map((item) => item._vId)).toEqual(['secret', 'first', 'third']);

    act(() => result.current.sortChronologically());
    expect(resume().work.map((item) => item._vId)).toEqual(['secret', 'third', 'first']);
    expect(isHidden('work', secret())).toBe(true);
  });

  it('deleting another entry keeps the rest', async () => {
    const { result } = renderWorkForm();
    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.deleteItem(0);
    });
    expect(useConfirmStore.getState().isOpen).toBe(true);
    await act(async () => {
      useConfirmStore.getState().onConfirm();
      await pending;
    });

    expect(vIds(resume().work)).toEqual(['secret', 'third']);
    expect(isHidden('work', secret())).toBe(true);
  });

  it('adding to a hidden section shows only the new entry, through its first edit', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        meta: {
          ...state.resume.meta,
          content: { ...state.resume.meta.content, hiddenIds: [], hiddenSections: ['work'] },
        },
      },
    }));
    const { result } = renderWorkForm();
    act(() => result.current.addItem());
    act(() => result.current.updateItem(0, { name: 'New Corp' }));

    expect(resume().work).toHaveLength(4);
    const added = resume().work.find((item) => item.name === 'New Corp')!;
    expect(isHidden('work', added)).toBe(false);
    for (const item of resume().work.filter((entry) => entry !== added)) {
      expect(isHidden('work', item)).toBe(true);
    }
  });

  it('a custom section keeps its entry ids', () => {
    let id = '';
    act(() => {
      id = useResumeStore.getState().addCustomSection('Talks');
      useResumeStore.getState().setCustomSectionItems(id, [
        { ...createCustomSectionItem(), _vId: 'talk-a', name: 'Talk A' },
        { ...createCustomSectionItem(), _vId: 'talk-b', name: 'Talk B' },
      ]);
    });
    const token = customSectionToken(id);
    act(() => useResumeStore.getState().toggleItemVisibility(token, { _vId: 'talk-b' }));

    const { result } = renderHook(() => useArrayForm({ sectionKey: token }));
    act(() => result.current.updateItem(0, { summary: 'Edited' }));

    const items = resume().customSections.find((section) => section.id === id)!.items;
    expect(items[0].summary).toBe('Edited');
    expect(vIds(items)).toEqual(['talk-a', 'talk-b']);
    expect(isHidden(token, items[1] as Record<string, unknown>)).toBe(true);
  });
});
