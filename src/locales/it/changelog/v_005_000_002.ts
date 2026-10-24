import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  fix_composer_translate_tick:
    "Dopo che Migliora con l'IA ha tradotto il tuo CV, l'esecuzione successiva non lo traduce più una seconda volta: «Traduci anche il mio CV» ora si disattiva da solo non appena la traduzione è pronta.",
  fix_pending_bar_wraps:
    "In un editor stretto, la barra delle proposte dell'IA da rivedere ora manda a capo i suoi pulsanti, così Scarta tutto non viene più tagliato.",
  fix_skills_false_change:
    "Le competenze che non hai toccato non compaiono più come modificate dopo Migliora con l'IA o una traduzione, e scartare le modifiche di una traduzione non riporta più le tue competenze nella lingua precedente.",
  fix_skills_reorder_is_change:
    "Quando Migliora con l'IA si limita a riordinare le tue competenze, ora ti viene proposto come una modifica da rivedere, con le competenze spostate evidenziate, invece di essere segnalato come «Invariato».",
  ui_composer_addon_summary:
    'Con la barra IA chiusa in modalità Professionale, le aggiunte che verranno eseguite insieme — come una traduzione o una ristrutturazione delle competenze — ora sono indicate accanto a Migliora il mio CV, e un clic su di esse apre la barra.',
  ui_export_closes_on_success:
    "Dopo un'esportazione riuscita del tutto, la finestra di esportazione ora si chiude da sola e un avviso lo conferma per dieci secondi. Se una destinazione fallisce, la finestra resta aperta così puoi riprovare.",
  ui_export_improve_apart:
    "Esporta e Migliora il mio CV ora si distinguono meglio: Migliora si trova all'inizio della barra IA e il pulsante Esporta nell'intestazione non è più verde. Quando lavori con un annuncio di lavoro o con le tue istruzioni, Migliora aspetta che la barra sia aperta, così non agisce mai su un testo che non vedi.",
  ui_page_break_toggle_on_row:
    "Il pulsante dell'interruzione di pagina è tornato su ogni riga di sezione nella scheda Design, così vedi a colpo d'occhio dove inizia una nuova pagina del PDF.",
};
