import { getTwoColumnSections } from '@/components/preview/themes/shared';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it } from 'vitest';

/** Adding, renaming, filling and removing a custom section. */

const store = () => useResumeStore.getState();

beforeEach(() => {
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
});

describe('custom section actions', () => {
  it('adds an empty section and places it at the end of the main column', () => {
    const before = store().resume.customSections.length;
    const id = store().addCustomSection('Talks');
    const { customSections, meta } = store().resume;

    expect(customSections).toHaveLength(before + 1);
    expect(customSections.at(-1)).toMatchObject({ id, title: 'Talks', items: [] });
    expect(meta.content.order.twoColumn.main.at(-1)).toBe(`custom:${id}`);
  });

  it('renames a section in place', () => {
    const id = store().addCustomSection('Talks');
    store().renameCustomSection(id, 'Conference talks');
    expect(store().resume.customSections.find((s) => s.id === id)?.title).toBe('Conference talks');
  });

  it('writes entries through the sanitizer', () => {
    const id = store().addCustomSection('Talks');
    store().setCustomSectionItems(id, [
      { name: 'Keynote', highlights: 'oops' } as unknown as never,
    ]);
    const item = store().resume.customSections.find((s) => s.id === id)?.items[0];
    expect(item?.name).toBe('Keynote');
    expect(item?.highlights).toEqual([]);
    expect(item?._vId).toBeTruthy();
  });

  it('removes the section and every layout reference to it', () => {
    const id = store().addCustomSection('Talks');
    const token = `custom:${id}`;
    useResumeStore.setState((state) => {
      const { content, theme } = state.resume.meta;
      content.order.oneColumn = ['work', token];
      content.order.twoColumn.sidebar = [token];
      content.hiddenSections = [token];
      content.hiddenIds = [`${token}:entry`, 'work:keep'];
      content.pageBreaks = { oneColumn: [token], twoColumn: { main: [token], sidebar: [] } };
      theme.params.sectionLabels = { [token]: 'X', work: 'Jobs' };
      return state;
    });

    store().removeCustomSection(id);
    const { customSections, meta } = store().resume;
    const serialized = JSON.stringify(meta);

    expect(customSections.some((s) => s.id === id)).toBe(false);
    expect(serialized).not.toContain(token);
    expect(meta.content.hiddenIds).toEqual(['work:keep']);
    expect(meta.theme.params.sectionLabels).toEqual({ work: 'Jobs' });
  });

  it('keeps a custom section in its column when an entry is hidden', () => {
    const id = store().addCustomSection('Talks');
    store().setCustomSectionItems(id, [{ name: 'Keynote', _vId: 'k1' } as never]);
    const token = `custom:${id}` as const;
    store().toggleItemVisibility(token, { _vId: 'k1' });

    const { meta } = store().resume;
    expect(meta.content.order.twoColumn.main).toContain(token);
    expect(meta.content.hiddenIds).toContain(`${token}:k1`);
    // Its only entry is hidden, so the section is hidden as a whole.
    expect(meta.content.hiddenSections).toContain(token);
  });
});

describe('adding a section on a one-column theme', () => {
  it('leaves an unset two-column order unset, so a later two-column theme still shows every section', () => {
    useResumeStore.setState((state) => {
      state.resume.meta.theme.name = 'plain';
      state.resume.meta.content.order.twoColumn.main = [];
      state.resume.meta.content.order.twoColumn.sidebar = [];
      return state;
    });
    const id = store().addCustomSection('Talks');
    const { twoColumn } = store().resume.meta.content.order;
    expect(twoColumn.main).toEqual([]);
    expect(twoColumn.sidebar).toEqual([]);

    store().setCustomSectionItems(id, [{ name: 'Keynote' } as never]);
    // The real theme switch, which normalises an empty two-column order.
    store().updateMeta({ theme: { ...store().resume.meta.theme, name: 'lunar' } });
    const { main, sidebar } = getTwoColumnSections(store().resume.meta, store().resume);
    expect([...main, ...sidebar]).toEqual(expect.arrayContaining(['work', `custom:${id}`]));
  });
});
