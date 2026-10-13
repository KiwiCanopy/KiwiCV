import { type CSSProperties, type ReactNode, memo } from 'react';

import { BREAKPOINTS } from '@/constants/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

export interface SegmentedOption<T> {
  value: T;
  label?: string;
  labelClassName?: string;
  icon?: ReactNode;
  hint?: string;
}

interface SegmentedToggleProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  activeColor?: string; // Optional: Override the sliding background color
  variant?: 'pill' | 'rect'; // Control rounding and padding
}

/**
 * A dynamic segmented control designed for toggles and multi-option switches.
 * Support for N-options with smooth sliding transitions.
 */
export const SegmentedToggle = memo(function SegmentedToggle<T extends string | boolean>({
  value,
  onChange,
  options,
  className,
  activeColor,
  variant = 'rect',
}: SegmentedToggleProps<T>) {
  const isSmallScreen = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
  const activeIndex = options.findIndex((opt) => opt.value === value);
  const totalOptions = options.length;

  const activeBgClass = activeColor || 'bg-card border-input border shadow-[var(--elevation-1)]';
  const activeTextClass = 'text-foreground';

  return (
    <div
      className={cn(
        // ⚠️ `border-transparent`, not "no border": the 1px stays so the track's
        // height and the thumb's inset are unchanged.
        //
        // The TRACK does not need an edge — its `--muted` fill already separates
        // it from the surface, and outlining both the group and the selected
        // item drew two rings around one control. The THUMB keeps its edge
        // (`activeBgClass` below), because the selected state is what the user
        // actually reads here: white on `--muted` is 1.17:1, so the edge is what
        // says which segment is on.
        'bg-muted group relative grid shrink-0 cursor-pointer items-stretch justify-stretch overflow-hidden border border-transparent p-[var(--seg-gutter)] transition-opacity select-none',
        variant === 'pill' ? 'h-9 rounded-full' : 'h-11 rounded-lg',
        className,
      )}
      style={
        {
          gridTemplateColumns: `repeat(${totalOptions}, minmax(0, 1fr))`,
          // ⚠️ The gutter is ONE number: padding, thumb inset, thumb width and
          // the ring's inward offset all derive from it, so none can drift out
          // of agreement with the others.
          '--seg-gutter': '3px',
          // A clipping zone, re-pointing the two focus variables `tokens.css`
          // publishes — the ring cannot go outside `overflow-hidden`, and the
          // separator has nothing to separate at 16.3:1 on the thumb.
          '--focus-offset': 'calc(-1 * var(--seg-gutter))',
          '--focus-separator-shadow': 'none',
        } as CSSProperties
      }
    >
      {/* Sliding Background Highlight */}
      <div
        className={cn(
          'absolute top-[var(--seg-gutter)] left-[var(--seg-gutter)] h-[calc(100%_-_2_*_var(--seg-gutter))] transition-transform duration-200 ease-out will-change-transform',
          variant === 'pill' ? 'rounded-full' : 'rounded-md',
          activeBgClass,
        )}
        style={{
          width: `calc((100% - 2 * var(--seg-gutter)) / ${totalOptions})`,
          transform: `translateX(calc(${activeIndex * 100}%))`,
        }}
      />

      {/* Options */}
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            title={isSmallScreen || !option.label ? option.hint : undefined}
            aria-pressed={isActive}
            // A responsive `labelClassName` can hide the label at narrow
            // widths, which would leave the button with no accessible name at
            // all. Name it from the label (or the hint) regardless of what is
            // painted.
            aria-label={option.label || option.hint}
            className={cn(
              // No focus utility here, deliberately: the ring comes from the
              // base rule and the track's variables above. `outline-hidden` sat
              // on this string and deleted the indicator outright.
              'relative z-10 flex h-full w-full min-w-0 cursor-pointer items-center justify-center gap-1.5 px-3 transition-colors duration-200',
              variant === 'pill' ? 'rounded-full' : 'rounded-md',
              // Active text color handling
              isActive ? activeTextClass : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon && (
              <span className="flex shrink-0 items-center justify-center">{option.icon}</span>
            )}
            {option.label && (
              // `truncate`, not a bare `whitespace-nowrap`: the track clips
              // overflow, so a label too long for its segment used to be cut
              // mid-glyph with no ellipsis and no sign anything was missing.
              <span className={cn('truncate text-sm font-medium', option.labelClassName)}>
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}) as <T extends string | boolean>(props: SegmentedToggleProps<T>) => React.ReactNode;
