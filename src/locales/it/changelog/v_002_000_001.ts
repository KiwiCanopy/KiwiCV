import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Resta informato: Aggiunta una finestra 'Novità' che evidenzia le ultime funzionalità e i miglioramenti dopo un aggiornamento.",
  fix_html_preview_scrolling:
    'Risolto un problema per cui il pannello di anteprima HTML poteva diventare non scorrevole in alcuni browser.',
  fix_onboarding_tour_mobile_overlay:
    'Risolto un problema di posizionamento per cui la scheda del tour di benvenuto poteva sovrapporsi agli elementi evidenziati su schermi piccoli.',
  fix_sidebar_position_placeholders:
    'Risolto un problema che impediva di scambiare la posizione della sidebar con i dati di esempio.',
  fix_ui_header_action_bubbling:
    "Azioni dell'editor fluide: Attivare/disattivare la visibilità o aggiungere nuovi elementi nelle intestazioni delle sezioni non attiva più l'espansione o la compressione indesiderata.",
  perf_ats_rendering_optimization:
    'Ottimizzazione ATS: il contenuto della colonna principale ha ora la precedenza per gli screen reader in tutti i temi a due colonne.',
  refactor_backend_cleanup:
    'Pulizia del backend e dei metadati rimuovendo le chiavi obsolete dai file JSON generati per una struttura dati più compatta.',
  refactor_package_upgrades:
    "Importante ottimizzazione interna con l'aggiornamento a Node 24 (da Node 22) e Vite 8 per un'esperienza più sicura e moderna.",
  ui_interactive_3d_buttons:
    "Unificazione del design: Il sistema di pulsanti tattili 3D è stato uniformato in tutta l'applicazione per un feedback più coerente e sofisticato.",
  ui_section_field_ordering:
    "Campi del modulo dell'editor riorganizzati per allinearsi alla gerarchia visiva del CV reso.",
};
