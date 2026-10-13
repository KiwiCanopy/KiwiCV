// @vitest-environment jsdom
import { useState } from 'react';

import { AIImportStyleStep } from '@/components/modals/ai/import/AIImportStyleStep';
import { type AIImportContext } from '@/components/modals/ai/import/useAIImport';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));

/**
 * The step reads its state from `useAIImport`, which is store- and auth-backed.
 * The two language fields are the only state this test exercises, so it holds
 * them locally and stubs the rest of the context.
 */
function Fixture() {
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [sourceLanguageOther, setSourceLanguageOther] = useState('');

  const context = {
    activeStyle: null,
    fileName: 'lebenslauf.pdf',
    handleStyleSelect: vi.fn(),
    resetState: vi.fn(),
    setSourceLanguage,
    setSourceLanguageOther,
    sourceLanguage,
    sourceLanguageOther,
  } as unknown as AIImportContext;

  return <AIImportStyleStep context={context} onBack={vi.fn()} />;
}

const importAction = () => screen.getByRole('button', { name: /Make it Professional/ });

describe('AIImportStyleStep', () => {
  it('unlocks the import once a language is chosen, or named', async () => {
    const user = userEvent.setup();
    const { container } = render(<Fixture />);

    expect(importAction().hasAttribute('disabled')).toBe(true);

    // A supported locale is enough on its own.
    await user.selectOptions(screen.getByRole('combobox', { name: /Document Language/ }), 'de');
    expect(screen.queryByRole('textbox', { name: /Language of your CV/ })).toBeNull();
    expect(importAction().hasAttribute('disabled')).toBe(false);

    // "Other" re-locks it until the language is actually named.
    await user.selectOptions(screen.getByRole('combobox', { name: /Document Language/ }), 'other');
    expect(importAction().hasAttribute('disabled')).toBe(true);

    const nameField = screen.getByRole('textbox', { name: /Language of your CV/ });
    await user.type(nameField, 'Danish');
    expect(importAction().hasAttribute('disabled')).toBe(false);

    // Whitespace alone is not a language.
    await user.clear(nameField);
    await user.type(nameField, '   ');
    expect(importAction().hasAttribute('disabled')).toBe(true);

    expect((await axe(container)).violations).toEqual([]);
  });
});
