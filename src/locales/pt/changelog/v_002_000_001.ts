import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Mantém-te informado: Adicionada uma janela 'Novidades' que destaca as funcionalidades e melhorias mais recentes após uma atualização.",
  fix_html_preview_scrolling:
    'Resolvido um problema em que o painel de pré-visualização HTML podia tornar-se não rolável em certos navegadores.',
  fix_onboarding_tour_mobile_overlay:
    'Resolvido um problema de posicionamento em que o cartão do tour de boas-vindas podia sobrepor os elementos destacados em ecrãs pequenos.',
  fix_sidebar_position_placeholders:
    'Corrigido um erro que impedia a troca da posição da barra lateral com dados de exemplo.',
  fix_ui_header_action_bubbling:
    'Ações do editor sem interrupções: Alternar a visibilidade ou adicionar novos itens nos cabeçalhos das secções já não desencadeia a expansão ou o recolhimento indesejado.',
  perf_ats_rendering_optimization:
    'Otimização ATS: o conteúdo da coluna principal agora tem prioridade para os leitores de ecrã em todos os temas de duas colunas.',
  refactor_backend_cleanup:
    'Limpeza do backend e metadados removendo chaves obsoletas dos ficheiros JSON gerados para uma estrutura de dados mais simplificada.',
  refactor_package_upgrades:
    'Otimização interna importante com uma atualização para Node 24 (do Node 22) e Vite 8 para uma experiência mais segura e moderna.',
  ui_interactive_3d_buttons:
    'Unificação do Design: O sistema de botões tácteis 3D foi padronizado em toda a aplicação para uma sensação mais consistente e sofisticada.',
  ui_section_field_ordering:
    'Campos do formulário do editor reorganizados para se alinharem com a hierarquia visual do currículo renderizado.',
};
