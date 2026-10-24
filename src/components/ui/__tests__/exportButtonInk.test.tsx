// @vitest-environment jsdom
import { ExportButton } from '@/components/ui/ExportButton';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ hasDrivePermission: false }) }));
vi.mock('@/hooks/useSyncWorkflow', () => ({
  useSyncWorkflow: () => ({
    syncStatus: 'idle',
    isAlreadySynced: false,
    errorMessage: '',
    setActiveModal: () => {},
    handleTrigger: () => {},
  }),
}));

// Lime is the AI run button's; a lime Export one row above it was pressed for it (#27).
describe('ExportButton', () => {
  it('is ink, not the lime primary', () => {
    render(<ExportButton variant="full" mode="push" id="export" />);
    const button = document.getElementById('export')!;
    expect(screen.getByRole('button')).toBe(button);
    expect(button.className).toContain('bg-foreground');
    expect(button.className).not.toContain('bg-primary');
  });
});
