import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Scala dimensione carattere',
    },
  },
  cv_defaults: {
    title: 'Impostazioni CV',
  },
  danger: {
    delete_btn: 'Confermo',
    delete_data: 'Elimina tutto',
    delete_data_desc: 'Irreversibile.',
    title: 'Zona Pericolo',
  },
  export: {
    available_variables: 'Variabili',
    format_tokens: 'Token FORMAT:',
    pattern_error_brackets: 'Modello non valido: parentesi non bilanciate.',
    pattern_tip: 'Format {date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}.',
    project_name: 'Nome Progetto',
    project_name_desc: 'Definisci la base del nome del progetto per le tue esportazioni.',
  },
  github: {
    disconnect_success: 'GitHub è stato disconnesso con successo.',
    error_forbidden: 'Accesso negato o limite di frequenza raggiunto',
    error_invalid_token: 'Token GitHub non valido. Per favore, controlla il tuo PAT.',
    error_repo_not_found: 'Repository non trovata',
    hide_token: 'Nascondi token',
    modal_connect_btn: 'Connetti e sincronizza',
    modal_description:
      'Collega il tuo repository GitHub per mantenere il tuo curriculum sincronizzato su tutti i dispositivi e distribuirlo su GitHub Pages.',
    modal_pat_placeholder: 'ghp_il_tuo_token_di_accesso_personale',
    modal_repo_placeholder: 'username/repository',
    modal_title: 'Sincronizza con GitHub',
    pat_creation_tip:
      "Ricorda di selezionare 'Only select repositories' e specificare la data di scadenza desiderata.",
    pat_security_note:
      "Suggerimento di sicurezza: Utilizza un Personal Access Token 'Fine-grained' con solo accesso in lettura/scrittura 'Contents' al tuo repository specifico per la massima sicurezza. Puoi crearne uno al seguente link: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      "In un repository pubblico, o pubblicato con GitHub Pages, i backup escludono tutto ciò che hai nascosto, la tua lettera di presentazione e i dati dei file importati. Includono comunque i nomi e i dati di contatto delle tue referenze e i nomi dei file e delle cartelle che scegli durante l'esportazione, che possono indicare l'azienda per cui ti candidi. Se in seguito rendi pubblico un repository privato o lo pubblichi con GitHub Pages, anche ciò che contiene già può diventare pubblico.",
    remember_pat: 'Memorizza il token in modo persistente in questo browser',
    remember_pat_tip:
      'Se disattivato, il token viene memorizzato solo per la sessione corrente e verrà cancellato alla chiusura della scheda.',
    repo_name: 'Repo',
    show_token: 'Mostra token',
  },
  interface: {
    appearance: 'Aspetto',
    install: {
      action: 'Installa KiwiCV',
      description: 'Apri KiwiCV come qualsiasi altra app, in una finestra tutta sua.',
      installed: 'Installato su questo dispositivo',
      ios_hint: 'Tocca Condividi, poi Aggiungi alla schermata Home.',
      label: 'App',
      unsupported:
        'Se il tuo browser può installare app, cerca Installa nella barra degli indirizzi o nel menu.',
    },
    language: 'UI-Lingua',
    language_description: "Seleziona la tua lingua preferita per l'interfaccia dell'applicazione.",
    theme_description: 'Scegli il tema.',
    theme_options: {
      dark: 'Scuro',
      light: 'Chiaro',
      system: 'Sistema',
    },
    title: 'Interfaccia',
  },
  title: 'Impostazioni',
};
