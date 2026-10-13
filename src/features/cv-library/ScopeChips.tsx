import { useEffect } from 'react';

import type { LibraryScope, ScopeCounts } from '@/features/cv-library/types';
import { type ProviderState } from '@/hooks/sync/providerState';
import { useProviderStates } from '@/hooks/sync/useProviderStates';
import { useTranslation } from '@/hooks/useTranslation';
import type { BackupSource } from '@/store/library/useCvLibraryStore';
import { cn } from '@/utils/cn';

interface ScopeChipsProps {
  scope: LibraryScope;
  counts: ScopeCounts;
  onChange: (scope: LibraryScope) => void;
  disabled?: boolean;
}

interface ScopeOption {
  scope: LibraryScope;
  /** A credential we hold but have not resolved yet: visible, not yet pressable. */
  isPending: boolean;
}

/**
 * `connected_disabled` counts as connected. It only means background sync is
 * switched off in Settings — the credentials exist and the provider's files are
 * still listable, so filtering by it is meaningful.
 */
function isConnected(state: ProviderState): boolean {
  return state === 'active' || state === 'connected_disabled';
}

function buildOptions(states: Record<BackupSource, ProviderState>): ScopeOption[] {
  const providers: ScopeOption[] = [];

  for (const source of ['github', 'google_drive'] as const) {
    const state = states[source];
    if (isConnected(state)) providers.push({ scope: source, isPending: false });
    // `checking` still counts toward the row: letting an unresolved handshake
    // collapse the row and pop it back mid-load is worse than one inert chip.
    else if (state === 'checking') providers.push({ scope: source, isPending: true });
  }

  // A narrowing control with one destination narrows nothing: `All` and the
  // single connected provider always select the same set, and every row already
  // shows its provider icon. Below two providers the row is pure noise.
  if (providers.length < 2) return [];

  return [{ scope: 'all', isPending: false }, ...providers];
}

/**
 * Provider narrowing, built from real connection state rather than from the
 * list of providers the app supports — a GitHub chip on an account that never
 * connected GitHub is a filter that can only ever return nothing.
 *
 * The counts come from the unscoped result, so the chip you are about to press
 * always tells you what pressing it will show.
 */
export function ScopeChips({ scope, counts, onChange, disabled }: ScopeChipsProps) {
  const { t } = useTranslation();
  const providerStates = useProviderStates();

  const options = buildOptions({
    github: providerStates.github,
    google_drive: providerStates.googleDrive,
  });

  // A scope nobody can reach is a filter nobody can clear — including on the
  // path where the whole row is hidden, which is how a `?source=github` link
  // could otherwise empty a Drive-only library with no visible cause.
  const isScopeReachable = scope === 'all' || options.some((option) => option.scope === scope);
  useEffect(() => {
    if (!isScopeReachable) onChange('all');
  }, [isScopeReachable, onChange]);

  if (options.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={t('cvs.scope_group')}
      className="mt-3 flex flex-wrap items-center gap-2"
    >
      {options.map(({ scope: candidate, isPending }) => {
        const isActive = scope === candidate;
        const label = candidate === 'all' ? t('cvs.scope_all') : t(`sync.providers.${candidate}`);

        return (
          <button
            key={candidate}
            type="button"
            disabled={disabled || isPending}
            aria-pressed={isActive}
            onClick={() => onChange(candidate)}
            className={cn(
              'border-input inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-50',
              isActive
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {label}
            <span className={cn('tabular-nums', !isActive && 'text-muted-foreground/70')}>
              {counts[candidate]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
