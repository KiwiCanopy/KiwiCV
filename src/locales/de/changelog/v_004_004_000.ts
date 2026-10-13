import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'KI',
      content:
        'KiwiCV verfasst jetzt dein Anschreiben. Füge einfach die Stellenanzeige ein und erhalte ein Anschreiben, das auf deinem bestehenden Lebenslauf aufbaut – bestimme Länge sowie Tonfall oder gib eine Textprobe ab, damit KiwiCV deinen eigenen Schreibstil übernimmt. Der Vorschlag wird direkt neben deinem Entwurf angezeigt und lässt sich Absatz für Absatz übernehmen.',
      title: 'Anschreiben, für dich verfasst',
    },
  },
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  feat_ai_cover_letters:
    'Dein Anschreiben kann jetzt für dich verfasst werden – direkt aus einer Stellenanzeige und deinem bestehenden Lebenslauf. Wähle Länge und Tonfall oder hinterlege eine eigene Schreibprobe, damit KiwiCV genau diesen Stil trifft. Der Entwurf wird als Vorschlag neben deinem Text eingeblendet und lässt sich Absatz für Absatz übernehmen – ganz gleich, ob das Anschreiben noch leer oder bereits begonnen ist. Der Bereich öffnet sich nun direkt mit dem eigentlichen Brieftext statt mit fünf Feldern für eine Empfängeradresse, für die du noch gar keinen Text hattest.',
  fix_ai_large_cv_wait:
    'Das Verbessern oder Übersetzen eines großen Lebenslaufs bricht nicht mehr nach einer Minute mit einem Fehler ab – die Wartezeit wächst jetzt mit der Größe des Lebenslaufs.',
  fix_dates:
    'Datumsangaben verhalten sich wieder wie erwartet. Ein eingegebenes Datum konnte sich außerhalb Europas um einen Tag nach hinten verschieben, und eine einzelne Jahreszahl konnte ganz verloren gehen; die Datumsauswahl sprang bei einem Klick am Rand des Rasters unbemerkt in den Nachbarmonat samt neuem Jahr; und „Einträge chronologisch sortieren“ konnte Datumsangaben mit vorangestelltem Tag wie 15.03.2019 gar nicht lesen, sodass diese Einträge wie ohne Datum ganz nach unten rutschten.',
  fix_keyboard_navigation:
    'Die Bedienung mit der Tastatur wirft dich nicht mehr an den Seitenanfang zurück. Beim Schließen eines Dialogs landest du wieder auf der Schaltfläche, mit der du ihn geöffnet hast, das Löschen eines Eintrags oder eines gespeicherten Lebenslaufs springt zum nächsten Eintrag weiter, und beim Beantworten eines KI-Vorschlags bleibst du dort, wo du gerade gearbeitet hast. Auch dein Profilfoto lässt sich nun vollständig per Tastatur erreichen – zuvor reagierte die Kachel nur auf Mausklicks, sodass „Bearbeiten“, „Ersetzen“ und „Löschen“ unerreichbar blieben.',
  fix_main_badge_overlaps_label:
    'Der „main“-Badge neben einer Feldbezeichnung überdeckt nicht mehr den Beschriftungstext. Er wurde innerhalb eines Felds in Symbolgröße gerendert, sodass ein breiterer Badge darüber hinausragte und die benachbarten Worte überlagerte.',
};
