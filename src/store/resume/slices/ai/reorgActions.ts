import { type ResumeStore } from '@/store/resume/types';
import { type ResumeData } from '@/types/resume';
import { generateId } from '@/utils/items';
import { type SectionKey } from '@/utils/layout/constants';
import { isVisible } from '@/utils/visibility';

export const applyReorgSuggestion = (
  state: ResumeStore,
  sectionKey: string,
  proposedItems: Array<Record<string, unknown>>,
) => {
  const originalItems = JSON.parse(
    JSON.stringify(state.resume[sectionKey as keyof ResumeData]),
  ) as Array<Record<string, unknown>>;
  const originalVIds = new Set(originalItems.map((i) => i._vId as string));
  const referencedVIds = new Set<string>();
  const classification: Record<string, 'added' | 'removed' | 'modified' | 'unchanged'> = {};

  // Classify proposed items
  proposedItems.forEach((item, i) => {
    const sourceVIds = (item._sourceVIds as string[]) || [];
    // Fallback: ignore invalid VIDs that don't match any original
    const validSourceVIds = sourceVIds.filter((id) => originalVIds.has(id));
    validSourceVIds.forEach((id) => referencedVIds.add(id));
    const key = `proposed_${i}`;

    if (validSourceVIds.length === 0) {
      classification[key] = 'added';
    } else if (validSourceVIds.length === 1) {
      const orig = originalItems.find((o) => o._vId === validSourceVIds[0]);
      if (
        orig &&
        orig.name === item.name &&
        JSON.stringify(orig.keywords) === JSON.stringify(item.keywords) &&
        orig.level === item.level
      ) {
        classification[key] = 'unchanged';
      } else {
        classification[key] = 'modified';
      }
    } else {
      classification[key] = 'modified'; // merged from multiple
    }
  });

  // Classify removed original items (not referenced by any proposed item)
  originalItems.forEach((item) => {
    if (!referencedVIds.has(item._vId as string)) {
      classification[`original_${item._vId}`] = 'removed';
    }
  });

  // ⚠️ An item whose ONLY source is an entry, and the only item for which that
  // is so, IS that entry: it keeps its `_vId`, which `hiddenIds` addresses —
  // a fresh id unhid a hidden skill. A merged item naming it too does
  // not count against it. Every other item is new, and is hidden when every
  // entry it came from was.
  const validSources = (item: Record<string, unknown>) => [
    ...new Set(((item._sourceVIds as string[]) || []).filter((id) => originalVIds.has(id))),
  ];
  const soleClaims = new Map<string, number>();
  proposedItems.forEach((item) => {
    const sources = validSources(item);
    if (sources.length === 1) soleClaims.set(sources[0], (soleClaims.get(sources[0]) ?? 0) + 1);
  });

  const hiddenIds = state.resume.meta.content.hiddenIds ?? [];
  const isHidden = (vId: string) =>
    originalItems.some(
      (original) =>
        original._vId === vId && !isVisible(sectionKey as SectionKey, original, hiddenIds),
    );
  const inheritHidden: string[] = [];

  // Immediately apply to store for live preview
  const newItems = proposedItems.map((item) => {
    const { _sourceVIds, ...rest } = item;
    const sources = validSources(item);
    const source =
      sources.length === 1 && soleClaims.get(sources[0]) === 1
        ? originalItems.find((original) => original._vId === sources[0])
        : undefined;
    const _vId = source ? (source._vId as string) : generateId();
    if (!source && sources.length > 0 && sources.every(isHidden)) {
      inheritHidden.push(`${sectionKey}:${_vId}`);
    }
    return { ...rest, _vId, visible: source?.visible ?? true };
  });

  if (inheritHidden.length > 0) {
    state.resume.meta.content.hiddenIds = [...hiddenIds, ...inheritHidden];
  }

  (state.resume as unknown as Record<string, unknown>)[sectionKey] = newItems;

  state.ai.reorgSuggestion = {
    sectionKey,
    originalItems,
    proposedItems,
    classification,
    timestamp: Date.now(),
  };
};

/**
 * Keeps the proposal and drops the visibility hashes of entries it removed or
 * merged away — they address ids no entry carries any more. Not done on
 * apply: Discard restores those entries, ids and all.
 */
export const acceptReorg = (state: ResumeStore) => {
  pruneReorgHiddenIds(state);
  state.ai.reorgSuggestion = null;
};

/** The hash cleanup of `acceptReorg`, for the accept-all paths that bypass it. */
export const pruneReorgHiddenIds = (state: ResumeStore) => {
  const reorg = state.ai.reorgSuggestion;
  if (reorg) {
    const live = state.resume[reorg.sectionKey as keyof ResumeData];
    const liveIds = new Set(
      (Array.isArray(live) ? (live as Array<Record<string, unknown>>) : []).map(
        (item) => item._vId,
      ),
    );
    const gone = new Set(
      reorg.originalItems
        .filter((item) => !liveIds.has(item._vId))
        .map((item) => `${reorg.sectionKey}:${item._vId as string}`),
    );
    const { content } = state.resume.meta;
    if (gone.size > 0 && content.hiddenIds) {
      content.hiddenIds = content.hiddenIds.filter((hash) => !gone.has(hash));
    }
  }
};

export const declineReorg = (state: ResumeStore) => {
  const reorg = state.ai.reorgSuggestion;
  if (!reorg) return;

  // The hashes a new entry inherited address an id the restored list lacks.
  const originalIds = new Set(reorg.originalItems.map((item) => item._vId));
  const live = state.resume[reorg.sectionKey as keyof ResumeData];
  const added = new Set(
    (Array.isArray(live) ? (live as Array<Record<string, unknown>>) : [])
      .filter((item) => !originalIds.has(item._vId))
      .map((item) => `${reorg.sectionKey}:${item._vId as string}`),
  );
  const { content } = state.resume.meta;
  if (added.size > 0 && content.hiddenIds) {
    content.hiddenIds = content.hiddenIds.filter((hash) => !added.has(hash));
  }

  (state.resume as unknown as Record<string, unknown>)[reorg.sectionKey] = reorg.originalItems;
  state.ai.reorgSuggestion = null;
};
