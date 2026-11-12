// @vitest-environment jsdom
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { SignatureRow } from '@/features/signature/SignatureRow';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useSignatureStore } from '@/store/signature/useSignatureStore';
import { sanitizeForAI } from '@/utils/ai';
import { getFilteredResumeData, getPublicBackupData } from '@/utils/resume-export';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The signature is device-only (#103): every road the résumé takes off the
 * device must come out without it. Each road is fed from `ResumeData`, so the
 * test saves a signature through the real dialog and then reads each payload.
 */
const MARKER_NAME = 'Zyxwq Signaturetest';
const MARKER_IMAGE = 'data:image/png;base64,U0lHTkFUVVJFLU1BUktFUg==';

const initialResume = useResumeStore.getState();

afterEach(() => {
  useResumeStore.setState(initialResume, true);
  useSignatureStore.setState({ signature: null });
  localStorage.clear();
});

function everyOffDevicePayload(): Record<string, string> {
  const resume = useResumeStore.getState().resume;
  return {
    'resume store (Drive and GitHub sync source)': JSON.stringify(resume),
    'persisted resume-storage': localStorage.getItem('resume-storage') ?? '',
    'JSON export, standard': JSON.stringify(getFilteredResumeData(resume, 'standard')),
    'JSON export, reduced': JSON.stringify(getFilteredResumeData(resume, 'reduced')),
    'public GitHub backup': JSON.stringify(getPublicBackupData(resume)),
    'AI payload': JSON.stringify(sanitizeForAI(resume)),
  };
}

describe('the signature stays on the device', () => {
  it('a typed signature saved in the dialog reaches no résumé payload', async () => {
    const user = userEvent.setup();
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, name: 'Jane Doe' } },
    }));
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Add signature' }));
    const nameField = await screen.findByRole('textbox', { name: 'Name' });
    await user.clear(nameField);
    await user.type(nameField, MARKER_NAME);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(useSignatureStore.getState().signature).toMatchObject({
        kind: 'typed',
        text: MARKER_NAME,
      }),
    );
    // Not vacuous: the marker is on the device, under the signature's own key.
    expect(localStorage.getItem(BRAND_STORAGE_KEYS.signature)).toContain(MARKER_NAME);

    for (const [road, payload] of Object.entries(everyOffDevicePayload())) {
      expect(payload, road).not.toContain(MARKER_NAME);
    }
  });

  it('an image signature reaches no résumé payload', () => {
    useSignatureStore
      .getState()
      .setSignature({ kind: 'image', id: 'marker', dataUrl: MARKER_IMAGE, source: 'draw' });

    expect(localStorage.getItem(BRAND_STORAGE_KEYS.signature)).toContain(MARKER_IMAGE);
    for (const [road, payload] of Object.entries(everyOffDevicePayload())) {
      expect(payload, road).not.toContain(MARKER_IMAGE);
      expect(payload, road).not.toContain('U0lHTkFUVVJFLU1BUktFUg');
    }
  });

  it('Remove deletes it from the device', async () => {
    const user = userEvent.setup();
    useSignatureStore
      .getState()
      .setSignature({ kind: 'image', id: 'marker', dataUrl: MARKER_IMAGE, source: 'draw' });
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(useSignatureStore.getState().signature).toBeNull();
    expect(localStorage.getItem(BRAND_STORAGE_KEYS.signature) ?? '').not.toContain(MARKER_IMAGE);
    expect(screen.getByRole('button', { name: 'Add signature' })).toBeTruthy();
  });
});
