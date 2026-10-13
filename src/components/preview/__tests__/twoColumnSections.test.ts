import { getTwoColumnSections } from '@/components/preview/themes/shared/sections';
import { initialResumeState } from '@/types/resume';
import type { ResumeData, ResumeMeta } from '@/types/resume';
import * as layoutMetadata from '@/utils/layoutMetadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `getMainSections` and `getSideSections` each called
 * `getRenderableTwoColumnSections` and threw half the result away, and the
 * `isTwoColumnLayout` gate lived in both of them rather than in the shared
 * computation. This file asserts the two properties that made that worth
 * collapsing.
 *
 * ⚠️ **The gate is the half worth guarding, and the fixture has to be able to
 * reach it.** (An earlier draft called it "a live hazard" — it was **latent**: at
 * the time the ungated callee had two callers and both gated. A hazard shape and a
 * live defect are different claims.) A one-column meta whose stored `twoColumn` order is
 * *empty* proves nothing: the columns come back empty either way, so deleting
 * the gate is green. What reaches it is a stored `twoColumn` order that is
 * populated **and** a one-column theme — which is the ordinary state after a
 * user switches from lunar to plain, since nothing clears the two-column order
 * on a theme change.
 */

function metaWith(theme: string, main: string[], sidebar: string[]): ResumeMeta {
  const meta = structuredClone(initialResumeState.meta) as ResumeMeta;
  meta.theme.name = theme;
  meta.content.order.twoColumn = { main, sidebar, sidebarPosition: 'left' };
  return meta;
}

function dataWith(meta: ResumeMeta): ResumeData {
  const data = structuredClone(initialResumeState) as unknown as ResumeData;
  data.work = [{ _vId: 'w', name: 'ACME', position: 'Dev' } as ResumeData['work'][number]];
  data.skills = [{ _vId: 's', name: 'TypeScript' } as ResumeData['skills'][number]];
  data.meta = meta;
  return data;
}

describe('getTwoColumnSections', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns both columns for a two-column theme', () => {
    const meta = metaWith('lunar', ['work'], ['skills']);

    expect(getTwoColumnSections(meta, dataWith(meta))).toEqual({
      main: ['work'],
      sidebar: ['skills'],
    });
  });

  /**
   * ⚠️ The gate. Both columns are populated and both sections have data, so the
   * only thing that can empty them is `isTwoColumnLayout`. Deleting the gate
   * returns `{ main: ['work'], sidebar: ['skills'] }` here.
   */
  it('returns two empty columns for a one-column theme with a populated stored order', () => {
    const meta = metaWith('plain', ['work'], ['skills']);

    expect(getTwoColumnSections(meta, dataWith(meta))).toEqual({ main: [], sidebar: [] });
  });

  it.each([
    ['no meta', undefined],
    ['no data', 'nodata'],
  ] as const)('returns two empty columns with %s', (_label, mode) => {
    const meta = metaWith('lunar', ['work'], ['skills']);

    const result =
      mode === undefined
        ? getTwoColumnSections(undefined, dataWith(meta))
        : getTwoColumnSections(meta, undefined);

    expect(result).toEqual({ main: [], sidebar: [] });
  });

  /**
   * The structural half: one shared computation per call, not two.
   *
   * ⚠️ This is a claim about **calls**, which is why spying on the call is the
   * right instrument here rather than the trap it is when the claim is about a
   * value's provenance. Splitting the getter back into a `main` half and a
   * `sidebar` half — the shape that was collapsed — makes this two.
   *
   * Measured on the twelve themes by counting `JSON.parse` (which
   * `migrateToNewLayoutStructure` opens with): **2** per two-column render in
   * both the HTML component and the serializer before, **1** after, and **0**
   * for every one-column theme in both.
   */
  it('runs the shared column computation once per call', () => {
    const spy = vi.spyOn(layoutMetadata, 'getRenderableTwoColumnSections');
    const meta = metaWith('lunar', ['work'], ['skills']);

    getTwoColumnSections(meta, dataWith(meta));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  /**
   * ⚠️ **This case degrades in one direction only, and the case above does not.**
   * The spy is on the `@/utils/layoutMetadata` barrel, which is how `sections.ts`
   * imports today. If it ever imported `getRenderableTwoColumnSections` directly
   * from `@/utils/layout/getters`, the `toHaveBeenCalledTimes(1)` case above goes
   * to 0 and **fails loudly**, while this one passes **vacuously** — zero calls
   * satisfies "not called" for the wrong reason. The behavioural gate case
   * ('returns two empty columns for a one-column theme…') still covers the
   * property, so this is not a hole; it is an asymmetry worth knowing before
   * anyone trusts this case alone. Found by the architect pass.
   */
  it('does not run it at all when the gate rejects the meta', () => {
    const spy = vi.spyOn(layoutMetadata, 'getRenderableTwoColumnSections');
    const meta = metaWith('plain', ['work'], ['skills']);

    getTwoColumnSections(meta, dataWith(meta));

    expect(spy).not.toHaveBeenCalled();
  });
});
