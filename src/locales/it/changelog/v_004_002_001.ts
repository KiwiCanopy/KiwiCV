import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    "Sullo smartphone, aprire il tuo CV come pagina web funziona perfettamente. L'opzione HTML nel menu Anteprima prima ti lasciava su una scheda bloccata sulla generazione; ora mostra direttamente il tuo CV pronto.",
  perf_phone_preview:
    "L'anteprima si apre più velocemente sullo smartphone. Ora KiwiCV prepara il motore del documento mentre stai ancora modificando, invece di avviarlo solo quando tocchi lo schermo, e se riapri un CV che non hai cambiato dall'ultima anteprima salti completamente l'attesa.",
  ui_phone_layout:
    "Sullo smartphone, l'editor e I miei CV danno di nuovo il giusto spazio a ogni elemento. Ogni backup mostra nome, lingua e data di salvataggio su una riga propria anziché finire sotto il pulsante Ripristina, la scheda «Migliora con l'IA» tiene il titolo e l'avviso sui crediti su righe separate, e l'ultima sezione dell'editor non rimane più nascosta sotto il pulsante flottante Anteprima.",
};
