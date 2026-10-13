import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'IA',
      content:
        "Ora KiwiCV scrive la tua lettera di presentazione. Incolla l'annuncio di lavoro e ricevi una lettera elaborata a partire dal tuo CV esistente: imposta lunghezza e tono, oppure fornisci un esempio dei tuoi testi per riprodurre il tuo stile personale. Arriva come proposta da consultare accanto alla tua bozza e accettare paragrafo per paragrafo.",
      title: 'Lettere di presentazione scritte per te',
    },
  },
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  feat_ai_cover_letters:
    'La tua lettera di presentazione può ora essere scritta per te, a partire da un annuncio di lavoro e dal CV che hai già compilato. Scegli lunghezza e tono, oppure condividi un esempio di testo scritto da te affinché KiwiCV adotti il tuo stile. La lettera viene presentata come una proposta da confrontare con la tua bozza e accettare paragrafo per paragrafo, sia che la lettera sia vuota sia che sia già iniziata. La sezione ora si apre direttamente sul corpo della lettera anziché mostrare per primi cinque campi di recapito del destinatario per un testo non ancora scritto.',
  fix_ai_large_cv_wait:
    "Migliorare o tradurre un CV lungo non si interrompe più con un errore dopo un minuto: l'attesa ora cresce con le dimensioni del CV.",
  fix_dates:
    "Le date tornano a funzionare a dovere. Una data inserita poteva slittare indietro di un giorno fuori dall'Europa, e un anno isolato poteva andare completamente perduto; nel selettore, un clic accidentale vicino al bordo della griglia passava senza preavviso al mese e all'anno adiacenti; e «Ordina le voci cronologicamente» non riconosceva le date con il giorno per primo come 15.03.2019, facendole finire in fondo all'elenco come se fossero prive di data.",
  fix_keyboard_navigation:
    "La navigazione da tastiera non ti rimanda più all'inizio della pagina. Chiudendo una finestra di dialogo torni al pulsante da cui l'avevi aperta, eliminando una voce o un CV salvato passi all'elemento successivo, e rispondendo a un suggerimento dell'IA rimani nel punto in cui stavi lavorando. Ora anche la tua foto del profilo è accessibile da tastiera: prima il riquadro rispondeva solo ai clic del mouse, rendendo irraggiungibili «Modifica», «Sostituisci» ed «Elimina».",
  fix_main_badge_overlaps_label:
    "Il badge «main» accanto all'etichetta di un campo non si sovrappone più al testo dell'etichetta. Veniva renderizzato all'interno di un riquadro dimensionato per un'icona, quindi un badge più largo fuoriusciva coprendo le parole vicine.",
};
