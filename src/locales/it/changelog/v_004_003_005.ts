import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  fix_ai_proposal_diff:
    'Le proposte dell’IA sono più facili da leggere e valutare. Le righe aggiunte e rimosse hanno ora una propria sfumatura di sfondo oltre al colore del testo, entrambe le opzioni rimangono leggibili in modalità scura e sono posizionate sotto il testo a cui appartengono: mantieni la tua formulazione a sinistra, accetta la proposta a destra.',
  fix_ai_stuck_dialog:
    'Un’elaborazione dell’IA bloccata non tiene più aperta la finestra di avanzamento. La finestra rifiutava di chiudersi durante un blocco, e ricaricare la pagina la riapriva all’istante riavviando la stessa operazione: l’unica via d’uscita finiva per peggiorare le cose. Ora rimane sempre chiudibile e un ricaricamento la mantiene chiusa.',
  fix_ai_translate_addon:
    'Selezionare «Traduci anche il mio CV» ora esegue davvero la traduzione. La casella della lingua accanto si apriva con la lingua già presente nel CV, interpretata dal sistema come «nulla da tradurre»: il CV tornava adattato all’annuncio di lavoro ma ancora nella lingua originale, senza segnalare che la richiesta era stata ignorata.',
  fix_cover_letter_footer:
    'La riga della firma sotto la tua lettera di presentazione segue ora le impostazioni di «Piè di pagina PDF», esattamente come per il tuo CV. In precedenza copiava il campo della data in cima alla lettera: cancellare quel campo svuotava anche la firma, impedendo alle due voci di differire.',
  fix_cvs_connect_button:
    'Il collegamento dello spazio cloud da «I miei CV» funziona di nuovo completamente. Il pulsante «Collega lo spazio cloud» non rispondeva quando avevi effettuato l’accesso senza un provider collegato, e la finestra di dialogo aperta conteneva un pulsante che ti rimandava alla pagina in cui ti trovavi già.',
};
