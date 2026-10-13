import { Button } from '@/components/ui/Button';
import type { useCvLibraryFilters } from '@/features/cv-library/useCvLibraryFilters';
import { useTranslation } from '@/hooks/useTranslation';
import { X } from 'lucide-react';

interface ActiveFilterChipsProps {
  filters: ReturnType<typeof useCvLibraryFilters>;
}

interface Chip {
  key: string;
  label: string;
  clear: () => void;
}

/**
 * Every narrowing currently in force, each removable on its own.
 *
 * Without it a scope chip, a language dropdown and four collapsed filters can
 * all be hiding rows at once with nothing on screen saying so — which is how
 * the modal's default calendar window managed to look like an empty account.
 */
export function ActiveFilterChips({ filters }: ActiveFilterChipsProps) {
  const { t } = useTranslation();

  const chips: Chip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: 'search',
      label: t('cvs.chip_search', { value: filters.search.trim() }),
      clear: () => filters.setSearch(''),
    });
  }

  if (filters.scope !== 'all') {
    chips.push({
      key: 'scope',
      label: t(`sync.providers.${filters.scope}`),
      clear: () => filters.setScope('all'),
    });
  }

  if (filters.localeFilter !== 'all') {
    chips.push({
      key: 'locale',
      label: t(`languages.${filters.localeFilter}`),
      clear: () => filters.setLocaleFilter('all'),
    });
  }

  if (filters.activeFilters.has('calendar') && (filters.dateRange.start || filters.dateRange.end)) {
    chips.push({
      key: 'calendar',
      label: t('cvs.chip_date', {
        start: filters.dateRange.start || '…',
        end: filters.dateRange.end || '…',
      }),
      clear: () => filters.toggleFilter('calendar'),
    });
  }

  if (filters.activeFilters.has('position') && filters.positionQuery.trim()) {
    chips.push({
      key: 'position',
      label: t('cvs.chip_position', { value: filters.positionQuery.trim() }),
      clear: () => filters.toggleFilter('position'),
    });
  }

  if (filters.activeFilters.has('company') && filters.companyQuery.trim()) {
    chips.push({
      key: 'company',
      label: t('cvs.chip_company', { value: filters.companyQuery.trim() }),
      clear: () => filters.toggleFilter('company'),
    });
  }

  if (filters.activeFilters.has('theme') && filters.selectedThemes.length > 0) {
    chips.push({
      key: 'theme',
      label: t('cvs.chip_theme', { value: filters.selectedThemes.join(', ') }),
      clear: () => filters.toggleFilter('theme'),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          aria-label={t('cvs.chip_remove', { name: chip.label })}
          className="border-input bg-secondary text-foreground hover:bg-muted inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors"
        >
          <span className="truncate">{chip.label}</span>
          <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
      ))}
      <Button variant="quiet" size="sm" onClick={filters.resetAll}>
        {t('sync.reset_filters')}
      </Button>
    </div>
  );
}
