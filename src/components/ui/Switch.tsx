import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/utils/cn';

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, disabled, label, onCheckedChange, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      // `onClick` used to sit before the prop spread, so a consumer passing one
      // silently replaced the toggle and the switch stopped switching.
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange(!checked);
      }}
      className={cn(
        // The track is 44x26 around a 20px knob, so the knob sits 2px inside it
        // rather than floating in 12px of dead space. The `before` pseudo-element
        // restores the 44px-tall pointer target the taller track used to provide:
        // shrinking the visual switch must not shrink what a thumb has to hit.
        'border-input relative inline-flex h-[26px] w-11 items-center rounded-full border p-0.5 transition-colors',
        "before:absolute before:inset-x-0 before:-inset-y-[9px] before:content-['']",
        checked ? 'bg-primary' : 'bg-muted',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          // 18px, not 20: the 44px track is border-box, so 2px of border and
          // 4px of padding leave a 38px content box for a 20px knob. Translating
          // a full 20px pushes the knob flush against the right edge and eats
          // the inset that makes the off and on states look symmetrical.
          'bg-card block h-5 w-5 rounded-full border shadow-sm transition-transform',
          checked && 'translate-x-[18px]',
        )}
      />
    </button>
  ),
);

Switch.displayName = 'Switch';
