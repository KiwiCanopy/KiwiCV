// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { FieldLabel } from '@/components/ui/FieldLabel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TagField } from '@/components/ui/TagField';
import { TextArea } from '@/components/ui/TextArea';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

// `violations` alone hides rules that return `incomplete` — form-field-multiple-labels
// is one, and it is exactly the rule this structure needs watched. `color-contrast`
// is always incomplete here because jsdom computes no colours, so it is excluded
// rather than allowed to mask the rest.
const JSDOM_BLIND_RULES = new Set(['color-contrast']);

async function expectNoAxeFindings(container: HTMLElement) {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
  expect(results.incomplete.map((f) => f.id).filter((id) => !JSDOM_BLIND_RULES.has(id))).toEqual(
    [],
  );
}

// These cases render each primitive with every optional prop that changes its
// DOM. The nested-button defect survived four phases because the shared test
// file never passed `infoHint`, so the InfoBox was never in the tree at all.
describe('FieldLabel', () => {
  it('renders the help trigger as a sibling of the label, not a child', async () => {
    const { container } = render(
      <FieldLabel htmlFor="field" infoHint="Some help">
        Website
      </FieldLabel>,
    );

    const label = container.querySelector('label');
    const trigger = screen.getByRole('button');

    expect(label?.querySelector('button')).toBeNull();
    expect(label?.contains(trigger)).toBe(false);
    await expectNoAxeFindings(container);
  });

  it('renders the layout badge as a sibling of the label, not a child', async () => {
    const { container } = render(
      <MemoryRouter>
        <FieldLabel htmlFor="field" layoutHint="Main column only">
          Summary
        </FieldLabel>
      </MemoryRouter>,
    );

    const label = container.querySelector('label');

    expect(label?.querySelector('button')).toBeNull();
    expect(screen.getByRole('button', { name: 'main' })).toBeTruthy();
    await expectNoAxeFindings(container);
  });

  it('keeps the badge out of the control name', async () => {
    // The badge sets aria-label="main" for WCAG 2.5.3. While it sat inside the
    // <label>, that name was concatenated into the field's own name, so every
    // field with a layout hint was announced as "Website main".
    const { container } = render(
      <MemoryRouter>
        <Input
          label="Website"
          value=""
          onChange={vi.fn()}
          layoutHint="Main column only"
          infoHint="Where this renders"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('textbox', { name: 'Website' })).toBeTruthy();
    await expectNoAxeFindings(container);
  });

  it('associates the label with the control it names', () => {
    render(
      <FieldLabel htmlFor="chosen-id" infoHint="Some help">
        Website
      </FieldLabel>,
    );

    expect(screen.getByText('Website').getAttribute('for')).toBe('chosen-id');
  });

  it.each([
    ['Input', <Input key="i" label="Website" value="" onChange={vi.fn()} infoHint="Help" />],
    ['TextArea', <TextArea key="t" label="Summary" value="" onChange={vi.fn()} infoHint="Help" />],
    [
      'Select',
      <Select
        key="s"
        label="Level"
        value="a"
        onChange={vi.fn()}
        options={[{ value: 'a', label: 'A' }]}
        infoHint="Help"
      />,
    ],
    [
      'TagField',
      <TagField
        key="g"
        label="Keywords"
        singularLabel="Keyword"
        value={['one']}
        onChange={vi.fn()}
        infoHint="Help"
        layoutHint="Main column only"
      />,
    ],
  ])('keeps %s free of a button nested in its label', async (_name, element) => {
    const { container } = render(<MemoryRouter>{element}</MemoryRouter>);

    const labels = container.querySelectorAll('label');
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.querySelector('button')).toBeNull();
    }
    await expectNoAxeFindings(container);
  });
});
