// @vitest-environment jsdom
import { useState } from 'react';

import { LegalCheckbox } from '@/components/auth/LegalCheckbox';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

function Harness({ onChange = () => {} }: { onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <LegalCheckbox
      id="accept-terms"
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        onChange(next);
      }}
      label="I accept the"
      linkText="Terms of Service"
      linkUrl="/en/terms?tab=terms"
    />
  );
}

describe('LegalCheckbox', () => {
  it('names the control with the full sentence, link text included', () => {
    render(<Harness />);
    expect(screen.getByRole('checkbox', { name: 'I accept the Terms of Service' })).toBeTruthy();
  });

  it('toggles consent when the label text is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByText('I accept the'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('does not toggle consent when the policy link is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    // The whole point: reading the terms must not accept them. The link is a
    // sibling of the label, so its click never reaches the checkbox.
    await user.click(screen.getByRole('link', { name: 'Terms of Service' }));
    expect(onChange).not.toHaveBeenCalled();
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Harness />);
    expect((await axe(container)).violations).toEqual([]);
  });
});

// German needs the policy link mid-sentence, expressed with a {link} placeholder.
function PlaceholderHarness({ onChange = () => {} }: { onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <LegalCheckbox
      id="accept-privacy"
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        onChange(next);
      }}
      label="Ich habe die {link} gelesen und stimme ihr zu"
      linkText="Datenschutzerklärung"
      linkUrl="/de/privacy?tab=privacy"
    />
  );
}

describe('LegalCheckbox with a {link} placeholder', () => {
  it('names the control with the link substituted in place, not appended', () => {
    render(<PlaceholderHarness />);
    expect(
      screen.getByRole('checkbox', {
        name: 'Ich habe die Datenschutzerklärung gelesen und stimme ihr zu',
      }),
    ).toBeTruthy();
  });

  it('toggles consent from the text around the link but not from the link', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PlaceholderHarness onChange={onChange} />);

    await user.click(screen.getByText(/gelesen und stimme ihr zu/));
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByRole('link', { name: 'Datenschutzerklärung' }));
    // The link click must not have toggled the box back off.
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PlaceholderHarness />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('interleaves every placeholder without dropping text or leaking the token', () => {
    render(
      <LegalCheckbox
        id="multi"
        checked={false}
        onChange={() => {}}
        label="Read {link} and {link} then agree"
        linkText="Policy"
        linkUrl="/x"
      />,
    );
    // Both occurrences become links; no trailing "then agree" is dropped and no
    // raw {link} leaks into the accessible name.
    expect(screen.getAllByRole('link', { name: 'Policy' })).toHaveLength(2);
    expect(
      screen.getByRole('checkbox', { name: 'Read Policy and Policy then agree' }),
    ).toBeTruthy();
  });
});
