import React, { useContext } from 'react';

import { ThemeHeadingContext } from '@/components/preview/themes/shared/ThemeHeadingContext';

interface ThemeHeadingProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLDivElement> {
  children: React.ReactNode;
}

export function ThemeHeading({ children, ...props }: ThemeHeadingProps) {
  const { as } = useContext(ThemeHeadingContext);

  return React.createElement(
    as,
    {
      ...props,
      // Add accessibility properties when not rendering as h1
      ...(as !== 'h1' ? { role: 'heading', 'aria-level': 1 } : {}),
    },
    children,
  );
}
