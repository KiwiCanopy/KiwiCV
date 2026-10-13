import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Skopiuj',
  data_label: 'Surowe dane',
  download: 'Pobierz JSON',
  full: 'Pełny',
  full_desc: 'flagi widoczności (Najlepsze do importu do KiwiCV)',
  full_title: 'Pełen',
  passthrough: {
    desc: 'Zachowane, aby inne narzędzia nadal mogły odczytać Twój plik. Trafiają do Twoich eksportów JSON oraz kopii zapasowych na Drive i w prywatnych repozytoriach GitHub; nigdy nie są wyświetlane w Twoim CV ani wysyłane do AI.',
    remove_confirm_message:
      'Pliki eksportowane z KiwiCV nie będą już zawierać tego bloku. Tego nie można cofnąć.',
    remove_confirm_title: 'Usunąć „{{name}}”?',
    removed_desc:
      'Następna synchronizacja zastąpi Twoją bieżącą kopię zapasową. Wcześniejsze migawki i starsze wersje przechowywane przez Drive i GitHub nadal go zawierają, dopóki ich tam nie usuniesz.',
    removed_title: 'Usunięto „{{name}}” z tej przeglądarki',
    title: 'Dodatkowe dane z zaimportowanego pliku',
  },
  reduced: 'Zredukowany',
  reduced_desc: 'ukryte elementy usunięte',
  reduced_title: 'Zredukowany',
  standard: 'Standard',
  standard_desc: 'Brak meta.',
  standard_title: 'Standard',
};
