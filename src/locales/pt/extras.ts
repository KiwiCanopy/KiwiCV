import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'O KiwiCV é uma de várias ferramentas criadas sob a alçada do KiwiCanopy. Explora o resto da família.',
    family_title: 'Parte da família KiwiCanopy',
    kiwicanopy_desc: 'A casa da família KiwiCanopy, onde todas as ferramentas vivem juntas.',
    kiwidesk_desc: 'Uma aplicação irmã na família KiwiCanopy.',
    story_p1:
      'Seja comigo mesmo ou em conversas com amigos e conhecidos – experimentei repetidamente a mesma frustração: a tarefa árdua de reescrever o currículo para cada nova candidatura. Todos desejam adaptar as suas experiências especificamente à respectiva vaga sem que o currículo pareça imediatamente sobrecarregado. No entanto, as ferramentas convencionais tornam exatamente isso um tormento: para cada pequeno ajuste, muitas vezes é necessário criar um documento completamente novo, o que termina rapidamente num caos interminável de versões.',
    story_p2:
      'Foi precisamente por esta razão que criei o KiwiCV: um construtor de currículos modular onde podes facilmente ativar e desativar secções individuais, mover segmentos livremente e exportar de forma flexível – tudo a partir de uma visão central única. Acabou-se o tedioso copiar e colar entre inúmeros documentos Word. Todo o teu histórico de carreira ganha um lar permanente, e tu selecionas calmamente apenas o que queres mostrar para cada candidatura.',
    story_title: 'A história por trás do KiwiCV',
    title: 'Sobre o KiwiCV',
    visit_site: 'Visitar site',
  },
  howto: {
    core: {
      ai_assistant: 'Assistente IA',
      ai_assistant_desc:
        'Usa o Assistente de IA para otimizar itens individuais, secções ou todo o teu currículo. Procura o ícone {wardsymbol}!',
      hide_show: 'Ocultar/Mostrar',
      hide_show_desc:
        'Para evitar remover e reinserir entradas constantemente, podes ocultar itens individuais ou secções inteiras com um único clique.',
      move_items_desc:
        'Arrasta e larga secções ou itens individuais entre a barra lateral e a coluna principal.',
      page_breaks: 'Quebras de página',
      page_breaks_desc:
        'Insere quebras de página manuais para garantir que a tua exportação de PDF fique perfeita. Isto afeta apenas o PDF, não a versão web.',
      rearrange: 'Rearranjar',
      rearrange_desc: 'Reordena itens em qualquer secção para focares no que queres destacar.',
      switch_sides: 'Trocar lados',
      switch_sides_desc:
        'Troca facilmente a coluna principal e a barra lateral para encontrares o melhor layout.',
      title: 'Funções principais',
    },
    footer: {
      message:
        'Esperamos que escrever o teu currículo seja mais divertido com o KiwiCV! Boa sorte!',
    },
    github: {
      create_pat_link: 'Criar token no GitHub',
      create_repo_link: 'Criar repositório no GitHub',
      go_to_settings: 'Ir para Definições',
      intro:
        'Liga o teu currículo a um repositório GitHub para processamento automático de vários idiomas, controlo de versões e alojamento simples. Segue estes três passos:',
      pat_security_tip:
        "Dica de segurança: usa um Personal Access Token 'Fine-grained' com apenas acesso de leitura/escrita de 'Contents' ao teu repositório específico. Lembra-te de selecionar 'Only select repositories' e definir a tua data de expiração preferida.",
      step1_desc:
        'Cria um novo repositório privado no GitHub. Podes deixá-lo completamente vazio por enquanto (não são necessários README ou .gitignore).',
      step1_title: 'Cria um repositório',
      step2_desc:
        'Precisas de um Personal Access Token (PAT) para permitir que o KiwiCV faça push para o teu repositório. Recomendo um token fine-grained para máxima segurança.',
      step2_title: 'Cria um Personal Access Token',
      step3_desc:
        'Vai à página de Definições e insere os detalhes do teu repositório e o token na secção do GitHub. Alternativamente, clica no botão GitHub no canto superior direito para abrir um formulário onde também podes inserir o teu PAT.',
      step3_title: 'Ligar no KiwiCV',
      title: 'Guia de ligação ao GitHub',
    },
    hosting: {
      automated_title: 'Opção B: Alojamento automatizado (via GitHub)',
      github_pages_desc:
        'Usa o ficheiro HTML gerado pelo KiwiCV e carrega-o para um repositório GitHub. Ativa o GitHub Pages nas definições do repositório para obteres um URL público gratuito para o teu currículo.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Podes alojar gratuitamente a versão HTML gerada do teu currículo. Aqui estão as opções mais comuns:',
      manual_title: 'Opção A: Carregamento manual (não é necessário GitHub)',
      netlify_desc:
        'Serviços como o Netlify ou o Vercel oferecem alojamento estático gratuito com fácil implementação por arrastar e largar ou sincronização automática com o teu repositório GitHub. Podes simplesmente carregar o teu currículo HTML lá sem expor o teu histórico de edição.',
      netlify_drop_desc:
        'Garante a tua vantagem competitiva com um URL pessoal. Existem muitos **fornecedores gratuitos** onde podes colocar o teu currículo online **em segundos**. Seja através da ferramenta ligada acima ou de alternativas como [Tiiny.host](https://tiiny.host): um rápido **arrastar e largar** do teu site é tudo o que precisas para teres uma presença profissional na web.',
      netlify_drop_title: 'Rápido e fácil: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        'Aviso: a menos que tenhas um plano GitHub pago, tens de tornar o teu repositório público para usares o GitHub Pages. Isto significa que todo o histórico do teu currículo (todos os commits) estará visível para todos! Se a privacidade for importante para ti, considera usar a primeira opção.',
      push_folder_hint:
        'O KiwiCV suporta exclusivamente o envio (push) do ficheiro HTML para uma pasta específica no teu repositório. Verifica as definições avançadas na página de pré-visualização.',
      sensitive_data_warning:
        'Aviso de privacidade: Se alojares o teu currículo num URL público, qualquer pessoa pode aceder aos teus dados. Considera remover informações pessoais altamente sensíveis, como a tua morada exata, número de telefone e e-mail.',
      title: 'Alojar o teu currículo',
    },
    pdf_guide: {
      font_size: 'Tamanho da fonte',
      font_size_desc: 'Ajusta o tamanho da fonte no separador Design para otimizar o espaço.',
      intro:
        'A renderização de PDF é complexa. Experimenta as seguintes funcionalidades até que o documento esteja perfeito:',
      rearrange_sections: 'Rearranjar',
      rearrange_sections_desc: 'Reordenar secções pode corrigir quebras de página estranhas.',
      space_opt: 'Otimização de espaço',
      space_opt_desc: 'Mover uma secção curta para a barra lateral pode libertar espaço.',
      title: 'Dicas de layout PDF',
      use_pagebreaks: 'Usar quebras de página',
      use_pagebreaks_desc:
        'Itens próximos da margem podem renderizar mal. Usa quebras de página para os mover de forma limpa.',
    },
    sync_guide: {
      auto_recognition_desc:
        'A mudança de idioma aciona uma verificação para ver se já existe uma versão na nuvem.',
      auto_recognition_title: 'Reconhecimento automático',
      desc: 'O KiwiCV gere vários idiomas. Quando guardas ou fazes um backup, a aplicação cria uma versão específica para o idioma ativo. Mais tarde, reconhecerá os backups existentes para os restaurar.',
      language_specific_desc:
        'Cada versão de idioma é armazenada como uma entrada separada no teu repositório na nuvem.',
      language_specific_title: 'Específico do idioma',
      title: 'Backups de idiomas inteligentes',
    },
    toc_title: 'ÍNDICE',
  },
  page_description:
    'Contexto, suporte e visão: descobre como tirar o máximo partido do KiwiCV, para onde estamos a caminhar e a história por trás do teu criador de currículos.',
  page_title: 'Extras',
  tabs: {
    about: 'Sobre o KiwiCV',
    changelog: 'Changelog',
    howto: 'Guias',
    roadmap: 'Roteiro',
  },
};
