import { type LocaleCode, locales } from '@/locales';

/**
 * Get the localized label for a language level (1-5).
 */
export function getLanguageLevelLabel(
  level: number | undefined,
  localeCode: string = 'en',
): string {
  if (!level || level <= 0) return '';
  const code = localeCode as LocaleCode;
  const translation = locales[code] || locales['en'];
  const levels = translation.editor?.modules?.languages?.levels as
    Record<string, string> | undefined;

  if (!levels) return '';

  const mapping: Record<number, string> = {
    1: 'elementary',
    2: 'intermediate',
    3: 'professional',
    4: 'fluent',
    5: 'native',
  };

  const key = mapping[level];
  return key ? levels[key] || '' : '';
}

/**
 * Get the localized label for a skill level (1-4).
 */
export function getSkillLevelLabel(level: number | undefined, localeCode: string = 'en'): string {
  if (!level || level <= 0) return '';
  const code = localeCode as LocaleCode;
  const translation = locales[code] || locales['en'];
  const levels = translation.editor?.modules?.skills?.levels as Record<string, string> | undefined;

  if (!levels) return '';

  const mapping: Record<number, string> = {
    1: 'basic',
    2: 'intermediate',
    3: 'advanced',
    4: 'expert',
  };

  const key = mapping[level];
  return key ? levels[key] || '' : '';
}

/**
 * Get the numeric level and max level for a given type (language or skill).
 * Handles both numeric levels and string descriptions.
 */
export function getLevelInfo(level: number | string | undefined, type: 'language' | 'skill') {
  if (type === 'language') {
    const val =
      typeof level === 'number'
        ? level
        : getFluencyLevel(typeof level === 'string' ? level : undefined);
    return { value: val, max: 5 };
  }

  // For skills, we now use a 1-4 scale.
  let val = 0;
  const max = 4;
  if (typeof level === 'number') {
    if (level >= 1 && level <= 4) {
      val = Math.round(level);
    } else if (level > 4 && level <= 100) {
      // Migrate percentage to level
      if (level <= 39) val = 1;
      else if (level <= 69) val = 2;
      else if (level <= 89) val = 3;
      else val = 4;
    } else if (level === 0) {
      val = 0;
    }
  } else if (typeof level === 'string') {
    const parsed = parseFloat(level);
    if (!isNaN(parsed)) {
      if (parsed >= 1 && parsed <= 4) {
        val = Math.round(parsed);
      } else if (parsed > 4 && parsed <= 100) {
        if (parsed <= 39) val = 1;
        else if (parsed <= 69) val = 2;
        else if (parsed <= 89) val = 3;
        else val = 4;
      }
    } else {
      // Handle common string levels for skills
      const s = level.toLowerCase();
      if (s.includes('expert') || s.includes('master')) val = 4;
      else if (s.includes('advanced') || s.includes('senior')) val = 3;
      else if (s.includes('intermediate') || s.includes('mid')) val = 2;
      else if (s.includes('beginner') || s.includes('junior') || s.includes('novice')) val = 1;
    }
  }

  return {
    value: val,
    max,
  };
}

/**
 * Get a numeric level (1-5) for a certificate string or level number.
 */
export function getFluencyLevel(certificate?: string, level?: number): number {
  if (typeof level === 'number' && level > 0) return level;
  if (!certificate) return 0;

  const f = certificate.toLowerCase();
  if (f.includes('native') || f.includes('bilingual') || f.includes('mother')) return 5;
  if (f.includes('fluent') || f.includes('full professional')) return 4;
  if (f.includes('professional')) return 3;
  if (f.includes('intermediate') || f.includes('conversational')) return 2;
  if (f.includes('elementary') || f.includes('basic')) return 1;
  return 0;
}

/**
 * Get the standardized display label for a language item (Level + Fluency).
 * Handles all combinations: only level, only certificate, or both combined.
 */
export function getLanguageLabel(
  level: number | string | undefined,
  certificate: string | undefined,
  localeCode: string = 'en',
): string {
  const { value } = getLevelInfo(level, 'language');
  const levelLabel = getLanguageLevelLabel(value, localeCode);

  if (levelLabel && certificate) {
    return `${levelLabel} (${certificate})`;
  }
  return levelLabel || certificate || '';
}

/**
 * Get the localized city placeholder for the given locale.
 */
export function getPlaceholderCity(localeCode: string = 'en'): string {
  const code = localeCode as LocaleCode;
  const translation = locales[code] || locales['en'];
  return translation.placeholders?.basics?.city || 'London';
}
