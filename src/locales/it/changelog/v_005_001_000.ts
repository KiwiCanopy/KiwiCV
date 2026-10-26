import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Annunci di lavoro',
      content:
        "Incolla il link all'annuncio nella finestra di esportazione quando fai il backup di un CV su Google Drive o in un repository GitHub privato, poi aprilo da «I miei CV» ogni volta che ti serve. I repository pubblici non ricevono mai il link.",
      title: 'Ricorda dove hai inviato la candidatura',
    },
  },
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  feat_cover_letter_style_default:
    'Con un campione di scrittura salvato, le tue lettere di presentazione ora partono da «Adatta al mio stile di scrittura», anche in una nuova scheda del browser. Se invece scegli un tono, KiwiCV lo mantiene per quella scheda.',
  feat_export_cmd_enter:
    "Premi Cmd+Invio (Ctrl+Invio su Windows) nella finestra di esportazione per avviare l'esportazione senza cercare il pulsante.",
  feat_export_cover_letter_switch:
    "La finestra di esportazione ora mostra se la tua lettera di presentazione è inclusa, con un interruttore per aggiungerla o escluderla, e ti avvisa quando la lettera potrebbe non corrispondere all'annuncio di lavoro a cui hai appena adattato il tuo CV, così puoi controllarla prima di inviarla.",
  feat_job_posting_link:
    "Aggiungi il link all'annuncio quando fai il backup di un CV su Google Drive o in un repository GitHub privato, poi aprilo direttamente da quella versione in «I miei CV». I repository GitHub pubblici non lo ricevono mai.",
  fix_basics_proposal_gap:
    "Una proposta dell'IA in «Info di Base» non è più attaccata alla tua foto.",
  fix_json_resume_import_levels:
    'L’importazione di un file JSON Resume ora trasforma la competenza di una lingua, ad esempio «Native» o «B2», nel suo livello e legge i livelli delle competenze scritti a parole, ad esempio «Expert». Se un’esperienza lavorativa contiene la descrizione dell’azienda, l’importazione ora ti avvisa che KiwiCV non ha un campo in cui conservarla, invece di scartarla in silenzio.',
  fix_sign_out_forgets_export_details:
    'Quando esci, KiwiCV ora dimentica anche l’azienda, la posizione e il link all’annuncio che hai inserito nella finestra di esportazione, così la prossima persona che accede da questo browser non li vede.',
  fix_tailoring_matches_job_ad:
    "L'adattamento a un annuncio ora riscrive la tua esperienza lavorativa in funzione dell'annuncio di lavoro e adegua il tuo titolo professionale, invece di limitarsi a ristrutturare le tue competenze.",
  ui_export_footer_pinned:
    'Esporta e Annulla ora restano visibili in fondo alla finestra di esportazione sugli schermi più piccoli.',
  ui_restructure_skills_default:
    "«Ristrutturare Competenze» ora è spuntato quando migliori l'intero CV, così l'adattamento raggruppa di default le tue competenze in funzione del ruolo. Togli la spunta per mantenere la tua struttura; ogni modifica arriva comunque come proposta che puoi accettare o scartare.",
};
