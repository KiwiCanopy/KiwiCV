import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'Correção do TagField no modo PDF: Resolvido um problema em que as entradas de etiquetas não eram sincronizadas corretamente ao usar a visualização de PDF.',
  perf_pdf_render_safety:
    'Estabilidade melhorada na geração de PDF: Implementada uma proteção robusta que evita loops em segundo plano e fornece passos claros de recuperação durante conflitos de layout complexos.',
};
