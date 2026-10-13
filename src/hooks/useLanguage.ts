import { useLocation } from 'react-router-dom';

import { type LocaleCode } from '@/locales';
import { splitLanguagePath } from '@/utils/localeRouting';

/**
 * The locale the current URL is in.
 *
 * Replaces `useParams<{ lang: string }>()`, which stopped working when English
 * moved to the origin root: the routes are now static per locale, so there is
 * no `:lang` param to read. The param version also failed quietly — it returned
 * `undefined`, and the `= 'en'` default most call sites wrote meant a German
 * visitor would have silently built English links.
 *
 * Derived from the pathname, so an unprefixed path resolves to English by
 * definition and this agrees with `localizedPath` by construction.
 */
export function useLanguage(): LocaleCode {
  const { pathname } = useLocation();
  return splitLanguagePath(pathname).lang;
}
