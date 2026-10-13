// @vitest-environment jsdom
import { LanguageOnboardingModal } from '@/components/modals/LanguageOnboardingModal';
import { locales } from '@/locales';
import { useUIStore } from '@/store/ui/useUIStore';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The onboarding copy resolves against the previewed language with `t()`'s own
 * rules, English fallback included, rather than a walk of its own that showed
 * the bare key for an empty value.
 */
const onboarding = locales.de.welcome.onboarding_lang as { title: string };
const shipped = onboarding.title;

afterEach(() => {
  onboarding.title = shipped;
  cleanup();
});

describe('LanguageOnboardingModal copy', () => {
  it('falls back to English for an empty value in the previewed language', () => {
    onboarding.title = '';
    useUIStore.setState({ appLanguage: 'de', firstTimeLanguageSelected: false });
    render(<LanguageOnboardingModal />);

    expect(
      screen.getByRole('heading', { name: locales.en.welcome.onboarding_lang.title }),
    ).toBeTruthy();
  });
});
