// @vitest-environment jsdom
import { PhotoEditor } from '@/components/ui/PhotoEditor';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The cropper is a separate canvas surface; stub it so these tests stay on the
// preview modal (it only mounts once a crop starts, which they never trigger).
vi.mock('@/components/ui/image-cropper', () => ({
  ImageCropper: () => null,
}));

const IMG = 'data:image/png;base64,AAAA';

function openPreview() {
  render(<PhotoEditor image={IMG} onUpdate={vi.fn()} />);
  // The trigger is the photo tile; its title switches to the edit label when a
  // photo is present.
  return screen.getByTitle('editor.photo.edit_title');
}

describe('PhotoEditor preview modal', () => {
  it('stays closed until the photo tile is clicked', () => {
    render(<PhotoEditor image={IMG} onUpdate={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens an accessible preview dialog with its edit/delete/replace actions', async () => {
    const user = userEvent.setup();
    await user.click(openPreview());

    expect(screen.getByRole('dialog', { name: /editor\.photo\.preview_title/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /common\.edit/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /common\.delete/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /editor\.photo\.replace_btn/i })).toBeTruthy();
  });

  it('closes the preview when replace is chosen', async () => {
    const user = userEvent.setup();
    await user.click(openPreview());
    await user.click(screen.getByRole('button', { name: /editor\.photo\.replace_btn/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
