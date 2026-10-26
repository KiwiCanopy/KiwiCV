import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Ogłoszenia o pracę',
      content:
        'Wklej link do ogłoszenia w oknie eksportu, gdy tworzysz kopię zapasową CV na Google Drive lub w prywatnym repozytorium GitHub, a potem otwieraj go z „Moje CV”, kiedy tylko potrzebujesz. Publiczne repozytoria nigdy nie otrzymują linku.',
      title: 'Miej pod ręką ogłoszenia, na które aplikujesz',
    },
  },
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  feat_cover_letter_style_default:
    'Gdy masz zapisaną próbkę tekstu, Twoje listy motywacyjne zaczynają teraz od opcji „Dopasuj do mojego stylu pisania”, nawet w nowej karcie przeglądarki. Jeśli zamiast tego wybierzesz ton, KiwiCV zachowa go dla tej karty.',
  feat_export_cmd_enter:
    'Naciśnij Cmd+Enter (Ctrl+Enter w systemie Windows) w oknie eksportu, aby rozpocząć eksport bez sięgania po przycisk.',
  feat_export_cover_letter_switch:
    'Okno eksportu pokazuje teraz, czy list motywacyjny jest dołączony, z przełącznikiem, by go dodać lub pominąć, i ostrzega, gdy list może nie pasować do ogłoszenia o pracę, do którego właśnie dopasowano Twoje CV, więc możesz go sprawdzić przed wysłaniem.',
  feat_job_posting_link:
    'Dodaj link do ogłoszenia, gdy tworzysz kopię zapasową CV na Google Drive lub w prywatnym repozytorium GitHub, a potem otwieraj go bezpośrednio z tej wersji w „Moje CV”. Publiczne repozytoria GitHub nigdy go nie otrzymują.',
  fix_basics_proposal_gap:
    'Propozycja AI w sekcji „Podstawy” nie przylega już bezpośrednio do Twojego zdjęcia.',
  fix_json_resume_import_levels:
    'Import pliku JSON Resume zamienia teraz biegłość w języku, na przykład „Native” lub „B2”, na odpowiedni poziom oraz odczytuje poziomy umiejętności zapisane słowami, na przykład „Expert”. Jeśli wpis doświadczenia zawiera opis firmy, import informuje teraz, że KiwiCV nie ma pola, w którym mógłby go zachować, zamiast po cichu go pomijać.',
  fix_sign_out_forgets_export_details:
    'Wylogowanie usuwa teraz także firmę, stanowisko i link do ogłoszenia wpisane w oknie eksportu, aby kolejna osoba logująca się w tej przeglądarce ich nie zobaczyła.',
  fix_tailoring_matches_job_ad:
    'Dopasowanie do oferty przepisuje teraz Twoje doświadczenie zawodowe pod kątem ogłoszenia o pracę i dostosowuje Twój tytuł zawodowy, zamiast tylko restrukturyzować umiejętności.',
  ui_export_footer_pinned:
    'Przyciski Eksportuj i Anuluj pozostają teraz widoczne na dole okna eksportu na mniejszych ekranach.',
  ui_restructure_skills_default:
    'Opcja „Restrukturyzuj Umiejętności” jest teraz domyślnie zaznaczona, gdy ulepszasz całe CV, więc dopasowanie przegrupowuje Twoje umiejętności pod kątem stanowiska. Odznacz ją, aby zachować własną strukturę; każda zmiana nadal przychodzi jako propozycja, którą możesz zaakceptować lub odrzucić.',
};
