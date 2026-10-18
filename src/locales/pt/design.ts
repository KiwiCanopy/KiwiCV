import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Campos ativos (Arrasta para reordenar)',
  address_schema_apply_template: 'Aplicar modelo',
  address_schema_available_fields: 'Campos disponíveis (Clica para incluir)',
  address_schema_desc:
    'Formata o layout do bloco de morada e os separadores de forma independente do idioma do teu currículo.',
  address_schema_mode_custom: 'Personalizado',
  address_schema_mode_default: 'Baseado no idioma',
  address_schema_mode_default_desc:
    'O schema adapta-se automaticamente ao idioma do teu currículo. Se este diferir do idioma de apresentação definido, o código do país também é adicionado. Para mais opções de personalização, escolhe "{customLayout}".',
  address_schema_mode_label: 'Modo de layout',
  address_schema_no_active_fields: 'Nenhum campo ativo. Clica nos campos abaixo para os adicionar.',
  address_schema_preset_european: 'Estilo europeu',
  address_schema_preset_us_ca: 'Estilo US/CA',
  address_schema_restore: 'Repor predefinição',
  address_schema_separator_comma: 'Vírgula',
  address_schema_separator_dash: 'Hífen',
  address_schema_separator_space: 'Espaço',
  address_schema_title: 'Gestão do esquema de morada',
  address_schema_toggle_separator: 'Alternar separador entre vírgula e espaço',
  bold_header: {
    desc: 'Escolhe quais os detalhes a mostrar como cabeçalho a negrito (linha principal)',
    title: 'Modo de cabeçalho em negrito',
  },
  color_chooser: 'Esquema de cores',
  column_empty: 'Sem secções',
  design_filter: {
    one_column: 'Uma coluna',
    two_column: 'Duas colunas',
  },
  empty_sections_subtitle:
    'Estas secções ainda estão vazias. Tens a certeza de que não queres adicionar nada? Cada detalhe conta.',
  empty_sections_title: 'Secções adicionais disponíveis',
  example_section: 'Secção de exemplo',
  formatting: 'formatação',
  groups: {
    details: 'Detalhes',
    layout: 'Layout',
    typography: 'Tipografia',
  },
  layout_flip: 'Espelhar layout',
  layout_main_column: 'Coluna principal',
  layout_side_column: 'Coluna lateral',
  layout_swap_tooltip: 'Mover para a outra coluna',
  more_actions_named: 'Mais ações para «{{name}}»',
  page_break_disabled_first: 'Quebra de página não disponível para o primeiro item',
  page_break_disabled_hidden: 'Quebra de página não disponível para secções ocultas',
  page_break_named: 'Quebra de página antes de «{{name}}»',
  page_break_removal_tooltip:
    'Remover a quebra de página antes desta secção (aplica-se apenas à versão PDF)',
  page_break_tooltip:
    'Adicionar uma quebra de página antes desta secção (aplica-se apenas à versão PDF)',
  pdf_footer: {
    date: 'Incluir data',
    desc: 'Inserir a linha de assinatura, o local e a data na parte inferior',
    location: 'Incluir local',
    show: 'Mostrar rodapé',
    title: 'Rodapé do PDF',
  },
  section_reordering: {
    hint: 'As secções aparecem no teu CV nesta ordem. Arrasta uma linha pela pega para a moveres.',
    hint_touch:
      'As secções aparecem no teu CV nesta ordem. Usa as setas para moveres uma linha, ou prime a pega e arrasta.',
    title: 'Ordem das secções',
  },
  swap_column_named: 'Mover «{{name}}» para a outra coluna',
  template: 'Modelo',
};
