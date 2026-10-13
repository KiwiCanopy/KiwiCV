import * as React from 'react';

import { cn } from '@/utils/cn';
import {
  Root as Popover,
  Anchor as PopoverAnchor,
  Content as PopoverContentPrimitive,
  Portal as PopoverPortal,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover';

// ⚠️ These are named imports rather than `const Popover = PopoverPrimitive.Root`
// aliases, and the spelling is load-bearing.
// `react-refresh/only-export-components` classifies an exported local by its
// initializer, and a MemberExpression is not one of the forms it recognises — so
// from eslint-plugin-react-refresh 0.5.5 the namespace-alias spelling reported
// all three re-exports as non-component exports and failed the release's
// `--max-warnings=0` pre-flight. An imported binding has no initializer, so the
// rule falls back to the name and accepts them. Same objects, same refs,
// same `asChild` behaviour; wrapping them in real components would have changed
// all three.
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverContentPrimitive>,
  React.ComponentPropsWithoutRef<typeof PopoverContentPrimitive>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPortal>
    <PopoverContentPrimitive
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      // The surface reads `--popover`, never the raw palette. The edge is
      // `--border`, not `--input`: a popover is a container, and the controls
      // 1.4.11 binds on are its rows (`.claude/rules/ui.md` § "Control edges").
      className={cn(
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border bg-popover text-popover-foreground z-[250] w-72 rounded-xl border p-4 shadow-[var(--elevation-2)] outline-none',
        className,
      )}
      {...props}
    />
  </PopoverPortal>
));
PopoverContent.displayName = PopoverContentPrimitive.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
