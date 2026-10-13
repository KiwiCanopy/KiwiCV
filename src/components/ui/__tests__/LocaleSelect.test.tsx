// @vitest-environment jsdom
import { useState } from 'react';

import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { type LocaleCode } from '@/locales/index';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

function Fixture() {
  const [locale, setLocale] = useState<LocaleCode>('en');
  return (
    <LocaleSelect
      label="Interface language"
      value={locale}
      onValueChange={(language) => language && setLocale(language)}
      localeCodes={['en', 'de']}
    />
  );
}

function ExtraOptionFixture() {
  const [value, setValue] = useState<LocaleCode | '' | 'other'>('en');
  return (
    <>
      <LocaleSelect<'other'>
        label="CV language"
        value={value}
        onValueChange={setValue}
        localeCodes={['en', 'de']}
        extraOptions={[{ value: 'other', label: 'Other language...' }]}
      />
      <output>{value}</output>
    </>
  );
}

describe('LocaleSelect', () => {
  it('uses locale codes and native names without flags', async () => {
    const user = userEvent.setup();
    const { container } = render(<Fixture />);
    const select = screen.getByRole('combobox', { name: 'Interface language' });

    expect(screen.getByRole('option', { name: 'EN — English' })).toBeTruthy();
    expect(container.textContent).not.toMatch(/🇬🇧|🇩🇪/);

    await user.selectOptions(select, 'de');
    expect((select as HTMLSelectElement).value).toBe('de');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('offers extra options after the locales and reports their value', async () => {
    const user = userEvent.setup();
    const { container } = render(<ExtraOptionFixture />);
    const select = screen.getByRole('combobox', { name: 'CV language' });

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['EN — English', 'DE — Deutsch', 'Other language...']);

    await user.selectOptions(select, 'other');
    expect(screen.getByText('other')).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });
});
