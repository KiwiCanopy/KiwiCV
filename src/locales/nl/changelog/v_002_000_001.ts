import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Blijf op de hoogte: Een 'Wat is er nieuw'-venster toegevoegd dat de nieuwste functies en verbeteringen benadrukt na een update.",
  fix_html_preview_scrolling:
    'Een probleem opgelost waarbij het HTML-voorbeeldvenster in bepaalde browsers niet meer scrollbar was.',
  fix_onboarding_tour_mobile_overlay:
    'Probleem met de positionering opgelost waarbij de Onboarding-tour op kleine schermen over de gemarkeerde elementen heen kon vallen.',
  fix_sidebar_position_placeholders:
    'Probleem opgelost waarbij de zijbalkpositie niet gewisseld kon worden bij voorbeeldgegevens.',
  fix_ui_header_action_bubbling:
    'Naadloze editoracties: Het in- of uitschakelen van de zichtbaarheid of het toevoegen van nieuwe items in sectiekoppen activeert geen ongewenst uit- of inklappen meer.',
  perf_ats_rendering_optimization:
    "ATS-optimalisatie: de inhoud van de hoofdkolom krijgt nu altijd voorrang bij schermlezers in alle tweekoloms thema's.",
  refactor_backend_cleanup:
    'Opschonen van backend en metadata door verouderde sleutels uit gegeneerde JSON-bestanden te verwijderen voor een strakkere datastructuur.',
  refactor_package_upgrades:
    'Belangrijke onderhuidse optimalisatie met een upgrade naar Node 24 (vanaf Node 22) en Vite 8 voor een veiligere en modernere ervaring.',
  ui_interactive_3d_buttons:
    'Design-unificatie: Het tactiele 3D-knoppensysteem is in de hele applicatie gestandaardiseerd voor een consistenter en hoogwaardiger gevoel.',
  ui_section_field_ordering:
    'Invoervelden van het formulier opnieuw gerangschikt om ze af te stemmen op de visuele hiërarchie van het gegenereerde cv.',
};
