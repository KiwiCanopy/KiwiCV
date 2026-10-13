import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Sezioni personalizzate',
      content:
        "Il tuo CV non è più limitato alle sezioni standard. Aggiungi le tue — Conferenze, Risultati chiave, tutto ciò che racconta la tua storia —, compilale come qualsiasi altra sezione e si adatteranno a ogni design, nell'anteprima e nel PDF. Anche «Migliora con l'IA» e la traduzione funzionano su di esse.",
      title: 'Sezioni tutte tue',
    },
  },
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  feat_custom_sections:
    "Aggiungi sezioni tue al tuo CV — Conferenze, Risultati chiave o qualsiasi cosa le sezioni standard non coprano. Trovi «Aggiungi sezione» in fondo all'elenco delle sezioni: assegna un titolo alla sezione e riempila di voci come qualsiasi altra — nome, date, link, riassunto e punti salienti. Le sezioni personalizzate stanno bene in ogni design, nell'anteprima e nel PDF, e si possono spostare tra le colonne nell'editor del layout come le altre. «Migliora con l'IA» funziona su di esse e su ciascuna delle loro voci, e traducendo il tuo CV si traducono anche i loro titoli e le loro voci.",
  feat_json_round_trip:
    "Importare un file CV da un altro strumento non scarta più ciò che KiwiCV non può mostrare. I blocchi extra nel file, insieme ai ruoli e alle parole chiave dei tuoi progetti, restano con il tuo CV e tornano invariati quando lo esporti o ne fai il backup su Google Drive o in un repository GitHub privato. Non compaiono mai sul tuo CV né raggiungono l'IA, e l'importazione ti dice quali blocchi ha conservato.",
  feat_privacy_by_design:
    "KiwiCV continua a plasmare i suoi flussi di lavoro attorno alla tua privacy. Un repository GitHub che chiunque può leggere — pubblico o pubblicato con GitHub Pages — ora riceve solo ciò che il tuo CV mostra: le voci nascoste, le parti dell'indirizzo che hai escluso e la tua lettera di presentazione restano fuori. Un repository privato conserva il backup completo, e la finestra di connessione ti dice quale dei due casi hai. Le foto in un file CV importato perdono i metadati della fotocamera, posizione GPS compresa, prima di essere salvate.",
  fix_hidden_entries_stay_hidden:
    "Ciò che nascondi resta nascosto. Modificare, spostare, ordinare o eliminare un'altra voce poteva riportarne in vista una nascosta, e lo stesso valeva per una riorganizzazione delle competenze con l'IA o per l'anteprima di esempio di un CV vuoto. Le stesse azioni inoltre non accettano più in silenzio un suggerimento dell'IA a cui non hai ancora risposto.",
  fix_keyboard_screen_reader:
    'Più fluido con tastiera e screen reader: una nuova prima voce si apre subito, il campo social network funziona come un vero elenco e i pulsanti vengono annunciati per nome.',
  fix_language_polish:
    "Rifiniture linguistiche in tutta l'app: titoli di sezione corretti in italiano, bulgaro, turco e portoghese, una İ maiuscola con il punto nei CV turchi, le ultime schermate in inglese tradotte e veri contenuti di esempio in un CV vuoto in dodici lingue.",
  fix_reduced_json_hides_sections:
    "Il JSON «Ridotto» nella pagina JSON grezzo ora esclude tutto ciò che il tuo CV nasconde — un'intera sezione nascosta e una foto profilo nascosta —, oltre alle parti dell'indirizzo che il tuo CV omette e ai campi dei progetti conservati solo da un file importato.",
};
