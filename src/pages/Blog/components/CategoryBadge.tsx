import { useTranslation } from '@/hooks/useTranslation';
import { getCategoryTranslationKey } from '@/pages/Blog/utils/category';
import { cn } from '@/utils/cn';

const CATEGORY_COLORS: Record<string, string> = {
  blue: 'bg-blue-600/80 text-white border-white/20 shadow-lg shadow-blue-500/20',
  purple: 'bg-purple-600/80 text-white border-white/20 shadow-lg shadow-purple-500/20',
  emerald: 'bg-emerald-600/80 text-white border-white/20 shadow-lg shadow-emerald-500/20',
  orange: 'bg-orange-600/80 text-white border-white/20 shadow-lg shadow-orange-500/20',
  rose: 'bg-rose-600/80 text-white border-white/20 shadow-lg shadow-rose-500/20',
  sky: 'bg-sky-600/80 text-white border-white/20 shadow-lg shadow-sky-500/20',
  indigo: 'bg-indigo-600/80 text-white border-white/20 shadow-lg shadow-indigo-500/20',
};

interface CategoryBadgeProps {
  title: string;
  color: string;
  className?: string;
}

export function CategoryBadge({ title, color, className }: CategoryBadgeProps) {
  const { t } = useTranslation();
  const translationKey = getCategoryTranslationKey(title);
  const localizedTitle = t(`blog.categories.${translationKey}`) || title;

  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase backdrop-blur-xl transition-all duration-300',
        CATEGORY_COLORS[color] || CATEGORY_COLORS.blue,
        className,
      )}
    >
      {localizedTitle}
    </span>
  );
}
