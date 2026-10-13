// @vitest-environment jsdom
import { type AIJobRunSpec, useAIJobRun } from '@/hooks/useAIJobRun';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The AI job run lifecycle both dialogs share: insert → start → poll
 * within a window → settle once → delete. What each dialog does with an
 * outcome is pinned beside it (`abandonedRunCleanup`, `abandonedImportCleanup`);
 * this pins the lifecycle itself, once. Supabase is mocked beneath
 * `@/services/aiJobs`, so the service's real row calls are exercised too.
 */

type Row = { status: string; result?: unknown; error?: string };

let pollRow: Row = { status: 'processing' };
const events: string[] = [];

const insert = vi.fn(async (_row: Record<string, unknown>) => ({ error: null }) as unknown);
const single = vi.fn(async () => ({ data: pollRow, error: null }) as unknown);
const deleteEq = vi.fn(async (_col: string, _id: string) => {
  events.push('delete');
  return { error: null };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert,
      select: () => ({ eq: () => ({ single }) }),
      delete: () => ({ eq: deleteEq }),
    }),
  },
}));

const WINDOW_MS = 10_000;

const makeSpec = (overrides: Partial<AIJobRunSpec<unknown>> = {}) => ({
  accessToken: 'token',
  userId: 'user-1',
  insert: { payload: { text: 'cv' } },
  workerUrl: '/.netlify/functions/worker',
  workerBody: (jobId: string) => ({ jobId, extra: 1 }),
  pollWindowMs: WINDOW_MS,
  startErrorMessage: 'worker did not start',
  onRefused: vi.fn(async () => {
    events.push('refused');
  }),
  onStartError: vi.fn(),
  onProcessing: vi.fn(),
  onTimeout: vi.fn(() => {
    events.push('timeout');
  }),
  onCompleted: vi.fn(async () => {
    events.push('completed');
  }),
  onFailed: vi.fn(async () => {
    events.push('failed');
  }),
  onPollError: vi.fn(),
  ...overrides,
});

const insertedJobId = (): string => {
  const row = insert.mock.calls[0]?.[0];
  if (!row) throw new Error('the run never inserted a job row');
  return row.id as string;
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

beforeEach(() => {
  vi.useFakeTimers();
  pollRow = { status: 'processing' };
  events.length = 0;
  insert.mockClear();
  single.mockClear();
  deleteEq.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200 })),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('starting a run', () => {
  it('inserts the row with the caller’s columns and posts the caller’s body', async () => {
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(makeSpec());
    });
    const jobId = insertedJobId();

    expect(insert).toHaveBeenCalledWith({
      id: jobId,
      user_id: 'user-1',
      status: 'processing',
      payload: { text: 'cv' },
    });
    expect(fetch).toHaveBeenCalledWith('/.netlify/functions/worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ jobId, extra: 1 }),
    });
    expect(result.current.isRunning()).toBe(true);
  });

  it('keeps the run’s own columns when the caller’s insert names them', async () => {
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(
        makeSpec({
          insert: { id: 'forged', user_id: 'someone-else', status: 'completed' } as never,
        }),
      );
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', status: 'processing' }),
    );
    expect(insertedJobId()).not.toBe('forged');
  });

  it('reports a failed insert and deletes, never marks, the row', async () => {
    insert.mockResolvedValueOnce({ error: { message: 'rls' } });
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    expect(spec.onStartError).toHaveBeenCalledWith(
      new Error('Could not start background job: rls'),
    );
    expect(deleteEq).toHaveBeenCalledWith('id', insertedJobId());
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.isRunning()).toBe(false);
  });

  it('deletes the row once when the worker cannot be started', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    expect(spec.onStartError).toHaveBeenCalledWith(new Error('worker did not start'));
    expect(spec.onRefused).not.toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledTimes(1);
    expect(deleteEq).toHaveBeenCalledWith('id', insertedJobId());
  });

  it.each([
    [402, 'PREMIUM_REQUIRED'],
    [403, 'LIMIT_REACHED'],
  ])('classifies a %i start as %s, after the row is deleted', async (status, kind) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status })),
    );
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    expect(spec.onRefused).toHaveBeenCalledWith(kind);
    expect(events).toEqual(['delete', 'refused']);
    expect(deleteEq).toHaveBeenCalledTimes(1);
    expect(spec.onStartError).not.toHaveBeenCalled();
    expect(result.current.isRunning()).toBe(false);
  });
});

describe('settling once', () => {
  it('deletes a completed row before handing its result over, then stops polling', async () => {
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    pollRow = { status: 'completed', result: { basics: {} } };
    await advance(2_100);
    const polls = single.mock.calls.length;
    await advance(10_000);

    expect(events).toEqual(['delete', 'completed']);
    expect(spec.onCompleted).toHaveBeenCalledWith({ basics: {} });
    expect(single.mock.calls.length).toBe(polls);
    expect(spec.onTimeout).not.toHaveBeenCalled();
    expect(result.current.isRunning()).toBe(false);
  });

  it('deletes a failed row before handing its error over', async () => {
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    pollRow = { status: 'failed', error: 'PAYLOAD_TOO_LARGE' };
    await advance(2_100);

    expect(events).toEqual(['delete', 'failed']);
    expect(spec.onFailed).toHaveBeenCalledWith('PAYLOAD_TOO_LARGE');
    expect(spec.onRefused).not.toHaveBeenCalled();
  });

  it.each(['PREMIUM_REQUIRED', 'LIMIT_REACHED'])(
    'classifies a row failed with %s as a refusal, after the row is deleted',
    async (code) => {
      const spec = makeSpec();
      const { result } = renderHook(() => useAIJobRun());
      await act(async () => {
        await result.current.start(spec);
      });

      pollRow = { status: 'failed', error: code };
      await advance(10_000);

      expect(events).toEqual(['delete', 'refused']);
      expect(spec.onRefused).toHaveBeenCalledTimes(1);
      expect(spec.onRefused).toHaveBeenCalledWith(code);
      expect(spec.onFailed).not.toHaveBeenCalled();
      expect(spec.onPollError).not.toHaveBeenCalled();
    },
  );

  it('routes a throwing refusal handler to onPollError', async () => {
    const boom = new Error('profile refresh failed');
    const spec = makeSpec({
      onRefused: vi.fn(async () => {
        throw boom;
      }),
    });
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    pollRow = { status: 'failed', error: 'LIMIT_REACHED' };
    await advance(2_100);

    expect(spec.onPollError).toHaveBeenCalledWith(boom);
  });

  it('routes a throwing outcome handler to onPollError, once', async () => {
    const boom = new Error('apply exploded');
    const spec = makeSpec({
      onCompleted: vi.fn(async () => {
        throw boom;
      }),
    });
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    pollRow = { status: 'completed', result: {} };
    await advance(10_000);

    expect(spec.onPollError).toHaveBeenCalledTimes(1);
    expect(spec.onPollError).toHaveBeenCalledWith(boom);
    expect(deleteEq).toHaveBeenCalledTimes(1);
  });

  it('passes each processing row to onProcessing and keeps polling', async () => {
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    pollRow = { status: 'processing', result: { stage: 'cover_letter' } };
    await advance(4_100);

    expect(spec.onProcessing).toHaveBeenCalledTimes(2);
    expect(spec.onProcessing).toHaveBeenCalledWith({ stage: 'cover_letter' });
    expect(result.current.isRunning()).toBe(true);
  });

  it('logs a failed read and keeps polling', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    single.mockResolvedValueOnce({ data: null, error: { message: 'network' } });
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    await advance(2_100);
    expect(consoleError).toHaveBeenCalledWith('Polling error:', { message: 'network' });
    pollRow = { status: 'completed', result: {} };
    await advance(2_000);

    expect(spec.onCompleted).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('times out once, past the caller’s window, and deletes the row', async () => {
    const spec = makeSpec();
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });

    await advance(WINDOW_MS - 1_000);
    expect(spec.onTimeout).not.toHaveBeenCalled();
    await advance(30_000);

    expect(events).toEqual(['timeout', 'delete']);
    expect(spec.onTimeout).toHaveBeenCalledTimes(1);
    expect(deleteEq).toHaveBeenCalledWith('id', insertedJobId());
  });

  it('logs a delete the database refused, since nothing else would show it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    deleteEq.mockResolvedValueOnce({ error: { message: 'refused' } } as never);
    const { result } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(makeSpec());
    });

    await advance(WINDOW_MS + 2_100);

    expect(consoleError).toHaveBeenCalledWith('[AI] Job row not deleted:', { message: 'refused' });
    consoleError.mockRestore();
  });

  it('discards a read that was in flight when the window closed', async () => {
    const pending: Array<(value: { data: Row; error: null }) => void> = [];
    single.mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
    try {
      const spec = makeSpec();
      const { result } = renderHook(() => useAIJobRun());
      await act(async () => {
        await result.current.start(spec);
      });

      await advance(WINDOW_MS + 2_100);
      expect(spec.onTimeout).toHaveBeenCalledTimes(1);
      expect(pending.length).toBeGreaterThan(0);

      await act(async () => {
        for (const resolve of pending) {
          resolve({ data: { status: 'completed', result: {} }, error: null });
        }
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(spec.onCompleted).not.toHaveBeenCalled();
      expect(deleteEq).toHaveBeenCalledTimes(1);
    } finally {
      single.mockImplementation(async () => ({ data: pollRow, error: null }));
    }
  });
});

describe('unmount', () => {
  it('deletes an unsettled run’s row once and stops polling', async () => {
    const spec = makeSpec();
    const { result, unmount } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(spec);
    });
    const jobId = insertedJobId();
    await advance(4_100);
    const polls = single.mock.calls.length;

    unmount();
    expect(deleteEq).toHaveBeenCalledTimes(1);
    expect(deleteEq).toHaveBeenCalledWith('id', jobId);

    pollRow = { status: 'completed', result: {} };
    await advance(10_000);
    expect(single.mock.calls.length).toBe(polls);
    expect(deleteEq).toHaveBeenCalledTimes(1);
    expect(spec.onCompleted).not.toHaveBeenCalled();
  });

  it('does not delete again once the run settled', async () => {
    const { result, unmount } = renderHook(() => useAIJobRun());
    await act(async () => {
      await result.current.start(makeSpec());
    });

    pollRow = { status: 'completed', result: {} };
    await advance(2_100);
    unmount();

    expect(deleteEq).toHaveBeenCalledTimes(1);
  });

  it('deletes the row an unmount during the insert was too early for, and never starts the worker', async () => {
    const inserted = deferred<{ error: null }>();
    insert.mockImplementationOnce(() => inserted.promise);
    const spec = makeSpec();
    const { result, unmount } = renderHook(() => useAIJobRun());
    let started!: Promise<void>;
    act(() => {
      started = result.current.start(spec);
    });

    unmount();
    const jobId = insertedJobId();
    expect(deleteEq).toHaveBeenCalledTimes(1);

    await act(async () => {
      inserted.resolve({ error: null });
      await started;
    });

    // The cleanup's delete ran before the row existed; this one finds it.
    expect(deleteEq).toHaveBeenCalledTimes(2);
    expect(deleteEq).toHaveBeenLastCalledWith('id', jobId);
    expect(fetch).not.toHaveBeenCalled();
    await advance(10_000);
    expect(single).not.toHaveBeenCalled();
    expect(spec.onStartError).not.toHaveBeenCalled();
  });

  it('leaves the row to the cleanup when unmounted while the worker starts', async () => {
    const started = deferred<{ ok: boolean; status: number }>();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => started.promise),
    );
    const spec = makeSpec();
    const { result, unmount } = renderHook(() => useAIJobRun());
    let running!: Promise<void>;
    await act(async () => {
      running = result.current.start(spec);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    unmount();
    expect(deleteEq).toHaveBeenCalledTimes(1);

    await act(async () => {
      started.resolve({ ok: true, status: 200 });
      await running;
    });
    await advance(10_000);

    expect(deleteEq).toHaveBeenCalledTimes(1);
    expect(single).not.toHaveBeenCalled();
    expect(spec.onStartError).not.toHaveBeenCalled();
    expect(spec.onTimeout).not.toHaveBeenCalled();
  });
});
