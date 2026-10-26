import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Ofertas de emprego',
      content:
        'Cola o link da oferta na janela de exportação quando fazes a cópia de segurança de um CV para o Google Drive ou para um repositório GitHub privado e abre-o a partir de «Os Meus CVs» sempre que precisares. Os repositórios públicos nunca recebem o link.',
      title: 'Lembra-te de onde te candidataste',
    },
  },
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  feat_cover_letter_style_default:
    'Com uma amostra de escrita guardada, as tuas cartas de apresentação começam agora em «Adaptar ao meu estilo de escrita», mesmo num novo separador do navegador. Se escolheres um tom, o KiwiCV mantém-no nesse separador.',
  feat_export_cmd_enter:
    'Prime Cmd+Enter (Ctrl+Enter no Windows) na janela de exportação para iniciar a exportação sem ires ao botão.',
  feat_export_cover_letter_switch:
    'A janela de exportação mostra agora se a tua carta de apresentação está incluída, com um interruptor para a adicionar ou deixar de fora, e avisa-te quando a carta pode não corresponder ao anúncio de emprego ao qual acabaste de adaptar o teu CV, para a poderes verificar antes de a enviar.',
  feat_job_posting_link:
    'Adiciona o link da oferta quando fazes a cópia de segurança de um CV para o Google Drive ou para um repositório GitHub privado e abre-o diretamente a partir dessa versão em «Os Meus CVs». Os repositórios GitHub públicos nunca o recebem.',
  fix_basics_proposal_gap:
    'Uma proposta da IA em «Dados Básicos» já não fica colada à tua fotografia.',
  fix_json_resume_import_levels:
    'Ao importar um ficheiro JSON Resume, o KiwiCV passa a converter a fluência de um idioma, por exemplo «Native» ou «B2», no respetivo nível, e lê os níveis de competência escritos por extenso, por exemplo «Expert». Se uma experiência profissional incluir a descrição da empresa, a importação avisa-te agora de que o KiwiCV não tem um campo para a guardar, em vez de a descartar em silêncio.',
  fix_sign_out_forgets_export_details:
    'Ao terminares sessão, o KiwiCV passa a esquecer também a empresa, o cargo e o link da oferta que escreveste na janela de exportação, para que a próxima pessoa que iniciar sessão neste navegador não os veja.',
  fix_tailoring_matches_job_ad:
    'A adaptação a uma oferta reescreve agora a tua experiência laboral em função do anúncio de emprego e ajusta o teu título profissional, em vez de apenas reestruturar as tuas competências.',
  ui_export_footer_pinned:
    'Exportar e Cancelar ficam agora visíveis no fundo da janela de exportação em ecrãs mais pequenos.',
  ui_restructure_skills_default:
    '«Reestruturar Competências» vem agora assinalado quando melhoras o CV inteiro, para que a adaptação reagrupe por predefinição as tuas competências em função da vaga. Desmarca-o para manteres a tua própria estrutura; cada alteração continua a chegar como uma proposta que podes aceitar ou rejeitar.',
};
