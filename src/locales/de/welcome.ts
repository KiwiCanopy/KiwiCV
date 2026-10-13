import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: 'Privat',
  choice_ai_desc:
    'Lade eine TXT-, PDF- oder Word-Datei hoch. Nichts wird zum Modell-Training verwendet.',
  choice_ai_paid: 'Kostenpflichtig',
  choice_ai_title: 'KI-Import',
  choice_direct_desc: 'Ich habe meinen Lebenslauf im KiwiCV Format.',
  choice_direct_title: 'Import als .json Datei',
  cloud_sync_desc:
    'Verwalte mehrsprachige Versionen und Cloud-Backups kostenlos in deiner eigenen privaten Cloud.',
  import_error: 'Fehler beim Importieren der Datei. Ungültiges Format.',
  import_success: 'Lebenslauf erfolgreich importiert!',
  import_success_with_warnings: 'Lebenslauf mit einigen Warnungen importiert.',
  onboarding_lang: {
    cta: "Los geht's!",
    cv_desc:
      'Bestimmt die Sprache der automatisch generierten Überschriften und Datumsformate in deinem CV.',
    cv_label: 'Sprache deines Lebenslaufs',
    description:
      'Richten wir deinen Workspace ein. Wähle die Sprache für die Benutzeroberfläche und deinen Lebenslauf aus.',
    note: 'Beide Einstellungen können später jederzeit geändert werden.',
    title: 'Willkommen bei KiwiCV',
    ui_desc: 'Zeigt Menüs, Optionen und Hilfetexte in dieser Sprache an.',
    ui_label: 'Sprache der Benutzeroberfläche',
  },
  tagline:
    'Standard-Lebensläufe scheitern an Algorithmen. Erstelle perfekt angepasste Versionen einfach an einem Ort.',
  title_import: 'Lebenslauf importieren',
};
