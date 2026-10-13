import { supabase } from '@/lib/supabase';

/** An `ai_jobs` row as the client inserts it (supabase/schema.sql). */
export interface JobRowInsert {
  id: string;
  user_id: string | undefined;
  status: 'processing';
  payload?: unknown;
}

/** The columns a caller may add; the run owns `id`, `user_id` and `status`. */
export type JobRowColumns = Omit<JobRowInsert, 'id' | 'user_id' | 'status'>;

/** An `ai_jobs` row as a poll reads it back. */
export interface JobRow {
  status: 'processing' | 'completed' | 'failed';
  result: unknown;
  error: string | null;
}

/** Inserts a job's `ai_jobs` row. A refused insert resolves as `{ error }`. */
export const insertJobRow = async (row: JobRowInsert) => {
  const { error } = await supabase.from('ai_jobs').insert(row);
  return { error };
};

/** Reads a job's `ai_jobs` row back. A failed read resolves as `{ error }`. */
export const readJobRow = async (jobId: string) => {
  const { data, error } = await supabase.from('ai_jobs').select('*').eq('id', jobId).single();
  return { data: data as JobRow | null, error };
};

/**
 * Removes a job's `ai_jobs` row. A refused delete resolves as `{ error }` rather
 * than throwing, and nothing else would show it.
 */
export const deleteJobRow = async (jobId: string | null) => {
  if (!jobId) return;
  const { error } = await supabase.from('ai_jobs').delete().eq('id', jobId);
  if (error) console.error('[AI] Job row not deleted:', error);
};
