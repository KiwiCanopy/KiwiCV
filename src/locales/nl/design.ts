import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Actieve velden (Sleep om te sorteren)',
  address_schema_apply_template: 'Sjabloon toepassen',
  address_schema_available_fields: 'Beschikbare velden (Klik om toe te voegen)',
  address_schema_desc:
    'Formatteer je adresblokweergave en scheidingstekens onafhankelijk van de CV-taal.',
  address_schema_mode_custom: 'Aangepast',
  address_schema_mode_default: 'Taalafhankelijk',
  address_schema_mode_default_desc:
    'Het schema past zich automatisch aan de taal van je CV aan. Als dit afwijkt van de ingestelde weergavetaal, wordt ook de landcode toegevoegd. Kies voor "{customLayout}" voor meer aanpassingsmogelijkheden.',
  address_schema_mode_label: 'Opmaakmodus',
  address_schema_no_active_fields:
    'Geen actieve velden. Klik hieronder op velden om ze toe te voegen.',
  address_schema_preset_european: 'Europese stijl',
  address_schema_preset_us_ca: 'US/CA-stijl',
  address_schema_restore: 'Standaard herstellen',
  address_schema_separator_comma: 'Komma',
  address_schema_separator_dash: 'Streepje',
  address_schema_separator_space: 'Spatie',
  address_schema_title: 'Adresweergave-beheer',
  address_schema_toggle_separator: 'Schakel scheidingsteken tussen komma en spatie',
  bold_header: {
    desc: 'Kies welke details als vette koptekst (hoofdregel) moeten worden weergegeven',
    title: 'Modus voor vette koptekst',
  },
  color_chooser: 'Kleurschema',
  column_empty: 'Geen secties',
  design_filter: {
    one_column: 'Eén kolom',
    two_column: 'Twee kolommen',
  },
  empty_sections_subtitle:
    'Deze secties zijn nog leeg. Weet je zeker dat je niets wilt toevoegen? Elk detail telt.',
  empty_sections_title: 'Aanvullende beschikbare secties',
  example_section: 'Voorbeeldsectie',
  formatting: 'opmaak',
  groups: {
    details: 'Details',
    layout: 'Indeling',
    typography: 'Typografie',
  },
  layout_flip: 'Lay-out spiegelen',
  layout_main_column: 'Hoofdkolom',
  layout_side_column: 'Zijbalk',
  layout_swap_tooltip: 'Verplaats naar andere kolom',
  more_actions_named: 'Meer acties voor “{{name}}”',
  page_break_disabled_first: 'Pagina-einde niet beschikbaar voor het eerste item',
  page_break_disabled_hidden: 'Pagina-einde niet beschikbaar voor verborgen secties',
  page_break_named: 'Pagina-einde vóór “{{name}}”',
  page_break_removal_tooltip:
    'Pagina-einde vóór deze sectie verwijderen (geldt alleen voor de PDF-versie)',
  page_break_tooltip: 'Pagina-einde vóór deze sectie toevoegen (geldt alleen voor de PDF-versie)',
  pdf_footer: {
    date: 'Datum opnemen',
    desc: 'Handtekeningregel, plaats en datum onderaan invoegen',
    location: 'Locatie opnemen',
    show: 'Voettekst tonen',
    title: 'PDF-voettekst',
  },
  section_reordering: {
    hint: 'Secties verschijnen in deze volgorde in je CV. Sleep een rij aan de handgreep om deze te verplaatsen.',
    hint_touch:
      'Secties verschijnen in deze volgorde in je CV. Gebruik de pijlen om een rij te verplaatsen, of houd de handgreep ingedrukt en sleep.',
    title: 'Sectievolgorde',
  },
  signature: {
    add: 'Handtekening toevoegen',
    backup_delete_failed:
      'Your signature is removed from this device, but its backup copy could not be deleted. Delete KiwiCV/signature/signature.json in Google Drive or signature/signature.json in GitHub yourself.',
    backup_failed:
      'Je handtekening is op dit apparaat opgeslagen, maar de back-up kon niet worden bijgewerkt.',
    backup_github_history:
      'Verwijderen haalt hem uit je repository; eerdere versies in de geschiedenis behouden hem.',
    backup_label: 'Ook een kopie opslaan in {{targets}}',
    backup_note: 'Opgeslagen op dit apparaat en in {{targets}}. PDF’s die je maakt bevatten hem.',
    backup_unreachable:
      "Saved on this device. Your backup copy can't be reached right now. PDFs you create include it.",
    change: 'Wijzigen',
    commit_removed: 'Back-up van handtekening verwijderen',
    commit_saved: 'Back-up van handtekening maken',
    crop_description:
      'Snijd de afbeelding bij, draai of spiegel hem. Daarna wordt de papieren achtergrond verwijderd.',
    crop_title: 'Handtekening bijsnijden',
    device_note:
      'Alleen op dit apparaat opgeslagen, buiten je back-ups en synchronisatie. PDF’s die je maakt bevatten hem.',
    dialog_title: 'Je handtekening',
    draw_hint: 'Teken met je muis, vinger of pen.',
    draw_label: 'Tekenvlak voor je handtekening',
    edit_label: 'Handtekening wijzigen',
    face_unavailable: 'Deze stijl kan niet elke letter van deze naam tonen.',
    footer_off: 'Verschijnt in de PDF-voettekst, die uit staat.',
    preview_alt: 'Je handtekening',
    restore_found: 'Je back-up bevat een opgeslagen handtekening.',
    restore_use: 'Gebruiken',
    row_empty: 'Geen handtekening op dit apparaat',
    row_label: 'Handtekening',
    tab_draw: 'Tekenen',
    tab_type: 'Typen',
    tab_upload: 'Uploaden',
    type_name: 'Naam',
    type_style: 'Stijl',
    type_unavailable:
      'Handschriftstijlen kunnen niet elke letter van deze naam tonen. Teken of upload hem in plaats daarvan.',
    upload_another: 'Kies een andere',
    upload_choose: 'Kies een afbeelding',
    upload_empty:
      'Geen handtekening gevonden in deze afbeelding. Een donkere pen op wit papier werkt het best.',
    upload_hint:
      'Een foto of scan op wit papier. De achtergrond wordt op dit apparaat verwijderd. Je kunt ook een afbeelding plakken. Exporteer de handtekening vanuit Voorvertoning op macOS eerst als PNG.',
    upload_ready: 'Handtekening klaar. Controleer hem en sla daarna op.',
    upload_too_large: 'De afbeelding is te groot (max. {{size}} MB).',
    upload_unreadable: 'Dit bestand kan niet als afbeelding worden gelezen. Probeer PNG of JPG.',
    upload_working: 'Achtergrond wordt verwijderd…',
  },
  swap_column_named: '“{{name}}” naar andere kolom verplaatsen',
  template: 'Sjabloon',
};
