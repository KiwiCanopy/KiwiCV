// @vitest-environment jsdom
import { useState } from 'react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PhotoEditor } from '@/components/ui/PhotoEditor';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/image-cropper', () => ({
  ImageCropper: () => null,
}));

/**
 * The photo delete raises a confirm from a control inside the preview dialog,
 * and the confirmed action closes **both** surfaces.
 *
 * ⚠️ No `restoreFocusTo` anywhere in this flow, deliberately. The preview's own
 * opener — the photo tile — survives the delete, so `DialogFrame`'s first rung
 * answers it. What the tile once could not do is take focus at all: it was
 * a `div` with an `onClick`, so this flow had no keyboard entry point and no
 * anchor. That is what the first test below pins.
 */
afterEach(() => {
  useConfirmStore.getState().close();
  vi.restoreAllMocks();
});

const IMG = 'data:image/png;base64,AAAA';

/**
 * `BasicsForm`'s wiring: the photo lives in the form above, so a delete only
 * lands once the parent re-renders without it — which is what closes the
 * preview. `ConfirmModal` is a store singleton mounted by the layout.
 */
function PhotoField({ onUpdate }: { onUpdate?: (data: { image?: string }) => void }) {
  const [image, setImage] = useState<string>(IMG);
  return (
    <>
      <PhotoEditor
        image={image}
        onUpdate={(data) => {
          setImage(data.image ?? '');
          onUpdate?.(data);
        }}
      />
      <ConfirmModal />
    </>
  );
}

const photoTrigger = () => screen.getByRole('button', { name: 'editor.photo.edit_title' });

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

describe('focus around the photo delete', () => {
  it('exposes the photo tile as a control a keyboard can reach', async () => {
    const user = userEvent.setup();
    render(<PhotoField />);

    // A `div` with an `onClick` has no role, is not tabbable, and does not fire
    // on Enter — the whole flow was unreachable without a pointer.
    await pressWithKeyboard(user, photoTrigger());
    expect(await screen.findByRole('dialog')).toBeTruthy();
  });

  it('returns focus to the photo tile once a confirmed delete closes both dialogs', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<PhotoField onUpdate={onUpdate} />);

    await pressWithKeyboard(user, photoTrigger());
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.delete' }));
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.confirm' }));

    expect(onUpdate).toHaveBeenCalledWith({ image: '', shape: undefined });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'editor.photo.upload_title' }),
      );
    });

    // The preview's img must never be handed the cleared value — asserted
    // as "nothing logged", so a reworded React warning cannot pass vacuously.
    expect(consoleError).not.toHaveBeenCalled();
  });

  /** Cancelling must return the user to the button they pressed, as everywhere. */
  it('returns to the Delete control when the delete is cancelled', async () => {
    const user = userEvent.setup();
    render(<PhotoField />);

    await pressWithKeyboard(user, photoTrigger());
    const pressed = await screen.findByRole('button', { name: 'common.delete' });
    await pressWithKeyboard(user, pressed);
    await pressWithKeyboard(user, await screen.findByRole('button', { name: 'common.cancel' }));

    await waitFor(() => {
      expect(document.activeElement).toBe(pressed);
    });
  });
});
