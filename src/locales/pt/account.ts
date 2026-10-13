import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Prolongar',
  get_premium: 'Obter Premium',
  joined_on: 'Entrou em {{date}}',
  member_fallback: 'Membro',
  modals: {
    delete_account: {
      confirm_btn: 'Eliminar conta permanentemente',
      consent_label:
        'Concordo em perder todos os dias restantes do meu Pass Premium e entendo que esta ação não pode ser revertida.',
      description:
        'Tens a certeza de que queres eliminar a tua conta? Esta ação é permanente e não pode ser desfeita.',
      error_message:
        'Falha ao eliminar a conta. Tenta novamente ou entra em contacto com o suporte.',
      premium_warning: 'O teu estatuto premium (ativo até {{date}}) será cancelado imediatamente.',
      remove_github: 'Remover também a ligação ao GitHub deste dispositivo',
      success_message: 'A tua conta foi eliminada com sucesso.',
      title: 'Eliminar conta',
    },
    profile_missing: {
      description:
        'O teu perfil de utilizador não foi encontrado. Tenta terminar a sessão e iniciar novamente. Se o problema persistir, contacta a equipa do KiwiCV através de {{email}} ou elimina a tua conta para começar de novo.',
      title: 'Perfil não encontrado',
    },
  },
  renew: 'Renovar',
  security_privacy: 'Segurança e privacidade',
  status: 'Estado',
  status_free: 'Grátis',
  status_pro: 'Pro',
  valid_until: 'Válido até',
};
