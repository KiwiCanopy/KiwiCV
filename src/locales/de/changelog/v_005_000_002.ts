import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  fix_composer_translate_tick:
    'Nachdem „Mit KI verbessern“ deinen Lebenslauf übersetzt hat, übersetzt der nächste Durchlauf ihn nicht erneut: „Meinen Lebenslauf auch übersetzen“ schaltet sich jetzt von selbst aus, sobald die Übersetzung da ist.',
  fix_pending_bar_wraps:
    'In einem schmalen Editor bricht die Leiste mit den KI-Vorschlägen ihre Schaltflächen jetzt um, sodass „Alle verwerfen“ nicht mehr abgeschnitten wird.',
  fix_skills_false_change:
    'Kompetenzen, die du nicht angefasst hast, erscheinen nach „Mit KI verbessern“ oder einer Übersetzung nicht mehr als geändert, und wenn du die Änderungen einer Übersetzung verwirfst, fallen deine Kompetenzen nicht mehr in die alte Sprache zurück.',
  fix_skills_reorder_is_change:
    'Ändert „Mit KI verbessern“ nur die Reihenfolge deiner Kompetenzen, bekommst du das jetzt als Änderung zur Prüfung angeboten – mit markierten verschobenen Kompetenzen – statt „Unverändert“ zu sehen.',
  ui_composer_addon_summary:
    'Bei geschlossener KI-Leiste im Modus „Professionell“ stehen die Optionen, die mitlaufen – etwa eine Übersetzung oder eine Neustrukturierung der Kompetenzen –, jetzt neben „Lebenslauf verbessern“; ein Klick darauf öffnet die Leiste.',
  ui_export_closes_on_success:
    'Nach einem vollständig erfolgreichen Export schließt sich der Export-Dialog jetzt von selbst, und ein Hinweis bestätigt das zehn Sekunden lang. Schlägt ein Ziel fehl, bleibt der Dialog offen, damit du es erneut versuchen kannst.',
  ui_export_improve_apart:
    '„Exportieren“ und „Lebenslauf verbessern“ lassen sich jetzt leichter unterscheiden: „Verbessern“ steht nun am Anfang der KI-Leiste, und „Exportieren“ in der Kopfzeile ist nicht mehr grün. Arbeitest du mit einer Stellenanzeige oder eigenen Anweisungen, wartet „Verbessern“, bis die Leiste offen ist – so läuft es nie mit Text, den du nicht sehen kannst.',
  ui_page_break_toggle_on_row:
    'Die Schaltfläche für Seitenumbrüche ist wieder in jeder Abschnittszeile im Tab „Design“, sodass du auf einen Blick siehst, wo eine neue PDF-Seite beginnt.',
};
