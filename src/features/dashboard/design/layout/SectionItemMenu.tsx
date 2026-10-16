import { useState } from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { useTranslation } from '@/hooks/useTranslation';
import { MoreVertical, Pencil } from 'lucide-react';

interface SectionItemMenuProps {
  label: string;
  editTitle?: string;
  onEdit?: () => void;
  position?: number;
  total?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  /** Set when the row already shows the move buttons, so they are not offered twice. */
  hideOrderControls?: boolean;
}

/**
 * Overflow menu for the less-frequent section actions.
 *
 * Each section row previously carried up to seven controls, which wrapped into
 * a second line as soon as the Design panel narrowed. Edit and the movement
 * controls live here; the row keeps the drag handle, visibility, column swap,
 * and page break, whose on/off state has to stay visible. Every action stays named and pointer-operable,
 * which is what keeps the drag interaction from being the only way to reorder.
 */
export function SectionItemMenu({
  label,
  editTitle,
  onEdit,
  position,
  total,
  onMoveUp,
  onMoveDown,
  hideOrderControls = false,
}: SectionItemMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const canMove = !hideOrderControls && !!position && !!total && !!onMoveUp && !!onMoveDown;
  if (!onEdit && !canMove) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          label={t('design.more_actions_named', { name: label })}
          variant="quiet"
          className="text-muted-foreground hover:text-primary-strong"
        >
          <MoreVertical size={14} aria-hidden="true" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <div className="flex flex-col">
          {onEdit && (
            <Button
              variant="quiet"
              size="sm"
              className="w-full justify-start"
              aria-label={t('common.edit_named', { name: label })}
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {editTitle || t('common.edit')}
            </Button>
          )}
          {canMove && (
            <ItemOrderControls
              variant="menu"
              itemLabel={label}
              position={position!}
              total={total!}
              onMoveUp={onMoveUp!}
              onMoveDown={onMoveDown!}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
