import { REPO_ROOT } from '@/test/sourceFiles';
import { TYPST_INIT_TIMEOUT_MS, compileToPdf, initTypstCompiler, isPdf } from '@/test/typstCompile';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * The harness never touches the network: `typst.ts` adds its default fonts from
 * `cdn.jsdelivr.net` unless the font loader says `assets: false`.
 * Its own file because the compiler is started once per file.
 */
describe('the Typst test harness', () => {
  const fetchSpy = vi.fn(() => Promise.reject(new Error('the Typst harness fetched')));

  beforeAll(() => {
    vi.stubGlobal('fetch', fetchSpy);
    return initTypstCompiler();
  }, TYPST_INIT_TIMEOUT_MS);

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('starts and compiles without a single fetch', async () => {
    expect(isPdf(await compileToPdf('#set text(font: "Inter")\nHello'))).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// The worker cannot start under node (`?url` imports, `self.location`), so its
// call site is a forward scan for the mention.
describe('the Typst worker', () => {
  it('starts its compiler with the shared font loaders', () => {
    const worker = readFileSync(resolve(REPO_ROOT, 'src/workers/typst.worker.ts'), 'utf8');
    expect(worker).toMatch(/beforeBuild:\s*typstFontLoaders\(/);
  });
});
