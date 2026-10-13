/**
 * Injects invisible break hints (zero-width spaces) to long strings to help PDF word wrap.
 */
export function injectBreakHints(
  str: string | undefined,
  strategy: 'url' | 'email' | 'underscore' | 'hyphen' | 'all' = 'all',
): string {
  if (!str) return '';

  switch (strategy) {
    case 'url':
      return str.replace(/([/:?#._-])/g, '$1\u200B');
    case 'email':
      return str.replace(/([@.])/g, '$1\u200B');
    case 'underscore':
      return str.replace(/(_+)/g, '$1\u200B');
    case 'hyphen':
      return str.replace(/(-+)/g, '$1\u200B');
    case 'all':
    default:
      return str.replace(/([/:?#._@-])/g, '$1\u200B');
  }
}
