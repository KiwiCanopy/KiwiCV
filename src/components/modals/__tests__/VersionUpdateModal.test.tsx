// @vitest-environment jsdom
import { VersionUpdateModal } from '@/components/modals/VersionUpdateModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Reassigned per test so a case can supply real changelog translations; the
// default keeps every version empty.
let tObjectImpl: (key: string) => unknown = () => ({});

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key, tObject: (key: string) => tObjectImpl(key) }),
}));

beforeEach(() => {
  tObjectImpl = () => ({});
});

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  // `useLanguage` reads the locale from the pathname now, not a `:lang` param.
  useLocation: () => ({ pathname: '/' }),
}));

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    version: '9.9.9',
    missedVersions: [],
    ...overrides,
  };
  render(<VersionUpdateModal {...props} />);
  return props;
}

describe('VersionUpdateModal', () => {
  it('names the dialog by its update hero title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /updates\.title_hero/i })).toBeTruthy();
  });

  it('stays closed when not open', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes from the frame close button', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('button', { name: /common\.close_dialog/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('routes to the full changelog and closes', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('button', { name: /updates\.view_changelog/i }));
    expect(props.onClose).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/extras?tab=changelog&v=9.9.9');
  });

  // 3.3.0 is the real changelog entry carrying the `landing` and `blog`
  // highlights. Using it rather than a fixture keeps the test honest about the
  // shape `tObject` actually returns.
  describe('with a version that has highlights and changelog lines', () => {
    beforeEach(() => {
      tObjectImpl = () => ({
        _highlights: {
          landing: { badge: 'Landing', title: 'Landing', content: 'A new landing page' },
          blog: { badge: 'Blog', title: 'Blog', content: 'A new blog' },
        },
        feat_one: 'First feature',
        feat_two: 'Second feature',
        feat_three: 'Third feature',
        fix_one: 'First fix',
        fix_two: 'Second fix',
        fix_three: 'Third fix',
        fix_four: 'Fourth fix',
      });
    });

    it('renders a card per highlight', () => {
      renderModal({ version: '3.3.0' });
      expect(screen.getByText('Landing')).toBeTruthy();
      expect(screen.getByText('Blog')).toBeTruthy();
    });

    it('spends one five-line budget across every type group, not five per group', () => {
      renderModal({ version: '3.3.0' });

      // feat comes first in TYPE_ORDER and takes three of the five slots, so
      // fix gets the remaining two and its last two lines never render.
      for (const shown of ['First feature', 'Second feature', 'Third feature']) {
        expect(screen.getByText(shown)).toBeTruthy();
      }
      expect(screen.getByText('First fix')).toBeTruthy();
      expect(screen.getByText('Second fix')).toBeTruthy();
      expect(screen.queryByText('Third fix')).toBeNull();
      expect(screen.queryByText('Fourth fix')).toBeNull();
    });

    it('offers the full changelog once the budget truncates the list', async () => {
      const user = userEvent.setup();
      const props = renderModal({ version: '3.3.0' });

      await user.click(screen.getByRole('button', { name: /updates\.more_highlights_desc/i }));
      expect(props.onClose).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith('/extras?tab=changelog&v=3.3.0');
    });
  });
});
