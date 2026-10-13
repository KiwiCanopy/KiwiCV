// @vitest-environment jsdom
import { ImageCropper } from '@/components/ui/image-cropper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The crop surface and controls are canvas/interaction-heavy; stub them so the
// tests exercise the DialogFrame shell — title, dismissal, and the apply gate —
// without a real react-image-crop mount.
vi.mock('@/components/ui/image-cropper/components/CropArea', () => ({
  CropArea: () => <div data-testid="crop-area" />,
}));
vi.mock('@/components/ui/image-cropper/components/CropperControls', () => ({
  CropperControls: () => <div data-testid="crop-controls" />,
}));

const IMG = 'data:image/png;base64,AAAA';

function renderCropper(overrides = {}) {
  const props = {
    imageSrc: IMG,
    onCancel: vi.fn(),
    onCropComplete: vi.fn(),
    ...overrides,
  };
  render(<ImageCropper {...props} />);
  return props;
}

describe('ImageCropper', () => {
  it('exposes an accessible dialog named by its title', () => {
    renderCropper();
    expect(screen.getByRole('dialog', { name: /image_cropper\.title/i })).toBeTruthy();
  });

  it('cancels from the cancel button', async () => {
    const user = userEvent.setup();
    const props = renderCropper();
    await user.click(screen.getByRole('button', { name: /image_cropper\.cancel/i }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels from the frame close button', async () => {
    const user = userEvent.setup();
    const props = renderCropper();
    await user.click(screen.getByRole('button', { name: /common\.close_dialog/i }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables apply until a crop is completed', () => {
    renderCropper();
    // No crop has completed on a fresh mount, so the apply action is inert.
    const apply = screen.getByRole('button', {
      name: /image_cropper\.apply/i,
    }) as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
  });
});
