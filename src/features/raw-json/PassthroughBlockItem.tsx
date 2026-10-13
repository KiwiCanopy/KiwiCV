import { useState } from 'react';

import { Disclosure } from '@/components/ui/Disclosure';
import { IconButton } from '@/components/ui/IconButton';
import type { PassthroughBlock } from '@/features/raw-json/types';
import { PASSTHROUGH_REMOVE_ATTR } from '@/features/raw-json/usePassthroughPanel';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { ChevronRight, Trash2 } from 'lucide-react';

interface PassthroughBlockItemProps {
  block: PassthroughBlock;
  onRemove: () => void;
}

/** Kilobytes to one decimal, as the viewer's size badge counts them, in the UI locale. */
const formatKilobytes = (bytes: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilobyte',
    unitDisplay: 'short',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.max(bytes / 1024, 0.1));

export const PassthroughBlockItem = ({ block, onRemove }: PassthroughBlockItemProps) => {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <li className="border-border border-b last:border-b-0">
      <Disclosure
        open={open}
        onOpenChange={setOpen}
        headerClassName="gap-1 pr-1"
        triggerClassName="hover:bg-muted flex items-center gap-2 rounded-md px-2"
        trigger={
          <>
            <ChevronRight
              className={cn(
                'text-muted-foreground h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
                open && 'rotate-90',
              )}
              aria-hidden="true"
            />
            <span className="text-foreground min-w-0 flex-1 truncate font-mono text-sm">
              {block.key}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatKilobytes(block.bytes, language)}
            </span>
          </>
        }
        actions={
          <IconButton
            variant="quiet"
            label={t('common.remove_named', { name: block.key })}
            onClick={onRemove}
            {...{ [PASSTHROUGH_REMOVE_ATTR]: '' }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        }
        panelClassName="px-2 pb-3"
      >
        {open && (
          // Focusable so a keyboard can scroll a block taller than the box.
          <pre
            tabIndex={0}
            aria-label={block.key}
            className="border-border bg-muted text-foreground custom-scrollbar max-h-64 overflow-auto rounded-md border p-3 font-mono text-xs whitespace-pre"
          >
            {JSON.stringify(block.value, null, 2)}
          </pre>
        )}
      </Disclosure>
    </li>
  );
};
