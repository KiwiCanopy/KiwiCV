import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import { isThemeId } from '@/components/preview/themeIds';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { FileText } from 'lucide-react';

interface VersionThumbnailProps {
  theme?: string;
  className?: string;
}

/**
 * The theme's shipped preview image, or a neutral tile when the filename does
 * not name a theme we know.
 *
 * `getThemeMeta` resolves anything unknown to `lunar`, so calling it
 * unconditionally would print a confidently wrong preview for a backup whose
 * `_theme_` suffix was lost — which `parseBackupFilename` returns `undefined`
 * for, and which is common enough to matter.
 */
export function VersionThumbnail({ theme, className }: VersionThumbnailProps) {
  const { t } = useTranslation();

  const base = cn(
    'border-border bg-secondary flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border',
    className,
  );

  if (!isThemeId(theme)) {
    return (
      <div className={base} title={t('cvs.unknown_theme')}>
        <FileText className="text-muted-foreground h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{t('cvs.unknown_theme')}</span>
      </div>
    );
  }

  const meta = getThemeMeta(theme);
  return (
    <div className={base}>
      <img src={meta.previewImage} alt="" loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
