import { useRef, useState } from 'react';

import { Disclosure } from '@/components/ui/Disclosure';
import { StatePanel } from '@/components/ui/StatePanel';
import { PassthroughBlockItem } from '@/features/raw-json/PassthroughBlockItem';
import { usePassthroughPanel } from '@/features/raw-json/usePassthroughPanel';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';

/**
 * The blocks an import kept in `ResumeData.passthrough`, each viewable and
 * removable. Collapsed by default and absent while there are none
 * (owner, 2026-10-05); once a block was removed it stays to report that.
 */
export const PassthroughPanel = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { blocks, lastRemoved, remove } = usePassthroughPanel(containerRef);

  if (blocks.length === 0 && !lastRemoved) return null;

  return (
    <div ref={containerRef} className="border-border bg-card mb-4 shrink-0 rounded-lg border">
      <Disclosure
        open={open}
        onOpenChange={setOpen}
        triggerClassName="hover:bg-muted flex items-center gap-2 rounded-lg px-3"
        trigger={
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <ChevronRight
              className={cn(
                'text-muted-foreground h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
                open && 'rotate-90',
              )}
              aria-hidden="true"
            />
            <span className="text-foreground min-w-0 truncate text-sm font-semibold">
              {t('raw_json.passthrough.title')}
            </span>
            <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 text-xs font-semibold tabular-nums">
              {blocks.length}
            </span>
          </span>
        }
        panelClassName="custom-scrollbar max-h-[40vh] overflow-y-auto px-3 pb-3"
      >
        <p className="text-muted-foreground mb-2 px-1 text-xs">{t('raw_json.passthrough.desc')}</p>
        {lastRemoved && (
          <StatePanel
            variant="success"
            title={t('raw_json.passthrough.removed_title', { name: lastRemoved })}
            description={t('raw_json.passthrough.removed_desc')}
            className="mb-2 p-3"
          />
        )}
        {blocks.length > 0 && (
          <ul className="p-1">
            {blocks.map((block, index) => (
              <PassthroughBlockItem
                key={block.key}
                block={block}
                onRemove={() => void remove(block.key, index)}
              />
            ))}
          </ul>
        )}
      </Disclosure>
    </div>
  );
};
