import { type DataSlice } from '@/store/resume/slices/dataSlice';
import { useImportWarningsStore } from '@/store/ui/useImportWarningsStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { preProcessResumeData } from '@/utils/image-processing';

type SetResume = DataSlice['setResume'];

/**
 * The one way outside CV data enters the store: photos are cleaned or dropped
 * first, and those warnings join the sanitizer's. Every import, restore
 * or sync path goes through here, never through `setResume` directly.
 */
export async function importResume(
  setResume: SetResume,
  raw: Parameters<SetResume>[0],
  options: Omit<NonNullable<Parameters<SetResume>[1]>, 'warnings' | 'clearImage'> = {},
): Promise<ReturnType<SetResume> & { data: Parameters<SetResume>[0] }> {
  const processed = await preProcessResumeData(raw);
  const result = setResume(processed.data, {
    ...options,
    warnings: processed.warnings,
    clearImage: processed.warnings.some((warning) => warning.field === 'image'),
  });
  // A different CV: the Recipient choice made on the previous one does not carry over.
  useUIStore.getState().setCoverLetterRecipientCollapsed(null);
  // `silent` suppresses the sanitizer's dialog, never the news that a photo was dropped.
  if (options.silent && processed.warnings.length > 0) {
    useImportWarningsStore.getState().showWarnings(processed.warnings);
  }
  return { ...result, data: processed.data };
}
