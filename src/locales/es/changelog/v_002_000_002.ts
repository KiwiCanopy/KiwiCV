import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'Corrección de TagField en modo PDF: Se resolvió un problema por el cual las entradas de etiquetas no se sincronizaban correctamente al usar la vista previa de PDF.',
  perf_pdf_render_safety:
    'Estabilidad mejorada en la generación de PDF: Se implementó un protector de seguridad robusto que evita bucles en segundo plano y proporciona pasos claros de recuperación durante conflictos de diseño complejos.',
};
