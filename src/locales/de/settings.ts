import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Schriftgrößen-Skalierung',
    },
  },
  cv_defaults: {
    title: 'Lebenslauf-Einstellungen',
  },
  danger: {
    delete_btn: 'Alle Daten löschen',
    delete_data: 'Alle lokalen Daten löschen',
    delete_data_desc:
      'Sobald du deine lokalen Daten löschst, gibt es kein Zurück mehr. Diese Aktion entfernt alle im LocalStorage deines Browsers gespeicherten Lebensläufe.',
    title: 'Gefahrenzone',
  },
  export: {
    available_variables: 'Verfügbare Variablen',
    format_tokens: 'FORMAT-Token:',
    pattern_error_brackets: 'Ungültiges Muster: unvollständige Klammern.',
    pattern_tip:
      'Ersetze FORMAT durch eine beliebige Kombination, z.B. {date-YYYYMMDD} oder {date-YYYY-MM-DD_HHmm}. Änderungen gelten für neue Exporte.',
    project_name: 'Standard Projektname',
    project_name_desc: 'Definiere die Projektnamen-Basis für deine Exporte.',
  },
  github: {
    disconnect_success: 'GitHub wurde erfolgreich getrennt.',
    error_forbidden: 'Zugriff verweigert oder Rate-Limit erreicht',
    error_invalid_token: 'Ungültiger GitHub-Token. Bitte überprüfe deinen PAT.',
    error_repo_not_found: 'Repository nicht gefunden',
    hide_token: 'Token verbergen',
    modal_connect_btn: 'Verbinden & Synchronisieren',
    modal_description:
      'Verbinde dein GitHub-Repository, um deinen Lebenslauf geräteübergreifend synchron zu halten und auf GitHub Pages bereitzustellen.',
    modal_pat_placeholder: 'ghp_dein_persönlicher_Zugriffstoken',
    modal_repo_placeholder: 'Benutzername/Repository',
    modal_title: 'Mit GitHub synchronisieren',
    pat_creation_tip:
      "Vergiss nicht, 'Only select repositories' auszuwählen und das gewünschte Ablaufdatum festzulegen.",
    pat_security_note:
      "Sicherheits-Tipp: Verwende einen 'Fine-grained' Personal Access Token mit nur 'Contents' Lese-/Schreibzugriff auf dein spezifisches Repository für maximale Sicherheit. Unter folgendem Link kannst du einen solchen erstellen: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'In einem öffentlichen Repository oder einem, das mit GitHub Pages veröffentlicht ist, enthalten Backups weder das, was du ausgeblendet hast, noch dein Anschreiben oder Daten aus importierten Dateien. Enthalten bleiben die Namen und Kontaktdaten deiner Referenzen sowie die Datei- und Ordnernamen, die du beim Export wählst; sie können das Unternehmen nennen, bei dem du dich bewirbst. Wenn du ein privates Repository später öffentlich machst oder mit GitHub Pages veröffentlichst, kann auch das öffentlich werden, was schon darin liegt.',
    remember_pat: 'Token dauerhaft in diesem Browser speichern',
    remember_pat_tip:
      'Falls deaktiviert, wird der Token nur für die aktuelle Sitzung gespeichert und beim Schließen des Tabs gelöscht.',
    repo_name: 'Repository-Name',
    show_token: 'Token anzeigen',
  },
  interface: {
    appearance: 'Erscheinungsbild',
    install: {
      action: 'KiwiCV installieren',
      description: 'Öffne KiwiCV wie jede andere App in einem eigenen Fenster.',
      installed: 'Auf diesem Gerät installiert',
      ios_hint: 'Tippe auf „Teilen“ und dann auf „Zum Home-Bildschirm“.',
      label: 'App',
      unsupported:
        'Wenn dein Browser Apps installieren kann, findest du „Installieren“ in der Adressleiste oder im Menü.',
    },
    language: 'UI-Sprache',
    language_description: 'Wähle deine bevorzugte Sprache für die Benutzeroberfläche.',
    theme_description: 'Wähle deinen bevorzugten Design-Modus.',
    theme_options: {
      dark: 'Dunkel',
      light: 'Hell',
      system: 'System',
    },
    title: 'Benutzeroberfläche',
  },
  title: 'Einstellungen',
};
