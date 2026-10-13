import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import { GitHubService } from '@/services/github';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface GitHubPatFieldsProps {
  pat: string;
  setPat: (val: string) => void;
  repoUrl: string;
  setRepoUrl: (val: string) => void;
  rememberPat: boolean;
  setRememberPat: (val: boolean) => void;
  showPat: boolean;
  setShowPat: (val: boolean) => void;
  isDisabled: boolean;
}

export function GitHubPatFields({
  pat,
  setPat,
  repoUrl,
  setRepoUrl,
  rememberPat,
  setRememberPat,
  showPat,
  setShowPat,
  isDisabled,
}: GitHubPatFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Input
        label={t('settings.github.personal_token')}
        type={showPat ? 'text' : 'password'}
        value={pat}
        disabled={isDisabled}
        onChange={(e) => setPat(e.target.value)}
        placeholder={t('settings.github.modal_pat_placeholder')}
        suffix={
          <button
            type="button"
            onClick={() => setShowPat(!showPat)}
            className="text-muted-foreground hover:text-foreground hover:bg-background rounded-md p-1.5 transition-colors"
            // Two literal `t()` calls, not `t(showPat ? … : …)`: a composed key
            // is invisible to `check-usage.cjs` and would need allowlisting
            // (`.claude/rules/i18n.md` § "Deleting a key").
            aria-label={showPat ? t('settings.github.hide_token') : t('settings.github.show_token')}
          >
            {showPat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <Input
        label={t('settings.github.repo_name')}
        value={repoUrl}
        disabled={isDisabled}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder={t('settings.github.modal_repo_placeholder')}
      />

      <div className="space-y-4">
        <div className="bg-primary/5 border-primary-strong/10 flex items-start gap-3 rounded-lg border p-3.5 sm:p-4">
          <input
            type="checkbox"
            id="remember-pat"
            checked={rememberPat}
            onChange={(e) => setRememberPat(e.target.checked)}
            className="text-primary-strong focus:ring-primary-strong mt-1 h-4 w-4 rounded border-gray-300"
          />
          <div className="space-y-1">
            <label
              htmlFor="remember-pat"
              className="text-foreground cursor-pointer text-sm font-bold"
            >
              {t('settings.github.remember_pat')}
            </label>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t('settings.github.remember_pat_tip')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3.5 text-amber-600 sm:p-4 dark:text-amber-400">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p>
              {t('settings.github.pat_security_note')
                .split('{{link}}')
                .map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <a
                        href={GitHubService.getPatCreationUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-amber-700 hover:underline dark:text-amber-300"
                      >
                        github.com
                      </a>
                    )}
                  </span>
                ))}
            </p>
            <p className="mt-2 text-[10px] font-semibold italic opacity-90">
              {t('settings.github.pat_creation_tip')}
            </p>
            {/* What a repo anyone can read receives. */}
            <p className="mt-2">{t('settings.github.public_repo_note')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
