import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Copiar al portapapeles',
  data_label: 'Datos sin procesar',
  download: 'Descargar JSON',
  full: 'Completo',
  full_desc: 'Meta + banderas visibles (Ideal para importar a KiwiCV)',
  full_title: 'Estado Completo',
  passthrough: {
    desc: 'Se conservan para que otras herramientas puedan seguir leyendo tu archivo. Se incluyen en tus exportaciones JSON y en tus copias de seguridad en Drive y en repositorios privados de GitHub; nunca se muestran en tu CV ni se envían a la IA.',
    remove_confirm_message:
      'Los archivos que exportes desde KiwiCV ya no contendrán este bloque. Esto no se puede deshacer.',
    remove_confirm_title: '¿Quitar «{{name}}»?',
    removed_desc:
      'Tu próxima sincronización reemplaza tu copia de seguridad actual. Las copias anteriores y las versiones antiguas que guardan Drive y GitHub lo siguen conteniendo hasta que las elimines allí.',
    removed_title: '«{{name}}» quitado de este navegador',
    title: 'Datos adicionales de un archivo importado',
  },
  reduced: 'Reducido',
  reduced_desc: 'elementos ocultos eliminados',
  reduced_title: 'JSON Reducido',
  standard: 'Estándar',
  standard_desc: 'Sin meta, Todos los elementos',
  standard_title: 'JSON Estándar',
};
