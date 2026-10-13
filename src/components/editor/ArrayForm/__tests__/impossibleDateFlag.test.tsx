// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EducationForm } from '@/components/editor/EducationForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import {
  ISO_DATE_PATTERN,
  isExpressibleDate,
  isValidDate,
  normalizeDate,
} from '@/utils/normalizeDate';
import { isOngoingDateWord } from '@/utils/ongoingDate';
import { sanitizeResumeData } from '@/utils/validation';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * The editor flags a date `normalizeDate` cannot express, while the sanitizer keeps it
 * as typed.
 */
const IMPOSSIBLE = ['31.02.2019', '13/2019', '13.13.2019'];
const EXPRESSIBLE = ['05.06.19', '12/25/2019', '2019-03', 'Present'];

afterEach(() => {
  cleanup();
  useResumeStore.setState((state) => ({ resume: { ...state.resume, education: [] } }));
});

const renderEntryWithStartDate = (startDate: string) => {
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      education: [
        { _vId: 'entry', institution: 'Uni', startDate } as ResumeData['education'][number],
      ],
    },
  }));
  render(
    <MemoryRouter>
      <EducationForm defaultCollapsed={false} />
    </MemoryRouter>,
  );
};

describe('the entry error indicator', () => {
  it.each(IMPOSSIBLE)('shows for %s', (startDate) => {
    renderEntryWithStartDate(startDate);
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it.each(EXPRESSIBLE)('does not show for %s', (startDate) => {
    renderEntryWithStartDate(startDate);
    expect(screen.getByText('Uni')).toBeTruthy();
    expect(screen.queryByText('Error')).toBeNull();
  });
});

describe('isExpressibleDate', () => {
  it.each([...IMPOSSIBLE, '29.02.2019', '02/31/2019', '2019-13', '2019-02-30', 'March 2019'])(
    'rejects %s',
    (value) => expect(isExpressibleDate(value)).toBe(false),
  );

  it.each([...EXPRESSIBLE, '', '  ', '2019', '2020-02-29', '29.02.2020', '03/2019', 'now'])(
    'accepts %j',
    (value) => expect(isExpressibleDate(value)).toBe(true),
  );
});

describe('isExpressibleDate is derived from isValidDate and normalizeDate', () => {
  const INPUTS = [
    ...IMPOSSIBLE,
    ...EXPRESSIBLE,
    ...['2019', '2019-03', '2019-03-15', '2019-00', '2019-13', '2019-02-29', '2020-02-29'],
    ...['03/2019', '3.2019', '12-2019', '00/2019', '13/2019', '1/2019'],
    ...['15.03.2019', '1/2/19', '31/12/99', '31.04.2019', '29.02.2019', '00.01.2019', '1.1.123'],
    ...['12/25/2019', '02/31/2019', '13/13/2019'],
    ...['March 2019', 'Mar 15, 2019', '15 March 2019', 'Sept. 2019'],
    ...['', '   ', 'Present', 'present', 'now', 'Heute'],
    ...['garbage', '20190', '2019/03', '2019-3-1', '2019-03-01T00:00:00Z', '42', '--', 'Q3 2019'],
  ];

  it.each(INPUTS)(
    '%j: expressible implies valid, and normalizes to ISO or stays blank/ongoing',
    (value) => {
      if (!isExpressibleDate(value)) return;
      expect(isValidDate(value)).toBe(true);
      const normalized = normalizeDate(value);
      const blankOrOngoing = !value.trim() || isOngoingDateWord(value.trim());
      expect(blankOrOngoing || ISO_DATE_PATTERN.test(normalized)).toBe(true);
    },
  );

  it('is not vacuous: the list holds both verdicts', () => {
    const accepted = INPUTS.filter((value) => isExpressibleDate(value));
    expect(accepted.length).toBeGreaterThan(10);
    expect(INPUTS.length - accepted.length).toBeGreaterThan(10);
  });
});

describe('the sanitizer keeps every one of them as typed', () => {
  it.each([...IMPOSSIBLE, ...EXPRESSIBLE])('%s', (value) => {
    expect(isValidDate(value)).toBe(true);
    const { sanitized, warnings } = sanitizeResumeData({
      education: [{ institution: 'Uni', startDate: value }],
    });
    expect(sanitized.education[0].startDate).toBe(value);
    expect(warnings).toEqual([]);
  });
});
