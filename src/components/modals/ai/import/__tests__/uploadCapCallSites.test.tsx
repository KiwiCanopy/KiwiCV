// @vitest-environment jsdom
import { AIImportUploadStep } from '@/components/modals/ai/import/AIImportUploadStep';
import { useAIImportFile } from '@/components/modals/ai/import/useAIImportFile';
import { AI_MAX_UPLOAD_BYTES, AI_MAX_UPLOAD_MB } from '@/constants/ai';
import { locales } from '@/locales';
import { useToastStore } from '@/store/ui/useToastStore';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The half `uploadCapCopy.test.ts` cannot reach. `t()` substitutes only the vars
 * it is handed, so a call site that omits `size` — or renames the property —
 * renders the literal `{{size}}` to the user while `tsc -b`, `lint`,
 * `i18n:check` and all four runners stay green.
 *
 * ⚠️ Asserts the RENDERED string against the English source with the cap
 * substituted, never "some element containing a 5". A query scoped by the digit
 * matches whatever else on the page happens to carry one, so a broken
 * substitution would pick a different element and pass.
 */
const substituted = (key: 'import_max_size' | 'import_error_file_too_large') =>
  locales.en.ai[key].replace('{{size}}', String(AI_MAX_UPLOAD_MB));

afterEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('the upload cap reaches the user as a number', () => {
  it('renders the caption under the drop zone with the size substituted', () => {
    render(<AIImportUploadStep onFileDrop={() => {}} onBack={() => {}} />);

    expect(screen.getByText(substituted('import_max_size'))).toBeTruthy();

    // Independent of the query above: catches a raw token anywhere on the step,
    // including one this test does not name.
    expect(document.body.textContent, 'a raw placeholder reached the UI').not.toContain('{{');
  });

  it('renders the too-large toast with the size substituted', async () => {
    const { result } = renderHook(() => useAIImportFile());

    const tooBig = new File(['x'], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(tooBig, 'size', { value: AI_MAX_UPLOAD_BYTES + 1 });

    await result.current.handleFileChange(tooBig);

    await waitFor(() => {
      const [toast] = useToastStore.getState().toasts;
      expect(toast, 'no toast was raised for an oversized file').toBeTruthy();
      expect(toast.message).toBe(substituted('import_error_file_too_large'));
      expect(toast.type).toBe('error');
    });
  });
});
