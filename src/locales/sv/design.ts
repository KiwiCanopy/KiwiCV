import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Aktiva fält (Dra för att sortera)',
  address_schema_apply_template: 'Använd mall',
  address_schema_available_fields: 'Tillgängliga fält (Klicka för att lägga till)',
  address_schema_desc: 'Formatera layout och avgränzare för adressblocket oberoende av CV-språk.',
  address_schema_mode_custom: 'Anpassad',
  address_schema_mode_default: 'Språkbaserad',
  address_schema_mode_default_desc:
    'Schemat anpassas automatiskt till språket i ditt CV. Om detta skiljer sig från det inställda visningsspråket läggs även landskoden till. För fler anpassningsalternativ, välj "{customLayout}".',
  address_schema_mode_label: 'Layoutläge',
  address_schema_no_active_fields: 'Inga aktiva fält. Klicka på fält nedan för att lägga till.',
  address_schema_preset_european: 'Europeisk stil',
  address_schema_preset_us_ca: 'US/CA-stil',
  address_schema_restore: 'Återställ standard',
  address_schema_separator_comma: 'Komma',
  address_schema_separator_dash: 'Bindestreck',
  address_schema_separator_space: 'Mellanslag',
  address_schema_title: 'Hantera adresschema',
  address_schema_toggle_separator: 'Växla avgränzare mellan komma och mellanslag',
  bold_header: {
    desc: 'Välj vilka detaljer som ska visas som fet rubrik (huvudrad)',
    title: 'Fet rubrik',
  },
  color_chooser: 'Välj ditt färgschema',
  column_empty: 'Inga avsnitt',
  design_filter: {
    one_column: 'En kolumn',
    two_column: 'Två kolumner',
  },
  empty_sections_subtitle:
    'Det verkar som att dessa sektioner fortfarande är tomma. Är du säker på att du inte har något att lägga till? Även små detaljer kan göra skillnad.',
  empty_sections_title: 'Fler tillgängliga sektioner',
  example_section: 'Exempelsektion',
  formatting: 'formatering',
  groups: {
    details: 'Detaljer',
    layout: 'Layout',
    typography: 'Typografi',
  },
  layout_flip: 'Spegla layout',
  layout_main_column: 'Huvudkolumn',
  layout_side_column: 'Sidofält',
  layout_swap_tooltip: 'Flytta till den andra kolumnen',
  more_actions_named: 'Fler åtgärder för ”{{name}}”',
  page_break_add: 'Lägg till sidbrytning',
  page_break_disabled_first: 'Sidbrytning är inte tillgänglig för det första objektet',
  page_break_disabled_hidden: 'Sidbrytning är inte tillgänglig för dolda sektioner',
  page_break_removal_tooltip:
    'Ta bort sidbrytningen före denna sektion (gäller endast PDF-versionen)',
  page_break_remove: 'Ta bort sidbrytning',
  page_break_tooltip: 'Lägg till en sidbrytning före denna sektion (gäller endast PDF-versionen)',
  pdf_footer: {
    date: 'Inkludera datum',
    desc: 'Infoga signaturrad, plats och datum längst ner',
    location: 'Inkludera plats',
    show: 'Visa sidfot',
    title: 'PDF-sidfot',
  },
  section_reordering: {
    hint: 'Avsnitten visas i ditt CV i denna ordning. Dra en rad i handtaget för att flytta den.',
    hint_touch:
      'Avsnitten visas i ditt CV i denna ordning. Använd pilarna för att flytta en rad, eller håll i handtaget och dra.',
    title: 'Sektionsordning',
  },
  swap_column_named: 'Flytta ”{{name}}” till den andra kolumnen',
  template: 'Mall',
};
