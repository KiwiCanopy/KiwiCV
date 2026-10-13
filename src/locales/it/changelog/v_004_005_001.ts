import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  fix_month_year_dates:
    'Una data inserita come mese e anno — 03/2019 o 03.2019 — ora viene salvata correttamente, così la voce si ordina al posto giusto invece di finire in fondo come se non avesse una data.',
  fix_skills_reorg_empty:
    "Riorganizzare le tue competenze con l'IA non può più svuotare la sezione Competenze. Se l'IA non propone un nuovo raggruppamento, le tue competenze restano esattamente com'erano, l'operazione non conta nel tuo limite giornaliero e la lettera di presentazione scritta insieme corrisponde al tuo CV.",
  ui_entry_header_contrast:
    "Più leggibile nell'editor: ruolo, date e il segnaposto «Senza titolo» accanto a ogni voce chiusa ora risaltano chiaramente sia in modalità chiara che scura.",
};
