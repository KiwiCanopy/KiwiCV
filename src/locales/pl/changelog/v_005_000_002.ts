import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  fix_composer_translate_tick:
    'Gdy Ulepsz za pomocą AI przetłumaczy Twoje CV, kolejne uruchomienie nie tłumaczy go ponownie: „Przetłumacz również mój CV” wyłącza się teraz samo, gdy tylko tłumaczenie się pojawi.',
  fix_pending_bar_wraps:
    'W wąskim edytorze pasek propozycji AI do sprawdzenia zawija teraz swoje przyciski, więc Odrzuć wszystko nie jest już ucięte.',
  fix_skills_false_change:
    'Umiejętności, których nie zmieniano, nie pojawiają się już jako zmienione po użyciu „Ulepsz za pomocą AI” lub po tłumaczeniu, a odrzucenie zmian tłumaczenia nie cofa już Twoich umiejętności do starego języka.',
  fix_skills_reorder_is_change:
    'Gdy Ulepsz za pomocą AI tylko zmienia kolejność Twoich umiejętności, jest to teraz proponowane jako zmiana do sprawdzenia, z oznaczonymi przeniesionymi umiejętnościami, zamiast być zgłaszane jako „Bez zmian”.',
  ui_composer_addon_summary:
    'Gdy pasek AI jest zamknięty w trybie Profesjonalny, dodatki, które uruchomią się razem — jak tłumaczenie czy przebudowa umiejętności — są teraz wymienione obok Ulepsz mój CV, a kliknięcie ich otwiera pasek.',
  ui_export_closes_on_success:
    'Po w pełni udanym eksporcie okno eksportu zamyka się teraz samo, a komunikat potwierdza to przez dziesięć sekund. Jeśli któryś cel zawiedzie, okno pozostaje otwarte, żeby można było spróbować ponownie.',
  ui_export_improve_apart:
    'Eksportuj i Ulepsz mój CV łatwiej teraz rozróżnić: Ulepsz znajduje się na początku paska AI, a przycisk Eksportuj w nagłówku nie jest już zielony. Gdy pracujesz na podstawie ogłoszenia o pracę lub własnych instrukcji, Ulepsz czeka, aż pasek będzie otwarty, więc nigdy nie działa na tekście, którego nie widzisz.',
  ui_page_break_toggle_on_row:
    'Przycisk podziału strony wrócił do każdego wiersza sekcji na karcie Wygląd, więc od razu widzisz, gdzie zaczyna się nowa strona PDF.',
};
