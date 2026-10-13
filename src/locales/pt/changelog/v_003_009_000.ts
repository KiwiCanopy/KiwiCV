import type { Translations } from '@/locales/en';

export const v_003_009_000: Translations['changelog']['entries']['v_003_009_000'] = {
  chore_login_stability:
    'Reforçada a persistência da sessão de login para evitar quedas acidentais da sessão e garantir um estado de ligação mais estável.',
  fix_translation_after_import:
    'Os currículos agora podem ser traduzidos para qualquer outro idioma imediatamente após a importação de dados.',
  fix_two_column_sidebar_position:
    'As posições da barra lateral de duas colunas agora são preservadas corretamente ao modificar as entradas no editor.',
  refactor_pdf_rendering:
    'Reconstruímos todo o motor de renderização de PDF do zero com o Typst para oferecer exportações mais rápidas, estáveis e de maior qualidade, ajudando-te a causar uma impressão ainda melhor nas tuas candidaturas.',
  ui_polish:
    'Polidos vários detalhes da interface no site para uma experiência visual mais suave e limpa.',
};
