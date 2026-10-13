import type { SanityCategory } from '@/lib/sanity';

// Predefined category priorities (lower numbers mean higher priority / displayed first)
const CATEGORY_PRIORITIES: Record<string, number> = {
  'resume guide': 1,
  'job search': 2,
  'interview prep': 3,
  'personal brand': 4,
  'career growth': 5,
  'career stories': 6,
  'inside kiwicv': 7,
  'inside cvcanvas': 7,
};

export function getCategoryTranslationKey(title: string): string {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle === 'inside cvcanvas') return 'inside_kiwicv';
  return normalizedTitle.replace(/\s+/g, '_').replace('&', 'and');
}

/**
 * Sorts an array of SanityCategory elements according to the predefined priorities.
 * Falls back to alphabetical sorting for unknown categories.
 */
export function sortCategories(categories?: SanityCategory[]): SanityCategory[] {
  if (!categories) return [];

  return [...categories].sort((a, b) => {
    const priorityA = CATEGORY_PRIORITIES[a.title.toLowerCase()] ?? 999;
    const priorityB = CATEGORY_PRIORITIES[b.title.toLowerCase()] ?? 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Fallback to alphabetical sorting if priorities are the same
    return a.title.localeCompare(b.title);
  });
}
