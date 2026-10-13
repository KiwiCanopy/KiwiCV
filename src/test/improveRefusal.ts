import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

/**
 * Shared by the Improve refusal suites. Each suite mocks `useAuth` as signed in
 * with a pass, so a live press reaches `openAIModal` rather than the sign-in wall.
 */
export const openAIModal = vi.fn();

export const seedWork = (work: ResumeData['work']) => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, work },
    ai: { ...state.ai, suggestions: {} },
    openAIModal,
  }));
};

export const job = {
  name: 'Acme',
  position: 'Engineer',
  url: '',
  startDate: '',
  endDate: '',
  summary: '',
  highlights: [],
} as unknown as ResumeData['work'][number];

export const improve = () => screen.getByRole('button', { name: /Optimize|Improve/i });

/** The refusal contract, shared by every site: present, described, inert. */
export const expectRefused = async (reason: RegExp) => {
  const button = improve();
  expect(button.hasAttribute('disabled')).toBe(false);
  expect(button.getAttribute('aria-disabled')).toBe('true');

  const describedBy = button.getAttribute('aria-describedby');
  expect(describedBy, 'the reason is not wired as a description').toBeTruthy();
  const tooltip = document.getElementById(describedBy!);
  expect(tooltip?.getAttribute('role')).toBe('tooltip');
  expect(tooltip?.textContent).toMatch(reason);
  // Portalled out of the row, so showing it cannot shift the header.
  expect(button.parentElement?.contains(tooltip!)).toBe(false);

  // Hidden until asked for, then shown on keyboard focus, gone on blur.
  expect(tooltip?.className).toContain('invisible');
  fireEvent.focus(button);
  expect(tooltip?.className).not.toContain('invisible');
  fireEvent.blur(button);
  expect(tooltip?.className).toContain('invisible');

  await userEvent.setup().click(button);
  expect(openAIModal).not.toHaveBeenCalled();
};

export const expectLive = async () => {
  const button = improve();
  expect(button.getAttribute('aria-disabled')).toBeNull();
  expect(button.getAttribute('aria-describedby')).toBeNull();
  await userEvent.setup().click(button);
  expect(openAIModal).toHaveBeenCalledOnce();
};
