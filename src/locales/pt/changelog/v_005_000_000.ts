import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Novo',
      content:
        'Não tens a certeza de que o KiwiCV é para ti? O novo Pass de 1 dia desbloqueia todas as funcionalidades de IA para a tua próxima candidatura, para descobrires antes de te comprometeres com um Pass mais longo. Os cartões de preços passam a oferecer 1, 7 e 30 dias.',
      title: 'Experimenta durante um dia',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Cada linha do KiwiCV é agora pública no GitHub, sob a AGPL. Vê exatamente como o teu CV é tratado, comunica um erro ou sugere uma funcionalidade: o código por trás das promessas de privacidade está lá para qualquer pessoa verificar.',
      title: 'O KiwiCV é open source',
    },
  },
  feat_ai_review_calmer:
    'Rever as propostas da IA é mais tranquilo. Competências e Idiomas passam a ter o painel de revisão em cada entrada, os campos que uma proposta reescreveu ficam só de leitura até escolheres «Manter a minha» ou «Usar a proposta», e Melhorar espera até teres decidido, para que uma segunda execução não substitua uma proposta que ainda não viste. Os leitores de ecrã anunciam cada decisão.',
  feat_ai_tailoring_keeps_facts:
    'Adaptar o teu CV a um anúncio de emprego passa a deixar intactos os teus cargos, empregadores, datas e competências listadas. Uma competência que o teu CV nunca menciona fica marcada como «Não está no teu CV — aceita só se for verdade», para decidires antes de ser adicionada.',
  feat_raw_data_extra_blocks:
    'A página JSON bruto passa a listar os dados extra que um ficheiro importado trouxe, como o bloco de definições de outra ferramenta. Abre um bloco para ler o respetivo JSON ou remove os que já não queres nas tuas exportações.',
  fix_dates:
    'As datas com o dia primeiro, como 05.06.19, passam a ser lidas como 5 de junho, não 6 de maio. Uma data que não existe, como 31.02.2019, fica como a escreveste e recebe a marca vermelha de erro.',
  fix_drive_reconnect:
    'Voltar a ligar o Google Drive passa a concluir-se sempre, ativa as cópias de segurança e começa com um envio a sério.',
  fix_photos:
    'As fotos de um CV importado perdem os metadados da câmara, incluindo a localização GPS, e as fotos GIF, HEIC e AVIF passam a JPEG. As fotos com fundo transparente ficam brancas depois de recortadas, em vez de ficarem pretas.',
  fix_preview_pdf_match:
    'A pré-visualização em direto e o PDF passam a coincidir melhor em Soft, Misty, Skyline, Swiss Grid, Lunar e Elegant: as mesmas maiúsculas, cronologias, tipos de letra e ligações. A pré-visualização já não carrega tipos de letra de um servidor de terceiros, e o título e o autor de um PDF levam só o teu nome.',
  fix_privacy_controls:
    'Tu decides o que fica neste dispositivo. Iniciar sessão com o Google só pede acesso duradouro quando ligas o Google Drive. Os cartões do Google Drive e do GitHub nas Definições oferecem sempre Desligar, ao terminares sessão ou eliminares a tua conta é-te oferecido remover também a ligação ao GitHub, e a tua amostra de escrita fica com a conta que a guardou.',
  fix_privacy_policy:
    'A política de privacidade foi reescrita. Enumera o que o KiwiCV guarda dos teus pedidos de IA (nunca o teu texto), indica o teu direito de oposição e como retirar o consentimento, e nomeia cada serviço envolvido e onde funciona.',
  fix_small_things:
    'Rodar um tablet com o menu lateral aberto já não bloqueia os toques, o botão flutuante Pré-visualização já não tapa o menu do telemóvel, um separador deixado aberto durante uma atualização recarrega na nova versão, e um CV demasiado longo para traduzir é recusado logo à partida em vez de falhar após uma longa espera.',
  ui_editor_polish:
    'De volta? A página inicial passa a dizer Continuar a editar, e Criar o teu CV abre diretamente nos teus dados pessoais. Na carta de apresentação, Assunto e Data ficam acima do texto da carta e Destinatário abre quando há um destinatário. Melhorar continua visível numa secção vazia, com uma dica sobre o que acrescentar primeiro, e os contadores de carateres da IA ficam âmbar antes do limite.',
  ui_informal_address_more_languages:
    'O espanhol, o neerlandês, o russo, o ucraniano e o búlgaro passam a tratar-te por tu em toda a app, como os outros idiomas.',
  ui_install_app:
    'Usa o KiwiCV como uma app: Definições → Interface tem agora um botão Instalar KiwiCV, e no iPhone e no iPad o KiwiCV ganha um ícone próprio quando o adicionas ao ecrã principal.',
};
