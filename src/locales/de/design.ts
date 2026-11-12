import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Aktive Felder (Ziehen zum Sortieren)',
  address_schema_apply_template: 'Template anwenden',
  address_schema_available_fields: 'Verfügbare Felder (Klicken zum Hinzufügen)',
  address_schema_desc:
    'Formatiere dein Adressblock-Layout und deine Trennzeichen unabhängig von der Lebenslaufsprache.',
  address_schema_mode_custom: 'Benutzerdefiniert',
  address_schema_mode_default: 'Sprachbasiert',
  address_schema_mode_default_desc:
    'Das Schema passt sich automatisch an die Sprache deines Lebenslaufs an. Weicht diese von der eingestellten Anzeigesprache ab, wird zusätzlich der Ländercode ergänzt. Für mehr Anpassungsmöglichkeiten wähle „{customLayout}“.',
  address_schema_mode_label: 'Layout-Modus',
  address_schema_no_active_fields:
    'Keine Felder aktiv. Klicke unten auf Felder, um sie hinzuzufügen.',
  address_schema_preset_european: 'Europäischer Stil',
  address_schema_preset_us_ca: 'US/CA-Stil',
  address_schema_restore: 'Standard wiederherstellen',
  address_schema_separator_comma: 'Komma',
  address_schema_separator_dash: 'Bindestrich',
  address_schema_separator_space: 'Leerzeichen',
  address_schema_title: 'Adressschema-Verwaltung',
  address_schema_toggle_separator: 'Trennzeichen zwischen Komma und Leerzeichen umschalten',
  bold_header: {
    desc: 'Wähle aus, welche Details als fette Überschrift (Hauptzeile) angezeigt werden sollen',
    title: 'Modus für fette Überschriften',
  },
  color_chooser: 'Wähle dein Farbschema',
  column_empty: 'Keine Abschnitte',
  design_filter: {
    one_column: 'Einspaltig',
    two_column: 'Zweispaltig',
  },
  empty_sections_subtitle:
    'Diese Abschnitte sind noch leer. Sicher, dass du hier nichts ergänzen möchtest? Jedes Detail zählt.',
  empty_sections_title: 'Zusätzlich verfügbare Abschnitte',
  example_section: 'Beispiel-Abschnitt',
  formatting: 'Formatierung',
  groups: {
    details: 'Details',
    layout: 'Layout',
    typography: 'Typografie',
  },
  layout_flip: 'Layout spiegeln',
  layout_main_column: 'Hauptspalte',
  layout_side_column: 'Seitenleiste',
  layout_swap_tooltip: 'In andere Spalte verschieben',
  more_actions_named: 'Weitere Aktionen für „{{name}}“',
  page_break_disabled_first: 'Seitenumbruch für das erste Element nicht verfügbar',
  page_break_disabled_hidden: 'Seitenumbruch für ausgeblendete Abschnitte nicht verfügbar',
  page_break_named: 'Seitenumbruch vor „{{name}}“',
  page_break_removal_tooltip:
    'Seitenumbruch vor diesem Abschnitt entfernen (gilt nur für die PDF-Version)',
  page_break_tooltip: 'Seitenumbruch vor diesem Abschnitt einfügen (gilt nur für die PDF-Version)',
  pdf_footer: {
    date: 'Datum anzeigen',
    desc: 'Unterschriftszeile, Ort und Datum am unteren Rand einfügen',
    location: 'Ort anzeigen',
    show: 'Fußzeile anzeigen',
    title: 'PDF-Fußzeile',
  },
  section_reordering: {
    hint: 'Die Abschnitte erscheinen in dieser Reihenfolge im Lebenslauf. Ziehe eine Zeile am Griff, um sie zu verschieben.',
    hint_touch:
      'Die Abschnitte erscheinen in dieser Reihenfolge im Lebenslauf. Nutze die Pfeile zum Verschieben oder halte den Griff gedrückt und ziehe.',
    title: 'Abschnittsreihenfolge',
  },
  signature: {
    add: 'Unterschrift hinzufügen',
    backup_delete_failed:
      'Deine Unterschrift ist von diesem Gerät entfernt, aber ihre Sicherungskopie konnte nicht gelöscht werden. Lösche KiwiCV/signature/signature.json in Google Drive oder signature/signature.json in GitHub selbst.',
    backup_failed:
      'Deine Unterschrift ist auf diesem Gerät gespeichert, aber die Sicherung konnte nicht aktualisiert werden.',
    backup_github_history:
      'Beim Entfernen wird sie aus deinem Repository gelöscht; frühere Versionen in seiner Historie behalten sie.',
    backup_label: 'Auch eine Kopie in {{targets}} speichern',
    backup_note:
      'Auf diesem Gerät und in {{targets}} gespeichert. PDFs, die du erstellst, enthalten sie.',
    backup_unreachable:
      'Auf diesem Gerät gespeichert. Deine Sicherungskopie ist gerade nicht erreichbar. PDFs, die du erstellst, enthalten sie.',
    change: 'Ändern',
    commit_removed: 'Sicherung der Unterschrift entfernen',
    commit_saved: 'Unterschrift sichern',
    crop_description:
      'Schneide das Bild zu, drehe oder spiegle es. Der Papierhintergrund wird danach entfernt.',
    crop_title: 'Unterschrift zuschneiden',
    device_note:
      'Nur auf diesem Gerät gespeichert, außerhalb deiner Sicherungen und Synchronisierung. PDFs, die du erstellst, enthalten sie.',
    dialog_title: 'Deine Unterschrift',
    draw_hint: 'Zeichne mit Maus, Finger oder Stift.',
    draw_label: 'Zeichenfläche für deine Unterschrift',
    edit_label: 'Unterschrift ändern',
    face_unavailable: 'Dieser Stil kann nicht jeden Buchstaben dieses Namens darstellen.',
    footer_off: 'Erscheint in der PDF-Fußzeile, die ausgeschaltet ist.',
    preview_alt: 'Deine Unterschrift',
    restore_found: 'Deine Sicherung enthält eine gespeicherte Unterschrift.',
    restore_use: 'Verwenden',
    row_empty: 'Keine Unterschrift auf diesem Gerät',
    row_label: 'Unterschrift',
    tab_draw: 'Zeichnen',
    tab_type: 'Tippen',
    tab_upload: 'Hochladen',
    type_name: 'Name',
    type_style: 'Stil',
    type_unavailable:
      'Handschrift-Stile können nicht jeden Buchstaben dieses Namens darstellen. Zeichne deine Unterschrift oder lade sie stattdessen hoch.',
    upload_another: 'Anderes Bild wählen',
    upload_choose: 'Bild auswählen',
    upload_empty:
      'In diesem Bild wurde keine Unterschrift gefunden. Am besten klappt ein dunkler Stift auf weißem Papier.',
    upload_hint:
      'Ein Foto oder Scan auf weißem Papier. Der Hintergrund wird auf diesem Gerät entfernt. Du kannst auch ein Bild einfügen. Exportiere die Unterschrift aus der macOS-App Vorschau zuerst als PNG.',
    upload_ready: 'Unterschrift bereit. Prüfe sie und speichere dann.',
    upload_too_large: 'Das Bild ist zu groß (max. {{size}} MB).',
    upload_unreadable: 'Diese Datei kann nicht als Bild gelesen werden. Versuche PNG oder JPG.',
    upload_working: 'Hintergrund wird entfernt…',
  },
  swap_column_named: '„{{name}}“ in andere Spalte verschieben',
  template: 'Template',
};
