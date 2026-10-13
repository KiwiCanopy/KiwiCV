import { moveCollectionItem } from '@/components/editor/collectionOrder';
import { describe, expect, it } from 'vitest';

describe('moveCollectionItem', () => {
  it('moves the existing item objects without changing identity fields', () => {
    const first = { _id: 'local-a', _vId: 'stable-a', name: 'A' };
    const second = { _id: 'local-b', _vId: 'stable-b', name: 'B' };
    const third = { _id: 'local-c', _vId: 'stable-c', name: 'C' };

    const result = moveCollectionItem([first, second, third], 1, -1);

    expect(result).toEqual([second, first, third]);
    expect(result[0]).toBe(second);
    expect(result[0]._id).toBe('local-b');
    expect(result[0]._vId).toBe('stable-b');
  });

  it('keeps boundary requests in the existing order', () => {
    const items = [{ id: 'a' }, { id: 'b' }];

    expect(moveCollectionItem(items, 0, -1)).toEqual(items);
    expect(moveCollectionItem(items, 1, 1)).toEqual(items);
  });
});
