import { getProfileImagePath } from '@/components/preview/themes/shared/typstUtils';
import { REPO_ROOT } from '@/test/sourceFiles';
import { EAGER_FONT_FILES, typstFontLoaders } from '@/workers/eagerFonts';
import { $typst } from '@myriaddreamin/typst.ts';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

/**
 * Compiles Typst markup with the **same compiler the app ships** —
 * `@myriaddreamin/typst-ts-web-compiler`, the WASM module `typst.worker.ts`
 * loads in the browser.
 *
 * Deliberately not the `typst` CLI. The CLI is not a dependency of this
 * repository, so a CLI-backed test needs a skip-if-missing gate and CI never
 * runs it — and the CLI installed on a developer machine is a different
 * compiler generation from the pinned WASM one, so it can accept markup
 * production rejects and vice versa. The WASM module is hermetic, runs
 * everywhere, and is version-locked to what users actually get.
 *
 * The WASM bytes are read straight off disk rather than fetched: `getModule`
 * accepts any `BufferSource`, and there is no origin to fetch from under node.
 */

// A package specifier, the one `typst.worker.ts` imports — `ops/TESTING.md`
// § Paths in tests.
const COMPILER_WASM = createRequire(import.meta.url).resolve(
  '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
);

let started: Promise<void> | null = null;

/**
 * The two faces the worker registers lazily over HTTP (`typst.worker.ts`).
 * 16 MB each, so they are opt-in here rather than part of every Typst test.
 */
export const CJK_FONT_FILES = ['noto-sans-cjk-sc-regular.otf', 'noto-sans-cjk-jp-regular.otf'];

/** Hook budget for the compiler start, kept out of the first test's 5 s. */
export const TYPST_INIT_TIMEOUT_MS = 60_000;

/**
 * Registers the compiler module and the Latin font faces, then starts the
 * compiler. Idempotent; call it from `beforeAll` with
 * {@link TYPST_INIT_TIMEOUT_MS} as the hook's timeout, so the start-up cost is
 * paid once under its own budget and never inside the first test.
 *
 * Rejects with "The Typst compiler did not start" when the WASM cannot be
 * instantiated, so a dead compiler fails the hook once instead of reading as
 * every theme's assertion failing.
 *
 * Pass `{ cjk: true }` to add the two Noto Sans CJK faces the worker fetches
 * lazily in production. Off by default: they are 16 MB each and every existing
 * fixture here is Latin.
 *
 * ⚠️ **Registering them is not optional for a CJK measurement, and getting it
 * wrong is silent.** A missing family is a Typst *warning*, not an error, so an
 * unregistered CJK face still yields a valid, readable PDF — with different
 * pagination. Measured 2026-09-08 on 8,800 identical CJK characters, A4, 11 pt:
 * **5 pages** with the face registered, **3 pages** without. A capacity sweep
 * run without it would have overstated a page by ~67%, with every check green
 * `coverLetterCapacityCjk.test.ts` asserts the difference rather than
 * trusting the load.
 *
 * ⚠️ Idempotent via a module-level promise, and `setCompilerInitOptions` is
 * global, so one vitest file cannot have it both ways. A file that needs the CJK
 * faces must be its own file — vitest isolates module state per file — and must
 * not also assert the Latin-only behaviour.
 */
export function initTypstCompiler(options: { cjk?: boolean } = {}): Promise<void> {
  if (started) return started;

  const compilerModule = readFileSync(COMPILER_WASM);
  const files = options.cjk ? [...EAGER_FONT_FILES, ...CJK_FONT_FILES] : EAGER_FONT_FILES;
  const fonts = files.map(
    (file) => new Uint8Array(readFileSync(resolve(REPO_ROOT, 'public/fonts', file))),
  );

  $typst.setCompilerInitOptions({
    getModule: () => compilerModule,
    beforeBuild: typstFontLoaders(fonts),
  });

  started = (async () => {
    try {
      await ($typst as unknown as { getCompiler: () => Promise<unknown> }).getCompiler();
    } catch (error) {
      throw new Error(`The Typst compiler did not start: ${String(error)}`, { cause: error });
    }
  })();
  return started;
}

/**
 * Maps the theme's icon SVGs into the compiler's virtual file system, exactly
 * as the worker does. The serializers emit `image("/icons/<name>.svg")` and no
 * such files exist in the repository — they are generated per render — so
 * without this every compile fails on a missing file rather than on anything
 * the test is about.
 */
export async function mapIcons(icons: Record<string, string>): Promise<void> {
  const compiler = (await (
    $typst as unknown as { getCompiler: () => Promise<unknown> }
  ).getCompiler()) as {
    mapShadow: (path: string, content: Uint8Array) => void;
  };

  const encoder = new TextEncoder();
  for (const [name, content] of Object.entries(icons)) {
    compiler.mapShadow(`/icons/${name}.svg`, encoder.encode(content));
  }
}

/**
 * Maps the profile image into the compiler's virtual file system, again as the
 * worker does.
 *
 * `basics.image` is a `public/` path or a data URL, and the themes that support
 * an image emit `image("/profile-image.<ext>")` for it. Nothing serves that
 * path here, and an unmapped one is a hard compile failure — "failed to load
 * file (access denied)" — not a missing picture. A `''` image emits nothing, so
 * only the fixtures that set one need this.
 */
export async function mapProfileImage(image: string): Promise<void> {
  if (!image) return;

  const compiler = (await (
    $typst as unknown as { getCompiler: () => Promise<unknown> }
  ).getCompiler()) as {
    mapShadow: (path: string, content: Uint8Array) => void;
  };

  const bytes = image.startsWith('data:image/')
    ? Uint8Array.from(Buffer.from(image.replace(/^data:image\/[^;]+;base64,/, ''), 'base64'))
    : new Uint8Array(readFileSync(resolve(REPO_ROOT, 'public', image.replace(/^\//, ''))));

  compiler.mapShadow(getProfileImagePath(image), bytes);
}

/**
 * Compiles markup to PDF bytes. Rejects with the compiler's own diagnostic when
 * the document does not compile, which is the entire point: a failure here
 * reads as e.g. `cannot spread string` — the single-element-tuple shape —
 * rather than as a silently empty export.
 */
export async function compileToPdf(markup: string): Promise<Uint8Array> {
  return (await $typst.pdf({ mainContent: markup })) as Uint8Array;
}

/**
 * Compiles markup and returns `field` of every element `selector` matches, as
 * `typst query` would. `$typst.query` queries without compiling first, and
 * throws "document is not compiled", so this drives the world itself.
 */
export async function queryDocument<T>(
  markup: string,
  selector: string,
  field?: string,
): Promise<T> {
  const compiler = (await (
    $typst as unknown as { getCompiler: () => Promise<unknown> }
  ).getCompiler()) as {
    addSource: (path: string, content: string) => void;
    runWithWorld: <R>(
      options: { mainFilePath: string },
      cb: (world: {
        compile: () => Promise<unknown>;
        query: (o: { selector: string; field?: string }) => Promise<R>;
      }) => Promise<R>,
    ) => Promise<R>;
  };
  const mainFilePath = '/query-main.typ';
  compiler.addSource(mainFilePath, markup);
  return compiler.runWithWorld<T>({ mainFilePath }, async (world) => {
    await world.compile();
    return world.query({ selector, field });
  });
}

/**
 * True when the bytes carry a PDF header.
 *
 * Deliberately weak, and worth being precise about: this checks five bytes. It
 * does not prove the document has content — a resume with no sections placed
 * compiles to a perfectly valid one-page PDF — and it does not prove the
 * compile was warning-free. The property this file asserts is "the compiler
 * accepted it"; anything stronger belongs to the assertions in the test file.
 */
export function isPdf(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
}
