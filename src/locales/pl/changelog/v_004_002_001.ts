import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'Na telefonie otwieranie CV jako strony internetowej działa już bez zarzutu. Opcja HTML w menu Podgląd zostawiała wcześniej kartę z komunikatem o generowaniu, który nigdy się nie kończył; teraz od razu wyświetla wyrenderowane CV.',
  perf_phone_preview:
    'Podgląd otwiera się szybciej na telefonie. KiwiCV przygotowuje silnik dokumentów już w trakcie edycji, zamiast uruchamiać go dopiero w momencie dotknięcia ekranu, a ponowne otwarcie CV, które nie zmieniło się od ostatniego podglądu, pozwala całkowicie pominąć czekanie.',
  ui_phone_layout:
    'Na telefonie edytor i Moje CV znowu dają każdemu elementowi odpowiednio dużo miejsca. Każda kopia zapasowa wyświetla swoją nazwę, język i datę zapisu w osobnej linii zamiast nachodzić na przycisk Przywróć, karta „Ulepsz z SI” mieści tytuł i informację o punktach w osobnych liniach, a ostatnia sekcja w edytorze nie chowa się już pod pływającym przyciskiem Podgląd.',
};
