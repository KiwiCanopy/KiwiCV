import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Ci invii un’e-mail',
    message:
      'Il feedback è il motore di KiwiCV. Che Lei abbia trovato un bug, abbia un’idea brillante per una funzionalità o voglia semplicemente salutare, KiwiCV è pronto ad ascoltarLa.',
    prompt: 'Le risposte arrivano solitamente entro 24 ore.',
    support_label: 'Indirizzo di contatto ufficiale',
    title: 'Costruiamo insieme il futuro dei curriculum!',
  },
  licenses: {
    description:
      'Il seguente software open-source è utilizzato in KiwiCV. Ringraziamo gli sviluppatori e la comunità per i loro preziosi contributi.',
    tabLabel: 'Licenze',
    title: 'Licenze Open Source',
  },
  nav_label: 'Privacy e termini',
  notice: {
    sections: {
      details: {
        content:
          '**{{name}}**\n**{{title}}**\n{{address}}\n\n**Contatto:**\nE-Mail: {{email}}\n\n*In qualità di piccolo imprenditore ai sensi del § 19 comma 1 UStG, non viene addebitata alcuna IVA.*',
        title: 'Informazioni ai sensi del § 5 DDG:',
      },
      dispute: {
        content:
          '**Risoluzione delle controversie dei consumatori:**\nKiwiCV non è disposta né obbligata a partecipare a procedimenti di risoluzione delle controversie dinanzi a un organo di conciliazione dei consumatori.',
        title: 'Risoluzione delle controversie:',
      },
    },
    title: 'Note Legali',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            'Le seguenti informazioni forniscono una semplice panoramica di ciò che accade ai Suoi dati personali quando visita questo sito web. I dati personali sono tutti i dati che possono essere utilizzati per identificarLa personalmente. KiwiCV non vende né condivide le Sue informazioni personali.',
          title: 'Note generali',
        },
        how: {
          content:
            "I Suoi dati vengono raccolti, da un lato, quando Lei ce li fornisce (ad esempio, inserendo i dati del curriculum nell'applicazione). Tuttavia, queste voci vengono elaborate principalmente a livello locale nel Suo browser. Altri dati vengono raccolti automaticamente dai nostri sistemi informatici quando visita il sito web. Si tratta principalmente di dati tecnici (ad esempio, browser Internet, sistema operativo o ora di visualizzazione della pagina).",
          title: 'In che modo KiwiCV raccoglie i Suoi dati?',
        },
        responsible: {
          content:
            'Il trattamento dei dati su questo sito web è effettuato dal gestore del sito web. I suoi dati di contatto sono riportati nella sezione "Nota sul titolare del trattamento" della presente informativa sulla privacy.',
          title: 'Chi è responsabile della raccolta dei dati su questo sito web?',
        },
        title: '1. Protezione dei dati in sintesi',
      },
      '2': {
        responsible: {
          content:
            "L'ente responsabile per il trattamento dei dati su questo sito web è:\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail: {{email}}",
          title: 'Nota sul titolare del trattamento',
        },
        rights: {
          content:
            "Nell'ambito delle disposizioni di legge applicabili, ha il diritto in qualsiasi momento di ottenere informazioni gratuite sui Suoi dati personali memorizzati, sulla loro origine e sui destinatari e sullo scopo del trattamento dei dati (art. 15 GDPR) e, se del caso, il diritto alla rettifica (art. 16 GDPR) o alla cancellazione (art. 17 GDPR) di questi dati, alla limitazione del loro trattamento (art. 18 GDPR), nonché di ricevere i dati da Lei forniti in un formato strutturato, di uso comune e leggibile da dispositivo automatico o di farli trasmettere a un altro titolare del trattamento (diritto alla portabilità dei dati, art. 20 GDPR). A tal fine, nonché per ulteriori domande sul tema dei dati personali, mi può contattare in qualsiasi momento.\n\n**Diritto di opposizione (art. 21 GDPR):** Se tratto i Suoi dati personali sulla base di interessi legittimi (art. 6 par. 1 lett. f GDPR), ha il diritto di opporsi in qualsiasi momento a tale trattamento per motivi connessi alla Sua situazione particolare. Ciò riguarda ogni trattamento per il quale la presente informativa sulla privacy indica come base giuridica l'art. 6 par. 1 lett. f GDPR. In tal caso non tratterò più i dati in questione, salvo che io dimostri l'esistenza di motivi legittimi cogenti per procedere al trattamento che prevalgono sui Suoi interessi, diritti e libertà, oppure che il trattamento serva all'accertamento, all'esercizio o alla difesa di un diritto in sede giudiziaria.\n\nSe un trattamento si basa sul Suo consenso (art. 6 par. 1 lett. a GDPR), può revocarlo in qualsiasi momento con effetto per il futuro (art. 7 par. 3 GDPR); la revoca non pregiudica la liceità del trattamento basato sul consenso prima della revoca.\n\nInoltre, ha il diritto di proporre reclamo all'autorità di controllo competente.",
          title: 'I Suoi diritti',
        },
        title: '2. Note generali e informazioni obbligatorie',
      },
      '3': {
        netlify: {
          content:
            "Questo sito web è ospitato da un fornitore di servizi esterno (hoster). KiwiCV utilizza il fornitore **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107** per l'hosting.\n\nL'uso di Netlify avviene allo scopo di una fornitura sicura, rapida ed efficiente dell'offerta online da parte di un fornitore professionista (Art. 6 par. 1 lett. f GDPR). Netlify utilizza una rete di distribuzione dei contenuti (CDN) mondiale, attraverso la quale i dati (come il Suo indirizzo IP) possono essere instradati tramite server in tutto il mondo per ridurre al minimo i tempi di caricamento del sito web. I file di log del server (dati di accesso) risultanti vengono solitamente memorizzati da Netlify per 90 giorni (e fino a 1 anno offline) per motivi di sicurezza e poi cancellati.\n\nNetlify gestisce inoltre le funzioni del server di KiwiCV, che si trovano negli USA. Ogni richiesta alle funzionalità di IA della sezione 8 passa attraverso di esse nel suo percorso verso Google, insieme al suo contenuto (ad esempio il testo del Suo curriculum, un annuncio di lavoro o un file di curriculum caricato). Lo stesso vale per la sincronizzazione con Google Drive (sezione 4), i pagamenti (sezione 6) e l'eliminazione del Suo account (sezione 7). Per le funzionalità di IA e la sincronizzazione con Google Drive la base giuridica è quella indicata nella rispettiva sezione; i pagamenti sono gestiti per l'esecuzione del contratto concluso con Lei (art. 6 par. 1 lett. b GDPR) e il Suo account viene eliminato per adempiere all'obbligo legale di cancellare i Suoi dati (art. 6 par. 1 lett. c GDPR in combinato disposto con l'art. 17 GDPR).\n\nIl trasferimento dei dati negli USA si basa sulle clausole contrattuali standard della Commissione Europea e sull'EU-US Data Privacy Framework (DPF), ai sensi del quale Netlify è certificata.\n\n**Trattamento dei dati per conto del titolare:** Ho stipulato un contratto per il trattamento dei dati (AVV) per l'utilizzo del servizio sopra menzionato, che garantisce che Netlify tratti i dati personali dei visitatori del sito web solo secondo le mie istruzioni e nel rispetto del GDPR.",
          title: 'Hosting esterno (Netlify)',
        },
        sanity: {
          content:
            "Gli articoli del blog di KiwiCV e le relative immagini, nonché le testimonianze della pagina iniziale e le relative foto, sono gestiti con la piattaforma di contenuti Sanity (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Norvegia, e Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, USA). Quando apre il blog o un articolo, o scorre la pagina iniziale verso una testimonianza, il Suo browser carica questi contenuti direttamente dai server di Sanity (sanity.io). In tale occasione Sanity riceve il Suo indirizzo IP e i dati tecnici che ogni richiesta porta con sé (ad esempio il tipo di browser e l'ora della richiesta).\n\nL'uso di Sanity si basa sul nostro legittimo interesse a fornire il blog e i contenuti del sito web in modo efficiente (art. 6 par. 1 lett. f GDPR). In tale contesto i dati possono essere trasferiti negli USA; l'accordo sul trattamento dei dati di Sanity basa tali trasferimenti sulle clausole contrattuali standard della Commissione Europea.",
          title: 'Contenuti del blog e del sito web (Sanity)',
        },
        title: '3. Hosting e Content Delivery Networks (CDN)',
      },
      '4': {
        drive: {
          content:
            'KiwiCV offre una sincronizzazione opzionale dei dati del Suo CV con il Suo Google Drive personale. Se attiva questa funzione, i file del Suo CV vengono trasferiti al Suo account Google Drive (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) e lì memorizzati in una cartella creata da KiwiCV.\n\nSe inserisce il link a un annuncio durante l\'esportazione, questo viene salvato con quella versione: nel file di backup e in proprietà del file che solo KiwiCV può leggere e che Google Drive non mostra, in modo che "I miei CV" possa mostrarlo accanto alla versione. Vi rimane finché non elimina quella versione dal Suo Google Drive; la disconnessione di Google Drive non lo rimuove. Non viene inviato alle funzionalità di IA.\n\nDal punto di vista tecnico, questa sincronizzazione è instradata attraverso le funzioni del nostro server: i contenuti del Suo CV, il link all\'annuncio e le credenziali di accesso necessarie per il trasferimento (refresh token) vengono elaborati lì in modo transitorio per la durata della richiesta e non vengono memorizzati in modo permanente sui nostri server; il link all\'annuncio vi transita anche quando "I miei CV" elenca le Sue versioni salvate. Il refresh token è altrimenti memorizzato esclusivamente a livello locale nel Suo browser. KiwiCV riceve l\'accesso solo ai file che ha creato esso stesso (ambito Google "drive.file") e in nessun momento al resto del Suo Drive.\n\nIl trasferimento dei dati avviene esclusivamente sulla base del Suo consenso attivo (Art. 6, par. 1, lett. a del GDPR) collegando volontariamente il Suo account Google. Può revocarlo in qualsiasi momento con "Disconnetti Google Drive" nella sezione "Sincronizzazione e archiviazione" delle impostazioni e "Disconnetti e rimuovi l\'accesso", revocando così anche l\'autorizzazione concessa a KiwiCV su Google. Può inoltre rimuovere KiwiCV nell\'accesso di terze parti del Suo account Google (myaccount.google.com/connections). La preghiamo di notare che Google, in quanto società statunitense, trasferisce i dati negli USA; tale trasferimento si basa sull\'EU-US Data Privacy Framework (DPF), nell\'ambito del quale Google è certificata, nonché sulle clausole contrattuali tipo della Commissione europea.',
          title: 'Sincronizzazione con Google Drive (Opzionale)',
        },
        github: {
          content:
            'Questa applicazione offre la possibilità di interagire direttamente con il Suo account GitHub (ad esempio per salvare o sincronizzare i dati del Suo curriculum) tramite un GitHub Personal Access Token (PAT) fornito volontariamente da Lei.\n\nSe utilizza questa funzione, il Suo browser stabilisce una connessione diretta con i server di GitHub (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). Durante questo processo, il Suo indirizzo IP e i dati inseriti nell\'applicazione vengono trasmessi direttamente a GitHub e lì elaborati.\n\nCiò che arriva a GitHub dipende dal repository che sceglie. Un repository privato che non è pubblicato con GitHub Pages riceve i dati completi del Suo curriculum, comprese le voci che ha nascosto, la Sua lettera di presentazione, i dati che KiwiCV conserva da un file importato e il link all\'annuncio, se ne inserisce uno durante l\'esportazione. Un repository che chiunque può leggere (uno pubblico o uno pubblicato con GitHub Pages) riceve il Suo curriculum senza le voci e le sezioni che ha nascosto, senza la Sua lettera di presentazione, senza i dati conservati da file importati e senza il link all\'annuncio. Include invece le Sue impostazioni di design, la Sua foto del profilo se non la nasconde, i nomi e i dati di contatto delle referenze che ha indicato e i nomi dei file e delle cartelle che sceglie durante l\'esportazione, che compaiono anche nei messaggi di commit e possono indicare l\'azienda e la posizione per cui si candida. Se in seguito rende pubblico un repository o lo pubblica con GitHub Pages, anche ciò che contiene già, compresa la sua cronologia, può diventare pubblico.\n\nIl Suo GitHub PAT non viene mai inviato ai server di KiwiCV. Viene memorizzato solo nel Suo browser su questo dispositivo e utilizzato solo per autorizzare le richieste che il Suo browser invia a GitHub per Suo conto: per la sessione corrente del browser o, se sceglie "Memorizza il token in modo persistente in questo browser", finché non lo rimuove. Poiché il token appartiene a questo dispositivo e non al Suo account KiwiCV, resta memorizzato quando esce dall\'account, a meno che non scelga "Rimuovi GitHub ed esci"; l\'eliminazione del Suo account lo rimuove se lascia selezionata l\'opzione "Rimuovere anche la connessione a GitHub da questo dispositivo".\n\nIl trasferimento dei dati a GitHub avviene esclusivamente sulla base del Suo consenso attivo (Art. 6 par. 1 lett. a GDPR), utilizzando volontariamente la funzione e inserendo il Suo token. Può revocare questo consenso in qualsiasi momento con "Disconnetti GitHub" nella sezione "Sincronizzazione e archiviazione" delle impostazioni e "Disconnetti e rimuovi il token", il che rimuove il Suo token e le impostazioni del repository da questo dispositivo e non invia nulla a GitHub. I dati già presenti nel Suo repository vi restano finché non li elimina su GitHub. Si prega di notare che GitHub, in quanto azienda statunitense, trasferisce i dati negli USA. Ulteriori informazioni sulla protezione dei dati presso GitHub sono disponibili qui:',
          link: {
            text: 'Informativa sulla privacy di GitHub',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Interazione con GitHub tramite Personal Access Token (PAT)',
        },
        storage: {
          content:
            "Per la fornitura e il funzionamento del generatore di CV, KiwiCV utilizza la cosiddetta tecnica del Web Storage (Local Storage). In questo processo, i Suoi dati immessi (come i dati di testo per il curriculum o le foto del profilo elaborate localmente in formato Base64) vengono memorizzati nella cache locale del browser del Suo dispositivo terminale. Ciò impedisce che i Suoi dati vadano persi in caso di ricaricamento accidentale della pagina.\n\nSe importa un file di curriculum che contiene sezioni di primo livello che KiwiCV non utilizza (ad esempio quelle scritte da un'altra applicazione), KiwiCV le conserva insieme al Suo curriculum, fino a un limite di dimensione, in modo che l'esportazione del file le restituisca invariate. Vengono memorizzate, esportate e incluse nei backup insieme al Suo curriculum (su Google Drive o in un repository GitHub privato non pubblicato con GitHub Pages) e compaiono nella vista JSON grezzo, ma non vengono mai mostrate nel Suo curriculum né nell'editor e non vengono mai inviate alle funzionalità di IA.\n\nSe usa «Adatta al mio stile di scrittura» per una lettera di presentazione, il campione di scrittura che inserisce (fino a 5.000 caratteri) viene conservato anch'esso nel Local Storage, separatamente dal Suo curriculum, così da essere pronto per la Sua prossima lettera. Viene trasmesso alle funzionalità di IA della sezione 8 ogni volta che una lettera di presentazione viene scritta nel Suo stile; non fa parte dei Suoi backup su Google Drive o GitHub. Rimane sul Suo dispositivo terminale finché non lo cancella nella finestra della lettera di presentazione, non esce dal Suo account, non accede con un altro account o non svuota la memoria del Suo browser; l'eliminazione del Suo account lo rimuove anche dal dispositivo su cui elimina l'account, perché comporta l'uscita dall'account.\n\nSe utilizza un repository GitHub, il Suo browser conserva inoltre nel Local Storage di questo dispositivo i link all'annuncio salvati con le versioni in esso contenute, in modo che \"I miei CV\" non debba scaricare di nuovo ogni backup per mostrarli. Vengono rimossi insieme alla Sua connessione a GitHub: quando disconnette GitHub, quando sceglie \"Rimuovi GitHub ed esci\" oppure quando elimina il Suo account lasciando selezionata l'opzione \"Rimuovere anche la connessione a GitHub da questo dispositivo\".\n\nQuesti dati vengono elaborati localmente sul Suo dispositivo terminale e non vengono trasmessi ad alcun server a meno che Lei non utilizzi attivamente una delle funzionalità opzionali descritte in questa informativa (ad esempio il backup su Google Drive in questa sezione o le funzionalità di IA nella sezione 8). Non ho accesso a questi dati memorizzati localmente in qualsiasi momento.\n\nSe accede, il Suo browser memorizza inoltre la Sua sessione di accesso, che accompagna le Sue richieste ai nostri server (si veda la sezione 5), una copia del Suo profilo e l'ID del Suo account, che indica a quale account appartengono le credenziali di accesso memorizzate localmente e il campione di scrittura. La loro memorizzazione è strettamente necessaria per l'accesso da Lei richiesto (§ 25 par. 2 n. 2 della TDDDG); tutti e tre vengono rimossi quando esce dal Suo account.\n\nLa memorizzazione di questi dati è tecnicamente strettamente necessaria per la funzione principale dell'applicazione. La base giuridica per la memorizzazione e la lettura dei dati sul Suo dispositivo terminale è il § 25 par. 2 n. 2 della TDDDG. La successiva elaborazione avviene sulla base del mio legittimo interesse a una fornitura del servizio facile da usare ai sensi dell'Art. 6 par. 1 lett. f del GDPR. Salvo quanto descritto diversamente sopra, i dati rimangono sul Suo dispositivo terminale finché non svuota manualmente la memoria (cache/Local Storage) del Suo browser.",
          title: 'Utilizzo del Web Storage (Local Storage)',
        },
        title: '4. Raccolta dei dati nella nostra applicazione',
      },
      '5': {
        account: {
          content:
            "Quando crea un account utente (tramite Google OAuth), memorizziamo il Suo indirizzo email, il Suo nome e la Sua foto del profilo Google per gestire il Suo accesso e i Suoi dati personalizzati. Tenga presente che le funzionalità premium sono disponibili solo per gli utenti registrati. Memorizziamo anche informazioni sul Suo Pro Pass attivo, nonché metadati sulle Sue richieste IA, che la sezione 8 descrive. Non memorizziamo in modo permanente alcun input (prompt) o output (risultati) dell'ottimizzazione dell'IA sui nostri server; la memorizzazione temporanea nella cache durante l'elaborazione è descritta nella sezione 8.\n\n**Fornitore del database:** Questi dati dell'account sono archiviati presso il nostro responsabile del trattamento **Supabase, Inc.** in un progetto ospitato nell'Unione Europea. Con Supabase è in essere un accordo sul trattamento dei dati conforme all'Art. 28 GDPR.",
          title: 'Informazioni sull’account e sul profilo',
        },
        title: '5. Account e dati utente',
      },
      '6': {
        stripe: {
          content:
            "Utilizziamo Stripe Payments Europe, Limited (Irlanda) per l'elaborazione dei pagamenti. Durante il processo di pagamento, Stripe raccoglie direttamente le Sue informazioni di pagamento. Non memorizziamo dati di pagamento sensibili (come i numeri delle carte di credito) sui nostri server; riceviamo solo informazioni sullo stato della transazione da Stripe. La base giuridica è l'esecuzione del Suo acquisto (Art. 6, par. 1, lett. b del GDPR) e, per i documenti di fatturazione che devono essere conservati, un obbligo legale (Art. 6, par. 1, lett. c del GDPR, vedere sezione 7). Stripe elabora dati anche negli USA (Stripe, LLC); tale trasferimento si basa sull'EU-US Data Privacy Framework (DPF), nell'ambito del quale Stripe è certificata, nonché sulle clausole contrattuali tipo della Commissione europea.",
          title: 'Gestione delle transazioni tramite Stripe',
        },
        title: '6. Elaborazione dei pagamenti',
      },
      '7': {
        deletion_scope: {
          content:
            "All'eliminazione del Suo account utente, il Suo profilo e tutti i metadati collegati (ad es. lo stato del Suo Pro Pass, i dati di pagamento e i log di utilizzo) verranno eliminati immediatamente e in modo permanente dal nostro database gestito da Supabase (vedere sezione 5). La preghiamo di notare che i dati del curriculum sono memorizzati nel local storage del Suo browser e, se utilizza il backup su Google Drive o la sincronizzazione con GitHub, nel Suo Google Drive personale o nel Suo repository GitHub; nessuno di questi è interessato dall'eliminazione dell'account lato server. Anche un token GitHub memorizzato su questo dispositivo viene rimosso se lascia selezionata l'opzione \"Rimuovere anche la connessione a GitHub da questo dispositivo\" (vedere sezione 4).",
          title: 'Ambito della cancellazione',
        },
        retention_legal: {
          content:
            "La preghiamo di notare che siamo legalmente tenuti a conservare i dati delle fatture relative alle transazioni (in particolare le ricevute degli acquisti effettuati tramite Stripe) per un periodo di 10 anni. Ciò avviene in base ai requisiti della legge fiscale e commerciale (ad esempio, secondo l'AO e l'HGB tedeschi). La base giuridica è l'Art. 6 par. 1 lett. c del GDPR.",
          title: 'Obblighi legali di conservazione',
        },
        stripe_retention: {
          content:
            'Questi dati specifici rimangono memorizzati presso il nostro fornitore di servizi di pagamento, Stripe, per la durata dei periodi legali per garantire una documentazione adeguata per le autorità fiscali.',
          title: 'Archiviazione tramite Stripe',
        },
        title: '7. Cancellazione e conservazione dei dati',
      },
      '8': {
        logging_metrics: {
          content:
            'Per ogni richiesta IA completata, KiwiCV registra metadati collegati al Suo account nel nostro database gestito da Supabase (vedere sezione 5). Questo registro non contiene mai il contenuto dei Suoi prompt o dei risultati; come questi vengono conservati brevemente mentre una richiesta è in corso è descritto più avanti sotto "Archiviazione Temporanea". Viene memorizzato quanto segue:\n\n**Tipo di richiesta:** che tipo di richiesta era (ad es. "Ottimizzazione del CV", "Lettera di presentazione", "Analisi del CV con IA"), la modalità IA che ha scelto e a cosa si riferiva (l\'intero CV o un tipo di sezione come "Esperienza Lavorativa"), mai il testo stesso.\n\n**Dati di utilizzo:** l\'ora della richiesta, il numero di token utilizzati e se l\'ha coperta un Pro Pass; per le richieste effettuate quando KiwiCV offriva ancora un periodo di prova gratuito, se l\'ha coperta tale periodo di prova.\n\n**Dati tecnici:** quanto è durata la richiesta, il modello di IA, la regione del server, la versione delle nostre istruzioni all\'IA, come si è conclusa la richiesta, se il risultato ha modificato qualcosa e se si trattava di un\'esecuzione di prova.\n\n**Classificazione di sicurezza:** per le ottimizzazioni del CV e le lettere di presentazione, i punteggi che i sistemi di sicurezza automatici di Google assegnano alla risposta dell\'IA, quando Google li fornisce, ad esempio quanto è probabile che contenga molestie o contenuti pericolosi. Derivano dal testo, ma non ne contengono nulla.\n\nUtilizziamo questi dati per conteggiare le Sue richieste rispetto alla Sua quota giornaliera, per applicare la nostra Fair Use Policy (evitare l\'uso abusivo e automatizzato) e per la diagnosi degli errori. Per migliorare le funzioni di IA, li valutiamo solo in forma aggregata e non li usiamo mai per creare un profilo di Lei. Il conteggio delle Sue richieste è necessario per fornire il servizio (Art. 6 par. 1 lett. b GDPR); le altre finalità si basano sul nostro legittimo interesse a prevenire abusi, correggere errori e migliorare le funzioni di IA (Art. 6 par. 1 lett. f GDPR). I dati vengono conservati finché esiste il Suo account e vengono eliminati insieme a esso (vedere sezione 7).',
          title: 'Registrazione e metriche di utilizzo',
        },
        privacy_training: {
          content:
            "La protezione dei Suoi dati è la nostra massima priorità. Nell'ambito dell'utilizzo dell'API Google Cloud (Vertex AI), si applicano le seguenti garanzie di sicurezza:\n\n**Nessun addestramento dei modelli:** Google esclude esplicitamente l'utilizzo dei dati inseriti (prompt) per addestrare i suoi modelli di IA globali. I Suoi dati rimangono nel nostro ambiente Google Cloud isolato.\n\n**Posizione dei dati:** Google elabora le Sue richieste su server all'interno dell'Unione Europea (multiregione UE di Google Cloud \"eu\", limitata agli Stati membri dell'UE) al fine di garantire un livello di protezione dei dati adeguato ai sensi del GDPR. Prima di raggiungere Google, passano attraverso le funzioni del nostro server negli USA (si veda la sezione 3).\n\n**Nessuna memorizzazione permanente presso il fornitore:** Google elabora i dati per gestire la richiesta e non li memorizza in modo permanente. Google può memorizzare nella cache input e risultati fino a 24 ore. Se i sistemi di sicurezza automatici di Google segnalano una richiesta, Google può conservare il prompt fino a 30 giorni per verificare eventuali abusi; non viene utilizzato per addestrare modelli.",
          title: "Protezione dei dati ed esclusione dell'addestramento",
        },
        processing_scope: {
          content:
            "Per fornirLe funzionalità di ottimizzazione intelligente e creazione di CV e lettere di presentazione, utilizziamo la piattaforma Vertex AI di Google Cloud. In questo processo, i testi da Lei inseriti vengono trasmessi e lavorati sui server di Google; nel percorso passano attraverso le funzioni del nostro server presso Netlify negli USA (si veda la sezione 3). Le funzioni di IA si attivano solo quando le avvia attivamente; la base giuridica di questo trattamento è l'Art. 6, par. 1, lett. b del GDPR (fornitura del servizio richiesto).",
          title: 'Tipo e ambito del trattamento',
        },
        temporary_storage: {
          content:
            "Per garantire un'elaborazione stabile delle richieste di IA, KiwiCV utilizza processi in background asincroni. I documenti di input caricati (come i file del curriculum) e i risultati generati dall'IA vengono temporaneamente memorizzati nel nostro database gestito da Supabase (vedere sezione 5) per un breve periodo (di solito non più di pochi minuti, e comunque mai più di 24 ore) finché il Suo browser non li recupera con successo. Dopo questo periodo, o una volta recuperati, questi risultati temporanei e i dati di input caricati vengono eliminati automaticamente e completamente. KiwiCV utilizza questi input e risultati temporanei solo per fornire il risultato che ha richiesto e mai per la profilazione o per addestrare modelli di IA.",
          title: 'Archiviazione Temporanea',
        },
        title: '8. Utilizzo dei servizi di IA (Google Cloud Vertex AI)',
      },
      '9': {
        posthog: {
          content:
            "Per comprendere meglio come gli utenti interagiscono con KiwiCV e per migliorare i nostri servizi, utilizziamo lo strumento di analisi PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, USA). Per proteggere la Sua privacy, abbiamo configurato PostHog in modo strettamente anonimo e senza cookie.\n\n**Monitoraggio anonimo:** Non utilizziamo cookie di monitoraggio e non memorizziamo alcuna identificazione personale nel Suo browser. PostHog è configurato per utilizzare la persistenza solo in memoria (memory-only), il che significa che tutti i dati della sessione vengono persi non appena chiude o ricarica la pagina.\n\n**Residenza dei dati (UE):** Tutti i dati vengono inviati e memorizzati sui server europei di PostHog (Regione: Francoforte, Germania - https://eu.i.posthog.com) per garantire la conformità agli standard europei di protezione dei dati.\n\n**Riconoscimento della sessione:** Per il riconoscimento anonimo della sessione, viene generato un valore hash a breve termine sul lato server, che viene eliminato automaticamente dopo 24 ore. Ciò ci consente di vedere i modelli di interazione (ad esempio, quali temi sono popolari o quanti curriculum vengono esportati) senza essere in grado di identificarLa come individuo.\n\nL'uso di PostHog si basa sul nostro legittimo interesse per la progettazione orientata alla domanda e l'ottimizzazione continua del nostro sito web (Art. 6 par. 1 lett. f GDPR).",
          title: 'Analitica Web Anonima (PostHog)',
        },
        title: '9. Analitica Web',
      },
      '10': {
        email: {
          content:
            "Se ci contatta via e-mail (ad esempio a {{email}} o a un altro indirizzo indicato su questo sito), conserviamo i Suoi dati, compresi i dati di contatto, per gestire la richiesta ed eventuali domande successive.\n\n**Inoltro delle e-mail (Cloudflare):** Le e-mail inviate agli indirizzi kiwicanopy.com vengono ricevute da **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** tramite il servizio Email Routing e inoltrate alla nostra casella di posta. Il contenuto non viene memorizzato; Cloudflare registra mittente, destinatario, oggetto, orario e stato di consegna. Con Cloudflare è in vigore un accordo sul trattamento dei dati (Cloudflare Customer DPA).\n\n**Casella di posta (Google):** La casella di posta è gestita da Google (Gmail); il fornitore è Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Eventuali trasferimenti negli Stati Uniti (a Cloudflare o Google LLC) si basano sull'EU-US Data Privacy Framework e, in subordine, sulle clausole contrattuali tipo della Commissione europea.\n\nLa base giuridica è l'art. 6, par. 1, lett. b GDPR se la richiesta riguarda un contratto, altrimenti il nostro legittimo interesse a rispondere (art. 6, par. 1, lett. f GDPR). I dati vengono cancellati non appena non sono più necessari a tale scopo e non sussistono obblighi legali di conservazione.",
          title: 'Inoltro delle e-mail e casella di posta',
        },
        title: '10. Contatto via e-mail',
      },
    },
    tabLabel: 'Privacy',
    title: 'Informativa sulla Privacy',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            "Le richieste di elaborazione IA vengono eseguite in modo asincrono. L'utente è responsabile del recupero dei risultati in modo tempestivo. Per motivi di sicurezza e ottimizzazione delle risorse, i risultati memorizzati temporaneamente nella cache vengono cancellati irrevocabilmente al più tardi dopo 24 ore. Non esiste alcun diritto alla conservazione permanente di questi dati temporanei.",
          title: 'Elaborazione Asincrona e Fornitura di Dati',
        },
        daily_limit: {
          content:
            'Per prevenire abusi e garantire la disponibilità per tutti gli utenti, il numero di richieste IA per account Pro è limitato a {{limit}} richieste entro 24 ore. Questa quota viene azzerata ogni giorno a mezzanotte (ora tedesca, CET/CEST).',
          title: 'Quota di utilizzo',
        },
        purpose: {
          content:
            'Le funzioni IA di KiwiCV possono essere utilizzate solo per creare e migliorare i documenti di candidatura all’interno della piattaforma. Non è consentito l’uso per scopi estranei al sistema.',
          title: 'Scopo previsto',
        },
        technical_limits: {
          content:
            'Ci riserviamo il diritto di limitare il numero massimo di token per richiesta a un livello ragionevole per l’ottimizzazione del CV. È vietato l’uso automatizzato o lo scraping di massa delle risposte IA.',
          title: 'Restrizioni tecniche',
        },
        title: '1. Politica di utilizzo corretto',
      },
      '2': {
        ai_usage: {
          content:
            'I titolari di un Pro Pass ricevono l’accesso alle funzioni di ottimizzazione guidate dall’IA senza fatturazione individuale per richiesta. Questo accesso è destinato all’uso privato nel contesto della ricerca di lavoro.',
          title: 'Accesso IA (Titolari del Pro Pass)',
        },
        one_time_payment: {
          content:
            "L'acquisto di un Pro Pass rappresenta un pagamento una tantum completato per un servizio specifico. Non è un abbonamento; non è previsto alcun rinnovo automatico.",
          title: 'Pagamento una tantum',
        },
        refunds: {
          content:
            "In qualità di consumatore, dispone di un diritto legale di recesso di 14 giorni a decorrere dalla conclusione del contratto. Le condizioni, il termine e le modalità sono indicati nella nostra Informativa sul recesso, che include anche il modulo tipo di recesso.\n\nSe recede entro tale termine, rimborseremo l'intero prezzo corrisposto. Al di fuori del diritto di recesso di legge, non offriamo rimborsi. Il Pro Pass non è trasferibile tra account utente.",
          title: 'Diritto di recesso, rimborsi e trasferibilità',
        },
        stacking: {
          content:
            'In caso di acquisto di più Pro Pass a tempo limitato, i periodi di validità vengono sommati («stacking»). La durata del nuovo pass inizia solo dopo la scadenza del periodo attualmente attivo.',
          title: 'Accumulo Pro Pass (Stacking)',
        },
        title: '2. Utilizzo Premium (Pass)',
        validity_timezone: {
          content:
            "I periodi di accesso e i limiti di utilizzo giornaliero sono calcolati in base all'ora dell'Europa centrale (CET/CEST). I pass a tempo limitato scadono alle 23:59:59 dell'ultimo giorno del periodo di accesso totale accumulato.",
          title: 'Politica sul fuso orario',
        },
      },
      '3': {
        termination: {
          content:
            "Può cancellare il Suo account utente in qualsiasi momento senza fornire alcuna motivazione. Con la cancellazione dell'account, il rapporto contrattuale termina con effetto immediato.",
          title: "Cancellazione dell'account",
        },
        title: "3. Risoluzione e cancellazione dell'account",
      },
    },
    tabLabel: 'T&C',
    title: 'Termini e Condizioni',
  },
  translation_note:
    'Questa è una traduzione automatica della versione originale tedesca per Sua comodità. In caso di discrepanze, prevale la versione tedesca.',
  update: {
    button: 'Accettare e continuare',
    changes_desc:
      "La sezione 4 spiega ora che il link a un annuncio che aggiunge durante l'esportazione viene salvato con quella versione nel Suo Google Drive o in un repository GitHub privato non pubblicato con GitHub Pages, mai in un repository che chiunque può leggere, che per Google Drive passa attraverso le funzioni del nostro server e che il Suo browser conserva su questo dispositivo i link all'annuncio salvati con le Sue versioni GitHub finché non rimuove la connessione a GitHub.",
    changes_title: 'Cosa è cambiato?',
    checkbox: "Accetto i Termini di servizio e l'Informativa sulla privacy aggiornati.",
    intro:
      "L'informativa sulla privacy di KiwiCV è stata aggiornata: ora spiega dove viene salvato il link all'annuncio che può aggiungere durante l'esportazione.",
    link_privacy: 'Informativa sulla privacy',
    link_terms: 'Termini di servizio',
    links_desc: 'Può leggere i documenti completi qui:',
    success: 'Grazie per aver accettato i termini aggiornati!',
    title: 'Aggiornamento Termini e Privacy',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            "Lei ha il diritto di recedere dal contratto, senza indicarne le ragioni, entro 14 giorni. Il periodo di recesso scade dopo 14 giorni dal giorno della conclusione del contratto.\n\nPer esercitare il diritto di recesso, è tenuto a informare noi:\n\n{{name}}\n{{address}}\n{{email}}\n\ndella sua decisione di recedere dal presente contratto tramite una dichiarazione esplicita (ad esempio lettera inviata per posta o posta elettronica). A tal fine può utilizzare il modulo tipo di recesso allegato, ma non è obbligatorio.\n\nPer rispettare il termine di recesso, è sufficiente che Lei invii la comunicazione relativa all'esercizio del diritto di recesso prima della scadenza del periodo di recesso.",
          title: 'Il Suo diritto di recesso',
        },
        title: '1. Diritto di recesso',
      },
      '2': {
        email_note: {
          content:
            "Per aiutarci a individuare il Suo ordine, La preghiamo di indicare anche l'indirizzo e-mail utilizzato per l'acquisto. Ciò non è richiesto affinché il Suo recesso sia efficace.",
          title: 'Identificazione del Suo ordine',
        },
        form: {
          content:
            '_Destinatario {{name}}, {{address}}, {{email}}:_\n\nCon la presente io/noi (*) notifichiamo il recesso dal mio/nostro (*) contratto di prestazione del seguente servizio:\n\n— Ordinato il (*) / ricevuto il (*):\n\n— Nome del/dei consumatore(i):\n\n— Indirizzo del/dei consumatore(i):\n\n— Firma del/dei consumatore(i) (solo se il presente modulo è notificato su carta):\n\n— Data:\n\n_(*) Cancellare la dicitura non pertinente._',
          title:
            'Compilare e restituire il presente modulo solo se si desidera recedere dal contratto',
        },
        title: '2. Modulo tipo di recesso',
      },
      '3': {
        refund: {
          content:
            'Se Lei recede dal presente contratto, Le saranno rimborsati tutti i pagamenti che ha effettuato a nostro favore senza indebito ritardo e in ogni caso non oltre 14 giorni dal giorno in cui siamo informati della Sua decisione di recedere dal presente contratto.\n\nDetti rimborsi saranno effettuati utilizzando lo stesso mezzo di pagamento da Lei usato per la transazione iniziale, salvo che Lei non abbia espressamente convenuto altrimenti; in ogni caso, non dovrà sostenere alcun costo quale conseguenza di tale rimborso.',
          title: 'Rimborso',
        },
        title: '3. Effetti del recesso',
      },
    },
    tabLabel: 'Recesso',
    title: 'Diritto di recesso',
  },
};
