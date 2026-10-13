import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      "KiwiCV è uno dei diversi strumenti creati sotto l'ombrello di KiwiCanopy. Esplora il resto della famiglia.",
    family_title: 'Parte della famiglia KiwiCanopy',
    kiwicanopy_desc: 'La casa della famiglia KiwiCanopy, dove tutti gli strumenti convivono.',
    kiwidesk_desc: "Un'applicazione sorella della famiglia KiwiCanopy.",
    story_p1:
      'Che sia per me stesso o parlando con amici e conoscenti, ho vissuto ripetutamente la stessa frustrazione: la fatica di riscrivere il curriculum per ogni nuova candidatura. Tutti desiderano adattare le proprie esperienze in modo mirato alla posizione specifica, ohne dass der CV erscheint. Ma gli strumenti tradizionali rendono proprio questo un tormento: per ogni piccolo aggiustamento, spesso è necessario creare un documento completamente nuovo, il che si trasforma rapidamente in un caos infinito di versioni.',
    story_p2:
      "È proprio per questo motivo che ho creato KiwiCV: un generatore di curriculum modulare in cui è possibile attivare e disattivare facilmente le singole sezioni, spostare i segmenti liberamente ed esportare in modo flessibile – il tutto da un'unica panoramica centrale. Niente più noiosi copia-incolla tra innumerevoli documenti Word. Tutta la tua storia lavorativa trova una casa permanente e tu scegli in totale relax solo ciò che vuoi mostrare per ogni candidatura.",
    story_title: 'La storia dietro KiwiCV',
    title: 'Informazioni su KiwiCV',
    visit_site: 'Visita il sito',
  },
  howto: {
    core: {
      ai_assistant: 'Assistente IA',
      ai_assistant_desc:
        "Usa l'assistente IA per ottimizzare singoli elementi, sezioni o l'intero CV. Cerca l'icona {wardsymbol}!",
      hide_show: 'Nascondi/Mostra',
      hide_show_desc:
        'Per evitare di dover rimuovere e reinserire costantemente le voci, puoi nascondere singoli elementi o intere sezioni con un clic.',
      move_items_desc:
        'Trascina sezioni o singoli elementi tra la barra laterale e la colonna principale.',
      page_breaks: 'Interruzioni di pagina',
      page_breaks_desc:
        "Inserisci interruzioni di pagina manuali per assicurarti che l'export PDF sia perfetto. Questo influisce solo sul PDF, non sulla versione web.",
      rearrange: 'Riordina',
      rearrange_desc:
        'Riordina gli elementi in qualsiasi sezione per concentrarti su ciò che vuoi evidenziare.',
      switch_sides: 'Inverti colonne',
      switch_sides_desc:
        'Scambia facilmente la colonna principale e la barra laterale per trovare il layout migliore.',
      title: 'Funzioni base',
    },
    footer: {
      message: 'Speriamo che scrivere il tuo CV sia più divertente con KiwiCV! Buona fortuna!',
    },
    github: {
      create_pat_link: 'Crea token su GitHub',
      create_repo_link: 'Crea repository su GitHub',
      go_to_settings: 'Vai alle impostazioni',
      intro:
        'Collega il tuo curriculum a un repository GitHub per la gestione automatica multilingua, il controllo di versione e un semplice hosting. Segui questi tre passaggi:',
      pat_security_tip:
        "Suggerimento per la sicurezza: usa un Personal Access Token 'Fine-grained' con accesso in lettura/scrittura solo a 'Contents' per il tuo repository specifico. Ricordati di selezionare 'Only select repositories' e impostare la data di scadenza preferita.",
      step1_desc:
        'Crea un nuovo repository privato su GitHub. Puoi lasciarlo completamente vuoto per ora (non sono necessari README e .gitignore).',
      step1_title: 'Crea un repository',
      step2_desc:
        'Hai bisogno di un Personal Access Token (PAT) per consentire a KiwiCV di fare il push nel tuo repository. Raccomando un token fine-grained per la massima sicurezza.',
      step2_title: 'Crea un Personal Access Token',
      step3_desc:
        'Vai alla pagina Impostazioni e inserisci i dettagli del tuo repository e il token nella sezione GitHub. In alternativa, clicca sul pulsante GitHub in alto a destra per aprire un modulo in cui inserire anche il tuo PAT.',
      step3_title: 'Connetti in KiwiCV',
      title: 'Guida alla connessione GitHub',
    },
    hosting: {
      automated_title: 'Opzione B: Hosting automatizzato (via GitHub)',
      github_pages_desc:
        'Usa il file HTML generato da KiwiCV e caricalo in un repository GitHub. Abilita GitHub Pages nelle impostazioni del repository per ottenere un URL pubblico gratuito per il tuo curriculum.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Puoi ospitare gratuitamente la versione HTML generata del tuo curriculum. Ecco le opzioni più comuni:',
      manual_title: 'Opzione A: Caricamento manuale (non è richiesto GitHub)',
      netlify_desc:
        'Servizi come Netlify o Vercel offrono hosting statico gratuito con facile distribuzione drag-and-drop o sincronizzazione automatica con il tuo repository GitHub. Puoi caricare lì il tuo curriculum HTML senza esporre la cronologia delle modifiche.',
      netlify_drop_desc:
        'Assicuratevi un vantaggio competitivo con un URL personale. Esistono molti **fornitori gratuiti** dove è possibile mettere online il proprio CV **in pochi secondi**. Sia tramite lo strumento linkato sopra che tramite alternative come [Tiiny.host](https://tiiny.host): un rapido **drag-and-drop** del vostro sito web è tutto ciò che serve per avere una presenza professionale sul web.',
      netlify_drop_title: 'Veloce e facile: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        "Attenzione: a meno che tu non abbia un piano GitHub a pagamento, devi rendere pubblico il tuo repository per usare GitHub Pages. Ciò significa che l'intera cronologia del tuo curriculum (tutti i commit) sarà visibile a tutti! Se la privacy è importante per te, considera l'utilizzo della prima opzione.",
      push_folder_hint:
        'KiwiCV supporta esclusivamente il push del file HTML in una cartella specifica nel tuo repository. Controlla le impostazioni avanzate nella pagina di anteprima.',
      sensitive_data_warning:
        "Avviso sulla privacy: se ospiti il tuo curriculum su un URL pubblico, chiunque può accedere ai tuoi dati. Prendi in considerazione la rimozione di informazioni personali altamente sensibili come l'indirizzo esatto, il numero di telefono e l'e-mail.",
      title: 'Hosting del tuo curriculum',
    },
    pdf_guide: {
      font_size: 'Dimensione carattere',
      font_size_desc:
        'Regola la dimensione del carattere nella scheda Design per ottimizzare lo spazio.',
      intro:
        'La resa PDF è complessa. Sperimenta con le seguenti funzioni finché il documento non è perfetto:',
      rearrange_sections: 'Riordina',
      rearrange_sections_desc:
        'Riordinare le sezioni può correggere interruzioni di pagina sgradevoli.',
      space_opt: 'Ottimizzazione spazio',
      space_opt_desc: 'Spostare una sezione breve nella barra laterale può liberare spazio.',
      title: 'Suggerimenti layout PDF',
      use_pagebreaks: 'Usa interruzioni di pagina',
      use_pagebreaks_desc:
        'Gli elementi vicino al bordo possono essere visualizzati male. Usa le interruzioni per spostarli in modo pulito.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Il cambio di lingua attiva un controllo per verificare se esiste già una versione nel cloud.',
      auto_recognition_title: 'Riconoscimento automatico',
      desc: 'KiwiCV gestisce più lingue. Quando salvi o esegui un backup, l’app crea una versione specifica per la lingua attiva. In seguito, riconoscerà i backup esistenti per ripristinarli.',
      language_specific_desc:
        'Ogni versione linguistica è memorizzata come voce separata nel tuo repository cloud.',
      language_specific_title: 'Specifico per la lingua',
      title: 'Backup linguistici intelligenti',
    },
    toc_title: 'INDICE',
  },
  page_description:
    'Background, supporto e visione: scopri come ottenere il massimo da KiwiCV, dove siamo diretti e la storia dietro il tuo creatore di CV.',
  page_title: 'Extra',
  tabs: {
    about: 'Informazioni su KiwiCV',
    changelog: 'Changelog',
    howto: 'Guide',
    roadmap: 'Roadmap',
  },
};
