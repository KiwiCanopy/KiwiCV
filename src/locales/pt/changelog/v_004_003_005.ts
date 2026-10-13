import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  fix_ai_proposal_diff:
    'As propostas da IA são agora mais fáceis de ler e responder. As linhas adicionadas e removidas têm agora um tom de fundo próprio além da cor do texto, ambas as opções permanecem legíveis no modo escuro e surgem por baixo do texto correspondente: à esquerda manténs a tua versão, à direita aceitas a proposta.',
  fix_ai_stuck_dialog:
    'Uma execução bloqueada da IA já não deixa a janela de progresso presa. A janela recusava-se a fechar quando um processo bloqueava, e recarregar a página trazia-a de volta de imediato reiniciando a mesma execução — a única saída acabava por piorar a situação. Agora é possível fechá-la em qualquer momento e permanece fechada após recarregar.',
  fix_ai_translate_addon:
    'Ativar a opção «Traduzir também o meu CV» agora traduz realmente o documento. A caixa de idioma ao lado abria no idioma em que o CV já estava, o que a execução interpretava como «nada a traduzir» — assim, o CV regressava adaptado ao anúncio de emprego mas no idioma original, sem qualquer indicação de que o pedido tinha sido ignorado.',
  fix_cover_letter_footer:
    'A linha de assinatura da tua carta de apresentação segue agora as definições de «Rodapé do PDF», tal como a do teu CV. Antes copiava o campo de data no topo da carta, pelo que limpar esse campo também esvaziava a assinatura e os dois nunca podiam ser diferentes.',
  fix_cvs_connect_button:
    'Ligar o armazenamento na nuvem a partir de «Os Meus CVs» volta a funcionar de ponta a ponta. O botão «Ligar armazenamento na nuvem» não fazia nada quando tinhas a sessão iniciada sem nenhum fornecedor ligado, e a janela de diálogo apresentava um botão que apenas te devolvia à página onde já estavas.',
};
