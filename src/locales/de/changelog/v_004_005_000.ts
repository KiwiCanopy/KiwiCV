import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Eigene Abschnitte',
      content:
        'Dein Lebenslauf ist nicht mehr auf die Standardabschnitte beschränkt. Füge eigene hinzu – Konferenzen, Schlüsselerfolge, alles, was deine Geschichte erzählt –, befülle sie wie jeden anderen Abschnitt, und sie passen zu jedem Design, in der Vorschau und im PDF. „Mit KI verbessern“ und das Übersetzen funktionieren auch dort.',
      title: 'Deine eigenen Abschnitte',
    },
  },
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  feat_custom_sections:
    'Füge deinem Lebenslauf eigene Abschnitte hinzu – Konferenzen, Schlüsselerfolge oder alles, was die Standardabschnitte nicht abdecken. „Abschnitt hinzufügen“ findest du am Ende der Abschnittsliste: Vergib einen Titel und befülle den Abschnitt mit Einträgen wie jeden anderen – Name, Datum, Link, Zusammenfassung und Highlights. Eigene Abschnitte fügen sich in jedes Design ein, in der Vorschau und im PDF, und lassen sich im Layout-Editor wie alle anderen zwischen den Spalten verschieben. „Mit KI verbessern“ funktioniert für sie und für jeden ihrer Einträge, und beim Übersetzen deines Lebenslaufs werden auch ihre Titel und Einträge übersetzt.',
  feat_json_round_trip:
    'Beim Import einer CV-Datei aus einem anderen Tool geht nicht mehr verloren, was KiwiCV nicht anzeigen kann. Zusätzliche Blöcke in der Datei sowie die Rollen und Schlagworte deiner Projekte bleiben bei deinem Lebenslauf erhalten und kommen unverändert zurück, wenn du ihn exportierst oder in Google Drive oder in einem privaten GitHub-Repository sicherst. Sie erscheinen nie in deinem Lebenslauf und gelangen nie zur KI, und der Import sagt dir, welche Blöcke er behalten hat.',
  feat_privacy_by_design:
    'KiwiCV richtet seine Abläufe weiter an deiner Privatsphäre aus. Ein GitHub-Repository, das jeder lesen kann – öffentlich oder mit GitHub Pages veröffentlicht –, erhält jetzt nur noch, was dein Lebenslauf zeigt: Ausgeblendete Einträge, weggelassene Adressbestandteile und dein Anschreiben bleiben draußen. Ein privates Repository behält die vollständige Sicherung, und der Verbindungsdialog sagt dir, welcher Fall vorliegt. Fotos in einer importierten Lebenslauf-Datei verlieren vor dem Speichern ihre Kamera-Metadaten, einschließlich des GPS-Standorts.',
  fix_hidden_entries_stay_hidden:
    'Was du ausblendest, bleibt ausgeblendet. Das Bearbeiten, Verschieben, Sortieren oder Löschen eines anderen Eintrags konnte einen ausgeblendeten zurückholen – ebenso eine KI-Neuordnung deiner Kompetenzen oder die Beispielvorschau eines leeren Lebenslaufs. Dieselben Aktionen übernehmen außerdem nicht mehr stillschweigend einen KI-Vorschlag, den du noch nicht beantwortet hast.',
  fix_keyboard_screen_reader:
    'Reibungsloser mit Tastatur und Screenreader: Ein neuer erster Eintrag öffnet sich sofort, das Netzwerk-Feld funktioniert als richtige Liste, und Schaltflächen werden mit ihrem Namen angesagt.',
  fix_language_polish:
    'Sprachfeinschliff in der ganzen App: korrigierte Abschnittsüberschriften auf Italienisch, Bulgarisch, Türkisch und Portugiesisch, ein Großbuchstabe İ mit Punkt in türkischen Lebensläufen, die letzten englischen Bildschirme übersetzt und echte Beispielinhalte in einem leeren Lebenslauf in zwölf Sprachen.',
  fix_reduced_json_hides_sections:
    'Das „Reduziert“-JSON auf der Seite „Rohdaten (JSON)“ lässt jetzt alles weg, was dein Lebenslauf ausblendet – einen ausgeblendeten Abschnitt und ein ausgeblendetes Profilfoto –, ebenso die Adressbestandteile, die dein Lebenslauf weglässt, und Projektfelder, die nur aus einer importierten Datei stammen.',
};
