import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  fix_migration_notice:
    'Jeśli nadal wchodzisz na KiwiCV przez poprzedni adres internetowy, wyświetlany tam komunikat podaje dokładną datę, kiedy ten adres przestanie działać: 31 października 2026 r.',
  fix_mobile_checkout:
    'Przesuwanie kart cennika na telefonie nie uruchamia już przypadkowo procesu płatności. Tylko przycisk rozpoczyna zakup.',
  fix_preview_reliability:
    'Podgląd nie zawiesza się już na nieskończonym ładowaniu. Zablokowane wyskakujące okienko informuje teraz o tym co się stało, proces renderowania w przypadku błędu zatrzymuje się z jasnym wyjaśnieniem, a podgląd działa nadal nawet wtedy, gdy zewnętrzna usługa działa wolno lub jest niedostępna.',
  fix_save_status:
    'Komunikat „Zapisano na tym urządzeniu” odzwierciedla teraz to, co faktycznie zostało zapisane, zamiast pokazywać to samo zapewnienie niezależnie od wyniku.',
  fix_translations:
    'Naprawiono trzynaście tekstów, które zawierały litery z niewłaściwego alfabetu (cyrylicę w słowach hiszpańskich i tureckich oraz znaki koreańskie i japońskie w chińskim) i uzupełniono ostatnie braki we wszystkich piętnastu językach.',
  perf_preview_speed:
    'Pierwszy podgląd pojawia się znacznie szybciej. KiwiCV ładował wcześniej wszystkie czcionki, których mógłby potrzebować przed wyświetleniem czegokolwiek, w tym dwie bardzo duże czcionki dla chińskiego i japońskiego. Teraz są one ładowane tylko wtedy, gdy Twoje CV faktycznie używa tych znaków.',
  ui_polish:
    'Szlif wizualny: nagłówki używają prawdziwej pogrubionej czcionki zamiast sztucznie pogrubianej przez przeglądarkę, etykiety formularzy i symbole zastępcze są czytelniejsze, a karty sekcji mają jeden spójny akcent.',
};
