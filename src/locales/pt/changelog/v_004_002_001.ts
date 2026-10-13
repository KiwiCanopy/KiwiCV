import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'No telemóvel, abrir o teu CV como uma página web funciona sem problemas. A opção HTML no menu Pré-visualização costumava ficar presa num separador a dizer que estava a gerar e nunca terminava; agora mostra o teu CV renderizado imediatamente.',
  perf_phone_preview:
    'A pré-visualização abre mais depressa no telemóvel. Agora o KiwiCV prepara o motor de documentos enquanto ainda estás a editar, em vez de começar só no momento em que tocas no ecrã, e reabrir um CV que não mudou desde a última pré-visualização dispensa totalmente a espera.',
  ui_phone_layout:
    'No telemóvel, o editor e Os Meus CVs voltam a dar espaço a cada elemento. Cada backup mostra o seu nome, idioma e data de gravação numa linha própria em vez de ficar sob o botão Restaurar, o cartão «Melhorar com IA» mantém o título e o aviso de créditos em linhas separadas, e a última secção do editor deixa de ficar atrás do botão flutuante Pré-visualização.',
};
