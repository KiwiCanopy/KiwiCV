// @vitest-environment jsdom
import { PhotoEditor } from '@/components/ui/PhotoEditor';
import { PHOTO_SIZE_LIMIT_BYTES, PHOTO_SIZE_LIMIT_MB } from '@/constants/photo';
import { locales } from '@/locales';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The photo size refusal states the constant, never a number written into the
 * copy.
 *
 * ⚠️ Asserts the RENDERED message against the English source with the figure
 * substituted, as `uploadCapCallSites.test.tsx` does: `t()` substitutes only
 * the vars it is handed, so a call site that drops `size` ships the literal
 * `{{size}}` with `tsc`, `lint` and `i18n:check` green. And it asserts the
 * figure itself, since an English that lost its placeholder would make the
 * substitution a no-op that still equals the source.
 */
vi.mock('@/components/ui/image-cropper', () => ({
  ImageCropper: () => <div data-testid="cropper" />,
}));

const substituted = () =>
  locales.en.editor.photo.file_too_large.replace('{{size}}', String(PHOTO_SIZE_LIMIT_MB));

afterEach(() => {
  useConfirmStore.getState().close();
});

describe('the photo size refusal', () => {
  it('states the threshold the picker enforces, as a number', async () => {
    const user = userEvent.setup();
    const { container } = render(<PhotoEditor onUpdate={vi.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const huge = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(huge, 'size', { value: PHOTO_SIZE_LIMIT_BYTES + 1 });

    await user.upload(input, huge);

    await waitFor(() => {
      const { isOpen, options } = useConfirmStore.getState();
      expect(isOpen, 'no refusal was raised for an oversized photo').toBe(true);
      expect(options.message).toBe(substituted());
      expect(String(options.message)).toContain(String(PHOTO_SIZE_LIMIT_MB));
      expect(String(options.message)).not.toContain('{{');
    });
  });

  /** The copy says the photo is refused, so the picker must actually refuse it. */
  it('refuses the photo rather than opening it for cropping', async () => {
    const user = userEvent.setup();
    const { container, findByTestId } = render(<PhotoEditor onUpdate={vi.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const huge = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(huge, 'size', { value: PHOTO_SIZE_LIMIT_BYTES + 1 });

    await user.upload(input, huge);
    await waitFor(() => expect(useConfirmStore.getState().isOpen).toBe(true));

    // Waits out the async HEIC sniff and FileReader an accepted file would go
    // through, rather than checking once before they could finish.
    await expect(findByTestId('cropper', {}, { timeout: 500 })).rejects.toThrow();
  });

  it('derives the figure it states from the bytes it enforces', () => {
    // Floors, and understates: a threshold of 10.5 MiB must read "10", never "11".
    expect(Number.isInteger(PHOTO_SIZE_LIMIT_MB)).toBe(true);
    expect(PHOTO_SIZE_LIMIT_MB * 1024 * 1024).toBeLessThanOrEqual(PHOTO_SIZE_LIMIT_BYTES);
    expect(PHOTO_SIZE_LIMIT_MB).toBeGreaterThan(0);
  });
});
