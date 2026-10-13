import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Skala rozmiaru czcionki',
    },
  },
  cv_defaults: {
    title: 'Ustawienia CV',
  },
  danger: {
    delete_btn: 'Potwierdź usuwanie',
    delete_data: 'Usuń wszystko',
    delete_data_desc: 'Trwale.',
    title: 'Niebezpieczne',
  },
  export: {
    available_variables: 'Zmienne',
    format_tokens: 'Tokeny FORMAT:',
    pattern_error_brackets: 'Nieprawidłowy wzorzec: niezrównoważone nawiasy.',
    pattern_tip: 'Użyj {date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}',
    project_name: 'Nazwa',
    project_name_desc: 'Zdefiniuj podstawę nazwy projektu dla swoich eksportów.',
  },
  github: {
    disconnect_success: 'GitHub został pomyślnie rozłączony.',
    error_forbidden: 'Dostęp zabroniony lub przekroczono limit zapytań',
    error_invalid_token: 'Nieprawidłowy token GitHub. Sprawdź swój PAT.',
    error_repo_not_found: 'Nie znaleziono repozytorium',
    hide_token: 'Ukryj token',
    modal_connect_btn: 'Połącz i synchronizuj',
    modal_description:
      'Połącz swoje repozytorium GitHub, aby synchronizować życiorys między urządzeniami i wdrażać go na GitHub Pages.',
    modal_pat_placeholder: 'ghp_twój_osobisty_token_dostępu',
    modal_repo_placeholder: 'użytkownik/repozytorium',
    modal_title: 'Synchronizuj z GitHub',
    pat_creation_tip:
      "Pamiętaj, aby wybrać 'Only select repositories' i określić żądaną datę wygaśnięcia.",
    pat_security_note:
      "Wskazówka dotycząca bezpieczeństwa: Użyj Personal Access Token 'Fine-grained' z uprawnieniami do odczytu/zapisu 'Contents' tylko do określonego repozytorium, aby zapewnić maksymalne bezpieczeństwo. Możesz go utworzyć pod następującym linkiem: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'W repozytorium publicznym lub opublikowanym za pomocą GitHub Pages kopie zapasowe nie zawierają ukrytych przez Ciebie elementów, Twojego listu motywacyjnego ani danych z zaimportowanych plików. Nadal zawierają imiona i nazwiska oraz dane kontaktowe Twoich referencji i nazwy plików i folderów wybierane przez Ciebie podczas eksportu, które mogą wskazywać firmę, do której aplikujesz. Jeśli później upublicznisz repozytorium prywatne lub opublikujesz je za pomocą GitHub Pages, to, co już w nim jest, również może stać się publiczne.',
    remember_pat: 'Przechowuj token na stałe w tej przeglądarce',
    remember_pat_tip:
      'Jeśli wyłączone, token jest przechowywany tylko dla bieżącej sesji i zostanie usunięty po zamknięciu karty.',
    repo_name: 'Repozytorium',
    show_token: 'Pokaż token',
  },
  interface: {
    appearance: 'Wygląd',
    install: {
      action: 'Zainstaluj KiwiCV',
      description: 'Otwieraj KiwiCV jak każdą inną aplikację, w osobnym oknie.',
      installed: 'Zainstalowano na tym urządzeniu',
      ios_hint: 'Stuknij Udostępnij, a następnie Do ekranu początkowego.',
      label: 'Aplikacja',
      unsupported:
        'Jeśli Twoja przeglądarka może instalować aplikacje, poszukaj opcji Zainstaluj na pasku adresu lub w menu.',
    },
    language: 'UI-Język',
    language_description: 'Wybierz preferowany język interfejsu aplikacji.',
    theme_description: 'Wybierz.',
    theme_options: {
      dark: 'Ciemny',
      light: 'Jasny',
      system: 'System',
    },
    title: 'Interfejs',
  },
  title: 'Ustawienia',
};
