import { useCallback, useState } from 'react';

// Single shared Web Worker instance at module scope to avoid multiple compiler instances
let sharedWorker: Worker | null = null;
let nextRequestId = 1;

// A worker/WASM init crash used to leave compile promises unsettled forever
// (spinner with no error). Cap every compile so a stuck worker still surfaces.
const COMPILE_TIMEOUT_MS = 30_000;

// Map to track active promise resolvers by request ID
const pendingResolves = new Map<
  string,
  { resolve: (val: unknown) => void; reject: (err: unknown) => void }
>();

// Settle every in-flight compile with the same error and clear the queue. Used
// when the worker itself dies, since no per-request response will ever arrive.
function rejectAllPending(err: Error) {
  for (const { reject } of pendingResolves.values()) {
    reject(err);
  }
  pendingResolves.clear();
}

function getWorker(): Worker {
  if (!sharedWorker) {
    // Instantiate worker using Vite-compatible worker construction syntax
    sharedWorker = new Worker(new URL('../workers/typst.worker.ts', import.meta.url), {
      type: 'module',
    });

    sharedWorker.onmessage = (event: MessageEvent) => {
      const { type, id, svg, pdf, error } = event.data;
      const callbacks = pendingResolves.get(id);
      if (!callbacks) return;

      pendingResolves.delete(id);

      if (type === 'compile-svg-success') {
        callbacks.resolve(svg);
      } else if (type === 'compile-pdf-success') {
        callbacks.resolve(pdf);
      } else if (type === 'warm-success') {
        callbacks.resolve(undefined);
      } else if (type === 'compile-error') {
        callbacks.reject(new Error(error));
      }
    };

    sharedWorker.onerror = (event) => {
      console.error('Typst Web Worker error event:', event);
      // An onerror event means the worker crashed (e.g. WASM init failure), so
      // no pending request can ever be answered. Reject them all instead of
      // hanging, and drop the dead instance so the next compile spins a fresh one.
      rejectAllPending(new Error('Typst worker crashed. Please reload the page and try again.'));
      sharedWorker?.terminate();
      sharedWorker = null;
    };
  }
  return sharedWorker;
}

// Register a pending compile, post it to the worker, and race it against a
// timeout so a silent hang always rejects instead of spinning forever.
function postCompile(
  type: 'compile-svg' | 'compile-pdf' | 'warm',
  markup: string,
  assets?: Record<string, string>,
  profileImage?: string,
): Promise<unknown> {
  const id = String(nextRequestId++);
  return new Promise<unknown>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (pendingResolves.delete(id)) {
        reject(new Error(`Typst compilation timed out after ${COMPILE_TIMEOUT_MS / 1000}s.`));
      }
    }, COMPILE_TIMEOUT_MS);

    pendingResolves.set(id, {
      resolve: (val) => {
        clearTimeout(timeoutId);
        resolve(val);
      },
      reject: (err) => {
        clearTimeout(timeoutId);
        reject(err);
      },
    });

    const worker = getWorker();
    worker.postMessage({ type, id, markup, assets, profileImage });
  });
}

/**
 * Boots the worker without compiling anything.
 *
 * Best-effort: a rejection here means the next real compile pays the cold start
 * it would have paid anyway, so callers ignore it rather than surfacing it.
 */
export function warmTypst(): Promise<void> {
  return postCompile('warm', '') as Promise<void>;
}

/**
 * The last PDF compile, so tapping Preview twice on an unchanged CV compiles
 * once.
 *
 * ⚠️ Keyed on the **input**, never on the output bytes: this compiler is not
 * byte-deterministic, so a bytes-keyed cache would never hit. The key has to
 * carry all three inputs — markup alone is blind to the icon assets and the
 * profile image, both of which change the document without changing a
 * character of the markup.
 *
 * One entry, and it holds the in-flight promise rather than the result, so a
 * double tap joins the first compile instead of starting a second. A rejection
 * evicts, so a retry after a failure really retries.
 */
let lastPdf: { key: string; promise: Promise<Uint8Array> } | null = null;

// Length-prefixed rather than joined on a separator: a raw concatenation lets
// a different split of the same characters produce the same key, and a NUL
// separator would make git treat this source file as binary.
const pdfCacheKey = (markup: string, assets?: Record<string, string>, profileImage?: string) =>
  [markup, assets ? JSON.stringify(assets) : '', profileImage ?? '']
    .map((part) => `${part.length}:${part}`)
    .join('');

export async function compileTypstPdf(
  markup: string,
  assets?: Record<string, string>,
  profileImage?: string,
): Promise<Uint8Array> {
  const key = pdfCacheKey(markup, assets, profileImage);
  if (lastPdf?.key === key) return lastPdf.promise;

  const promise = postCompile('compile-pdf', markup, assets, profileImage) as Promise<Uint8Array>;
  const entry = { key, promise };
  lastPdf = entry;

  try {
    return await promise;
  } catch (error) {
    if (lastPdf === entry) lastPdf = null;
    throw error;
  }
}

export function useTypst() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compileSvg = useCallback(
    async (
      markup: string,
      assets?: Record<string, string>,
      profileImage?: string,
    ): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        return (await postCompile('compile-svg', markup, assets, profileImage)) as string;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err instanceof Error ? err : new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const compilePdf = useCallback(
    async (
      markup: string,
      assets?: Record<string, string>,
      profileImage?: string,
    ): Promise<Uint8Array> => {
      setLoading(true);
      setError(null);
      try {
        return (await postCompile('compile-pdf', markup, assets, profileImage)) as Uint8Array;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err instanceof Error ? err : new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    compileSvg,
    compilePdf,
    loading,
    error,
  };
}
