import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Copiar para a área de transferência',
  data_label: 'Dados brutos',
  download: 'Transferir JSON',
  full: 'Completo',
  full_desc: 'Meta + flags de visibilidade (Ideal para importar no KiwiCV)',
  full_title: 'Estado Completo',
  passthrough: {
    desc: 'Guardados para que outras ferramentas possam continuar a ler o teu ficheiro. Incluídos nas tuas exportações JSON e nas cópias de segurança no Drive e em repositórios privados do GitHub; nunca apresentados no teu CV nem enviados à IA.',
    remove_confirm_message:
      'Os ficheiros que exportares do KiwiCV deixarão de conter este bloco. Isto não pode ser desfeito.',
    remove_confirm_title: 'Remover «{{name}}»?',
    removed_desc:
      'A tua próxima sincronização substitui a tua cópia de segurança atual. As cópias anteriores e as versões antigas guardadas pelo Drive e pelo GitHub continuam a contê-lo até as eliminares lá.',
    removed_title: '«{{name}}» removido deste navegador',
    title: 'Dados adicionais de um ficheiro importado',
  },
  reduced: 'Reduzido',
  reduced_desc: 'itens ocultos removidos',
  reduced_title: 'JSON Reduzido',
  standard: 'Padrão',
  standard_desc: 'Sem meta, Todos os itens',
  standard_title: 'JSON Padrão',
};
