import React from 'react';

import { Sparkles } from 'lucide-react';

/**
 * Parses text for special placeholders and replaces them with inline icons.
 * Currently supports:
 * - {wardsymbol}: injects the AI icon. Changelog copy uses it to say "look for
 *   this in the app", so it must render whatever `AISuggestButton` renders —
 *   `Sparkles`. The token keeps its historical misspelling because it is
 *   embedded in translated strings across all locales.
 */
export function renderWithIcons(text: string): React.ReactNode {
  if (!text || !text.includes('{wardsymbol}')) return text;

  return (
    <>
      {text.split('{wardsymbol}').map((part, i, arr) => (
        <React.Fragment key={i}>
          {part}
          {i < arr.length - 1 && (
            <Sparkles className="text-primary-strong mx-0.5 inline-block h-3.5 w-3.5 translate-y-[-1px]" />
          )}
        </React.Fragment>
      ))}
    </>
  );
}
