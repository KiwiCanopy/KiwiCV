import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Gezorgd voor ATS-vriendelijk formaat voor gegenereerde PDF-bestanden',
  feat_github_backup:
    'Bij het pushen naar GitHub (vanaf het tabblad preview) wordt je configuratie ook bijgewerkt volgens de huidige status',
  feat_mock_data_preview:
    'Als er geen gegevens worden verstrekt, worden mock-gegevens gebruikt om de voorbeeldtemplates in te vullen, zodat je onmiddellijk een voorbeeld kunt zien',
  feat_onboarding_flow: 'Verbeterde onboarding-ervaring met een verbeterde welkomstflow',
  fix_link_references: "diverse linkreferenties geoptimaliseerd in PDF- en HTML-thema's",
  fix_lunar_sidebar_header:
    'Probleem opgelost waarbij de sidebar-headers niet werden weergegeven in het Lunar-thema',
  fix_netlify_routing:
    "Probleem opgelost waarbij het vernieuwen van subpagina's op Netlify resulteerde in een 404-fout",
  fix_welcome_modal_scroll:
    'Probleem opgelost waarbij de welkomstmodal niet scrollbaar was op kleinere schermen',
};
