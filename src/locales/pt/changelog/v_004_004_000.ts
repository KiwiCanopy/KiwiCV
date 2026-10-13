import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'IA',
      content:
        'O KiwiCV escreve agora a tua carta de apresentação. Cola o anúncio de emprego e obtém uma carta elaborada a partir do teu currículo atual: define a extensão e o tom, ou introduz uma amostra da tua própria escrita para que o texto reflita o teu estilo. Surge como uma proposta que podes ler ao lado do teu rascunho e aceitar parágrafo a parágrafo.',
      title: 'Cartas de apresentação escritas para ti',
    },
  },
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  feat_ai_cover_letters:
    'A tua carta de apresentação pode agora ser escrita para ti a partir de um anúncio de emprego e do CV que já tens. Escolhe o comprimento e o tom, ou fornece uma amostra da tua própria escrita para que o KiwiCV adote a tua voz. A carta chega sob a forma de uma proposta que podes rever ao lado do teu rascunho e aceitar parágrafo a parágrafo — quer a carta esteja em branco ou já iniciada. A secção abre agora diretamente no corpo da carta, em vez de exigir primeiro cinco campos de endereço para um destinatário de um texto que ainda nem tinhas escrito.',
  fix_ai_large_cv_wait:
    'Melhorar ou traduzir um CV extenso já não para com um erro ao fim de um minuto — a espera cresce agora com o tamanho do CV.',
  fix_dates:
    'As datas voltam a comportar-se corretamente. Uma data introduzida podia recuar um dia fora da Europa, e um ano isolado podia perder-se por completo; no seletor, um clique acidental junto à margem da grelha saltava para o mês e ano vizinhos sem aviso; e «Ordenar entradas cronologicamente» não conseguia ler datas que começam pelo dia, como 15.03.2019, fazendo com que essas entradas caíssem para o fundo como se não tivessem data.',
  fix_keyboard_navigation:
    'Navegar com o teclado já não te atira para o topo da página. Fechar uma caixa de diálogo devolve-te ao botão de onde a abriste, eliminar uma entrada ou um CV guardado deixa-te no item seguinte, e responder a uma sugestão de IA mantém-te onde estavas a trabalhar. A tua foto de perfil agora também pode ser acedida por teclado — o mosaico só respondia ao rato, pelo que «Editar», «Substituir» e «Eliminar» estavam inacessíveis.',
  fix_main_badge_overlaps_label:
    'O distintivo «main» junto ao rótulo de um campo já não fica por cima do texto do rótulo. Era renderizado dentro de uma caixa dimensionada para um ícone, pelo que um distintivo mais largo transbordava e cobria as palavras ao lado.',
};
