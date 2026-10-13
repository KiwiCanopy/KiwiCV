import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LibraryFilterPanel } from '@/features/cv-library/LibraryFilterPanel';
import { ScopeChips } from '@/features/cv-library/ScopeChips';
import type { useCvLibraryFilters } from '@/features/cv-library/useCvLibraryFilters';
import { useTranslation } from '@/hooks/useTranslation';
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

interface LibraryToolbarProps {
  filters: ReturnType<typeof useCvLibraryFilters>;
  onRefresh: () => void;
  isBusy?: boolean;
}

export function LibraryToolbar({ filters, onRefresh, isBusy }: LibraryToolbarProps) {
  const { t } = useTranslation();
  const panelId = useId();

  const localeOptions = [
    { value: 'all', label: t('cvs.all_languages') },
    ...filters.availableLocales.map((locale) => ({
      value: locale,
      label: t(`languages.${locale}`),
    })),
  ];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <Input
            type="search"
            label={t('cvs.search_label')}
            placeholder={t('cvs.search_placeholder')}
            value={filters.search}
            disabled={isBusy}
            onChange={(event) => filters.setSearch(event.target.value)}
            suffix={<Search className="h-4 w-4" aria-hidden="true" />}
          />
        </div>

        <div className="basis-48">
          <Select
            label={t('cvs.language_label')}
            options={localeOptions}
            value={filters.localeFilter}
            disabled={isBusy}
            onChange={(event) => filters.setLocaleFilter(event.target.value)}
          />
        </div>

        <Button
          variant="secondary"
          disabled={isBusy}
          aria-expanded={filters.showFilterBar}
          aria-controls={panelId}
          onClick={() => filters.setShowFilterBar(!filters.showFilterBar)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
          {filters.activeFilters.size > 0
            ? t('cvs.filters_active', { n: filters.activeFilters.size })
            : t('cvs.filters')}
        </Button>

        <Button variant="quiet" onClick={onRefresh} disabled={isBusy}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('cvs.refresh')}
        </Button>
      </div>

      {filters.showFilterBar && (
        <LibraryFilterPanel
          id={panelId}
          activeFilters={filters.activeFilters}
          toggleFilter={filters.toggleFilter}
          dateRange={filters.dateRange}
          setDateRange={filters.setDateRange}
          positionQuery={filters.positionQuery}
          setPositionQuery={filters.setPositionQuery}
          companyQuery={filters.companyQuery}
          setCompanyQuery={filters.setCompanyQuery}
          availableThemes={filters.availableThemes}
          selectedThemes={filters.selectedThemes}
          setSelectedThemes={filters.setSelectedThemes}
        />
      )}

      {/* Renders nothing below two connected providers, and owns its own top
          margin so the row leaves no gap behind when it does. It stays mounted
          either way: hidden is also when it resets an unreachable scope. */}
      <ScopeChips
        scope={filters.scope}
        counts={filters.scopeCounts}
        onChange={filters.setScope}
        disabled={isBusy}
      />
    </div>
  );
}
