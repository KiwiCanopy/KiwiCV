import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Escala de tamaño de fuente',
    },
  },
  cv_defaults: {
    title: 'Configuración del CV',
  },
  danger: {
    delete_btn: 'Borrar todo',
    delete_data: 'Borrar Datos',
    delete_data_desc: 'Esto borrará todos tus datos locales de forma irrecuperable.',
    title: 'Zona Peligrosa',
  },
  export: {
    available_variables: 'Variables',
    format_tokens: 'Tokens de FORMAT:',
    pattern_error_brackets: 'Patrón no válido: corchetes desequilibrados.',
    pattern_tip: 'Usa {date-YYYYMMDD} o {date-YYYY-MM-DD_HHmm}. Aplicable a nuevas exportaciones.',
    project_name: 'Nombre de Proyecto',
    project_name_desc: 'Define la base del nombre del proyecto para tus exportaciones.',
  },
  github: {
    disconnect_success: 'GitHub se ha desconectado correctamente.',
    error_forbidden: 'Acceso prohibido o límite de frecuencia excedido',
    error_invalid_token: 'Token de GitHub no válido. Por favor, comprueba tu PAT.',
    error_repo_not_found: 'Repositorio no encontrado',
    hide_token: 'Ocultar token',
    modal_connect_btn: 'Conectar y sincronizar',
    modal_description:
      'Conecta tu repositorio de GitHub para mantener tu currículum sincronizado en todos los dispositivos y desplegarlo en GitHub Pages.',
    modal_pat_placeholder: 'ghp_tu_token_de_acceso_personal',
    modal_repo_placeholder: 'usuario/repositorio',
    modal_title: 'Sincronizar con GitHub',
    pat_creation_tip:
      "No olvides seleccionar 'Only select repositories' y especificar la fecha de caducidad deseada.",
    pat_security_note:
      "Consejo de seguridad: Utiliza un Personal Access Token 'Fine-grained' con solo acceso de lectura/escritura de 'Contents' a tu repositorio específico para garantizar la máxima seguridad. Puedes crear uno en el siguiente enlace: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'En un repositorio público, o publicado con GitHub Pages, las copias de seguridad dejan fuera todo lo que has ocultado, tu carta de presentación y los datos de archivos importados. Siguen incluyendo los nombres y los datos de contacto de tus referencias y los nombres de archivo y de carpeta que eliges al exportar, que pueden indicar la empresa a la que optas. Si más adelante haces público un repositorio privado o lo publicas con GitHub Pages, lo que ya contiene también puede pasar a ser público.',
    remember_pat: 'Almacenar el token en este navegador',
    remember_pat_tip:
      'Si está desactivado, el token solo se almacena para la sesión actual y se borrará al cerrar la pestaña.',
    repo_name: 'Repositorio',
    show_token: 'Mostrar token',
  },
  interface: {
    appearance: 'Apariencia',
    install: {
      action: 'Instalar KiwiCV',
      description: 'Abre KiwiCV como cualquier otra aplicación, en su propia ventana.',
      installed: 'Instalado en este dispositivo',
      ios_hint: 'Toca Compartir y, después, Añadir a pantalla de inicio.',
      label: 'Aplicación',
      unsupported:
        'Si tu navegador puede instalar aplicaciones, busca «Instalar» en la barra de direcciones o en el menú.',
    },
    language: 'Idioma de la interfaz',
    language_description: 'Selecciona tu idioma preferido para la interfaz de la aplicación.',
    theme_description: 'Elige tu tema.',
    theme_options: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
    title: 'Interfaz',
  },
  title: 'Ajustes',
};
