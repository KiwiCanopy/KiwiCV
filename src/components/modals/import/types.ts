import { type ResumeData } from '@/types/resume';

export type ImportStepType = 'import_choice' | 'import_ai';

export interface StepProps {
  t: (key: string) => string;
  resume: ResumeData;
}
