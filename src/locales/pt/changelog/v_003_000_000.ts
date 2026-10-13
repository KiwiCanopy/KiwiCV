import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'Importação IA',
      content:
        'Importa o teu currículo aqui. Uma vez carregado, este botão torna-se o teu poderoso assistente de IA. Fica atento ao {wardsymbol} na aplicação.',
      title: 'Importação e Assistente IA',
    },
    'google-drive': {
      badge: 'Sincronização Cloud',
      content:
        'Sincroniza o teu currículo perfeitamente com o Google Drive para fácil acesso em qualquer lugar.',
      title: 'Integração com Google Drive',
    },
    webhosting: {
      badge: 'Webhosting',
      content: 'Aprende a publicar o teu currículo como um site pessoal em apenas alguns minutos.',
      title: 'Alojamento Web simples',
    },
  },
  feat_ai_import_assistant:
    'Uma nova forma de começar! O KiwiCV permite agora a importação de conteúdos de currículos com a ajuda de LLMs externos diretamente do editor. Anteriormente limitada à visita de boas-vindas, esta funcionalidade está agora disponível para todos — permitindo uma transição perfeita de um simples prompt para um currículo perfeitamente formatado.',
  feat_brand_contact_modal:
    'Entra em contacto! Um novo formulário de contacto foi adicionado para facilitar a partilha de feedback, o reporte de problemas ou a sugestão de novas funcionalidades diretamente ao KiwiCV.',
  feat_deletion_prevention:
    'Adicionados avisos de confirmação antes de eliminar itens em todas as secções, para evitar a perda acidental de dados.',
  feat_google_drive_sync:
    'A sincronização com o Google Drive chegou! O KiwiCV agora suporta a sincronização segura com o teu Google Drive pessoal, oferecendo ainda mais flexibilidade para manter os teus dados sincronizados em todos os teus dispositivos. O motor de sincronização foi completamente reinventado para suportar vários fornecedores simultaneamente — tudo isto mantendo os teus dados estritamente sob o teu controlo para a máxima privacidade.',
  feat_language_aware_restore:
    'Descoberta inteligente na nuvem. Quer inicies uma restauração nas definições, inicies sessão via Google Drive ou reconfigures a tua ligação ao GitHub, o KiwiCV identifica inteligentemente os backups disponíveis em segundo plano. Assim, podes restaurar com um único clique a versão de idioma exata de que precisas.',
  feat_localized_language_display:
    'Localização melhorada. Os seletores de idioma do CV agora são traduzidos para o teu idioma de interface atual, enquanto a seleção do idioma da interface permanece na sua forma nativa para melhor acessibilidade.',
  feat_robust_manual_import:
    'Importação manual robusta. Embora o KiwiCV ofereça agora o seu próprio modelo de IA seguro para importação de currículos, continuamos a melhorar as funcionalidades que apoiam a independência dos nossos utilizadores. Copia diretamente o teu currículo de qualquer chat de IA (como o Gemini ou o ChatGPT) – o nosso importador identifica e limpa agora automaticamente artefactos incómodos, como etiquetas de citação ou blocos Markdown.',
  fix_design_tab_overflow:
    'Melhor gestão de transbordamento e seleção de temas centrada no separador de design para uma experiência mais equilibrada e acessível em todos os dispositivos.',
  fix_intelligent_address_cc:
    'Formatação de morada inteligente. O KiwiCV agora oculta de forma inteligente o código do país para currículos nacionais. O país apenas aparece quando a tua localização difere do idioma principal do currículo, garantindo uma apresentação mais limpa e profissional.',
  fix_pagebreaks_reset_on_edit:
    'Corrigido um problema em que as quebras de página manuais eram redefinidas involuntariamente ao editar o conteúdo do currículo. O teu layout personalizado agora permanece exatamente como o configuraste.',
  fix_project_keywords_cleanup:
    'Limpeza de dados. Removidos campos de palavras-chave não funcionais das secções de Projeto e Projeto Privado.',
  other_language_polish:
    'Aperfeiçoado para um público global. As formulações em várias línguas foram refinadas para tornar os fluxos de trabalho de criação de currículos mais intuitivos e fáceis de navegar para todos.',
  perf_high_growth_optimization:
    'Concebido para a excelência. O KiwiCV introduziu melhorias significativas de desempenho interno para garantir uma experiência fluida e reativa à medida que a plataforma continua a evoluir e a crescer.',
  refactor_language_certificate:
    'Renomeada a chave JSON `languages.fluency` para `certificate` para refletir melhor o seu propósito, com um fallback legado para compatibilidade com versões anteriores.',
  refactor_sync_organization:
    "Refinado para maior consistência. A pasta de armazenamento na nuvem foi renomeada de 'backup' para 'backups' para se alinhar perfeitamente com a estrutura de dados do KiwiCV. O suporte para pastas legadas permanece ativo, garantindo que os teus dados existentes continuem a ser corretamente identificados e sincronizados.",
  ui_enhancements:
    'Elevando a experiência de construção de currículos. Introduzimos melhorias abrangentes na interface do utilizador e refinamentos de layout para tornar o KiwiCV mais intuitivo, acessível e fácil de navegar em todos os idiomas suportados.',
  ui_improved_extras_section:
    "Atualização completa do manual. A secção 'Como fazer' foi redesenhada com novas dicas de layout, domínio das quebras de página e guias de backup multilingues inteligentes.",
  ui_multi_cloud_interface:
    'Gestão multi-cloud simples. A interface de utilizador foi refinada para gerir elegantemente vários serviços de sincronização ao mesmo tempo, oferecendo uma visão clara e intuitiva do estado de sincronização dos teus dados.',
  ui_refined_experience:
    'Experiência de utilizador refinada. Foram implementadas melhorias subtis na interface de utilizador e ajustes de layout em toda a plataforma para garantir um processo de criação de currículos mais polido e intuitivo.',
  ui_swedish_support:
    'Välkommen! O KiwiCV agora suporta oficialmente o sueco. Desfruta de uma experiência totalmente localizada, desde o editor até ao teu currículo exportado.',
};
