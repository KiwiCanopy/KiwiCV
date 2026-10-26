import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Schreib uns eine E-Mail',
    message:
      'Feedback ist der Antrieb für KiwiCV. Egal, ob ein Fehler gefunden wurde, eine geniale Funktionsidee besteht oder du einfach nur Hallo sagen möchtest – KiwiCV hat immer ein offenes Ohr.',
    prompt: 'Antworten erfolgen in der Regel innerhalb von 24 Stunden.',
    support_label: 'Offizielle Kontaktadresse',
    title: 'Lass uns gemeinsam die Zukunft der Lebensläufe gestalten!',
  },
  licenses: {
    description:
      'Die folgende Open-Source-Software wird in KiwiCV verwendet. KiwiCV bedankt sich bei den Entwicklern und der Community für ihre wertvollen Beiträge.',
    tabLabel: 'Lizenzen',
    title: 'Open-Source-Lizenzen',
  },
  nav_label: 'Datenschutz & AGB',
  notice: {
    sections: {
      details: {
        content:
          '**{{name}}**\n**{{title}}**\n{{address}}\n\n**Kontakt:**\nE-Mail: {{email}}\n\n*Als Kleinunternehmer im Sinne von § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.*',
        title: 'Angaben gemäß § 5 DDG:',
      },
      dispute: {
        content:
          '**Verbraucherstreitbeilegung:**\nKiwiCV ist nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
        title: 'Streitbeilegung:',
      },
    },
    title: 'Impressum',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit deinen personenbezogenen Daten passiert, wenn du diese Website besuchst. Personenbezogene Daten sind alle Daten, mit denen du persönlich identifiziert werden kannst. KiwiCV verkauft oder teilt deine personenbezogenen Informationen nicht.',
          title: 'Allgemeine Hinweise',
        },
        how: {
          content:
            'Deine Daten werden zum einen dadurch erhoben, dass du uns diese mitteilst (z. B. Eingabe von Lebenslauf-Daten in die Applikation). Diese Eingaben werden jedoch vorrangig lokal in deinem Browser verarbeitet. Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).',
          title: 'Wie erfasst KiwiCV deine Daten?',
        },
        responsible: {
          content:
            'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten kannst du dem Abschnitt „Hinweis zur verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.',
          title: 'Wer ist verantwortlich für die Datenerfassung auf dieser Website?',
        },
        title: '1. Datenschutz auf einen Blick',
      },
      '2': {
        responsible: {
          content:
            'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail: {{email}}',
          title: 'Hinweis zur verantwortlichen Stelle',
        },
        rights: {
          content:
            'Du hast im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung (Art. 15 DSGVO) und ggf. ein Recht auf Berichtigung (Art. 16 DSGVO) oder Löschung (Art. 17 DSGVO) dieser Daten, auf Einschränkung ihrer Verarbeitung (Art. 18 DSGVO) sowie darauf, die Daten, die du bereitgestellt hast, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten oder an einen anderen Verantwortlichen übermitteln zu lassen (Recht auf Datenübertragbarkeit, Art. 20 DSGVO). Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten kannst du dich jederzeit an mich wenden.\n\n**Widerspruchsrecht (Art. 21 DSGVO):** Soweit ich deine personenbezogenen Daten auf Grundlage berechtigter Interessen verarbeite (Art. 6 Abs. 1 lit. f DSGVO), hast du das Recht, aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit Widerspruch gegen diese Verarbeitung einzulegen. Das betrifft jede Verarbeitung, für die diese Datenschutzerklärung Art. 6 Abs. 1 lit. f DSGVO als Rechtsgrundlage nennt. Ich verarbeite die betroffenen Daten dann nicht mehr, es sei denn, ich kann zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die deine Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.\n\nSoweit eine Verarbeitung auf deiner Einwilligung beruht (Art. 6 Abs. 1 lit. a DSGVO), kannst du sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO); die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon unberührt.\n\nDes Weiteren steht dir ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.',
          title: 'Deine Rechte',
        },
        title: '2. Allgemeine Hinweise und Pflichtinformationen',
      },
      '3': {
        netlify: {
          content:
            'Diese Website wird bei einem externen Dienstleister gehostet (Hoster). KiwiCV nutzt für das Hosting den Anbieter **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107**.\n\nDie Nutzung von Netlify erfolgt zum Zwecke einer sicheren, schnellen und effizienten Bereitstellung des Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO). Netlify nutzt ein weltweites Content Delivery Network (CDN), wodurch Daten (wie deine IP-Adresse) über Server auf der ganzen Welt geroutet werden können, um die Ladezeiten der Website zu minimieren. Die anfallenden Server-Logfiles (Zugriffsdaten) werden von Netlify aus Sicherheitsgründen in der Regel für 90 Tage (bzw. bis zu 1 Jahr offline) gespeichert und danach gelöscht.\n\nNetlify betreibt außerdem die Serverfunktionen von KiwiCV, die sich in den USA befinden. Jede Anfrage an die KI-Funktionen in Abschnitt 8 läuft auf dem Weg zu Google samt ihrem Inhalt (zum Beispiel deinem Lebenslauftext, einer Stellenanzeige oder einer hochgeladenen Lebenslauf-Datei) über diese Funktionen. Dasselbe gilt für die Synchronisation mit Google Drive (Abschnitt 4), Zahlungen (Abschnitt 6) und die Löschung deines Kontos (Abschnitt 7). Für die KI-Funktionen und die Synchronisation mit Google Drive gilt die im jeweiligen Abschnitt genannte Rechtsgrundlage; Zahlungen werden zur Erfüllung des Vertrags mit dir abgewickelt (Art. 6 Abs. 1 lit. b DSGVO), und dein Konto wird gelöscht, um die gesetzliche Pflicht zur Löschung deiner Daten zu erfüllen (Art. 6 Abs. 1 lit. c DSGVO i. V. m. Art. 17 DSGVO).\n\nDie Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission sowie auf das EU-US Data Privacy Framework (DPF) gestützt, unter dem Netlify zertifiziert ist.\n\n**Auftragsverarbeitung:** KiwiCV hat einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes geschlossen, der gewährleistet, dass Netlify die personenbezogenen Daten unserer Websitebesucher nur nach meinen Weisungen und unter Einhaltung der DSGVO verarbeitet.',
          title: 'Externes Hosting (Netlify)',
        },
        sanity: {
          content:
            'Die Artikel des KiwiCV-Blogs und ihre Bilder sowie die Erfahrungsberichte auf der Startseite und ihre Fotos werden mit der Content-Plattform Sanity verwaltet (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Norwegen, und Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, USA). Wenn du den Blog oder einen Artikel öffnest oder auf der Startseite in die Nähe eines Erfahrungsberichts scrollst, lädt dein Browser diese Inhalte direkt von den Servern von Sanity (sanity.io). Dabei erhält Sanity deine IP-Adresse und die technischen Daten, die jede Anfrage mitführt (etwa deinen Browsertyp und den Zeitpunkt der Anfrage).\n\nDie Nutzung von Sanity beruht auf unserem berechtigten Interesse an einer effizienten Bereitstellung des Blogs und der Website-Inhalte (Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden; der Auftragsverarbeitungsvertrag von Sanity stützt solche Übermittlungen auf die Standardvertragsklauseln der EU-Kommission.',
          title: 'Blog- und Website-Inhalte (Sanity)',
        },
        title: '3. Hosting und Content Delivery Networks (CDN)',
      },
      '4': {
        drive: {
          content:
            'KiwiCV bietet eine optionale Synchronisation deiner Lebenslaufdaten mit deinem persönlichen Google Drive an. Wenn du diese Funktion aktivierst, werden deine Lebenslauf-Dateien in dein Google-Drive-Konto (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) übertragen und dort in einem von KiwiCV erstellten Ordner gespeichert.\n\nWenn du beim Export den Link zu einer Stellenanzeige angibst, wird er mit dieser Version gespeichert: in der Backup-Datei und in Dateieigenschaften, die nur KiwiCV lesen kann und die Google Drive nicht anzeigt, damit "Meine Lebensläufe" ihn neben der Version zeigen kann. Er bleibt dort, bis du diese Version aus deinem Google Drive löschst; das Trennen von Google Drive entfernt ihn nicht. Er wird nicht an die KI-Funktionen gesendet.\n\nTechnisch wird diese Synchronisation über unsere Serverfunktionen geroutet: Deine Lebenslaufinhalte, der Link zur Stellenanzeige und die für die Übertragung erforderlichen Zugangsdaten (Refresh-Token) werden dort für die Dauer der Anfrage flüchtig verarbeitet und nicht dauerhaft auf unseren Servern gespeichert; der Link zur Stellenanzeige läuft außerdem über sie, wenn "Meine Lebensläufe" deine gespeicherten Versionen auflistet. Das Refresh-Token wird ansonsten ausschließlich lokal in deinem Browser gespeichert. KiwiCV erhält nur Zugriff auf Dateien, die es selbst erstellt hat (Google "drive.file"-Berechtigung) und zu keinem Zeitpunkt auf den Rest deines Drives.\n\nDie Datenübertragung erfolgt ausschließlich auf Grundlage deiner aktiven Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) durch freiwillige Verknüpfung deines Google-Kontos. Du kannst diese jederzeit mit "Google Drive trennen" im Bereich "Synchronisierung & Speicherung" der Einstellungen und "Trennen und Zugriff entfernen" widerrufen, wodurch auch die KiwiCV erteilte Berechtigung bei Google widerrufen wird. Du kannst KiwiCV außerdem in deinem Google-Konto unter Drittanbieter-Zugriff entfernen (myaccount.google.com/connections). Bitte beachte, dass Google als US-Unternehmen Daten in die USA überträgt; diese Übertragung basiert auf dem EU-US Data Privacy Framework (DPF), unter dem Google zertifiziert ist, sowie auf den Standardvertragsklauseln der EU-Kommission.',
          title: 'Google Drive Synchronisation (Optional)',
        },
        github: {
          content:
            'Diese Anwendung bietet die Möglichkeit, über einen von dir freiwillig bereitgestellten GitHub Personal Access Token (PAT) direkt mit deinem GitHub-Account zu interagieren (z. B. zum Speichern oder Synchronisieren deiner Lebenslauf-Daten).\n\nWenn du diese Funktion nutzt, baut dein Browser eine direkte Verbindung zu den Servern von GitHub (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA) auf. Dabei werden deine IP-Adresse sowie die von dir in der Applikation eingegebenen Daten direkt an GitHub übermittelt und dort verarbeitet.\n\nWas bei GitHub ankommt, hängt vom gewählten Repository ab. Ein privates Repository, das nicht mit GitHub Pages veröffentlicht ist, erhält deine vollständigen Lebenslauf-Daten, einschließlich der von dir ausgeblendeten Einträge, deines Anschreibens, der Daten, die KiwiCV aus einer importierten Datei behält, und des Links zur Stellenanzeige, wenn du beim Export einen angibst. Ein Repository, das jeder lesen kann (ein öffentliches oder ein mit GitHub Pages veröffentlichtes), erhält deinen Lebenslauf ohne die von dir ausgeblendeten Einträge und Abschnitte, ohne dein Anschreiben, ohne Daten aus importierten Dateien und ohne den Link zur Stellenanzeige. Enthalten sind dagegen deine Design-Einstellungen, dein Profilfoto (sofern du es nicht ausblendest), die Namen und Kontaktdaten der von dir aufgeführten Referenzen sowie die Datei- und Ordnernamen, die du beim Export wählst; sie erscheinen auch in Commit-Nachrichten und können das Unternehmen und die Position nennen, auf die du dich bewirbst. Wenn du ein Repository später öffentlich machst oder mit GitHub Pages veröffentlichst, kann auch das öffentlich werden, was bereits darin liegt, einschließlich seines Verlaufs.\n\nDein GitHub PAT wird zu keinem Zeitpunkt an die Server von KiwiCV gesendet. Er wird ausschließlich in deinem Browser auf diesem Gerät gespeichert und nur verwendet, um die Anfragen zu autorisieren, die dein Browser in deinem Namen an GitHub sendet: für die aktuelle Browser-Sitzung oder, wenn du "Token dauerhaft in diesem Browser speichern" wählst, bis du ihn entfernst. Da der Token zu diesem Gerät und nicht zu deinem KiwiCV-Konto gehört, bleibt er beim Abmelden erhalten, es sei denn, du wählst "GitHub entfernen und abmelden"; die Löschung deines Kontos entfernt ihn, wenn du "Auch die GitHub-Verbindung von diesem Gerät entfernen" angehakt lässt.\n\nDie Datenübertragung an GitHub erfolgt ausschließlich auf Grundlage deiner aktiven Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), indem du die Funktion freiwillig nutzt und deinen Token eingibst. Du kannst diese Einwilligung jederzeit mit "GitHub trennen" im Bereich "Synchronisierung & Speicherung" der Einstellungen und "Trennen und Token entfernen" widerrufen; dadurch werden dein Token und deine Repository-Einstellungen von diesem Gerät entfernt, und es wird nichts an GitHub gesendet. Daten, die bereits in deinem Repository liegen, bleiben dort, bis du sie bei GitHub löschst. Bitte beachte, dass GitHub als US-Unternehmen Daten in die USA überträgt. Weitere Informationen zum Datenschutz bei GitHub erhältst du hier:',
          link: {
            text: 'GitHub-Datenschutzerklärung',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Interaktion mit GitHub via Personal Access Token (PAT)',
        },
        storage: {
          content:
            'Zur Bereitstellung und Funktion dieses CV-Builders nutzt KiwiCV die sogenannte Web-Storage-Technik (Local Storage). Dabei werden deine Eingaben (wie Textdaten für den Lebenslauf oder lokal verarbeitete Profilbilder im Base64-Format) lokal im Browser deines Endgeräts zwischengespeichert. Dies verhindert, dass deine Daten bei einem versehentlichen Neuladen der Seite verloren gehen.\n\nWenn du eine Lebenslauf-Datei importierst, die Abschnitte der obersten Ebene enthält, die KiwiCV nicht verwendet (zum Beispiel solche, die von einer anderen Anwendung geschrieben wurden), behält KiwiCV sie bis zu einer Größengrenze bei deinem Lebenslauf, damit sie beim Export unverändert in der Datei bleiben. Diese Daten werden zusammen mit deinem Lebenslauf gespeichert, exportiert und gesichert (auf Google Drive oder in einem privaten GitHub-Repository, das nicht mit GitHub Pages veröffentlicht ist) und erscheinen in der Rohdaten-Ansicht, werden aber nie in deinem Lebenslauf oder im Editor angezeigt und nie an die KI-Funktionen gesendet.\n\nWenn du für ein Anschreiben „An meinen Schreibstil anpassen“ nutzt, wird die Schreibprobe, die du eingibst (bis zu 5.000 Zeichen), ebenfalls im Local Storage gespeichert – getrennt von deinem Lebenslauf, damit sie für dein nächstes Anschreiben bereitsteht. Sie wird jedes Mal an die KI-Funktionen in Abschnitt 8 übermittelt, wenn ein Anschreiben in deinem Stil verfasst wird; sie ist nicht Teil deiner Backups in Google Drive oder GitHub. Sie bleibt auf deinem Endgerät, bis du sie im Anschreiben-Dialog leerst, dich abmeldest, dich mit einem anderen Konto anmeldest oder den Speicher deines Browsers löschst; die Löschung deines Kontos entfernt sie auch von dem Endgerät, auf dem du das Konto löschst, weil du dabei abgemeldet wirst.\n\nWenn du ein GitHub-Repository nutzt, speichert dein Browser außerdem die Links zu Stellenanzeigen, die mit den Versionen darin gespeichert sind, im Local Storage auf diesem Gerät, damit "Meine Lebensläufe" nicht jedes Backup erneut herunterladen muss, um sie anzuzeigen. Sie werden zusammen mit deiner GitHub-Verbindung entfernt: wenn du GitHub trennst, wenn du "GitHub entfernen und abmelden" wählst oder wenn du dein Konto löschst und dabei "Auch die GitHub-Verbindung von diesem Gerät entfernen" angehakt lässt.\n\nDiese Daten werden lokal auf deinem Endgerät verarbeitet und nicht an Server übermittelt, es sei denn, du nutzt aktiv eine der in dieser Datenschutzerklärung beschriebenen optionalen Funktionen (zum Beispiel das Google Drive Backup in diesem Abschnitt oder die KI-Funktionen in Abschnitt 8). Ich habe zu keinem Zeitpunkt Zugriff auf diese lokal gespeicherten Daten.\n\nWenn du dich anmeldest, speichert dein Browser außerdem deine Anmeldesitzung, die deine Anfragen an unsere Server begleitet (siehe Abschnitt 5), eine Kopie deines Profils und deine Konto-ID, mit der festgehalten wird, zu welchem Konto lokal gespeicherte Zugangsdaten und die Schreibprobe gehören. Diese Speicherung ist für die von dir gewünschte Anmeldung unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); alle drei werden entfernt, wenn du dich abmeldest.\n\nDie Speicherung dieser Daten ist für die Kernfunktion der Anwendung technisch zwingend erforderlich. Die Rechtsgrundlage für das Speichern und Auslesen der Daten auf deinem Endgerät ist § 25 Abs. 2 Nr. 2 TDDDG. Die anschließende Verarbeitung erfolgt auf Grundlage meines berechtigten Interesses an einer nutzerfreundlichen Bereitstellung des Dienstes gemäß Art. 6 Abs. 1 lit. f DSGVO. Soweit oben nicht anders beschrieben, bleiben die Daten auf deinem Endgerät erhalten, bis du den Speicher (Cache/Local Storage) deines Browsers manuell leerst.',
          title: 'Nutzung von Web-Storage (Local Storage)',
        },
        title: '4. Datenerfassung in unserer Anwendung',
      },
      '5': {
        account: {
          content:
            'Wenn du ein Benutzerkonto erstellst (via Google OAuth), speichern wir deine E-Mail-Adresse, deinen Namen und dein Google-Profilbild, um deinen Zugang und deine personalisierten Daten zu verwalten. Bitte beachte, dass Premium-Funktionen nur registrierten Benutzern zur Verfügung stehen. Wir speichern außerdem Informationen über deinen aktiven Pro-Pass sowie Metadaten zu deinen KI-Anfragen, die in Abschnitt 8 beschrieben sind. Wir speichern Eingaben (Prompts) oder Ausgaben (Ergebnisse) der KI-Optimierung nicht dauerhaft auf unseren Servern; die temporäre Zwischenspeicherung während der Verarbeitung ist in Abschnitt 8 beschrieben.\n\n**Datenbank-Anbieter:** Diese Kontodaten werden bei unserem Auftragsverarbeiter **Supabase, Inc.** in einem in der Europäischen Union gehosteten Projekt gespeichert. Ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO liegt mit Supabase vor.',
          title: 'Account- und Profilinformationen',
        },
        title: '5. Account- und Nutzerdaten',
      },
      '6': {
        stripe: {
          content:
            'Wir nutzen für die Abwicklung von Zahlungen Stripe Payments Europe, Limited (Irland). Im Rahmen des Zahlungsprozesses erfasst Stripe deine Zahlungsinformationen direkt. KiwiCV selbst speichert keine sensiblen Zahlungsdaten (wie Kreditkartennummern) auf eigenen Servern; KiwiCV erhält von Stripe lediglich Status-Informationen zur Transaktion. Rechtsgrundlage ist die Erfüllung des Vertrags über deinen Kauf (Art. 6 Abs. 1 lit. b DSGVO) und, für die aufzubewahrenden Rechnungsunterlagen, eine rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO, siehe Abschnitt 7). Stripe verarbeitet Daten auch in den USA (Stripe, LLC); diese Übertragung basiert auf dem EU-US Data Privacy Framework (DPF), unter dem Stripe zertifiziert ist, sowie auf den Standardvertragsklauseln der EU-Kommission.',
          title: 'Zahlungsabwicklung via Stripe',
        },
        title: '6. Zahlungsabwicklung',
      },
      '7': {
        deletion_scope: {
          content:
            'Bei der Löschung deines Benutzerkontos werden dein Profil sowie alle damit verknüpften Metadaten (z. B. dein Pro-Pass-Status, Zahlungsdaten und Nutzungsprotokolle) unverzüglich und dauerhaft aus unserer von Supabase betriebenen Datenbank gelöscht (siehe Abschnitt 5). Bitte beachte, dass Lebenslauf-Daten im Local Storage deines Browsers und bei Nutzung des Google Drive Backups oder der GitHub-Synchronisierung in deinem persönlichen Google Drive bzw. deinem GitHub-Repository gespeichert werden; keiner dieser Speicherorte ist von der serverseitigen Kontolöschung betroffen. Ein auf diesem Gerät gespeicherter GitHub-Token wird ebenfalls entfernt, wenn du "Auch die GitHub-Verbindung von diesem Gerät entfernen" angehakt lässt (siehe Abschnitt 4).',
          title: 'Umfang der Löschung',
        },
        retention_legal: {
          content:
            'Bitte beachte, dass KiwiCV gesetzlich verpflichtet ist, transaktionsrelevante Rechnungsdaten (insbesondere Belege über getätigte Käufe via Stripe) für einen Zeitraum von 10 Jahren aufzubewahren. Dies erfolgt auf Grundlage der steuer- und handelsrechtlichen Vorgaben (z. B. gemäß AO und HGB). Die Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. c DSGVO.',
          title: 'Gesetzliche Aufbewahrungspflichten',
        },
        stripe_retention: {
          content:
            'Diese spezifischen Daten verbleiben für die Dauer der gesetzlichen Fristen bei unserem Zahlungsdienstleister Stripe gespeichert, um die ordnungsgemäße Dokumentation gegenüber den Finanzbehörden sicherzustellen.',
          title: 'Speicherung via Stripe',
        },
        title: '7. Löschung von Daten & Aufbewahrung',
      },
      '8': {
        logging_metrics: {
          content:
            'Zu jeder abgeschlossenen KI-Anfrage protokolliert KiwiCV Metadaten, die mit deinem Konto verknüpft sind, in unserer von Supabase betriebenen Datenbank (siehe Abschnitt 5). Dieses Protokoll enthält nie den Inhalt deiner Prompts oder der Ergebnisse; wie diese während einer laufenden Anfrage kurzzeitig vorgehalten werden, ist weiter unten unter „Temporäre Zwischenspeicherung“ beschrieben. Folgendes wird gespeichert:\n\n**Art der Anfrage:** welche Art von Anfrage es war (z. B. „Lebenslauf-Optimierung“, „Anschreiben“, „KI-Lebenslauf-Import“), welchen KI-Modus du gewählt hast und worauf sie sich bezog (der gesamte Lebenslauf oder eine Art von Abschnitt wie „Berufserfahrung“), nie aber der Text selbst.\n\n**Nutzungsdaten:** der Zeitpunkt der Anfrage, die Anzahl der verwendeten Token und ob ein Pro-Pass sie abgedeckt hat; bei Anfragen aus der Zeit, in der KiwiCV noch eine kostenlose Testphase angeboten hat, ob diese Testphase sie abgedeckt hat.\n\n**Technische Daten:** wie lange die Anfrage gedauert hat, das KI-Modell, die Serverregion, die Version unserer Anweisungen an die KI, wie die Anfrage geendet hat, ob das Ergebnis etwas verändert hat und ob es sich um einen Testlauf handelte.\n\n**Sicherheitsklassifizierung:** bei Lebenslauf-Optimierungen und Anschreiben die Werte, die Googles automatische Sicherheitssysteme der KI-Antwort zuweisen, soweit Google sie liefert, zum Beispiel wie wahrscheinlich sie Belästigung oder gefährliche Inhalte enthält. Diese Werte werden aus dem Text abgeleitet, enthalten aber nichts davon.\n\nWir nutzen diese Daten, um deine Anfragen auf dein Tageskontingent anzurechnen, zur Durchsetzung unserer Fair-Use-Policy (Vermeidung von missbräuchlicher, automatisierter Nutzung) und zur Fehlerdiagnose. Zur Verbesserung der KI-Funktionen werten wir sie nur in aggregierter Form aus und nutzen sie nie, um ein Profil von dir zu erstellen. Die Zählung deiner Anfragen ist für die Bereitstellung des Dienstes erforderlich (Art. 6 Abs. 1 lit. b DSGVO); die übrigen Zwecke beruhen auf unserem berechtigten Interesse an der Verhinderung von Missbrauch, der Behebung von Fehlern und der Verbesserung der KI-Funktionen (Art. 6 Abs. 1 lit. f DSGVO). Diese Daten werden so lange gespeichert, wie dein Konto besteht, und mit ihm gelöscht (siehe Abschnitt 7).',
          title: 'Protokollierung und Nutzungsmetriken',
        },
        privacy_training: {
          content:
            'Der Schutz deiner Daten hat für uns höchste Priorität. Im Rahmen der Nutzung der Google Cloud API (Vertex AI) gelten folgende Sicherheitsgarantien:\n\n**Kein Modelltraining:** Google nutzt deine eingegebenen Daten (Prompts) explizit nicht zum Trainieren seiner globalen KI-Modelle. Deine Daten verbleiben in unserer isolierten Google Cloud-Umgebung.\n\n**Datenstandort:** Google verarbeitet deine Anfragen auf Servern innerhalb der Europäischen Union (Google Cloud EU-Multi-Region "eu", beschränkt auf EU-Mitgliedstaaten), um ein angemessenes Datenschutzniveau gemäß DSGVO zu gewährleisten. Bevor sie Google erreichen, laufen sie über unsere Serverfunktionen in den USA (siehe Abschnitt 3).\n\n**Keine dauerhafte Speicherung beim Anbieter:** Google verarbeitet die Daten zur Bearbeitung der Anfrage und speichert sie nicht dauerhaft. Google kann Eingaben und Ergebnisse bis zu 24 Stunden zwischenspeichern. Wenn Googles automatische Sicherheitssysteme eine Anfrage markieren, kann Google den Prompt bis zu 30 Tage aufbewahren, um ihn auf Missbrauch zu prüfen; er wird nicht zum Trainieren von Modellen verwendet.',
          title: 'Datenschutz und Training-Ausschluss',
        },
        processing_scope: {
          content:
            'Um dir Funktionen zur intelligenten Optimierung und Erstellung von Lebensläufen und Anschreiben bereitzustellen, nutzen wir die Plattform Vertex AI von Google Cloud. Dabei werden die von dir eingegebenen Texte an Server von Google übermittelt und dort verarbeitet; auf dem Weg dorthin laufen sie über unsere Serverfunktionen bei Netlify in den USA (siehe Abschnitt 3). Die KI-Funktionen laufen nur ab, wenn du sie aktiv auslöst; Rechtsgrundlage für diese Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der von dir angeforderten Funktion).',
          title: 'Art und Umfang der Verarbeitung',
        },
        temporary_storage: {
          content:
            'Zur Gewährleistung einer stabilen Verarbeitung von KI-Anfragen nutzt KiwiCV asynchrone Hintergrundprozesse. Die hochgeladenen Eingabedokumente (wie Lebenslauf-Dateien) sowie die von der KI generierten Ergebnisse werden in unserer von Supabase betriebenen Datenbank (siehe Abschnitt 5) kurzzeitig (in der Regel nicht länger als wenige Minuten und nie länger als 24 Stunden) zwischengespeichert, bis dein Browser diese erfolgreich abruft. Anschließend oder spätestens nach Ablauf dieser Frist werden diese Zwischenergebnisse und Eingabedaten automatisch und vollständig gelöscht. KiwiCV verwendet diese zwischengespeicherten Eingaben und Ergebnisse nur, um dir das angeforderte Ergebnis zu liefern, und niemals für Profiling oder zum Training von KI-Modellen.',
          title: 'Temporäre Zwischenspeicherung',
        },
        title: '8. Nutzung von KI-Diensten (Google Cloud Vertex AI)',
      },
      '9': {
        posthog: {
          content:
            'Um besser zu verstehen, wie Nutzer mit KiwiCV interagieren und um unser Angebot zu verbessern, setzen wir das Analyse-Tool PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, USA) ein. Zum Schutz deiner Privatsphäre haben wir PostHog strikt anonym und cookies-frei konfiguriert.\n\n**Anonymes Tracking:** Wir verwenden keine Tracking-Cookies und speichern keine persönlichen Identifikationsmerkmale in deinem Browser. PostHog ist so konfiguriert, dass es eine reine Speicher-Persistenz (memory-only) nutzt, was bedeutet, dass alle Sitzungsdaten verloren gehen, sobald du die Seite schließt oder neu lädst.\n\n**Datenresidenz (EU):** Alle Daten werden an die europäischen Server von PostHog gesendet und dort gespeichert (Region: Frankfurt, Deutschland - https://eu.i.posthog.com), um die Einhaltung europäischer Datenschutzstandards zu gewährleisten.\n\n**Sitzungserkennung:** Zur anonymen Sitzungserkennung wird serverseitig ein kurzzeitiger Hash-Wert erzeugt, der nach 24 Stunden automatisch gelöscht wird. Dies ermöglicht es uns, Interaktionsmuster zu erkennen (z. B. welche Designs beliebt sind oder wie viele Lebensläufe exportiert werden), ohne dich als Person identifizieren zu können.\n\nDer Einsatz von PostHog erfolgt auf Grundlage unseres berechtigten Interesses an der bedarfsgerechten Gestaltung und kontinuierlichen Optimierung unserer Website (Art. 6 Abs. 1 lit. f DSGVO).',
          title: 'Anonyme Web-Analyse (PostHog)',
        },
        title: '9. Web-Analyse',
      },
      '10': {
        email: {
          content:
            'Wenn du uns per E-Mail kontaktierst (z. B. an {{email}} oder eine andere auf dieser Website genannte Adresse), speichern wir deine Angaben einschließlich deiner Kontaktdaten zur Bearbeitung der Anfrage und für Anschlussfragen.\n\n**E-Mail-Weiterleitung (Cloudflare):** E-Mails an Adressen unter kiwicanopy.com nimmt die **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** mit dem Dienst Email Routing entgegen und leitet sie an unser Postfach weiter. Der Inhalt wird dabei nicht gespeichert; Cloudflare protokolliert Absender, Empfänger, Betreff, Zeitpunkt und Zustellstatus. Mit Cloudflare besteht ein Vertrag über Auftragsverarbeitung (Cloudflare Customer DPA).\n\n**Postfach (Google):** Das Postfach wird bei Google (Gmail) geführt; Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Eine Übermittlung in die USA (an Cloudflare bzw. die Google LLC) stützt sich auf das EU-US Data Privacy Framework, hilfsweise auf die Standardvertragsklauseln der EU-Kommission.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern deine Anfrage auf einen Vertrag abzielt, im Übrigen unser berechtigtes Interesse an der Beantwortung (Art. 6 Abs. 1 lit. f DSGVO). Die Daten werden gelöscht, sobald sie für diesen Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
          title: 'E-Mail-Weiterleitung und Postfach',
        },
        title: '10. Kontaktaufnahme per E-Mail',
      },
    },
    tabLabel: 'Datenschutz',
    title: 'Datenschutzerklärung',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            'Die Verarbeitung von KI-Anfragen erfolgt asynchron. Der Nutzer ist dafür verantwortlich, das Ergebnis der Verarbeitung zeitnah abzurufen. Aus Sicherheitsgründen und zur Ressourcenoptimierung werden temporär zwischengespeicherte Ergebnisse nach spätestens 24 Stunden unwiderruflich gelöscht. Ein Anspruch auf dauerhafte Speicherung dieser temporären Daten besteht nicht.',
          title: 'Asynchrone Verarbeitung & Datenbereitstellung',
        },
        daily_limit: {
          content:
            'Um Missbrauch vorzubeugen und die Verfügbarkeit für alle Nutzer sicherzustellen, ist die Anzahl der KI-Anfragen pro Pro-Konto auf {{limit}} Anfragen innerhalb von 24 Stunden begrenzt. Dieses Kontingent wird täglich um Mitternacht (deutscher Zeit, MEZ/MESZ) zurückgesetzt.',
          title: 'Nutzungskontingent',
        },
        purpose: {
          content:
            'Die KI-Funktionen von KiwiCV dürfen ausschließlich zur Erstellung und Verbesserung von Bewerbungsunterlagen innerhalb der Plattform genutzt werden. Eine Nutzung für systemfremde Zwecke ist nicht gestattet.',
          title: 'Zweckbindung',
        },
        technical_limits: {
          content:
            'Wir behalten uns vor, die maximale Token-Anzahl pro Anfrage auf ein für die Lebenslauf-Optimierung angemessenes Maß zu begrenzen. Eine automatisierte Nutzung oder das massenhafte Auslesen von KI-Antworten ist untersagt.',
          title: 'Technische Beschränkungen',
        },
        title: '1. Fair-Use-Richtlinien',
      },
      '2': {
        ai_usage: {
          content:
            'Inhaber eines Pro-Passes erhalten Zugriff auf KI-gestützte Optimierungsfunktionen ohne Einzelabrechnung pro Anfrage. Dieser Zugriff ist für die private Nutzung im Rahmen der Stellensuche vorgesehen.',
          title: 'KI-Nutzung (Pro-Pass-Inhaber)',
        },
        one_time_payment: {
          content:
            'Der Erwerb eines Pro-Passes stellt eine abgeschlossene Einmalzahlung für eine spezifische Leistung dar. Es handelt sich um kein Abonnement; es findet keine automatische Verlängerung statt.',
          title: 'Einmalzahlung',
        },
        refunds: {
          content:
            'Als Verbraucher steht dir ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss zu. Die Bedingungen, die Frist und das Verfahren sind in unserer Widerrufsbelehrung geregelt, die auch das Muster-Widerrufsformular enthält.\n\nWiderrufst du innerhalb dieser Frist, erstatten wir den vollen gezahlten Preis. Abgesehen vom gesetzlichen Widerrufsrecht bieten wir keine Rückerstattungen an. Ein Pro-Pass ist nicht zwischen Nutzerkonten übertragbar.',
          title: 'Widerrufsrecht, Erstattungen & Übertragbarkeit',
        },
        stacking: {
          content:
            'Beim Erwerb mehrerer zeitlich begrenzter Pro-Pässe werden die Gültigkeitszeiträume addiert („Stacking“). Die Laufzeit des neuen Passes beginnt erst nach Ablauf des aktuell aktiven Zeitraums.',
          title: 'Pro-Pass-Stacking',
        },
        title: '2. Premium-Nutzung (Pass)',
        validity_timezone: {
          content:
            'Nutzungszeiträume und tägliche Limits werden basierend auf der Mitteleuropäischen Zeit (MEZ/MESZ) berechnet. Zeitbasierte Pässe laufen um 23:59:59 Uhr des letzten Tages des gesamten kumulierten Zugangszeitraums ab.',
          title: 'Zeitzonen-Richtlinie',
        },
      },
      '3': {
        termination: {
          content:
            'Du kannst dein Nutzerkonto jederzeit ohne Angabe von Gründen löschen. Mit der Löschung des Kontos endet das Vertragsverhältnis mit sofortiger Wirkung.',
          title: 'Kontolöschung',
        },
        title: '3. Beendigung & Kontolöschung',
      },
    },
    tabLabel: 'AGB',
    title: 'Allgemeine Geschäftsbedingungen',
  },
  translation_note:
    'Dies ist eine maschinelle Übersetzung der deutschen Originalfassung zu deiner Bequemlichkeit. Bei Abweichungen gilt die deutsche Fassung.',
  update: {
    button: 'Akzeptieren & Weiter',
    changes_desc:
      'Abschnitt 4 erklärt jetzt, dass ein Link zur Stellenanzeige, den du beim Export angibst, mit dieser Version in deinem Google Drive oder in einem privaten GitHub-Repository gespeichert wird, das nicht mit GitHub Pages veröffentlicht ist, nie in einem Repository, das jeder lesen kann, dass er bei Google Drive über unsere Serverfunktionen läuft und dass dein Browser die Links zu Stellenanzeigen deiner GitHub-Versionen auf diesem Gerät behält, bis du die GitHub-Verbindung entfernst.',
    changes_title: 'Was hat sich geändert?',
    checkbox:
      'Ich akzeptiere die aktualisierten Allgemeinen Geschäftsbedingungen und die Datenschutzerklärung.',
    intro:
      'Die Datenschutzerklärung von KiwiCV wurde aktualisiert: Sie erklärt jetzt, wo der Link zur Stellenanzeige gespeichert wird, den du beim Export angeben kannst.',
    link_privacy: 'Datenschutzerklärung',
    link_terms: 'Allgemeine Geschäftsbedingungen',
    links_desc: 'Du kannst die vollständigen Dokumente hier lesen:',
    success: 'Vielen Dank, dass du die aktualisierten Bedingungen akzeptiert hast!',
    title: 'Aktualisierung der AGB & Datenschutzerklärung',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.\n\nUm Ihr Widerrufsrecht auszuüben, müssen Sie uns:\n\n{{name}}\n{{address}}\n{{email}}\n\nmittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das nachstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.\n\nZur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
          title: 'Widerrufsrecht',
        },
        title: '1. Widerrufsrecht',
      },
      '2': {
        email_note: {
          content:
            'Damit wir Ihre Bestellung zuordnen können, geben Sie bitte zusätzlich die E-Mail-Adresse an, mit der Sie gekauft haben. Für die Wirksamkeit Ihres Widerrufs ist dies nicht erforderlich.',
          title: 'Zuordnung Ihrer Bestellung',
        },
        form: {
          content:
            '_An {{name}}, {{address}}, {{email}}:_\n\nHiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:\n\n— Bestellt am (*) / erhalten am (*):\n\n— Name des/der Verbraucher(s):\n\n— Anschrift des/der Verbraucher(s):\n\n— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):\n\n— Datum:\n\n_(*) Unzutreffendes streichen._',
          title:
            'Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück',
        },
        title: '2. Muster-Widerrufsformular',
      },
      '3': {
        refund: {
          content:
            'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.\n\nFür diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.',
          title: 'Folgen des Widerrufs',
        },
        title: '3. Folgen des Widerrufs',
      },
    },
    tabLabel: 'Widerruf',
    title: 'Widerrufsbelehrung',
  },
};
