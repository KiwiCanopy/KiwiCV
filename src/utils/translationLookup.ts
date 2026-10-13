import { locales } from '@/locales';

const { en } = locales;

/** Walks a dotted path through a locale tree; `null` at the first segment that is missing. */
export const getNestedValue = (obj: unknown, path: string): unknown => {
  if (!path) return obj;
  return path.split('.').reduce((prev: unknown, curr: string) => {
    if (prev && typeof prev === 'object' && curr in prev) {
      return (prev as Record<string, unknown>)[curr];
    }
    return null;
  }, obj);
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value !== '';

/**
 * The string `t()` renders for `path` before interpolation, or `null` where `t()`
 * gives up and returns the path itself. Mirrors its rules: a numeric `vars.count`
 * reads `_one`/`_other`, and a miss in `baseLocale` falls back to English. Tests
 * that ask "does this key name something" call this rather than walking a bundle.
 */
export const lookupTranslation = (
  baseLocale: unknown,
  path: string,
  vars?: Readonly<Record<string, string | number>>,
): string | null => {
  let finalPath = path;

  if (vars && typeof vars.count === 'number') {
    const pluralPath = `${path}${vars.count === 1 ? '_one' : '_other'}`;
    if (
      isNonEmptyString(getNestedValue(baseLocale, pluralPath)) ||
      isNonEmptyString(getNestedValue(en, pluralPath))
    ) {
      finalPath = pluralPath;
    }
  }

  const translation = getNestedValue(baseLocale, finalPath);
  if (isNonEmptyString(translation)) return translation;
  const fallback = getNestedValue(en, finalPath);
  return isNonEmptyString(fallback) ? fallback : null;
};
