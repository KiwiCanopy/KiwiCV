import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  fix_ai_proposal_diff:
    'KI-Vorschläge lassen sich jetzt leichter lesen und beantworten. Hinzugefügte und entfernte Zeilen haben nun eine eigene Tönung statt nur einer reinen Textfarbe, beide Optionen bleiben im Dark Mode gut lesbar und stehen direkt unter dem passenden Textabschnitt – links behältst du deine eigene Formulierung, rechts übernimmst du den Vorschlag.',
  fix_ai_stuck_dialog:
    'Ein hängengebliebener KI-Durchlauf blockiert das Fortschrittsfenster nicht mehr. Das Fenster ließ sich bei einem Stillstand nicht schließen, und ein Neuladen öffnete es direkt wieder und startete denselben Durchlauf erneut – der einzige Ausweg machte es also nur schlimmer. Jetzt bleibt es jederzeit schließbar, und nach dem Neuladen bleibt es zu.',
  fix_ai_translate_addon:
    'Das Aktivieren von „Meinen Lebenslauf auch übersetzen“ führt die Übersetzung jetzt auch wirklich aus. Das Sprachauswahlfeld daneben war standardmäßig auf die bisherige Sprache des Lebenslaufs eingestellt, was der Durchlauf als „nichts zu übersetzen“ interpretierte – der Lebenslauf kam zwar auf die Stellenanzeige abgestimmt zurück, blieb aber in der Ausgangssprache, ohne jeden Hinweis auf den verworfenen Wunsch.',
  fix_cover_letter_footer:
    'Die Unterschriftszeile unter deinem Anschreiben folgt nun deinen Einstellungen für „PDF-Fußzeile“, genau wie unter deinem Lebenslauf. Zuvor wurde das Datumsfeld oben im Brief übernommen – wer dieses Feld leerte, verlor auch die Datumsangabe bei der Unterschrift, und beide konnten nie voneinander abweichen.',
  fix_cvs_connect_button:
    'Das Verbinden von Cloud-Speicher aus „Meine Lebensläufe“ heraus funktioniert wieder durchgehend. Die Schaltfläche „Cloud-Speicher verbinden“ reagierte nicht, wenn du ohne verbundenen Anbieter angemeldet warst, und der nachfolgende Dialog bot lediglich einen Button, der dich auf dieselbe Seite zurückführte.',
};
