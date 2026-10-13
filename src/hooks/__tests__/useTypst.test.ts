import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The interesting property of `compileTypstPdf` is *how often it reaches the
 * worker*, so these tests stub the worker and count messages rather than
 * compiling anything.
 *
 * The worker is a module-scope singleton and the cache holds one entry, so
 * every test re-imports the module through `vi.resetModules()` to get a fresh
 * pair.
 */

interface StubMessage {
  type: string;
  id: string;
  markup: string;
  assets?: Record<string, string>;
  profileImage?: string;
}

const posted: StubMessage[] = [];
let respond: (message: StubMessage) => void = () => {};

class StubWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor() {
    // Every instance answers through the same hook: a test that sees a second
    // instance would silently lose its responder otherwise.
    respond = (message) => {
      this.onmessage?.({ data: message } as MessageEvent);
    };
  }

  postMessage(message: StubMessage) {
    posted.push(message);
  }

  terminate() {}
}

/** Answers whatever is outstanding, oldest first, as a successful compile. */
const answerPdf = (bytes: number[]) => {
  const pending = posted[posted.length - 1];
  respond({ ...pending, type: 'compile-pdf-success', pdf: new Uint8Array(bytes) } as StubMessage & {
    pdf: Uint8Array;
  });
};

const answerError = (error: string) => {
  const pending = posted[posted.length - 1];
  respond({ ...pending, type: 'compile-error', error } as StubMessage & { error: string });
};

const loadModule = async () => {
  vi.resetModules();
  posted.length = 0;
  vi.stubGlobal('Worker', StubWorker);
  return import('@/hooks/useTypst');
};

describe('compileTypstPdf', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('compiles once for two identical calls', async () => {
    const { compileTypstPdf } = await loadModule();

    const first = compileTypstPdf('#let a = 1', { icon: '<svg/>' }, 'data:image/png;base64,AA');
    answerPdf([1, 2, 3]);
    await first;

    const second = compileTypstPdf('#let a = 1', { icon: '<svg/>' }, 'data:image/png;base64,AA');
    await expect(second).resolves.toEqual(new Uint8Array([1, 2, 3]));

    expect(posted.filter((message) => message.type === 'compile-pdf')).toHaveLength(1);
  });

  it('recompiles when the assets change but the markup does not', async () => {
    const { compileTypstPdf } = await loadModule();

    const first = compileTypstPdf('#let a = 1', { icon: '<svg/>' });
    answerPdf([1]);
    await first;

    const second = compileTypstPdf('#let a = 1', { icon: '<svg fill="red"/>' });
    answerPdf([2]);
    await expect(second).resolves.toEqual(new Uint8Array([2]));

    expect(posted.filter((message) => message.type === 'compile-pdf')).toHaveLength(2);
  });

  it('recompiles when the profile image changes but the markup does not', async () => {
    const { compileTypstPdf } = await loadModule();

    const first = compileTypstPdf('#let a = 1', undefined, 'data:image/png;base64,AA');
    answerPdf([1]);
    await first;

    const second = compileTypstPdf('#let a = 1', undefined, 'data:image/png;base64,BB');
    answerPdf([2]);
    await expect(second).resolves.toEqual(new Uint8Array([2]));

    expect(posted.filter((message) => message.type === 'compile-pdf')).toHaveLength(2);
  });

  it('joins a compile that is still in flight instead of starting a second', async () => {
    const { compileTypstPdf } = await loadModule();

    const first = compileTypstPdf('#let a = 1');
    const second = compileTypstPdf('#let a = 1');
    answerPdf([7]);

    await expect(first).resolves.toEqual(new Uint8Array([7]));
    await expect(second).resolves.toEqual(new Uint8Array([7]));
    expect(posted.filter((message) => message.type === 'compile-pdf')).toHaveLength(1);
  });

  it('does not cache a failure, so a retry really retries', async () => {
    const { compileTypstPdf } = await loadModule();

    const failing = compileTypstPdf('#let a = 1');
    answerError('boom');
    await expect(failing).rejects.toThrow('boom');

    const retry = compileTypstPdf('#let a = 1');
    answerPdf([9]);
    await expect(retry).resolves.toEqual(new Uint8Array([9]));

    expect(posted.filter((message) => message.type === 'compile-pdf')).toHaveLength(2);
  });
});

describe('warmTypst', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('boots the worker without posting a compile', async () => {
    const { warmTypst } = await loadModule();

    const warming = warmTypst();
    expect(posted).toHaveLength(1);
    expect(posted[0].type).toBe('warm');

    respond({ ...posted[0], type: 'warm-success' });
    await expect(warming).resolves.toBeUndefined();
    expect(posted.filter((message) => message.type.startsWith('compile'))).toHaveLength(0);
  });

  it('leaves the cache alone, so the next compile still reaches the worker', async () => {
    const { compileTypstPdf, warmTypst } = await loadModule();

    const warming = warmTypst();
    respond({ ...posted[0], type: 'warm-success' });
    await warming;

    const compile = compileTypstPdf('#let a = 1');
    answerPdf([4]);
    await expect(compile).resolves.toEqual(new Uint8Array([4]));
  });
});
