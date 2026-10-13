import { createContext } from 'react';

export const ThemeHeadingContext = createContext<{ as: 'h1' | 'h2' | 'div' }>({ as: 'h1' });
