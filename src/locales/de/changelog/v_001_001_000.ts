import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'ATS-freundliches Format für generierte PDF-Dateien sichergestellt',
  feat_github_backup:
    'Beim Push zu GitHub (aus dem Vorschau-Tab) wird deine Konfiguration auch entsprechend dem aktuellen Status aktualisiert',
  feat_mock_data_preview:
    'Wenn keine Daten bereitgestellt werden, werden Mock-Daten verwendet, um die Vorschauvorlagen auszufüllen, sodass du sofort eine Vorschau sehen kannst',
  feat_onboarding_flow: 'Verbessertes Onboarding-Erlebnis mit einem optimierten Willkommens-Flow',
  fix_link_references: 'Mehrere Link-Referenzen in PDF- und HTML-Themes optimiert',
  fix_lunar_sidebar_header:
    'Ein Problem wurde behoben, bei dem die Sidebar-Header im Lunar-Theme nicht angezeigt wurden',
  fix_netlify_routing:
    'Ein Problem wurde behoben, bei dem das Aktualisieren von Unterseiten auf Netlify zu einem 404-Fehler führte',
  fix_welcome_modal_scroll:
    'Ein Problem wurde behoben, bei dem das Willkommens-Modal auf kleineren Bildschirmen nicht scrollbar war',
};
