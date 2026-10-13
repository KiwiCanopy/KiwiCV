import React from 'react';

import { cn } from '@/utils/cn';
import { renderWithIcons } from '@/utils/text-rendering';
import * as Popover from '@radix-ui/react-popover';

/**
 * One brand family plus status roles — not a decorative palette.
 *
 * This replaced a ten-hue rainbow (emerald/teal/blue/purple/amber/indigo/rose/
 * sky/slate) that sat outside the token system and broke DESIGN_LANGUAGE.md's
 * "use one brand accent family; reserve other colors for semantic status".
 * Cards that merely sit next to each other are all `brand`; they are told
 * apart by icon and label, which is what a reader actually parses at 10px.
 * Reach for a status role only when the card *means* success/caution/failure.
 */
export type InfoCardColor = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  color?: InfoCardColor;
  tooltipAlignment?: 'left' | 'center' | 'right';
  tooltipSide?: 'top' | 'bottom';
  className?: string;
  onClick?: () => void;
}

const COLOR_CONFIG: Record<
  InfoCardColor,
  {
    text: string;
    bg: string;
    border: string;
    /** Popover arrow stroke — needs a real color value, not a utility class. */
    stroke: string;
    tooltipBorder: string;
  }
> = {
  brand: {
    text: 'text-primary-strong',
    bg: 'bg-primary/5',
    border: 'border-primary-strong/30',
    stroke: 'hsl(var(--primary-strong))',
    tooltipBorder: 'border-primary-strong/40',
  },
  neutral: {
    text: 'text-muted-foreground',
    bg: 'bg-muted/40',
    border: 'border-border',
    stroke: 'hsl(var(--border))',
    tooltipBorder: 'border-border',
  },
  success: {
    text: 'text-success',
    bg: 'bg-success/5',
    border: 'border-success/30',
    stroke: 'hsl(var(--success))',
    tooltipBorder: 'border-success/40',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    stroke: 'hsl(var(--warning))',
    tooltipBorder: 'border-warning/40',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/5',
    border: 'border-danger/30',
    stroke: 'hsl(var(--danger))',
    tooltipBorder: 'border-danger/40',
  },
};

export function InfoCard({
  icon: Icon,
  label,
  description,
  color = 'brand',
  tooltipSide = 'top',
  className,
  onClick,
}: InfoCardProps) {
  const config = COLOR_CONFIG[color] || COLOR_CONFIG.brand;
  const [open, setOpen] = React.useState(false);
  const isInteractive = Boolean(description || onClick);

  const contentChildren = (
    <>
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-transform group-hover/badge:scale-110',
          config.text,
        )}
      />
      <span
        className={cn(
          'text-center text-[8.5px] leading-tight font-bold tracking-widest uppercase min-[420px]:text-[10px]',
          config.text,
        )}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </>
  );
  const contentProps = {
    onClick: () => {
      if (description) {
        setOpen((prev) => !prev);
      }
      onClick?.();
    },
    className: cn(
      'flex h-full min-h-[75px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border p-2 transition-all min-[420px]:min-h-[85px] min-[420px]:gap-2 min-[420px]:p-3',
      description ? 'cursor-help' : onClick ? 'cursor-pointer' : 'cursor-default',
      config.border,
      config.bg,
      'hover:bg-opacity-10',
    ),
  };
  const content = isInteractive ? (
    <button type="button" {...contentProps}>
      {contentChildren}
    </button>
  ) : (
    <div {...contentProps}>{contentChildren}</div>
  );

  if (!description) {
    return <div className={cn('relative h-full', className)}>{content}</div>;
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {React.cloneElement(content, {
          className: cn(
            content.props.className,
            'group/badge relative h-full outline-none',
            className,
          ),
        })}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side={tooltipSide}
          sideOffset={4}
          collisionPadding={16}
          className={cn(
            'animate-in fade-in bg-card z-[110] w-[calc(100vw-64px)] max-w-[280px] rounded-xl border p-3 shadow-[var(--elevation-2)] transition-opacity duration-200 sm:w-64',
            'data-[side=top]:-translate-y-4', // Increase gap to 16px only on top
            config.tooltipBorder,
          )}
        >
          <p className="text-foreground/80 text-sm leading-relaxed font-medium antialiased">
            {renderWithIcons(description)}
          </p>
          <Popover.Arrow
            className={cn('fill-card')}
            style={{
              stroke: config.stroke,
              strokeWidth: '1.5px',
              strokeOpacity: 0.6,
            }}
            width={12}
            height={6}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
