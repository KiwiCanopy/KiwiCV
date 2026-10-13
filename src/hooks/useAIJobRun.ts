import { useCallback, useEffect, useRef } from 'react';

import { type AIPaywallCode, AI_PAYWALL_CODES } from '@/constants/ai';
import { type JobRowColumns, deleteJobRow, insertJobRow, readJobRow } from '@/services/aiJobs';

const POLL_INTERVAL_MS = 2000;

const START_REFUSALS: Partial<Record<number, AIPaywallCode>> = {
  402: AI_PAYWALL_CODES.PREMIUM_REQUIRED,
  403: AI_PAYWALL_CODES.LIMIT_REACHED,
};

const PAYWALL_CODES: readonly string[] = Object.values(AI_PAYWALL_CODES);

const asPaywallCode = (error: string | null | undefined): AIPaywallCode | null =>
  error && PAYWALL_CODES.includes(error) ? (error as AIPaywallCode) : null;

/**
 * One background AI job: its `ai_jobs` row, the worker that fills it, and the
 * poll that reads it back. Every callback runs at most once per run, except
 * `onProcessing`, and none runs after the run has settled.
 */
export interface AIJobRunSpec<TResult> {
  accessToken: string | undefined;
  userId: string | undefined;
  /** Columns beyond `id`, `user_id` and `status`, which the run owns. */
  insert?: JobRowColumns;
  workerUrl: string;
  workerBody: (jobId: string) => Record<string, unknown>;
  /** How long the poll waits before giving up, measured from the worker's start. */
  pollWindowMs: number;
  /** The message thrown into `onStartError` when the worker answers non-2xx. */
  startErrorMessage: string;
  /**
   * The worker refused the run at the paywall, at start or in a `failed` row
   * (mapping on `useAIJobRun`). Called after the row is deleted. A throw lands
   * in `onStartError` at start, in `onPollError` from a poll.
   */
  onRefused: (kind: AIPaywallCode) => Promise<void>;
  /** Insert or fetch failed. The row is deleted after this returns. */
  onStartError: (error: unknown) => void;
  /** A poll read a row still `processing`, which may carry a progress marker. */
  onProcessing?: (result: unknown) => void;
  /** The window passed. The row is deleted after this returns. */
  onTimeout: () => void;
  /** Called after the row is deleted, so a throw here leaves nothing at rest. */
  onCompleted: (result: TResult) => Promise<void>;
  /**
   * A `failed` row that is not a paywall refusal. Called after the row is
   * deleted. A throw lands in `onPollError`.
   */
  onFailed: (error: string | null | undefined) => Promise<void>;
  /** `onCompleted`, `onFailed` or a poll's `onRefused` threw. The run is already settled. */
  onPollError: (error: unknown) => void;
}

/**
 * `settled` is set by the first exit — a read result, the timeout, a failure,
 * or unmount — and every other path checks it after each await.
 */
interface Run {
  jobId: string;
  interval: ReturnType<typeof setInterval> | null;
  settled: boolean;
}

const settle = (run: Run) => {
  run.settled = true;
  if (run.interval !== null) clearInterval(run.interval);
};

/**
 * The AI job run lifecycle shared by the improve and import dialogs:
 * insert → start the worker → poll within a window → settle once → delete the
 * row. The invariant is argued in `.agent/wiki/ops/AI_LOGIC.md` § One run, one
 * outcome.
 *
 * Unmount settles and deletes an unsettled run: neither dialog can be closed
 * mid-run, so nothing would ever read the row.
 *
 * A paywall refusal goes to `onRefused`, never `onFailed` or `onStartError`: a
 * `failed` row whose error is in `AI_PAYWALL_CODES` passes that code, and a
 * start answered 402 or 403 passes `PREMIUM_REQUIRED` or `LIMIT_REACHED`. Both
 * workers are background functions, which Netlify answers 202 before the
 * handler runs, so today every refusal arrives as a `failed` row.
 */
export function useAIJobRun() {
  const runRef = useRef<Run | null>(null);

  useEffect(
    () => () => {
      const run = runRef.current;
      runRef.current = null;
      if (!run || run.settled) return;
      settle(run);
      void deleteJobRow(run.jobId);
    },
    [],
  );

  /** Whether a run has started and not yet settled. */
  const isRunning = useCallback(() => {
    const run = runRef.current;
    return run !== null && !run.settled;
  }, []);

  const start = useCallback(async <TResult>(spec: AIJobRunSpec<TResult>) => {
    let jobId: string | null = null;
    let run: Run | null = null;
    try {
      jobId = crypto.randomUUID();
      const activeRun: Run = { jobId, interval: null, settled: false };
      run = activeRun;
      runRef.current = activeRun;

      // Spread first: a caller's columns cannot override the run's own.
      const { error: dbError } = await insertJobRow({
        ...spec.insert,
        id: jobId,
        user_id: spec.userId,
        status: 'processing',
      });

      if (dbError) throw new Error('Could not start background job: ' + dbError.message);
      // Unmounted during the insert: the cleanup's delete ran before the row existed.
      if (activeRun.settled) {
        await deleteJobRow(jobId);
        return;
      }

      const response = await fetch(spec.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spec.accessToken}`,
        },
        body: JSON.stringify(spec.workerBody(jobId)),
      });

      // Unmounted while the worker was being started; the cleanup took the row.
      if (activeRun.settled) return;

      if (!response.ok) {
        const refusal = START_REFUSALS[response.status];
        if (refusal) {
          // The worker never started, so the row stays empty; nothing else deletes it.
          settle(activeRun);
          await deleteJobRow(jobId);
          await spec.onRefused(refusal);
          return;
        }
        throw new Error(spec.startErrorMessage);
      }

      const startTime = Date.now();
      const pollJobId = jobId;

      activeRun.interval = setInterval(async () => {
        try {
          if (activeRun.settled) return;
          if (Date.now() - startTime > spec.pollWindowMs) {
            settle(activeRun);
            spec.onTimeout();
            // Abandoned: with the row gone, a late completion lands nowhere.
            // Billed either way.
            await deleteJobRow(pollJobId);
            return;
          }

          const { data, error } = await readJobRow(pollJobId);

          // ⚠️ Settled while this read was in flight — by the timeout, whose
          // error is already on screen, or by unmount.
          if (activeRun.settled) return;

          if (error || !data) {
            console.error('Polling error:', error);
            return;
          }

          if (data.status === 'processing') {
            spec.onProcessing?.(data.result);
          } else if (data.status === 'completed') {
            settle(activeRun);
            // Deleted before the result is applied, so an apply that throws
            // cannot leave it at rest.
            await deleteJobRow(pollJobId);
            await spec.onCompleted(data.result as TResult);
          } else if (data.status === 'failed') {
            settle(activeRun);
            await deleteJobRow(pollJobId);
            const refusal = asPaywallCode(data.error);
            if (refusal) await spec.onRefused(refusal);
            else await spec.onFailed(data.error);
          }
        } catch (pollError: unknown) {
          settle(activeRun);
          spec.onPollError(pollError);
        }
      }, POLL_INTERVAL_MS);
    } catch (error: unknown) {
      spec.onStartError(error);
      if (run) settle(run);
      // Delete, never mark failed: users hold no UPDATE policy on `ai_jobs`
      // (supabase/schema.sql), so an update matches nothing.
      await deleteJobRow(jobId);
    }
  }, []);

  return { start, isRunning };
}
