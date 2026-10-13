import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Anschreiben',
      content:
        'Anschreiben ziehen in KiwiCV ein. Verfasse ein Anschreiben im exakten Design deines Lebenslaufs und exportiere beides zusammen als einheitliches Bewerbungspaket – keine unpassenden Dokumente mehr.',
      title: 'Anschreiben, perfekt abgestimmt',
    },
  },
  chore_ai_model_upgrade:
    'Die KI von KiwiCV läuft jetzt auf Googles neuester Gemini-Generation (Gemini 3.1) für spürbar bessere Vorschläge. Beim Datenschutz ändert sich nichts: Die Verarbeitung bleibt ausschließlich in der EU, DSGVO-konform, und deine Daten werden niemals zum Trainieren von KI-Modellen verwendet.',
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  feat_matching_cover_letters:
    'Gestalte ein Anschreiben, das zum Design deines Lebenslaufs passt, und exportiere beides zusammen als einheitliches Bewerbungspaket. Formatiere den Text fett, kursiv oder mit Links, wähle zwischen klassischem DIN 5008 und einem zum Design passenden Layout und passe Absender-, Empfänger- sowie Unterschriftenblöcke flexibel an.',
  fix_design_settings_reset:
    'Deine Design-Einstellungen bleiben jetzt beim Bearbeiten erhalten. Die Hervorhebung der Überschriften für Berufserfahrung und Ausbildung, ein benutzerdefiniertes Adress-Layout und der Zielpfad für das GitHub-Hosting wurden bisher ohne Warnung und ohne Rückgängig-Option auf die Standardwerte zurückgesetzt, sobald du einen Eintrag in einem beliebigen Listen-Abschnitt hinzugefügt, umsortiert oder bearbeitet hast. Auch benutzerdefinierte Abschnittsüberschriften aus einem importierten Lebenslauf bleiben nun bei jeder Änderung erhalten.',
  fix_elegant_page_breaks:
    'Manuelle Seitenumbrüche funktionieren jetzt im Theme Elegant. Das Aktivieren eines Umbruchs hatte bisher keine Auswirkung auf das exportierte PDF; jetzt beginnt genau an der gewünschten Stelle eine neue Seite, wie bei jedem anderen Theme.',
  fix_empty_custom_address_layout:
    'Ein benutzerdefiniertes Adress-Layout ohne nutzbare Felder löscht deine Adresse nicht mehr. Das Entfernen aller Felder aus dem benutzerdefinierten Layout unter Design hat bisher deine Adresse vollständig aus dem Lebenslauf und dem PDF entfernt, ohne dass auf dem Bildschirm der Grund erklärt wurde. KiwiCV greift nun stattdessen auf das Standard-Layout deines Landes zurück.',
  fix_footer_date_round_trip:
    'Das Deaktivieren des Datums in der Fußzeile des Lebenslaufs bleibt nun nach einem Export und erneuten Import erhalten, und ein selbst eingegebenes Datum wird exakt so übernommen, anstatt geleert zu werden.',
  fix_import_list_warnings:
    'Import-Warnungen decken jetzt auch Listen ab. Wenn KiwiCV etwas nicht lesen kann und aus den Highlights einer Stelle, den Kursen eines Abschlusses oder den Schlüsselwörtern einer Kompetenz entfernen muss, werden der Eintrag und das Feld in der Import-Zusammenfassung genannt, anstatt die Liste stillschweigend zu kürzen.',
  fix_import_warning_headings:
    'Import-Warnungen benennen jetzt den betroffenen Bereich deines Lebenslaufs – einschließlich deiner persönlichen Daten – anstelle einer internen Bezeichnung.',
  fix_imported_list_fields:
    'Eine Lebenslauf-Datei mit unvollständigen Aufzählungen bringt deine Vorschau nicht mehr durcheinander. Wenn in einem importierten JSON die Highlights einer Stelle, die Kurse eines Abschlusses oder die Schlüsselwörter einer Kompetenz als einzelner Textblock statt als Liste formatiert waren, wurden die Vorschau und das PDF nicht mehr gerendert. KiwiCV liest jetzt, was möglich ist, und überspringt den Rest.',
  fix_imported_text_fields:
    'Kontaktdaten im falschen Format beschädigen deinen Lebenslauf nicht mehr. Wenn in einer importierten Datei dein Name, deine Website, deine Telefonnummer oder deine Stadt nicht als einfacher Text vorlag, konnte die Vorschau oder das PDF vollständig abbrechen. KiwiCV liest jetzt, was möglich ist, und bereinigt überflüssige Leerzeichen um deinen Namen und deine Adresse, sodass Themes mit zweizeiliger Namensdarstellung keine leere erste Zeile mehr anzeigen.',
  fix_imported_theme_name:
    'Ein Lebenslauf, der mit einem unbekannten Design-Namen importiert wurde, zeigt jetzt wieder alle Abschnitte an, anstatt nahezu leer zu erscheinen.',
  fix_missing_sections_single_column:
    'Abschnitte, die du nach dem Umstrukturieren deines Layouts ausgefüllt hast, gehen bei einspaltigen Themes nicht mehr verloren – jeder Abschnitt mit Inhalt erscheint in der Vorschau und im exportierten PDF.',
  fix_pdf_special_characters:
    'Sonderzeichen und Links in deinem Lebenslauf werden jetzt in den PDFs aller Designs zuverlässig exportiert.',
  fix_preview_pdf_parity:
    'Was du siehst, entspricht jetzt dem, was du exportierst. Umbenannte Abschnittsüberschriften, designspezifische Details, die Symbole daneben und Projektbereiche bei mehreren zweispaltigen Themes konnten sich zwischen der Bildschirmvorschau und dem exportierten PDF unterscheiden – beide werden jetzt identisch gerendert.',
  fix_reload_repairs_cv:
    'Das Neuladen des Editors repariert beschädigte oder veraltete CV-Dateien jetzt automatisch im Hintergrund und verhindert so mögliche Abstürze bei der Vorschau und dem Export.',
  fix_signature_footer:
    'Der Unterschriftsbereich wurde korrigiert: Er lässt jetzt Platz für eine tatsächliche Unterschrift, erzwingt bei längeren Lebensläufen keine leere Endseite mehr und erscheint auf den Themes Elegant, Plain und Plain 2, auf denen er bisher fehlte.',
  fix_stackoverflow_page_breaks:
    'Manuelle Seitenumbrüche funktionieren wieder im Theme Stack Overflow. Bisher verhinderte ein manueller Umbruch die Erstellung des PDFs vollständig; Vorschau und Export brechen nun exakt an der von dir gewählten Stelle um.',
  fix_theme_fonts:
    'Elegant, Timeless und JavaScript werden in der Vorschau jetzt in ihren Original-Schriftarten angezeigt. Bisher wurde in der Vorschau auf eine Standard-Systemschrift zurückgegriffen, und das Timeless-PDF nutzte beim Export noch eine andere Schrift – alle drei sehen auf dem Bildschirm nun genauso aus wie im fertigen Dokument.',
  fix_two_column_stray_breaks:
    'In den Themes Lunar, Misty und Swiss Grid zieht ein Abschnitt, dessen Einträge du vollständig ausgeblendet hast, seinen manuellen Seitenumbruch nicht mehr in das exportierte PDF mit – so entsteht keine leere Spalte anstelle des Abschnitts.',
  other_discord_community:
    'KiwiCV hat jetzt eine Discord-Community – ein Ort, um Feedback auszutauschen, Vorlagen anzufordern und sich gegenseitig bei der Jobsuche zu unterstützen. Ein Link wartet in der Fußzeile und auf der Startseite.',
  other_export_no_google_fonts:
    'Beim Öffnen eines exportierten HTML-Lebenslaufs wird Google nicht mehr für Schriftarten kontaktiert. Es werden dieselben Schriftdateien verwendet, die KiwiCV bereits bereitstellt, sodass die Seite identisch gerendert wird, ohne dass jemand anderes davon erfährt, dass du ihn geöffnet hast.',
  other_import_clear_warning:
    'Die Import-Zusammenfassung warnt dich jetzt deutlich, wenn Nicht-Text-Werte aus reinen Textfeldern gelöscht werden, anstatt sie stillschweigend zu leeren.',
  other_kiwicanopy_family:
    'Lerne den Rest der KiwiCanopy-Familie kennen – KiwiCV verlinkt jetzt auf der Über-uns-Seite direkt zu KiwiCanopy und KiwiDesk.',
};
