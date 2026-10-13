import { createContext, useContext } from 'react';

export interface EditorLayoutContextValue {
  width: number;
  isStandard: boolean; // width > 560
  isSocial: boolean; // width > 650
}

export const EditorLayoutContext = createContext<EditorLayoutContextValue | null>(null);

export const useEditorBreakpoints = () => {
  const context = useContext(EditorLayoutContext);
  if (!context) {
    // Fallback if used outside the provider (e.g. during initial paint or mobile)
    return { width: 0, isStandard: false, isSocial: false };
  }
  return context;
};
