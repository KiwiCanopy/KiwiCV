import { Input } from '@/components/ui/Input';
import type { ActiveFilter, DateRange } from '@/features/cv-library/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

interface LibraryFilterPanelProps {
  id: string;
  activeFilters: Set<ActiveFilter>;
  toggleFilter: (filter: ActiveFilter) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  positionQuery: string;
  setPositionQuery: (value: string) => void;
  companyQuery: string;
  setCompanyQuery: (value: string) => void;
  availableThemes: string[];
  selectedThemes: string[];
  setSelectedThemes: (themes: string[]) => void;
}

/**
 * The four optional narrowings, each behind its own switch so an unused one
 * costs no vertical space and — unlike the modal — none of them is on by
 * default.
 */
export function LibraryFilterPanel({
  id,
  activeFilters,
  toggleFilter,
  dateRange,
  setDateRange,
  positionQuery,
  setPositionQuery,
  companyQuery,
  setCompanyQuery,
  availableThemes,
  selectedThemes,
  setSelectedThemes,
}: LibraryFilterPanelProps) {
  const { t } = useTranslation();

  const filterToggle = (filter: ActiveFilter, label: string) => (
    <button
      type="button"
      aria-pressed={activeFilters.has(filter)}
      onClick={() => toggleFilter(filter)}
      className={cn(
        'border-input inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition-colors',
        activeFilters.has(filter)
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-secondary',
      )}
    >
      {label}
    </button>
  );

  return (
    <div id={id} className="border-border bg-card mt-3 rounded-xl border p-4">
      <div role="group" aria-label={t('cvs.filters')} className="flex flex-wrap items-center gap-2">
        {filterToggle('calendar', t('cvs.filter_date'))}
        {filterToggle('position', t('cvs.filter_position'))}
        {filterToggle('company', t('cvs.filter_company'))}
        {availableThemes.length > 0 && filterToggle('theme', t('design.template'))}
      </div>

      {activeFilters.has('calendar') && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            type="date"
            label={t('common.date.from')}
            value={dateRange.start}
            onChange={(event) => setDateRange({ ...dateRange, start: event.target.value })}
          />
          <Input
            type="date"
            label={t('common.date.to')}
            value={dateRange.end}
            onChange={(event) => setDateRange({ ...dateRange, end: event.target.value })}
          />
        </div>
      )}

      {activeFilters.has('position') && (
        <div className="mt-4">
          <Input
            label={t('cvs.filter_position')}
            placeholder={t('cvs.filter_position_placeholder')}
            value={positionQuery}
            onChange={(event) => setPositionQuery(event.target.value)}
          />
        </div>
      )}

      {activeFilters.has('company') && (
        <div className="mt-4">
          <Input
            label={t('cvs.filter_company')}
            placeholder={t('cvs.filter_company_placeholder')}
            value={companyQuery}
            onChange={(event) => setCompanyQuery(event.target.value)}
          />
        </div>
      )}

      {activeFilters.has('theme') && availableThemes.length > 0 && (
        <div className="mt-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold">{t('design.template')}</p>
          <div className="flex flex-wrap gap-2">
            {availableThemes.map((theme) => {
              const isSelected = selectedThemes.includes(theme);
              return (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedThemes(
                      isSelected
                        ? selectedThemes.filter((candidate) => candidate !== theme)
                        : [...selectedThemes, theme],
                    )
                  }
                  className={cn(
                    'border-input inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold capitalize transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'text-muted-foreground hover:bg-secondary',
                  )}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
