import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Bleib auf dem Laufenden: Ein 'Was gibt's Neues'-Modal hinzugefügt, das nach einem Update die neuesten Funktionen und Verbesserungen hervorhebt.",
  fix_html_preview_scrolling:
    'Ein Problem behoben, bei dem das HTML-Vorschau-Panel in bestimmten Browsern nicht scrollbar war.',
  fix_onboarding_tour_mobile_overlay:
    'Ein Positionierungsproblem behoben, bei dem die Onboarding-Tour auf kleinen Bildschirmen die hervorgehobenen Elemente verdecken konnte.',
  fix_sidebar_position_placeholders:
    'Ein Problem behoben, bei dem sich die Position der Seitenleiste in der Vorschau für die Beispieldaten nicht tauschen ließ.',
  fix_ui_header_action_bubbling:
    'Nahtlose Editor-Aktionen: Das Umschalten der Sichtbarkeit oder das Hinzufügen neuer Einträge in den Sektions-Headern löst kein unerwünschtes Auf- oder Zuklappen mehr aus.',
  perf_ats_rendering_optimization:
    'ATS-Optimierung: Inhalte in der Hauptspalte werden nun in allen zweispaltigen Themes von Screenreadern und Scannern zuerst gelesen.',
  refactor_backend_cleanup:
    'Bereinigung des Backends und der Metadaten durch Entfernung veralteter Schlüssel aus den generierten JSON-Dateien für eine kompaktere Datenstruktur.',
  refactor_package_upgrades:
    'Umfassende Optimierung im Hintergrund durch die Aktualisierung auf Node 24 (von Node 22) und Vite 8 für ein sichereres und moderneres Erlebnis.',
  ui_interactive_3d_buttons:
    'Design-Vereinheitlichung: Das taktile 3D-Button-System wurde in der gesamten Anwendung vereinheitlicht, um ein konsistenteres und hochwertigeres Bediengefühl zu bieten.',
  ui_section_field_ordering:
    'Editor-Formularfelder neu angeordnet, um sie an die visuelle Hierarchie des gerenderten Lebenslaufs anzupassen.',
};
