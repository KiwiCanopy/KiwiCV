import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Campi attivi (Trascina per riordinare)',
  address_schema_apply_template: 'Applica modello',
  address_schema_available_fields: 'Campi disponibili (Clicca per includere)',
  address_schema_desc:
    "Formatta il layout del blocco dell'indirizzo e i separatori in modo indipendente dalla lingua del CV.",
  address_schema_mode_custom: 'Personalizzato',
  address_schema_mode_default: 'In base alla lingua',
  address_schema_mode_default_desc:
    'Lo schema si adatta automaticamente alla lingua del tuo CV. Se questa differisce dalla lingua di visualizzazione impostata, viene aggiunto anche il codice del paese. Per ulteriori opzioni di personalizzazione, scegli "{customLayout}".',
  address_schema_mode_label: 'Modalità layout',
  address_schema_no_active_fields:
    'Nessun campo attivo. Clicca sui campi sottostanti per aggiungerli.',
  address_schema_preset_european: 'Stile europeo',
  address_schema_preset_us_ca: 'Stile US/CA',
  address_schema_restore: 'Ripristina predefinito',
  address_schema_separator_comma: 'Virgola',
  address_schema_separator_dash: 'Trattino',
  address_schema_separator_space: 'Spazio',
  address_schema_title: "Gestione dello schema dell'indirizzo",
  address_schema_toggle_separator: 'Alterna il separatore tra virgola e spazio',
  bold_header: {
    desc: 'Scegli quali dettagli visualizzare come intestazione in grassetto (riga principale)',
    title: 'Modalità intestazione in grassetto',
  },
  color_chooser: 'Schema colori',
  column_empty: 'Nessuna sezione',
  design_filter: {
    one_column: 'Una colonna',
    two_column: 'Due colonne',
  },
  empty_sections_subtitle:
    'Queste sezioni sono ancora vuote. Sei sicuro di non aver nulla da aggiungere? Ogni dettaglio conta.',
  empty_sections_title: 'Sezioni aggiuntive disponibili',
  example_section: 'Sezione di esempio',
  formatting: 'formattazione',
  groups: {
    details: 'Dettagli',
    layout: 'Layout',
    typography: 'Tipografia',
  },
  layout_flip: 'Specchia layout',
  layout_main_column: 'Colonna principale',
  layout_side_column: 'Colonna laterale',
  layout_swap_tooltip: "Sposta nell'altra colonna",
  more_actions_named: 'Altre azioni per «{{name}}»',
  page_break_disabled_first: 'Interruzione di pagina non disponibile per il primo elemento',
  page_break_disabled_hidden: 'Interruzione di pagina non disponibile per le sezioni nascoste',
  page_break_named: 'Interruzione di pagina prima di «{{name}}»',
  page_break_removal_tooltip:
    "Rimuovi l'interruzione di pagina prima di questa sezione (si applica solo alla versione PDF)",
  page_break_tooltip:
    "Aggiungi un'interruzione di pagina prima di questa sezione (si applica solo alla versione PDF)",
  pdf_footer: {
    date: 'Includi data',
    desc: 'Inserire la riga della firma, il luogo e la data in fondo alla pagina',
    location: 'Includi luogo',
    show: 'Mostra piè di pagina',
    title: 'Piè di pagina PDF',
  },
  section_reordering: {
    hint: 'Le sezioni appaiono nel tuo CV in questo ordine. Trascina una riga tramite la maniglia per spostarla.',
    hint_touch:
      'Le sezioni appaiono nel tuo CV in questo ordine. Usa le frecce per spostare una riga, oppure tieni premuta la maniglia e trascina.',
    title: 'Ordine delle sezioni',
  },
  swap_column_named: "Sposta «{{name}}» nell'altra colonna",
  template: 'Modello',
};
