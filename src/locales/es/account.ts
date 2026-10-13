import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Extender',
  get_premium: 'Obtener Premium',
  joined_on: 'Se unió el {{date}}',
  member_fallback: 'Miembro',
  modals: {
    delete_account: {
      confirm_btn: 'Eliminar cuenta permanentemente',
      consent_label:
        'Acepto perder todos los días restantes de mi Premium Pass y entiendo que esta acción no se puede revertir.',
      description:
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente y no se puede deshacer.',
      error_message:
        'Error al eliminar la cuenta. Por favor, inténtalo de nuevo o contacta con el soporte.',
      premium_warning: 'Tu estado premium (activo hasta el {{date}}) se cancelará de inmediato.',
      remove_github: 'Eliminar también la conexión con GitHub de este dispositivo',
      success_message: 'Tu cuenta ha sido eliminada con éxito.',
      title: 'Eliminar cuenta',
    },
    profile_missing: {
      description:
        'Tu perfil de usuario no se pudo encontrar. Intenta cerrar sesión y volver a iniciarla. Si el problema persiste, ponte en contacto con el equipo de KiwiCV a través de {{email}} o elimina tu cuenta para empezar de nuevo.',
      title: 'Perfil no encontrado',
    },
  },
  renew: 'Renovar',
  security_privacy: 'Seguridad y privacidad',
  status: 'Estado',
  status_free: 'Gratis',
  status_pro: 'Pro',
  valid_until: 'Válido hasta',
};
