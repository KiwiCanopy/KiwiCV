import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  fix_composer_translate_tick:
    'Depois de «Melhorar com IA» traduzir o teu CV, a execução seguinte já não o traduz outra vez: «Traduzir também o meu CV» desliga-se agora sozinho assim que a tradução chega.',
  fix_pending_bar_wraps:
    'Num editor estreito, a barra das propostas de IA por rever passa agora os botões para várias linhas, por isso Descartar tudo já não fica cortado.',
  fix_skills_false_change:
    'As competências que não tocaste deixam de aparecer como alteradas depois de Melhorar com IA ou de uma tradução, e descartar as alterações de uma tradução já não devolve as tuas competências ao idioma anterior.',
  fix_skills_reorder_is_change:
    'Quando Melhorar com IA só reordena as tuas competências, isso passa a ser-te oferecido como uma alteração para reveres, com as competências movidas assinaladas, em vez de ser indicado como «Inalterado».',
  ui_composer_addon_summary:
    'Com a barra de IA fechada no modo Profissional, os extras que vão correr em conjunto — como uma tradução ou uma reestruturação das competências — passam a aparecer junto de Melhorar o meu CV, e um clique neles abre a barra.',
  ui_export_closes_on_success:
    'Depois de uma exportação totalmente bem-sucedida, a janela de exportação fecha-se agora sozinha e um aviso confirma-o durante dez segundos. Se algum destino falhar, a janela fica aberta para poderes tentar de novo.',
  ui_export_improve_apart:
    'Exportar e Melhorar o meu CV distinguem-se agora melhor: Melhorar fica no início da barra de IA e o botão Exportar no cabeçalho já não é verde. Quando trabalhas a partir de um anúncio de emprego ou das tuas próprias instruções, Melhorar espera até a barra estar aberta, para nunca correr sobre um texto que não vês.',
  ui_page_break_toggle_on_row:
    'O botão de quebra de página voltou a estar em cada linha de secção no separador Design, para veres de relance onde começa uma nova página do PDF.',
};
