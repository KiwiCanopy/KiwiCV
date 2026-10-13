import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Prolonger',
  get_premium: 'Passer au Premium',
  joined_on: 'Inscrit le {{date}}',
  member_fallback: 'Membre',
  modals: {
    delete_account: {
      confirm_btn: 'Supprimer définitivement le compte',
      consent_label:
        'Je consens à perdre tous les jours restants de mon Pass Premium et je comprends que cette action est irréversible.',
      description:
        'Es-tu sûr de vouloir supprimer ton compte ? Cette action est permanente et ne peut être annulée.',
      error_message: 'La suppression du compte a échoué. Réessaie ou contacte le support.',
      premium_warning: "Ton statut premium (actif jusqu'au {{date}}) sera immédiatement annulé.",
      remove_github: 'Retirer aussi la connexion GitHub de cet appareil',
      success_message: 'Ton compte a été supprimé avec succès.',
      title: 'Supprimer le compte',
    },
    profile_missing: {
      description:
        "Ton profil utilisateur est introuvable. Essaie de te déconnecter et de te reconnecter. Si le problème persiste, contacte l'équipe KiwiCV via {{email}} ou supprime ton compte pour recommencer.",
      title: 'Profil non trouvé',
    },
  },
  renew: 'Renouveler',
  security_privacy: 'Sécurité et confidentialité',
  status: 'Statut',
  status_free: 'Gratuit',
  status_pro: 'Pro',
  valid_until: "Valide jusqu'au",
};
