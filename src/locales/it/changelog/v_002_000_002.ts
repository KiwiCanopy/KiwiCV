import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'Correzione TagField in modalità PDF: Risolto un problema per cui gli input dei tag non venivano sincronizzati correttamente durante l’uso dell’anteprima PDF.',
  perf_pdf_render_safety:
    'Maggiore stabilità nella generazione PDF: Implementata una protezione robusta che previene i loop in background e fornisce chiari passaggi di ripristino in caso di conflitti di layout complessi.',
};
