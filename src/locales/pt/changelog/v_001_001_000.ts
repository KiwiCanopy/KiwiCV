import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Formato compatível com ATS garantido para ficheiros PDF gerados',
  feat_github_backup:
    'Ao fazer push para o GitHub (a partir do separador de pré-visualização), a tua configuração também será atualizada de acordo com o estado atual',
  feat_mock_data_preview:
    'Se não forem fornecidos dados, serão utilizados dados fictícios para preencher os modelos de pré-visualização, permitindo-te ver uma pré-visualização imediatamente',
  feat_onboarding_flow:
    'Experiência de integração melhorada com um fluxo de boas-vindas aperfeiçoado',
  fix_link_references: 'várias referências de links otimizadas em temas PDF e HTML',
  fix_lunar_sidebar_header:
    'Corrigido um problema em que os cabeçalhos da barra lateral não eram apresentados no tema Lunar',
  fix_netlify_routing:
    'Corrigido um problema em que a atualização de subpáginas na Netlify resultava num erro 404',
  fix_welcome_modal_scroll:
    'Corrigido um problema em que o modal de boas-vindas não era passível de scroll em ecrãs mais pequenos',
};
