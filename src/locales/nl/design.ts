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
  page_break_add: 'Pagina-einde toevoegen',
  page_break_disabled_first: 'Pagina-einde niet beschikbaar voor het eerste item',
  page_break_disabled_hidden: 'Pagina-einde niet beschikbaar voor verborgen secties',
  page_break_removal_tooltip:
    'Pagina-einde vóór deze sectie verwijderen (geldt alleen voor de PDF-versie)',
  page_break_remove: 'Pagina-einde verwijderen',
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
  swap_column_named: '“{{name}}” naar andere kolom verplaatsen',
  template: 'Sjabloon',
};
