import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Lettera di presentazione',
      content:
        'Le lettere di presentazione arrivano su KiwiCV. Scrivi una lettera che riprende l’esatto design del tuo curriculum ed esporta entrambi insieme come un unico pacchetto di candidatura elegante — mai più documenti scompagnati.',
      title: 'Lettere di presentazione, perfettamente abbinate',
    },
  },
  chore_ai_model_upgrade:
    "L'IA di KiwiCV ora funziona sulla nuova generazione Gemini di Google (Gemini 3.1) per suggerimenti notevolmente migliori. La privacy rimane invariata: l'elaborazione rimane esclusivamente nell'UE, conforme al GDPR, e i tuoi dati non vengono mai utilizzati per addestrare modelli di IA.",
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  feat_matching_cover_letters:
    'Crea una lettera di presentazione coordinata al design del tuo curriculum ed esporta entrambi insieme in un unico pacchetto di candidatura. Formatta il testo in grassetto, corsivo o con link, scegli tra un layout classico DIN 5008 o abbinato al tema, e mostra o nascondi i blocchi mittente, destinatario e firma per ogni candidatura.',
  fix_design_settings_reset:
    "Le tue impostazioni di Design rimangono ora invariate mentre modifichi il testo. La scelta dell'intestazione in grassetto per Esperienza Lavorativa ed Istruzione, il layout di indirizzo personalizzato e il percorso di destinazione GitHub venivano ripristinati ai valori predefiniti ogni volta che aggiungevi, riordinavi o modificavi un elemento in una sezione elenco, senza avvisi né possibilità di annullare. Anche le intestazioni di sezione personalizzate in un CV importato mantengono ora le tue modifiche.",
  fix_elegant_page_breaks:
    "Le interruzioni di pagina manuali funzionano ora anche sul tema Elegant. Selezionare un'interruzione non aveva alcun effetto sul PDF esportato; ora una nuova pagina inizia esattamente dove richiesto, come in tutti gli altri temi.",
  fix_empty_custom_address_layout:
    "Un layout di indirizzo personalizzato privo di campi validi non cancella più il tuo indirizzo. Rimuovere tutti i campi dal layout personalizzato in Design eliminava completamente l'indirizzo dal CV e dal PDF senza alcuna spiegazione a schermo. KiwiCV utilizza ora il layout standard del tuo paese.",
  fix_footer_date_round_trip:
    "La disattivazione della data nel piè di pagina del CV rimane ora attiva dopo l'esportazione e la ri-importazione, e le date inserite manualmente vengono conservate esattamente come scritte invece di essere cancellate.",
  fix_import_list_warnings:
    "Gli avvisi di importazione includono ora anche gli elenchi. Quando KiwiCV deve ignorare un elemento non leggibile tra i punti salienti di un lavoro, i corsi di uno studio o le parole chiave di una competenza, indica l'elemento e il campo nel riepilogo di importazione invece di accorciare l'elenco in silenzio.",
  fix_import_warning_headings:
    "Gli avvisi di importazione indicano ora la sezione del CV da cui provengono, compresi i tuoi dati personali, al posto di un'etichetta interna.",
  fix_imported_list_fields:
    "Un file CV con elenchi puntati non formattati correttamente non interrompe più l'anteprima. Se un file JSON importato salvava i punti salienti di un lavoro, i corsi di uno studio o le parole chiave di una competenza come un'unica riga di testo anziché come elenco, l'anteprima e il PDF smettevano di funzionare. KiwiCV legge ora i dati validi e ignora il resto.",
  fix_imported_text_fields:
    "I dati di contatto in un formato errato non danneggiano più il tuo CV. Se un file importato salvava il tuo nome, sito web, telefono o città in un formato diverso dal testo semplice, l'anteprima o il PDF potevano bloccarsi del tutto. KiwiCV legge ora quello che può e rimuove gli spazi in eccesso attorno al nome e all'indirizzo, evitando che i temi con nome su due righe mostrino una prima riga vuota.",
  fix_imported_theme_name:
    'Un CV importato con un nome di design non riconosciuto mostra ora tutte le sue sezioni invece di apparire quasi vuoto.',
  fix_missing_sections_single_column:
    "Le sezioni compilate dopo aver riorganizzato la struttura del layout non scompaionu più nei temi a colonna singola: ogni sezione con contenuti viene visualizzata nell'anteprima e nel PDF esportato.",
  fix_pdf_special_characters:
    'I caratteri speciali e i link del tuo curriculum ora si esportano in modo impeccabile nel PDF di ogni tema.',
  fix_preview_pdf_parity:
    "Ciò che vedi ora corrisponde a ciò che esporti. I titoli delle sezioni rinominati, i dettagli specifici del tema, le icone accanto ad essi e le sezioni dei progetti su diversi temi a due colonne potevano differire tra l'anteprima sullo schermo e il PDF esportato: ora i due vengono renderizzati in modo identico.",
  fix_reload_repairs_cv:
    "Il ricaricamento dell'editor ora ripara automaticamente i file CV corrotti o vecchi al volo, prevenendo potenziali arresti anomali dell'anteprima e dell'esportazione.",
  fix_signature_footer:
    'Il piè di pagina della firma è stato corretto: ora lascia spazio per firmare effettivamente, non spinge più una pagina finale vuota sui CV più lunghi e compare nei temi Elegant, Plain e Plain 2 in cui mancava.',
  fix_stackoverflow_page_breaks:
    "Le interruzioni di pagina manuali funzionano di nuovo sul tema Stack Overflow. L'impostazione di un'interruzione impediva la creazione del PDF; l'anteprima e l'esportazione si interrompono ora esattamente nel punto scelto.",
  fix_theme_fonts:
    "Elegant, Timeless e JavaScript vengono ora visualizzati nell'anteprima con i font originali con cui sono stati progettati. L'anteprima utilizzava in precedenza un font di sistema generico e il PDF di Timeless veniva esportato con un altro font ancora; ora tutti e tre hanno lo stesso aspetto a schermo e nel documento finale.",
  fix_two_column_stray_breaks:
    'Nei temi Lunar, Misty e Swiss Grid, una sezione di cui hai nascosto tutti gli elementi non trascina più la sua interruzione di pagina manuale nel PDF esportato, evitando di lasciare una colonna vuota.',
  other_discord_community:
    'KiwiCV ora ha una community su Discord — un luogo dove scambiarsi opinioni, richiedere modelli e sostenersi a vicenda durante la ricerca di lavoro. Trovi il link nel piè di pagina e sulla pagina principale.',
  other_export_no_google_fonts:
    "L'apertura di un CV HTML esportato non effettua più richieste a Google per caricare i font. Vengono utilizzati i medesimi file font già forniti da KiwiCV, garantendo un rendering identico senza che nessun altro sappia che lo hai aperto.",
  other_import_clear_warning:
    "Il riepilogo dell'importazione ora ti avverte chiaramente quando i valori non di testo vengono rimossi dai campi di solo testo, invece di svuotarli silenziosamente.",
  other_kiwicanopy_family:
    'Scopri il resto della famiglia KiwiCanopy — KiwiCV ora collega a KiwiCanopy e KiwiDesk dalla pagina Info.',
};
