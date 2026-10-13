import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'Importazione IA',
      content:
        "Importa qui il tuo CV. Una volta caricato, questo pulsante diventa il tuo potente assistente IA per l'ottimizzazione. Cerca il {wardsymbol} nell'app.",
      title: 'Importazione e Assistente IA',
    },
    'google-drive': {
      badge: 'Sincronizzazione Cloud',
      content:
        'Sincronizza il tuo CV senza problemi con Google Drive per un facile accesso ovunque.',
      title: 'Integrazione Google Drive',
    },
    webhosting: {
      badge: 'Webhosting',
      content: 'Scopri come pubblicare il tuo CV come sito web personale in pochi minuti.',
      title: 'Hosting Web semplice',
    },
  },
  feat_ai_import_assistant:
    "Un nuovo modo per iniziare! KiwiCV ora consente di importare i contenuti del curriculum con l'aiuto di LLM esterni direttamente dall'editor. Questa funzione, precedentemente limitata al tour di benvenuto, è ora disponibile per tutti, consentendo una transizione senza intoppi da un semplice prompt a un curriculum dallo stile perfetto.",
  feat_brand_contact_modal:
    'Contatti diretti! Un nuovo modulo di contatto è stato aggiunto per rendere ancora più semplice la condivisione di feedback, la segnalazione di problemi o il suggerimento di nuove funzioni direttamente a KiwiCV.',
  feat_deletion_prevention:
    "Aggiunti prompt di conferma per l'eliminazione di elementi in tutte le sezioni per prevenire la perdita accidentale di dati.",
  feat_google_drive_sync:
    'La sincronizzazione con Google Drive è arrivata! KiwiCV ora supporta la sincronizzazione sicura con il tuo Google Drive personale, offrendo ancora più flessibilità per mantenere i tuoi dati sincronizzati su tutti i tuoi dispositivi. Il motore di sincronizzazione è stato completamente reinventato per supportare più provider contemporaneamente, il tutto mantenendo i tuoi dati rigorosamente sotto il tuo controllo per la massima privacy.',
  feat_language_aware_restore:
    "Scoperta intelligente del cloud. Che tu avvii un ripristino nelle impostazioni, acceda tramite Google Drive o riconfiguri la tua connessione GitHub, KiwiCV rileva intelligentemente i backup disponibili in background. Con un solo clic, puoi ripristinare l'esatta versione linguistica di cui hai bisogno.",
  feat_localized_language_display:
    "Localizzazione migliorata. I selettori della lingua del CV sono ora tradotti nella lingua dell'interfaccia corrente, mentre la selezione della lingua dell'interfaccia rimane nella sua forma nativa per una migliore accessibilità.",
  feat_robust_manual_import:
    "Importazione manuale robusta. Sebbene KiwiCV offra ora il proprio modello di IA sicuro per l'importazione dei curricula, continuiamo a migliorare le funzionalità che supportano l'indipendenza dei nostri utenti. Copia direttamente il tuo CV da qualsiasi chat di IA (come Gemini o ChatGPT): il nostro importatore ora identifica e pulisce automaticamente gli artefatti fastidiosi come i tag di citazione o i blocchi Markdown.",
  fix_design_tab_overflow:
    "Migliore gestione dell'overflow e selezione dei temi centrata nella scheda di design per un'esperienza più equilibrata e accessibile su tutti i dispositivi.",
  fix_intelligent_address_cc:
    "Formattazione intelligente dell'indirizzo. KiwiCV ora nasconde in modo intelligente il codice del paese per i curriculum nazionali. Il paese appare solo quando la tua posizione differisce dalla lingua principale del curriculum, garantendo una presentazione più pulita e professionale.",
  fix_pagebreaks_reset_on_edit:
    "Risolto un problema per cui le interruzioni di pagina manuali venivano involontariamente rimosse dopo la modifica dei contenuti. Il tuo layout personalizzato ora resta esattamente come l'hai impostato.",
  fix_project_keywords_cleanup:
    'Pulizia dei dati. Rimossi i campi parola chiave non funzionali dalle sezioni Progetto e Progetto privato.',
  other_language_polish:
    'Perfezionato per un pubblico globale. I testi in diverse lingue sono stati affinati per rendere i flussi di lavoro per la creazione del curriculum più intuitivi e facili da navigare per tutti.',
  perf_high_growth_optimization:
    "Progettato per l'eccellenza. KiwiCV ha introdotto significativi miglioramenti delle prestazioni sotto il cofano per garantire un'esperienza fluida e reattiva mentre la piattaforma continua a evolversi e crescere.",
  refactor_language_certificate:
    'Rinominata la chiave JSON `languages.fluency` in `certificate` per riflettere meglio il suo scopo, con un fallback legacy per la compatibilità con le versioni precedenti.',
  refactor_sync_organization:
    "Perfezionato per coerenza. La cartella di archiviazione cloud è stata rinominata da 'backup' a 'backups' per allinearsi perfettamente alla struttura dei dati di KiwiCV. Il supporto legacy rimane attivo, garantendo che i dati esistenti continuino a essere identificati e sincronizzati correttamente.",
  ui_enhancements:
    "Elevando l'esperienza di creazione del curriculum. Abbiamo introdotto miglioramenti completi dell'interfaccia utente e perfezionamenti del layout per rendere KiwiCV più intuitivo, accessibile e facile da navigare in tutte le lingue supportate.",
  ui_improved_extras_section:
    "Aggiornamento completo del manuale. La sezione 'Come fare' è stata ripensata con nuovi consigli di layout, gestione delle interruzioni di pagina e guide ai backup multilingua.",
  ui_multi_cloud_interface:
    "Gestione multi-cloud senza interruzioni. L'interfaccia utente è stata perfezionata per gestire elegantemente più servizi di sincronizzazione contemporaneamente, offrendo una visione chiara e intuitiva dello stato di sincronizzazione dei dati.",
  ui_refined_experience:
    "Esperienza utente raffinata. Sottili miglioramenti dell'interfaccia utente e regolazioni del layout sono stati implementati in tutta la piattaforma per garantire un percorso di creazione del curriculum più curato e intuitivo.",
  ui_swedish_support:
    "Välkommen! KiwiCV supporta ora ufficialmente lo svedese. Goditi un'esperienza completamente localizzata, dall'editor al tuo curriculum esportato.",
};
