import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Novità',
      content:
        'Non sei sicuro che KiwiCV faccia per te? Il nuovo Pass da 1 giorno sblocca tutte le funzioni IA per la tua prossima candidatura, così lo scopri prima di scegliere un Pass più lungo. Le schede dei prezzi ora offrono 1, 7 e 30 giorni.',
      title: 'Provalo per un giorno',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Ogni riga di KiwiCV è ora pubblica su GitHub con licenza AGPL. Guarda esattamente come viene trattato il tuo CV, segnala un bug o proponi una funzione: il codice dietro le promesse sulla privacy è lì, a disposizione di chiunque voglia verificarlo.',
      title: 'KiwiCV è open source',
    },
  },
  feat_ai_review_calmer:
    "Rivedere le proposte dell'IA è più sereno. Competenze e Lingue ora hanno il pannello di revisione su ogni voce, i campi riscritti da una proposta restano in sola lettura finché non scegli «Mantieni la mia» o «Usa la proposta», e Migliora aspetta che tu abbia deciso, così un secondo passaggio non può sostituire una proposta che non hai ancora visto. Gli screen reader annunciano ogni decisione.",
  feat_ai_tailoring_keeps_facts:
    'Adattare il tuo CV a un annuncio di lavoro ora lascia intatti i tuoi titoli, i datori di lavoro, le date e le competenze elencate. Una competenza che il tuo CV non menziona mai è segnata come «Non è nel tuo CV — accetta solo se è vero», così decidi prima che venga inserita.',
  feat_raw_data_extra_blocks:
    'La pagina JSON grezzo ora elenca gli eventuali dati extra portati da un file importato, come il blocco di impostazioni di un altro strumento. Apri un blocco per leggerne il JSON, oppure rimuovi quelli che non vuoi più nelle tue esportazioni.',
  fix_dates:
    "Le date con il giorno per primo, come 05.06.19, ora vengono lette come 5 giugno, non 6 maggio. Una data che non esiste, come 31.02.2019, resta come l'hai scritta e riceve il segno rosso di errore.",
  fix_drive_reconnect:
    'Ricollegare Google Drive ora va sempre a buon fine, attiva i backup e parte con un vero caricamento.',
  fix_photos:
    'Le foto di un CV importato perdono i metadati della fotocamera, posizione GPS compresa, e le foto GIF, HEIC e AVIF diventano JPEG. Le foto con sfondo trasparente restano bianche dopo il ritaglio invece di diventare nere.',
  fix_preview_pdf_match:
    "L'anteprima dal vivo e il PDF ora coincidono meglio in Soft, Misty, Skyline, Swiss Grid, Lunar ed Elegant: stesse maiuscole, linee del tempo, caratteri e link. L'anteprima non carica più i caratteri da un server di terze parti, e titolo e autore di un PDF contengono solo il tuo nome.",
  fix_privacy_controls:
    "Decidi tu cosa resta su questo dispositivo. L'accesso con Google chiede un accesso duraturo solo quando colleghi Google Drive. Le schede Google Drive e GitHub nelle Impostazioni offrono sempre Disconnetti, uscendo o eliminando il tuo account ti viene proposto di rimuovere anche il collegamento a GitHub, e il tuo campione di scrittura resta con l'account che lo ha salvato.",
  fix_privacy_policy:
    "L'informativa sulla privacy è stata riscritta. Elenca cosa conserva KiwiCV delle tue richieste IA (mai il tuo testo), indica il tuo diritto di opposizione e come revocare il consenso, e nomina ogni servizio coinvolto e dove funziona.",
  fix_small_things:
    'Ruotare un tablet con il menu laterale aperto non blocca più i tocchi, il pulsante Anteprima mobile non copre più il menu del telefono, una scheda lasciata aperta durante un aggiornamento si ricarica sulla nuova versione, e un CV troppo lungo da tradurre viene rifiutato subito invece di fallire dopo una lunga attesa.',
  ui_editor_polish:
    "Di nuovo qui? La pagina iniziale ora dice Continua a modificare, e Crea il tuo CV si apre direttamente sui tuoi dati personali. Nella lettera di presentazione, Oggetto e Data stanno sopra il testo della lettera e Destinatario si apre quando c'è un destinatario. Migliora resta visibile in una sezione vuota con un suggerimento su cosa aggiungere per prima cosa, e i contatori di caratteri dell'IA diventano ambra prima del limite.",
  ui_informal_address_more_languages:
    "Spagnolo, olandese, russo, ucraino e bulgaro ora ti danno del tu in tutta l'app, come le altre lingue.",
  ui_install_app:
    "Usa KiwiCV come un'app: Impostazioni → Interfaccia ora ha un pulsante Installa KiwiCV, e su iPhone e iPad KiwiCV ottiene un'icona vera quando lo aggiungi alla schermata Home.",
};
