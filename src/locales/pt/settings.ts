import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Escala de tamanho da fonte',
    },
  },
  cv_defaults: {
    title: 'Definições do CV',
  },
  danger: {
    delete_btn: 'Confirmar',
    delete_data: 'Apagar tudo',
    delete_data_desc: 'Irreversível.',
    title: 'Zona de Perigo',
  },
  export: {
    available_variables: 'Variáveis',
    format_tokens: 'Tokens de FORMAT:',
    pattern_error_brackets: 'Padrão inválido: parênteses desequilibrados.',
    pattern_tip: 'Usa {date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}. Aplicável a novas exportações.',
    project_name: 'Nome do Projeto',
    project_name_desc: 'Define a base do nome do projeto para as tuas exportações.',
  },
  github: {
    disconnect_success: 'O GitHub foi desligado com sucesso.',
    error_forbidden: 'Acesso proibido ou limite de taxa atingido',
    error_invalid_token: 'Token do GitHub inválido. Por favor, verifica o teu PAT.',
    error_repo_not_found: 'Repositório não encontrado',
    hide_token: 'Ocultar token',
    modal_connect_btn: 'Ligar e sincronizar',
    modal_description:
      'Liga o teu repositório GitHub para manter o teu currículo sincronizado em todos os dispositivos e implementá-lo no GitHub Pages.',
    modal_pat_placeholder: 'ghp_teu_token_de_acesso_pessoal',
    modal_repo_placeholder: 'utilizador/repositório',
    modal_title: 'Sincronizar com GitHub',
    pat_creation_tip:
      "Lembra-te de selecionar 'Only select repositories' e especificar a data de expiração desejada.",
    pat_security_note:
      "Dica de segurança: Usa um Personal Access Token 'Fine-grained' apenas com acesso de leitura/escrita de 'Contents' ao teu repositório específico para segurança máxima. Podes criar um no seguinte link: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'Num repositório público, ou publicado com o GitHub Pages, as cópias de segurança deixam de fora tudo o que ocultaste, a tua carta de apresentação e os dados de ficheiros importados. Continuam a incluir os nomes e os contactos das tuas referências e os nomes de ficheiros e de pastas que escolhes ao exportar, que podem indicar a empresa a que te candidatas. Se mais tarde tornares público um repositório privado ou o publicares com o GitHub Pages, o que já está nele também pode tornar-se público.',
    remember_pat: 'Armazenar o token neste navegador',
    remember_pat_tip:
      'Se desativado, o token é armazenado apenas para a sessão atual e será apagado quando fechares o separador.',
    repo_name: 'Repositório',
    show_token: 'Mostrar token',
  },
  interface: {
    appearance: 'Aparência',
    install: {
      action: 'Instalar KiwiCV',
      description: 'Abre o KiwiCV como qualquer outra aplicação, numa janela própria.',
      installed: 'Instalado neste dispositivo',
      ios_hint: 'Toca em Partilhar e depois em Adicionar ao ecrã principal.',
      label: 'Aplicação',
      unsupported:
        'Se o teu navegador pode instalar aplicações, procura «Instalar» na barra de endereços ou no menu.',
    },
    language: 'Idioma da interface',
    language_description: 'Seleciona o teu idioma preferido para a interface da aplicação.',
    theme_description: 'Escolhe o teu tema.',
    theme_options: {
      dark: 'Escuro',
      light: 'Claro',
      system: 'Sistema',
    },
    title: 'Interface',
  },
  title: 'Definições',
};
