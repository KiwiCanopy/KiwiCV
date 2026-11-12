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
  signature: {
    add: 'Aggiungi firma',
    backup_failed:
      'La tua firma è salvata su questo dispositivo, ma non è stato possibile aggiornare il backup.',
    backup_github_history:
      'Rimuoverla la elimina dal tuo repository; le versioni precedenti nella sua cronologia la conservano.',
    backup_label: 'Salva anche una copia su {{targets}}',
    backup_note: 'Salvata su questo dispositivo e su {{targets}}. I PDF che crei la includono.',
    change: 'Cambia',
    commit_removed: 'Rimuovi backup della firma',
    commit_saved: 'Salva backup della firma',
    crop_description:
      "Ritaglia, ruota o rifletti l'immagine. Lo sfondo della carta viene rimosso dopo.",
    crop_title: 'Ritaglia la tua firma',
    device_note:
      'Salvata solo su questo dispositivo, fuori dai tuoi backup e dalla sincronizzazione. I PDF che crei la includono.',
    dialog_title: 'La tua firma',
    draw_hint: 'Disegna con il mouse, il dito o una penna.',
    draw_label: 'Area di disegno per la tua firma',
    edit_label: 'Cambia firma',
    face_unavailable: 'Questo stile non può mostrare tutte le lettere di questo nome.',
    footer_off: 'Appare nel piè di pagina PDF, che è disattivato.',
    preview_alt: 'La tua firma',
    restore_found: 'Il tuo backup contiene una firma salvata.',
    restore_use: 'Usala',
    row_empty: 'Nessuna firma su questo dispositivo',
    row_label: 'Firma',
    tab_draw: 'Disegna',
    tab_type: 'Scrivi',
    tab_upload: 'Carica',
    type_name: 'Nome',
    type_style: 'Stile',
    type_unavailable:
      'Gli stili calligrafici non possono mostrare tutte le lettere di questo nome. Disegna o carica la firma.',
    upload_another: "Scegline un'altra",
    upload_choose: "Scegli un'immagine",
    upload_empty:
      'Nessuna firma trovata in questa immagine. Una penna scura su carta bianca funziona meglio.',
    upload_hint:
      "Una foto o una scansione su carta bianca. Lo sfondo viene rimosso su questo dispositivo. Puoi anche incollare un'immagine. Da Anteprima di macOS, esporta prima la firma come PNG.",
    upload_ready: 'Firma pronta. Controllala, poi salva.',
    upload_too_large: "L'immagine è troppo grande (max {{size}} MB).",
    upload_unreadable: 'Questo file non può essere letto come immagine. Prova con PNG o JPG.',
    upload_working: 'Rimozione dello sfondo…',
  },
  swap_column_named: "Sposta «{{name}}» nell'altra colonna",
  template: 'Modello',
};
