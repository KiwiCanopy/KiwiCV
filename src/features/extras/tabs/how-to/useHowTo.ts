import { useSearchParams } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';

export const useHowTo = () => {
  const { t } = useTranslation();
  const lang = useLanguage();

  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const activeSection = sectionParam || 'core';

  const setActiveSection = (section: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (section === 'core') {
      newParams.delete('section');
    } else {
      newParams.set('section', section);
    }
    setSearchParams(newParams, { replace: true });
  };

  return {
    t,
    lang,
    activeSection,
    setActiveSection,
  };
};
