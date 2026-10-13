import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Garantito formato ATS-friendly per i file PDF generati',
  feat_github_backup:
    'Al push su GitHub (dalla scheda di anteprima) la tua configurazione verrà aggiornata in base allo stato attuale',
  feat_mock_data_preview:
    "Se non vengono forniti dati, verranno utilizzati dati fittizi per riempire i template di anteprima, consentendoti di vedere immediatamente un'anteprima",
  feat_onboarding_flow:
    'Esperienza di onboarding migliorata con un flusso di benvenuto ottimizzato',
  fix_link_references: 'vari riferimenti ai link ottimizzati nei temi PDF e HTML',
  fix_lunar_sidebar_header:
    'Risolto un problema per cui gli header della sidebar non venivano visualizzati nel tema Lunar',
  fix_netlify_routing:
    "Risolto un problema per cui l'aggiornamento delle sottopagine su Netlify causava un errore 404",
  fix_welcome_modal_scroll:
    'Risolto un problema per cui il modale di benvenuto non era scorrevole su schermi più piccoli',
};
