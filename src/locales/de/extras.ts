import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV ist eines von mehreren Werkzeugen unter dem Dach von KiwiCanopy. Entdecke den Rest der Familie.',
    family_title: 'Teil der KiwiCanopy-Familie',
    kiwicanopy_desc: 'Das Zuhause der KiwiCanopy-Familie, in dem alle Werkzeuge zusammenleben.',
    kiwidesk_desc: 'Eine Schwester-App in der KiwiCanopy-Familie.',
    story_p1:
      'Ob bei mir selbst oder im Austausch mit Freunden und Bekannten – ich habe immer wieder die gleiche Frustration erlebt: das mühsame Umschreiben des Lebenslaufs für jede neue Bewerbung. Jeder möchte seine Erfahrungen gezielt auf die jeweilige Stelle zuschneiden, ohne dass der CV direkt überladen wirkt. Doch herkömmliche Tools machen genau das zur Qual: Für jede kleine Anpassung muss oft ein komplett neues Dokument angelegt werden, was schnell in einem endlosen Versions-Chaos endet.',
    story_p2:
      'Genau aus diesem Grund habe ich KiwiCV ins Leben gerufen: einen modularen Lebenslauf-Builder, bei dem du einzelne Stationen ganz einfach ein- und ausschalten, Sektionen frei verschieben und flexibel exportieren kannst – alles aus einer einzigen, zentralen Übersicht heraus. Kein lästiges Copy-Paste mehr zwischen unzähligen Word-Dokumenten. Deine gesamte Karrierehistorie bekommt ein festes Zuhause, und du wählst für jede Bewerbung ganz entspannt nur noch das aus, was du gerade zeigen möchtest.',
    story_title: 'Die Geschichte hinter KiwiCV',
    title: 'Über KiwiCV',
    visit_site: 'Website besuchen',
  },
  howto: {
    core: {
      ai_assistant: 'KI-Assistent',
      ai_assistant_desc:
        'Nutze den KI-Assistenten, um einzelne Einträge, Sektionen oder deinen gesamten Lebenslauf zu optimieren. Achte auf das {wardsymbol}-Icon!',
      hide_show: 'Ein-/Ausblenden',
      hide_show_desc:
        'Damit ihr nicht immer wieder Einträge entfernen und wieder einfügen müsst, gibt es die Möglichkeit, einzelne Einträge oder aber ganze Sektionen mit einem Klick auszublenden.',
      move_items_desc:
        'Verschiebe Sektionen oder einzelne Einträge per Drag & Drop zwischen Seitenleiste und Hauptspalte.',
      page_breaks: 'Seitenumbrüche',
      page_breaks_desc:
        'Füge manuelle Seitenumbrüche ein, damit dein PDF-Export genau so aussieht, wie du es dir vorstellst. Dies wirkt sich zusätzlich nur auf das PDF und nicht auf die HTML-Ansicht aus.',
      rearrange: 'Neu anordnen',
      rearrange_desc:
        'Ordne Einträge innerhalb einer Sektion neu an, um den Fokus auf das zu legen, was du hervorheben möchtest.',
      switch_sides: 'Spalten tauschen',
      switch_sides_desc:
        'Tausche Hauptspalte und Seitenleiste ganz einfach aus, um das beste Layout für deine Inhalte zu finden.',
      title: 'Kernfunktionen',
    },
    footer: {
      message:
        'Deinen Lebenslauf zu schreiben ist mithilfe von KiwiCV zukünftig hoffentlich weniger mühsam und macht mehr Spaß! Viel Erfolg bei der Jobsuche!',
    },
    github: {
      create_pat_link: 'Token auf GitHub erstellen',
      create_repo_link: 'Repository auf GitHub erstellen',
      go_to_settings: 'Zu den Einstellungen',
      intro:
        'Verbinde deinen Lebenslauf mit einem GitHub-Repository für automatisches Multi-Sprachen handling, Versionskontrolle und einfaches Hosting. Folge diesen drei Schritten:',
      pat_security_tip:
        "Sicherheitstipp: Verwende einen 'Fine-grained' Personal Access Token mit ausschließlich Lese- und Schreibzugriff für 'Contents' auf dein spezifisches Repository. Vergiss nicht, 'Only select repositories' auszuwählen und das gewünschte Ablaufdatum festzulegen.",
      step1_desc:
        'Erstelle ein neues privates Repository auf GitHub. Du kannst es vorerst komplett leer lassen (keine README und keine .gitignore werden benötigt).',
      step1_title: 'Repository erstellen',
      step2_desc:
        'Du benötigst einen Personal Access Token (PAT), damit KiwiCV in dein Repository pushen kann. Ich empfehle einen Fine-grained Token für maximale Sicherheit.',
      step2_title: 'Personal Access Token erstellen',
      step3_desc:
        'Geh zur Einstellungsseite und gib deine Repository-Details und den Token im GitHub-Bereich ein. Alternativ kannst du oben rechts auf die GitHub-Schaltfläche klicken, um ein Formular zu öffnen, in das du auch deinen PAT eingeben kannst.',
      step3_title: 'In KiwiCV verbinden',
      title: 'GitHub-Verbindung einrichten',
    },
    hosting: {
      automated_title: 'Option B: Automatisiertes Hosting (via GitHub)',
      github_pages_desc:
        'Nutze die von KiwiCV generierte HTML-Datei und lade sie in ein GitHub-Repository hoch. Aktiviere GitHub Pages in den Repo-Einstellungen, um eine kostenlose, öffentlich zugängliche URL für deinen Lebenslauf zu erhalten.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Du kannst die generierte HTML-Version deines Lebenslaufs kostenlos hosten. Hier sind die gängigsten Optionen:',
      manual_title: 'Option A: Manueller Upload (Kein GitHub erforderlich)',
      netlify_desc:
        'Dienste wie Netlify oder Vercel bieten kostenloses statisches Hosting mit einfachem Drag-and-Drop-Deployment oder automatischer Synchronisierung mit deinem GitHub-Repository. Du kannst deinen HTML-Lebenslauf dort hochladen, ohne deine Bearbeitungshistorie offenzulegen.',
      netlify_drop_desc:
        'Sichere dir deinen Wettbewerbsvorteil durch eine persönliche URL. Es gibt viele **kostenlose Anbieter**, bei denen du deinen CV **in Sekunden** online bringen kannst. Ob über das oben verlinkte Tool oder Alternativen wie [Tiiny.host](https://tiiny.host): Ein kurzes **Drag-and-drop** deiner Webseite genügt, um professionell im Netz präsent zu sein.',
      netlify_drop_title: 'Schnell & Einfach: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        'Achtung: Wenn du keinen kostenpflichtigen GitHub-Plan hast, musst du dein Repository öffentlich machen, um GitHub Pages nutzen zu können. Dadurch ist deine gesamte CV-Historie (alle Commits) für jeden sichtbar! Wenn dir Privatsphäre wichtig ist, nutze stattdessen die erste Option.',
      push_folder_hint:
        'KiwiCV unterstützt extra hierfür das alleinige Pushen der HTML-Datei in einen bestimmten Ordner in deinem Repository. Prüfe die erweiterten Einstellungen auf der Vorschauseite.',
      sensitive_data_warning:
        'Datenschutz-Hinweis: Wenn du deinen Lebenslauf über eine öffentliche URL hostest, kann jeder auf deine Daten zugreifen. Erwäge, sehr sensible persönliche Informationen wie deine genaue Adresse, Telefonnummer und E-Mail zu entfernen.',
      title: 'Lebenslauf hosten',
    },
    pdf_guide: {
      font_size: 'Schriftgröße',
      font_size_desc:
        'Passe die Schriftgröße im Design-Tab an, um die Aufteilung deiner Inhalte auf den Seiten zu optimieren.',
      intro:
        'PDF-Rendering ist komplex, weshalb es leider auch ab und zu zu unschönen Darstellungen kommen kann. Damit ihr diese umgehen könnt, könnt ihr mit folgenden Funktionalitäten rumspielen, bis euer Dokument ganz euren Wünschen entspricht:',
      rearrange_sections: 'Neu anordnen',
      rearrange_sections_desc:
        'Das Umstellen von Sektionen kann oft unschöne Seitenumbrüche verhindern.',
      space_opt: 'Platzoptimierung',
      space_opt_desc:
        'Manchmal schafft das Verschieben einer kurzen Sektion in die Seitenleiste genug Platz für ein sauberes Layout.',
      title: 'PDF-Layout-Tipps',
      use_pagebreaks: 'Seitenumbrüche nutzen',
      use_pagebreaks_desc:
        'Einträge, die zu nah am Seitenrand liegen, können manchmal unschön gerendert werden. Nutze manuelle Seitenumbrüche, um diese sauber auf die nächste Seite zu schieben.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Das Wechseln der Sprache löst eine Prüfung aus, ob bereits eine Version in der Cloud existiert.',
      auto_recognition_title: 'Automatische Erkennung',
      desc: 'KiwiCV verwaltet mehrere Sprachen. Wenn du deinen Lebenslauf speicherst oder ein Backup erstellst, wird eine Version speziell für die aktuell aktive Sprache erstellt. Wenn du später die Sprache wechselst, erkennt KiwiCV vorhandene Backups und bietet dir an, diese wiederherzustellen. So bleibt deine mehrsprachige Historie perfekt organisiert.',
      language_specific_desc:
        'Jede Sprachversion wird als separater Eintrag in deinem Cloud-Repository gespeichert.',
      language_specific_title: 'Sprachspezifisch',
      title: 'Intelligente Sprach-Backups',
    },
    toc_title: 'INHALTSVERZEICHNIS',
  },
  page_description:
    'Hintergründe, Support und Vision: Entdecke, wie du KiwiCV optimal für dich nutzt, wohin die Reise geht und welche Geschichte hinter deinem CV-Builder steckt.',
  page_title: 'Extras',
  tabs: {
    about: 'Über KiwiCV',
    changelog: 'Changelog',
    howto: 'Anleitungen',
    roadmap: 'Roadmap',
  },
};
