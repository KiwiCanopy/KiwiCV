import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  fix_migration_notice:
    'Se ainda acedes ao KiwiCV através do endereço web anterior, o aviso indica agora a data exata em que esse endereço deixará de funcionar: 31 de outubro de 2026.',
  fix_mobile_checkout:
    'Deslizar pelos cartões de preços no telemóvel já não abre a caixa por acidente. Apenas o botão inicia a compra.',
  fix_preview_reliability:
    'A visualização já não fica presa num carregamento infinito. Um pop-up bloqueado agora avisa-te do sucedido, uma renderização interrompida para com uma explicação clara e a visualização continua a funcionar mesmo quando um serviço externo está lento ou inacessível.',
  fix_save_status:
    'A nota «Guardado neste dispositivo» reflete agora o que foi realmente guardado, em vez de mostrar a mesma confirmação independentemente do que aconteceu.',
  fix_translations:
    'Corrigidos treze textos que continham carateres do alfabeto errado (carateres cirílicos em palavras em espanhol e turco, ou coreanos e japoneses em chinês) e preenchidas as últimas lacunas em todos os quinze idiomas.',
  perf_preview_speed:
    'A primeira visualização aparece muito mais rapidamente. Antes, o KiwiCV carregava todas as fontes que pudesse precisar antes de mostrar qualquer coisa, incluindo duas fontes muito grandes em chinês e japonês. Estas agora só são carregadas se o teu CV realmente usar esses carateres.',
  ui_polish:
    'Um retoque visual: os cabeçalhos usam uma tipografia extra-negrito real em vez de uma engrossada artificialmente pelo navegador, os rótulos de formulário e marcadores são mais fáceis de ler, e os cartões de secção partilham um acento uniforme.',
};
