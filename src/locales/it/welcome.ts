import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: 'Privato',
  choice_ai_desc: 'Carica un file TXT, PDF o Word. Niente viene usato per addestrare modelli.',
  choice_ai_paid: 'A pagamento',
  choice_ai_title: 'Importazione con IA',
  choice_direct_desc: 'Ho il mio CV nel formato KiwiCV.',
  choice_direct_title: 'Importa come file .json',
  cloud_sync_desc:
    'Gestisci gratuitamente versioni multilingue e backup cloud nel tuo cloud privato.',
  import_error: "Errore durante l'importazione del file. Formato non valido.",
  import_success: 'Curriculum importato con successo!',
  import_success_with_warnings: 'Curriculum importato con alcuni avvisi.',
  onboarding_lang: {
    cta: 'Cominciamo!',
    cv_desc:
      'Controlla le intestazioni delle sezioni generate automaticamente, i formati della data e i testi del layout.',
    cv_label: 'Lingua del curriculum',
    description:
      "Personalizziamo la tua area di lavoro. Seleziona la lingua dell'interfaccia e del curriculum che intendi scrivere.",
    note: 'Entrambe le impostazioni possono essere modificate in qualsiasi momento in seguito.',
    title: 'Benvenuto su KiwiCV',
    ui_desc: 'Mostra i menu, le opzioni e le guide in questa lingua.',
    ui_label: "Lingua dell'interfaccia",
  },
  tagline:
    'I curriculum standard falliscono contro gli algoritmi. Crea versioni perfettamente adattate facilmente in un unico posto.',
  title_import: 'Importa il tuo Curriculum',
};
