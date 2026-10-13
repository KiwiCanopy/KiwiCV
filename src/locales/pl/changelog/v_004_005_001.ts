import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  fix_month_year_dates:
    'Data wpisana jako miesiąc i rok — 03/2019 lub 03.2019 — jest teraz zapisywana poprawnie, więc wpis trafia na właściwe miejsce zamiast na koniec, jakby nie miał daty.',
  fix_skills_reorg_empty:
    'Porządkowanie umiejętności z AI nie może już opróżnić sekcji Umiejętności. Gdy AI nie zaproponuje nowego grupowania, Twoje umiejętności zostają dokładnie takie, jakie były, to uruchomienie nie wlicza się do dziennego limitu, a list motywacyjny pisany równolegle zgadza się z Twoim CV.',
  ui_entry_header_contrast:
    'Czytelniej w edytorze: stanowisko, daty i symbol zastępczy „Bez nazwy” obok każdego zwiniętego wpisu wyraźnie się teraz wyróżniają w trybie jasnym i ciemnym.',
};
