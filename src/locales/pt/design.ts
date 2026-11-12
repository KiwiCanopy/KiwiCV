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
  signature: {
    add: 'Adicionar assinatura',
    backup_delete_failed:
      'Your signature is removed from this device, but its backup copy could not be deleted. Delete KiwiCV/signature/signature.json in Google Drive or signature/signature.json in GitHub yourself.',
    backup_failed:
      'A tua assinatura está guardada neste dispositivo, mas não foi possível atualizar a cópia de segurança.',
    backup_github_history:
      'Removê-la elimina-a do teu repositório; as versões anteriores no histórico mantêm-na.',
    backup_label: 'Guardar também uma cópia em {{targets}}',
    backup_note: 'Guardada neste dispositivo e em {{targets}}. Os PDF que crias incluem-na.',
    backup_unreachable:
      "Saved on this device. Your backup copy can't be reached right now. PDFs you create include it.",
    change: 'Alterar',
    commit_removed: 'Remover cópia da assinatura',
    commit_saved: 'Guardar cópia da assinatura',
    crop_description: 'Recorta, roda ou vira a imagem. O fundo do papel é removido a seguir.',
    crop_title: 'Recortar a tua assinatura',
    device_note:
      'Guardada apenas neste dispositivo, fora das tuas cópias de segurança e da sincronização. Os PDF que crias incluem-na.',
    dialog_title: 'A tua assinatura',
    draw_hint: 'Desenha com o rato, o dedo ou uma caneta.',
    draw_label: 'Área de desenho para a tua assinatura',
    edit_label: 'Alterar assinatura',
    face_unavailable: 'Este estilo não consegue mostrar todas as letras deste nome.',
    footer_off: 'Aparece no rodapé do PDF, que está desativado.',
    preview_alt: 'A tua assinatura',
    restore_found: 'A tua cópia de segurança tem uma assinatura guardada.',
    restore_use: 'Usar',
    row_empty: 'Nenhuma assinatura neste dispositivo',
    row_label: 'Assinatura',
    tab_draw: 'Desenhar',
    tab_type: 'Escrever',
    tab_upload: 'Carregar',
    type_name: 'Nome',
    type_style: 'Estilo',
    type_unavailable:
      'Os estilos manuscritos não conseguem mostrar todas as letras deste nome. Desenha-o ou carrega-o.',
    upload_another: 'Escolher outra',
    upload_choose: 'Escolher uma imagem',
    upload_empty:
      'Não foi encontrada nenhuma assinatura nesta imagem. Uma caneta escura em papel branco funciona melhor.',
    upload_hint:
      'Uma fotografia ou digitalização em papel branco. O fundo é removido neste dispositivo. Também podes colar uma imagem. A partir da Pré-visualização do macOS, exporta primeiro a assinatura como PNG.',
    upload_ready: 'Assinatura pronta. Verifica-a e depois guarda.',
    upload_too_large: 'A imagem é demasiado grande (máx. {{size}} MB).',
    upload_unreadable: 'Este ficheiro não pode ser lido como imagem. Experimenta PNG ou JPG.',
    upload_working: 'A remover o fundo…',
  },
  swap_column_named: 'Mover «{{name}}» para a outra coluna',
  template: 'Modelo',
};
