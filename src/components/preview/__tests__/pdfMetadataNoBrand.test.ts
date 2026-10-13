import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ThemeId } from '@/components/preview/themeIds';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { describe, expect, it } from 'vitest';

// An export carries no product name in its metadata (AGENTS.md, Product identity).
const THEME_IDS = Object.keys(SERIALIZERS) as ThemeId[];

const metadataLine = (themeId: ThemeId, name: string): string | undefined => {
  const data = buildSingleItemResume(themeId);
  data.basics.name = name;
  return SERIALIZERS[themeId](data)
    .split('\n')
    .find((line) => line.startsWith('#set document('));
};

describe('PDF document metadata', () => {
  it.each(THEME_IDS)('%s: title and author carry the name, never KiwiCV', (themeId) => {
    const line = metadataLine(themeId, 'Ada Lovelace');
    expect(line).toContain('author: "Ada Lovelace"');
    expect(line).toMatch(/title: "[^"]*Ada Lovelace[^"]*"/);
    expect(line).not.toMatch(/KiwiCV/i);
  });

  it.each(THEME_IDS)('%s: an empty or blank name leaves no metadata', (themeId) => {
    expect(metadataLine(themeId, '')).toBeUndefined();
    expect(metadataLine(themeId, '   ')).toBeUndefined();
  });
});
