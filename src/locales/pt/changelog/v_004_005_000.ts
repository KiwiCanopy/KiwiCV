import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Secções personalizadas',
      content:
        'O teu CV já não está limitado às secções padrão. Adiciona as tuas — Conferências, Principais conquistas, tudo o que conta a tua história —, preenche-as como qualquer outra secção e ajustam-se a todos os designs, na pré-visualização e no PDF. «Melhorar com IA» e a tradução também funcionam nelas.',
      title: 'As tuas próprias secções',
    },
  },
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  feat_custom_sections:
    'Adiciona secções próprias ao teu CV — Conferências, Principais conquistas ou tudo o que as secções padrão não cobrem. Encontras «Adicionar secção» no fim da lista de secções: dá um título à secção e preenche-a com entradas como em qualquer outra — nome, datas, link, resumo e destaques. As secções personalizadas ficam bem em todos os designs, na pré-visualização e no PDF, e podem ser movidas entre colunas no editor de layout, como as restantes. «Melhorar com IA» funciona nelas e em cada uma das suas entradas, e ao traduzir o teu CV os respetivos títulos e entradas também são traduzidos.',
  feat_json_round_trip:
    'Importar um ficheiro de CV de outra ferramenta já não deita fora o que o KiwiCV não consegue mostrar. Os blocos extra do ficheiro, bem como as funções e as palavras-chave dos teus projetos, ficam guardados com o teu CV e voltam inalterados quando o exportas ou fazes a cópia de segurança para o Google Drive ou para um repositório GitHub privado. Nunca aparecem no teu CV nem chegam à IA, e a importação diz-te que blocos manteve.',
  feat_privacy_by_design:
    'O KiwiCV continua a orientar os seus fluxos em torno da tua privacidade. Um repositório GitHub que qualquer pessoa pode ler — público ou publicado com o GitHub Pages — passa a receber apenas o que o teu CV mostra: as entradas ocultas, as partes da morada que omitiste e a tua carta de apresentação não são enviadas. Um repositório privado mantém a cópia de segurança completa, e a caixa de diálogo de ligação diz-te qual é o caso. As fotos de um ficheiro de CV importado perdem os metadados da câmara, incluindo a localização GPS, antes de serem guardadas.',
  fix_hidden_entries_stay_hidden:
    'O que ocultas permanece oculto. Editar, mover, ordenar ou eliminar outra entrada podia fazer reaparecer uma oculta, tal como uma reorganização das tuas competências por IA ou a pré-visualização de exemplo de um CV vazio. Essas mesmas ações já não aceitam discretamente uma sugestão de IA a que ainda não respondeste.',
  fix_keyboard_screen_reader:
    'Mais fluido com teclado e leitor de ecrã: uma nova primeira entrada abre-se logo, o campo da rede social funciona como uma lista a sério e os botões são anunciados pelo nome.',
  fix_language_polish:
    'Acabamento linguístico em toda a app: títulos de secção corrigidos em italiano, búlgaro, turco e português, um İ maiúsculo com ponto nos CV turcos, os últimos ecrãs em inglês traduzidos e conteúdo de exemplo real num CV vazio em doze idiomas.',
  fix_reduced_json_hides_sections:
    'O JSON «Reduzido» na página JSON bruto passa a deixar de fora tudo o que o teu CV oculta — uma secção inteira que ocultaste e uma foto de perfil oculta —, assim como as partes da morada que o teu CV omite e os campos de projeto mantidos apenas a partir de um ficheiro importado.',
};
