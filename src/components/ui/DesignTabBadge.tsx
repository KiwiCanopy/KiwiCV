import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { type DesignGroupId, applyDesignJump } from '@/utils/designJump';
import { ChevronRight } from 'lucide-react';

interface DesignTabBadgeProps {
  /** The text shown inside the badge */
  label: string;
  /** The Design-tab group the target lives in; opened before the scroll */
  group: DesignGroupId;
  /** The element ID to scroll to once the group is open */
  targetId: string;
  className?: string;
}

export const DesignTabBadge: React.FC<DesignTabBadgeProps> = ({
  label,
  group,
  targetId,
  className,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Hand the scroll off to DesignTab: the target section may be a collapsed
    // disclosure, which has no layout box to scroll to until it is opened.
    const nextParams = new URLSearchParams(searchParams);
    applyDesignJump(nextParams, group, targetId);
    setSearchParams(nextParams);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'bg-primary/10 text-primary-strong border-primary-strong/20 focus-visible:ring-primary-strong flex cursor-pointer items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold transition-all hover:-translate-y-[0.5px] focus-visible:ring-2 focus-visible:outline-none active:translate-y-[0.5px]',
        className,
      )}
    >
      {label}
      <ChevronRight className="h-2.5 w-2.5 opacity-70" strokeWidth={5} />
    </button>
  );
};
