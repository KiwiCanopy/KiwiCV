import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'In die Zwischenablage kopieren',
  data_label: 'Rohdaten',
  download: 'JSON herunterladen',
  full: 'Vollständig',
  full_desc: 'Meta + Sichtbarkeitsflags (Am besten für den Import in KiwiCV)',
  full_title: 'Vollständiger App Status',
  passthrough: {
    desc: 'Diese Daten bleiben erhalten, damit andere Tools deine Datei weiterhin lesen können. Sie sind in deinen JSON-Exporten und in deinen Drive- und privaten GitHub-Sicherungen enthalten, werden aber nie in deinem Lebenslauf angezeigt oder an die KI gesendet.',
    remove_confirm_message:
      'Dateien, die du aus KiwiCV exportierst, enthalten diesen Block nicht mehr. Dies kann nicht rückgängig gemacht werden.',
    remove_confirm_title: '„{{name}}“ entfernen?',
    removed_desc:
      'Deine nächste Synchronisierung ersetzt deine aktuelle Sicherung. Frühere Sicherungsstände und ältere Versionen, die Drive und GitHub aufbewahren, enthalten die Daten weiterhin, bis du sie dort löschst.',
    removed_title: '„{{name}}“ aus diesem Browser entfernt',
    title: 'Zusatzdaten aus einer importierten Datei',
  },
  reduced: 'Reduziert',
  reduced_desc: 'Versteckte Einträge entfernt',
  reduced_title: 'Reduziertes JSON',
  standard: 'Standard',
  standard_desc: 'Ohne Meta, alle Einträge',
  standard_title: 'Standard JSON',
};
