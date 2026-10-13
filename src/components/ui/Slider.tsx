import * as React from 'react';

import { cn } from '@/utils/cn';

interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onValueChange'
> {
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  showTooltip?: boolean;
  formatTooltip?: (value: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      min,
      max,
      step,
      onValueChange,
      onValueCommit,
      showTooltip = false,
      formatTooltip,
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const val = value[0];
    const percentage = ((val - min) / (max - min)) * 100;

    return (
      <div
        className={cn('relative flex w-full touch-none items-center py-6 select-none', className)}
      >
        {showTooltip && isDragging && (
          <div
            className={cn(
              'pointer-events-none absolute top-1/2 z-10 flex -translate-x-1/2 -translate-y-[calc(100%+12px)] flex-col items-center',
            )}
            style={{ left: `calc(${percentage}% + ${(8 - (percentage * 16) / 100).toFixed(2)}px)` }}
          >
            <div
              className={cn(
                'relative mb-1 min-w-[42px] scale-110 rounded-lg border border-white/20 bg-blue-600 px-3 py-1.5 text-center text-[11px] font-bold whitespace-nowrap text-white shadow-xl backdrop-blur-md transition-all duration-75',
              )}
            >
              {formatTooltip ? formatTooltip(val) : val}
              {/* Refined longer tick with perfect alignment */}
              <div
                className={cn(
                  'absolute -bottom-[4px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-blue-600 shadow-sm',
                )}
              />
            </div>
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onValueChange([parseFloat(e.target.value)])}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={(e) => {
            setIsDragging(false);
            onValueCommit?.([parseFloat((e.target as HTMLInputElement).value)]);
          }}
          onLostPointerCapture={(e) => {
            setIsDragging(false);
            onValueCommit?.([parseFloat((e.target as HTMLInputElement).value)]);
          }}
          onKeyUp={(e) => {
            if (
              [
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'PageUp',
                'PageDown',
              ].includes(e.key)
            ) {
              onValueCommit?.([parseFloat((e.target as HTMLInputElement).value)]);
            }
          }}
          className="slider-input m-0 h-1.5 w-full cursor-pointer appearance-none rounded-lg p-0 transition-all focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
          ref={ref}
          {...props}
        />
        <style>{`
            .slider-input::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: white;
                border: 2px solid #3b82f6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-width 0.1s ease;
            }
            .slider-input::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            .slider-input::-webkit-slider-thumb:active {
                transform: scale(1.35);
                border-width: 3px;
                box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2), 0 8px 16px rgba(0,0,0,0.2);
            }
            .slider-input::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: white;
                border: 2px solid #3b82f6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .slider-input::-moz-range-thumb:active {
                transform: scale(1.35);
            }
         `}</style>
      </div>
    );
  },
);
Slider.displayName = 'Slider';
