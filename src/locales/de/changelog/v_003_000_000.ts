import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'KI Import',
      content:
        'Hier kannst du deinen Lebenslauf importieren. Sobald die Daten geladen sind, verwandelt sich dieser Button in deinen leistungsstarken KI-Assistenten für die Optimierung deines CVs. Halte einfach Ausschau nach dem {wardsymbol} in der App.',
      title: 'Import & KI-Assistent',
    },
    'google-drive': {
      badge: 'Cloud Sync',
      content:
        'Synchronisiere deinen Lebenslauf nahtlos mit Google Drive für einfachen Zugriff von überall.',
      title: 'Google Drive Integration',
    },
    webhosting: {
      badge: 'Webhosting',
      content:
        'Erfahre, wie du deinen Lebenslauf in wenigen Minuten als eigene Website veröffentlichst.',
      title: 'Einfaches Webhosting',
    },
  },
  feat_ai_import_assistant:
    'Ein neuer Weg, um durchzustarten! KiwiCV ermöglicht jetzt den Import von Lebenslaufinhalten mithilfe externer LLMs direkt aus dem Editor heraus. Diese Funktion, die zuvor auf die Onboarding-Tour beschränkt war, steht nun allen zur Verfügung – für einen nahtlosen Übergang von einem einfachen Prompt zu einem perfekt gestalteten Lebenslauf.',
  feat_brand_contact_modal:
    'Direkter Kontakt! Ein neues, zentrales Kontaktformular erleichtert das Teilen von Feedback, das Melden von Problemen oder das Vorschlagen neuer Funktionen direkt an KiwiCV.',
  feat_deletion_prevention:
    'Bestätigungsabfragen für das Löschen von Einträgen in allen Bereichen hinzugefügt, um versehentlichen Datenverlust zu verhindern.',
  feat_google_drive_sync:
    'Google Drive Sync ist da! KiwiCV unterstützt jetzt die sichere Synchronisation mit deinem persönlichen Google Drive und bietet dir noch mehr Flexibilität, um deine Daten geräteübergreifend aktuell zu halten. Die Sync-Engine wurde komplett neu konzipiert, um mehrere Anbieter gleichzeitig zu unterstützen – und das alles, während deine Daten für maximale Privatsphäre strikt unter deiner Kontrolle bleiben.',
  feat_language_aware_restore:
    'Intelligente Cloud-Wiederherstellung. Ganz gleich, ob du eine Wiederherstellung in den Einstellungen startest, dich bei Google Drive anmeldest oder deine GitHub-Verbindung neu einrichtest – KiwiCV erkennt automatisch im Hintergrund, für welche Sprachen ein Backup hinterlegt ist. So kannst du mit einem Klick genau die Sprachversion wiederherstellen, die du gerade benötigst.',
  feat_localized_language_display:
    'Erweiterte Lokalisierung. Die Auswahlfelder für die CV-Sprache werden nun in deine aktuelle UI-Sprache übersetzt, während die UI-Spracheinstellung zur besseren Barrierefreiheit in ihrer nativen Form bleibt.',
  feat_robust_manual_import:
    'Robusterer manueller Import. Auch wenn KiwiCV mittlerweile ein eigenes sichereres KI-Modell zum Importieren von Lebensläufen anbietet, arbeiten wir weiterhin an Features, die die Unabhängigkeit unserer Nutzer unterstützen. Kopiere deinen Lebenslauf direkt aus beliebigen KI-Chats (wie Gemini oder ChatGPT) – unser Importer erkennt und bereinigt nun automatisch störende Artefakte wie Zitat-Tags oder Markdown-Blöcke.',
  fix_design_tab_overflow:
    'Bessere Handhabung von Überläufen und zentrierte Theme-Auswahl im Design-Tab für eine ausgewogenere und barrierefreiere Nutzung auf allen Geräten.',
  fix_intelligent_address_cc:
    'Intelligente Adressformatierung. KiwiCV blendet den Ländercode bei inländischen Lebensläufen nun intelligent aus. Das Land erscheint nur dann, wenn dein Standort von der Primärsprache des Lebenslaufs abweicht, was für eine sauberere und professionellere Darstellung sorgt.',
  fix_pagebreaks_reset_on_edit:
    'Ein Problem behoben, bei dem manuelle Seitenumbrüche nach dem Bearbeiten von Inhalten unbeabsichtigt zurückgesetzt wurden. Dein benutzerdefiniertes Layout bleibt jetzt genau so, wie du es eingestellt hast.',
  fix_project_keywords_cleanup:
    'Datenbereinigung. Überflüssige, nicht funktionale Keyword-Felder aus den Abschnitten Projekt und Privates Projekt entfernt.',
  other_language_polish:
    'Feinschliff für ein globales Publikum. Die Formulierungen in mehreren Sprachen wurden verfeinert, um die Arbeitsabläufe bei der Erstellung von Lebensläufen für alle intuitiver und einfacher zu gestalten.',
  perf_high_growth_optimization:
    'Auf Exzellenz getrimmt. KiwiCV hat bedeutende Leistungsverbesserungen unter der Haube eingeführt, um ein flüssiges und reaktionsschnelles Erlebnis zu gewährleisten, während sich die Plattform ständig weiterentwickelt.',
  refactor_language_certificate:
    'JSON-Key `languages.fluency` in `certificate` umbenannt, um den Sinn des Feldes besser widerzuspiegeln. Inklusive Legacy-Fallback für volle Abwärtskompatibilität.',
  refactor_sync_organization:
    'Auf Konsistenz getrimmt. Der Cloud-Speicherordner wurde von „backup“ in „backups“ umbenannt, um ihn perfekt an die Datenstruktur von KiwiCV anzupassen. Die Unterstützung für bestehende Ordner bleibt aktiv, damit deine vorhandenen Daten weiterhin korrekt erkannt und synchronisiert werden.',
  ui_enhancements:
    'Optimiertes Nutzererlebnis. Wir haben umfassende UI-Verbesserungen und Layout-Anpassungen eingeführt, um KiwiCV in allen unterstützten Sprachen intuitiver, zugänglicher und einfacher bedienbar zu machen.',
  ui_improved_extras_section:
    "Umfassendes Handbuch-Update. Der 'Extras'-Bereich wurde komplett überarbeitet, inklusive neuer Layout-Tipps, Unterstützung für Seitenumbrüche und Guides für intelligente mehrsprachige Backups.",
  ui_multi_cloud_interface:
    'Nahtloses Multi-Cloud-Management. Die Benutzeroberfläche wurde verfeinert, um mehrere Sync-Dienste gleichzeitig elegant zu verwalten und eine klare sowie intuitive Ansicht des Synchronisationsstatus deiner Daten zu bieten.',
  ui_refined_experience:
    'Verfeinerte Benutzererfahrung. Subtile UI-Verbesserungen und Layout-Anpassungen wurden auf der gesamten Plattform implementiert, um einen noch geschliffeneren und intuitiveren Prozess bei der Erstellung des Lebenslaufs zu gewährleisten.',
  ui_swedish_support:
    'Välkommen! KiwiCV unterstützt jetzt offiziell Schwedisch. Genieße eine vollständig lokalisierte Erfahrung, vom Editor bis zu deinem exportierten Lebenslauf.',
};
