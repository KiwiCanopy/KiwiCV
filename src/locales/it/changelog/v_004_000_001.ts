import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  fix_migration_notice:
    "Se accedi ancora a KiwiCV tramite il precedente indirizzo web, l'avviso indica ora la data esatta in cui l'indirizzo smetterà di funzionare: 31 ottobre 2026.",
  fix_mobile_checkout:
    "Scorrere le schede dei prezzi su uno smartphone non avvia più la cassa per errore. Solo il pulsante avvia l'acquisto.",
  fix_preview_reliability:
    "L'anteprima non rimane più bloccata in un caricamento infinito. Un pop-up bloccato ora ti avvisa dell'accaduto, un rendering che si interrompe mostra una spiegazione chiara e l'anteprima continua a funzionare anche quando un servizio esterno è lento o irraggiungibile.",
  fix_save_status:
    "La nota «Salvato su questo dispositivo» ora riflette ciò che è stato realmente salvato, invece di mostrare sempre la stessa conferma a prescindere dall'esito.",
  fix_translations:
    "Corretti tredici testi che contenevano caratteri dell'alfabeto errato (caratteri cirillici in parole spagnole e turche, o coreani e giapponesi in cinese) e colmate le ultime lacune in tutte e quindici le lingue.",
  perf_preview_speed:
    'La prima anteprima appare molto più velocemente. In precedenza KiwiCV caricava tutti i font necessari prima di poter mostrare qualsiasi cosa, inclusi due font molto grandi per il cinese e il giapponese. Ora vengono caricati solo se il tuo CV utilizza effettivamente quei caratteri.',
  ui_polish:
    'Un ritocco visivo: gli intestazioni utilizzano un carattere extra-grassetto reale anziché uno ispessito artificialmente dal browser, le etichette dei moduli e i segnaposto sono più facili da leggere e le schede delle sezioni condividono un accento uniforme.',
};
