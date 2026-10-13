import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Estendi',
  get_premium: 'Passa a Premium',
  joined_on: 'Iscritto il {{date}}',
  member_fallback: 'Membro',
  modals: {
    delete_account: {
      confirm_btn: "Elimina definitivamente l'account",
      consent_label:
        'Accetto di perdere tutti i giorni rimanenti del mio Pass Premium e capisco che questa azione non può essere annullata.',
      description:
        'Sei sicuro di voler eliminare il tuo account? Questa azione è permanente e non può essere annullata.',
      error_message: "Impossibile eliminare l'account. Riprova o contatta il supporto.",
      premium_warning:
        'Il tuo stato premium (attivo fino al {{date}}) verrà annullato immediatamente.',
      remove_github: 'Rimuovere anche la connessione a GitHub da questo dispositivo',
      success_message: 'Il tuo account è stato eliminato con successo.',
      title: 'Elimina account',
    },
    profile_missing: {
      description:
        'Il tuo profilo utente non è stato trovato. Prova a disconnetterti e riaccedere. Se il problema persiste, contatta il team di KiwiCV tramite {{email}} o elimina il tuo account per ricominciare.',
      title: 'Profilo non trovato',
    },
  },
  renew: 'Rinnova',
  security_privacy: 'Sicurezza e privacy',
  status: 'Stato',
  status_free: 'Gratuito',
  status_pro: 'Pro',
  valid_until: 'Valido fino al',
};
