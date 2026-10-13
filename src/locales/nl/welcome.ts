import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: 'Privé',
  choice_ai_desc:
    'Upload een TXT-, PDF- of Word-bestand. Niets wordt gebruikt om modellen te trainen.',
  choice_ai_paid: 'Tegen betaling',
  choice_ai_title: 'AI-import',
  choice_direct_desc: 'Ik heb mijn cv in KiwiCV-formaat.',
  choice_direct_title: 'Importeren als .json-bestand',
  cloud_sync_desc: 'Beheer meertalige versies en cloudback-ups gratis in je eigen privécloud.',
  import_error: 'Bestand importeren mislukt. Ongeldig formaat.',
  import_success: 'Cv succesvol geïmporteerd!',
  import_success_with_warnings: 'Cv geïmporteerd met een paar waarschuwingen.',
  onboarding_lang: {
    cta: 'Aan de slag!',
    cv_desc: 'Bepaalt de automatisch gegenereerde sectiekoppen, datumnotaties en lay-outteksten.',
    cv_label: 'Taal van het cv',
    description:
      'Laten we je werkruimte personaliseren. Selecteer de taal voor de interface en het cv dat je wilt gaan schrijven.',
    note: 'Beide instellingen kunnen later op elk moment worden gewijzigd.',
    title: 'Welkom bij KiwiCV',
    ui_desc: "Toont de menu's, opties en handleidingen in deze taal.",
    ui_label: 'Taal van de interface',
  },
  tagline:
    "Standaard-cv's falen door algoritmen. Maak eenvoudig perfect aangepaste versies op één plek.",
  title_import: 'Importeer je CV',
};
