import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: 'Privat',
  choice_ai_desc: 'Ladda upp en TXT-, PDF- eller Word-fil. Inget används för att träna modeller.',
  choice_ai_paid: 'Avgiftsbelagd',
  choice_ai_title: 'AI-import',
  choice_direct_desc: 'Jag har mitt CV i KiwiCV-format.',
  choice_direct_title: 'Importera som .json-fil',
  cloud_sync_desc:
    'Hantera flerspråkiga versioner och molnsynk i ditt eget privata moln helt gratis.',
  import_error: 'Misslyckades med att importera filen. Ogiltigt format.',
  import_success: 'CV:t har importerats!',
  import_success_with_warnings: 'CV:t importerades med vissa varningar.',
  onboarding_lang: {
    cta: 'Då kör vi!',
    cv_desc: 'Styr automatiskt genererade avsnittsrubriker, datumformat och layouttexter.',
    cv_label: 'CV-språk',
    description:
      'Låt oss anpassa din arbetsyta. Välj språk för gränssnittet och för det CV du planerar att skriva.',
    note: 'Båda inställningarna kan ändras när som helst senare.',
    title: 'Välkommen till KiwiCV',
    ui_desc: 'Visar menyer, alternativ och guider på detta språk.',
    ui_label: 'Gränssnittsspråk',
  },
  tagline:
    'Standard-CV:n misslyckas mot algoritmer. Skapa perfekt anpassade versioner enkelt på ett ställe.',
  title_import: 'Importera ditt CV',
};
