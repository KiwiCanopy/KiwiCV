import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Plus } from 'lucide-react';

interface AddSectionRailRowProps {
  isCollapsed: boolean;
  onAdd: () => void;
}

/**
 * The custom-sections group's trailing row. Muted and badge-less: it is an
 * action, not a section, so it never takes the active marker either.
 */
export function AddSectionRailRow({ isCollapsed, onAdd }: AddSectionRailRowProps) {
  const { t } = useTranslation();
  const label = t('editor.custom_sections.add');

  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        title={isCollapsed ? label : undefined}
        className={cn(
          'group text-muted-foreground hover:text-foreground hover:bg-muted/60 flex min-h-11 w-full items-center rounded-xl text-left transition-colors duration-200',
          isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
        )}
      >
        <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
        {isCollapsed ? (
          <span className="sr-only">{label}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
        )}
      </button>
    </li>
  );
}
