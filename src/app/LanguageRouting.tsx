import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { type LocaleCode } from '@/locales';
import { useUIStore } from '@/store/ui/useUIStore';
import { DEFAULT_LANGUAGE, localizedPath, splitLanguagePath } from '@/utils/localeRouting';

/**
 * Wraps one prefixed locale subtree (`/de/…`), with that subtree's locale baked
 * in as a prop rather than read from a `:lang` param.
 *
 * The param version had to validate the segment itself and bounce anything
 * unrecognized, which made `/nonsense` an unknown-locale redirect instead of a
 * 404. `AppRoutes` now mounts one subtree per real locale, so an unmatched
 * first segment simply is not a locale route and falls through to the
 * unprefixed tree's 404.
 *
 * **A prefixed URL is authoritative.** Landing on `/de/dashboard` sets the app
 * to German, whatever the store previously held — the link the visitor followed
 * says which language they want. The unprefixed tree inverts this; see
 * {@link RootLanguageGate}.
 */
export function LanguageSyncWrapper({ lang }: { lang: LocaleCode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { appLanguage, setAppLanguage } = useUIStore();
  const uiLanguage = appLanguage || DEFAULT_LANGUAGE;
  const prevZustandLang = useRef(uiLanguage);

  useEffect(() => {
    if (lang !== uiLanguage) {
      if (uiLanguage !== prevZustandLang.current) {
        // The store moved first: the visitor changed language in the UI, so
        // carry them to the same page in the new locale. `localizedPath` is
        // what makes English land on the unprefixed form here.
        const { pathWithoutLang } = splitLanguagePath(location.pathname);
        navigate(localizedPath(uiLanguage, pathWithoutLang) + location.search + location.hash, {
          replace: true,
        });
      } else {
        setAppLanguage(lang);
      }
    }

    prevZustandLang.current = uiLanguage;
  }, [lang, uiLanguage, location, navigate, setAppLanguage]);

  return <Outlet />;
}

/**
 * Whether this browser already had a language persisted when the page loaded.
 *
 * Read once, from storage, at module load — deliberately NOT from the store.
 * `useUIStore` falls back to `detectBrowserLanguage()`, so its `appLanguage` is
 * non-English for anyone with a non-English browser whether or not they ever
 * chose anything, and gating the root redirect on that would bounce `/` for a
 * renderer reporting a non-English locale. That is the exact failure this whole
 * scheme exists to remove, and Google's multi-regional guidance warns against
 * automatic redirection by perceived language for the same reason: it can stop
 * a crawler ever reaching the other versions.
 *
 * A returning visitor has the key; a crawler never does.
 */
function hasPersistedLanguage(): boolean {
  try {
    const raw = window.localStorage.getItem(BRAND_STORAGE_KEYS.uiPreferences);
    return !!raw && typeof (JSON.parse(raw)?.state?.appLanguage ?? null) === 'string';
  } catch {
    // Private mode, disabled storage, corrupt JSON — treat as a fresh visitor,
    // which is the safe direction: English at the root.
    return false;
  }
}

const HAD_PERSISTED_LANGUAGE = typeof window !== 'undefined' && hasPersistedLanguage();

/**
 * Guards the unprefixed tree, which is English by definition.
 *
 * Here the *store* wins, not the URL — the reverse of {@link LanguageSyncWrapper} —
 * because an unprefixed path carries no locale to honour. A returning visitor
 * whose stored language is German opening `/dashboard` is sent to
 * `/de/dashboard`, which is the behaviour the old `RootRedirector` gave them.
 *
 * ⚠️ A visitor with no persisted choice stays on English instead, even if their
 * browser says otherwise. That is a deliberate change of first-visit behaviour:
 * the domain-root home page has to be a real, indexable English page rather
 * than a bounce, or Google has no home page to read a site name from.
 */
export function RootLanguageGate() {
  const uiLanguage = useUIStore((state) => state.appLanguage) || DEFAULT_LANGUAGE;
  const location = useLocation();

  if (HAD_PERSISTED_LANGUAGE && uiLanguage !== DEFAULT_LANGUAGE) {
    const { pathWithoutLang } = splitLanguagePath(location.pathname);
    return (
      <Navigate
        to={localizedPath(uiLanguage, pathWithoutLang) + location.search + location.hash}
        replace
      />
    );
  }

  // Not redirecting means this visitor is staying on the unprefixed tree, so the
  // URL is authoritative here exactly as it is under a prefix: the content has
  // to be English too. Rendering German copy at an English URL would leave the
  // canonical describing a page that is not what was served.
  return <LanguageSyncWrapper lang={DEFAULT_LANGUAGE} />;
}

/**
 * `/en/…` is the pre-move English form, and a lot of it is indexed and linked.
 *
 * `netlify.toml` 301s it for real requests, which is what search engines need.
 * This route covers the two cases those rules never see: in-app navigation to a
 * stale `/en` link, and the Vite dev server, which applies no redirect rules at
 * all.
 */
export function LegacyEnglishRedirect() {
  const location = useLocation();
  const { pathWithoutLang } = splitLanguagePath(location.pathname);

  return (
    <Navigate
      to={localizedPath(DEFAULT_LANGUAGE, pathWithoutLang) + location.search + location.hash}
      replace
    />
  );
}
