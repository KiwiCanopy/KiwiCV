// @vitest-environment jsdom
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ExportNameFields } from '@/components/modals/export/ExportNameFields';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, uiLanguage: 'en' }),
}));

function Harness() {
  const [postingUrl, setPostingUrl] = useState('');
  return (
    <MemoryRouter>
      <ExportNameFields
        base="cv"
        company=""
        position=""
        postingUrl={postingUrl}
        showPostingUrl={true}
        preview="cv"
        suggestedBase="cv"
        disabled={false}
        onBaseChange={vi.fn()}
        onCompanyChange={vi.fn()}
        onPositionChange={vi.fn()}
        onPostingUrlChange={setPostingUrl}
      />
    </MemoryRouter>
  );
}

describe('ExportNameFields', () => {
  // #62: the warning appears on blur, when focus has already left the field.
  it('announces an invalid posting link through a region mounted before the warning', () => {
    render(<Harness />);
    const region = screen.getByRole('status');
    expect(region.textContent).toBe('');

    const field = screen.getByLabelText('sync.export_modal_posting_label');
    fireEvent.change(field, { target: { value: 'not a url' } });
    fireEvent.blur(field);

    expect(screen.getByRole('status')).toBe(region);
    expect(region.textContent).toBe('sync.export_dialog.posting_invalid');
  });
});
