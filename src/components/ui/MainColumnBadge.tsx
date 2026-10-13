import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { InfoBox } from '@/components/ui/InfoBox';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { applyDesignJump } from '@/utils/designJump';
import { ArrowRightLeft, CircleQuestionMark } from 'lucide-react';

interface MainColumnBadgeProps {
  layoutHint: string;
}

export const MainColumnBadge: React.FC<MainColumnBadgeProps> = ({ layoutHint }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const goToDesignTab = (e: React.MouseEvent) => {
    e.preventDefault();
    // The section-order editor lives in the collapsed "layout" group, so let
    // DesignTab open it before scrolling rather than scrolling into a hidden box.
    const nextParams = new URLSearchParams(searchParams);
    applyDesignJump(nextParams, 'layout', 'section-order');
    setSearchParams(nextParams);
  };

  const badgeElement = (
    <span
      className={cn(
        'bg-primary/10 text-primary-strong border-primary-strong/20 flex cursor-help items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold transition-all hover:-translate-y-[0.5px] active:translate-y-[0.5px]',
      )}
    >
      <CircleQuestionMark className="h-2.5 w-2.5 opacity-60" strokeWidth={3} />
      main
    </span>
  );

  const layoutHintContent = (
    <div className="flex flex-col gap-1.5">
      <span>{layoutHint}</span>
      <button
        type="button"
        onClick={goToDesignTab}
        className="text-primary-strong flex cursor-pointer items-center gap-1.5 self-start border-none bg-transparent p-0 text-left text-xs font-semibold hover:underline"
      >
        <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
        {t('editor.hints.change_in_design_tab')}
      </button>
    </div>
  );

  return (
    <InfoBox
      position="top"
      content={layoutHintContent}
      className="flex"
      interactive={true}
      italic={false}
      // The badge shows the literal text "main", so the accessible name must
      // contain it (WCAG 2.5.3 Label in Name). It is a layout keyword, not copy.
      label="main"
    >
      {badgeElement}
    </InfoBox>
  );
};
