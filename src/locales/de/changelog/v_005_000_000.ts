import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Neu',
      content:
        'Noch unsicher, ob KiwiCV zu dir passt? Der neue 1-Tages-Pass schaltet bei deiner nächsten Bewerbung alle KI-Funktionen frei – so findest du es heraus, bevor du dich für einen längeren Pass entscheidest. Die Preiskarten bieten jetzt 1, 7 und 30 Tage.',
      title: 'Einen Tag lang testen',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Jede Zeile Code von KiwiCV ist jetzt unter der AGPL öffentlich auf GitHub. Sieh dir genau an, wie dein Lebenslauf verarbeitet wird, melde einen Fehler oder schlag eine Funktion vor: Den Code hinter den Datenschutzversprechen kann jeder selbst prüfen.',
      title: 'KiwiCV ist Open Source',
    },
  },
  feat_ai_review_calmer:
    'KI-Vorschläge kannst du jetzt in Ruhe überprüfen. Auch bei Kompetenzen und Sprachen vergleichst du sie jetzt Eintrag für Eintrag, umgeschriebene Felder bleiben gesperrt, bis du „Meine behalten“ oder „Vorschlag verwenden“ wählst, und „Verbessern“ wartet auf deine Entscheidung – so ersetzt ein zweiter Durchlauf keinen Vorschlag, den du noch nicht gesehen hast. Screenreader sagen jede Entscheidung an.',
  feat_ai_tailoring_keeps_facts:
    'Wenn du deinen Lebenslauf an eine Stellenanzeige anpasst, bleiben deine Positionen, Arbeitgeber, Zeitangaben und aufgeführten Kompetenzen jetzt unverändert. Eine Kompetenz, die in deinem Lebenslauf nirgends vorkommt, wird mit „Nicht in deinem CV – nur übernehmen, wenn es stimmt“ markiert – ob sie aufgenommen wird, entscheidest du.',
  feat_raw_data_extra_blocks:
    'Die Seite „Rohdaten (JSON)“ listet jetzt zusätzliche Daten auf, die eine importierte Datei mitgebracht hat, etwa den Einstellungsblock eines anderen Tools. Öffne einen Block, um sein JSON zu lesen, oder entferne die, die du nicht mehr in deinen Exporten haben möchtest.',
  fix_dates:
    'Datumsangaben mit dem Tag zuerst, etwa 05.06.19, werden jetzt als 5. Juni gelesen, nicht als 6. Mai. Ein Datum, das es nicht gibt, etwa 31.02.2019, bleibt so, wie du es eingegeben hast, und bekommt die rote Fehlermarkierung.',
  fix_drive_reconnect:
    'Das erneute Verbinden mit Google Drive läuft jetzt immer vollständig durch, aktiviert die Backups und beginnt mit einem echten Upload.',
  fix_photos:
    'Fotos in einem importierten Lebenslauf verlieren ihre Kamera-Metadaten, einschließlich des GPS-Standorts, und GIF-, HEIC- und AVIF-Fotos werden zu JPEG. Fotos mit transparentem Hintergrund bleiben nach dem Zuschneiden weiß, statt schwarz zu werden.',
  fix_preview_pdf_match:
    'Live-Vorschau und PDF stimmen jetzt in Soft, Misty, Skyline, Swiss Grid, Lunar und Elegant besser überein: dieselben Großbuchstaben, Zeitleisten, Schriften und Links. Die Vorschau lädt keine Schriften mehr von einem Drittanbieter-Server, und Titel und Autor eines PDFs enthalten nur deinen Namen.',
  fix_privacy_controls:
    'Du bestimmst, was auf diesem Gerät bleibt. Die Anmeldung mit Google fragt nur dann nach dauerhaftem Zugriff, wenn du Google Drive verbindest. Google Drive und GitHub lassen sich in den Einstellungen jederzeit trennen, beim Abmelden oder Löschen deines Kontos kannst du die GitHub-Verbindung gleich mit entfernen, und deine Schreibprobe bleibt bei dem Konto, mit dem du sie gespeichert hast.',
  fix_privacy_policy:
    'Die Datenschutzerklärung wurde neu geschrieben. Sie listet auf, was KiwiCV zu deinen KI-Anfragen speichert (nie deinen Text), nennt dein Widerspruchsrecht und wie du eine Einwilligung widerrufst, und benennt jeden beteiligten Dienst und wo er läuft.',
  fix_small_things:
    'Ein Tablet bei geöffnetem Seitenmenü zu drehen, blockiert das Tippen nicht mehr, der schwebende Vorschau-Button verdeckt das Smartphone-Menü nicht mehr, ein Tab, der während eines Updates offen war, lädt die neue Version, und ein Lebenslauf, der zu lang zum Übersetzen ist, wird sofort abgelehnt, statt nach langem Warten zu scheitern.',
  ui_editor_polish:
    'Wieder da? Die Startseite zeigt jetzt „Bearbeitung fortsetzen“, und „Lebenslauf erstellen“ öffnet direkt deine persönlichen Daten. Im Anschreiben stehen „Betreff“ und „Datum“ über dem Brieftext, und „Empfänger“ ist aufgeklappt, sobald ein Adressat eingetragen ist. „Verbessern“ bleibt auch bei einem leeren Abschnitt sichtbar und gibt einen Tipp, womit du anfangen kannst, und die KI-Zeichenzähler färben sich vor dem Limit bernsteinfarben.',
  ui_informal_address_more_languages:
    'Spanisch, Niederländisch, Russisch, Ukrainisch und Bulgarisch sprechen dich jetzt in der ganzen App informell an, wie die anderen Sprachen.',
  ui_install_app:
    'Nutze KiwiCV wie eine App: Unter Einstellungen → Benutzeroberfläche gibt es jetzt den Button „KiwiCV installieren“, und auf iPhone und iPad bekommt KiwiCV ein richtiges Symbol, wenn du es zum Home-Bildschirm hinzufügst.',
};
