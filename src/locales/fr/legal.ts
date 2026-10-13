import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Envoyez-nous un e-mail',
    message:
      'Le feedback est le moteur de KiwiCV. Que vous ayez trouvé un bug, ayez une idée de fonctionnalité géniale ou souhaitiez simplement dire bonjour, KiwiCV est à votre écoute.',
    prompt: 'Les réponses parviennent généralement sous 24 heures.',
    support_label: 'Adresse de contact officielle',
    title: 'Construisons ensemble l’avenir des CV !',
  },
  licenses: {
    description:
      'Les logiciels open-source suivants sont utilisés dans KiwiCV. Nous remercions les développeurs et la communauté pour leurs précieuses contributions.',
    tabLabel: 'Licences',
    title: 'Licences Open Source',
  },
  nav_label: 'Confidentialité et conditions',
  notice: {
    sections: {
      details: {
        content:
          "**{{name}}**\n**{{title}}**\n{{address}}\n\n**Contact :**\nE-Mail : {{email}}\n\n*En tant que petite entreprise au sens du § 19 al. 1 UStG, aucune TVA n'est facturée.*",
        title: 'Informations selon le § 5 DDG :',
      },
      dispute: {
        content:
          "**Règlement des litiges de consommation :**\nKiwiCV n'est pas disposé ou obligé de participer à une procédure de règlement des litiges devant un conseil d'arbitrage des consommateurs.",
        title: 'Règlement des litiges :',
      },
    },
    title: 'Mentions Légales',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            "Les informations suivantes fournissent un aperçu simple de ce qu'il advient de vos données personnelles lorsque vous visitez ce site web. Les données personnelles sont toutes les données permettant de vous identifier personnellement. KiwiCV ne vend ni ne partage vos informations personnelles.",
          title: 'Remarques générales',
        },
        how: {
          content:
            "Vos données sont collectées, d'une part, parce que vous nous les communiquez (par exemple, en saisissant des données de CV dans l'application). Toutefois, ces saisies sont principalement traitées localement dans votre navigateur. D'autres données sont collectées automatiquement par nos systèmes informatiques lors de votre visite sur le site. Il s'agit principalement de données techniques (par exemple, navigateur Internet, système d'exploitation ou heure de consultation de la page).",
          title: 'Comment KiwiCV collecte-t-il vos données ?',
        },
        responsible: {
          content:
            "Le traitement des données sur ce site web est effectué par l'exploitant du site web. Vous trouverez ses coordonnées dans la section « Note sur l'organisme responsable » de cette politique de confidentialité.",
          title: 'Qui est responsable de la collecte des données sur ce site web ?',
        },
        title: "1. La protection des données en un coup d'œil",
      },
      '2': {
        responsible: {
          content:
            "L'organisme responsable du traitement des données sur ce site web est :\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail : {{email}}",
          title: "Note sur l'organisme responsable",
        },
        rights: {
          content:
            "Dans le cadre des dispositions légales en vigueur, vous avez à tout moment le droit d'obtenir gratuitement des informations sur vos données personnelles enregistrées, leur origine et leurs destinataires et le but du traitement des données (Art. 15 RGPD) et, le cas échéant, un droit de rectification (Art. 16 RGPD) ou de suppression (Art. 17 RGPD) de ces données, un droit à la limitation de leur traitement (Art. 18 RGPD) ainsi que le droit de recevoir les données que vous avez fournies dans un format structuré, couramment utilisé et lisible par machine, ou de les faire transmettre à un autre responsable du traitement (droit à la portabilité des données, Art. 20 RGPD). Pour cela, ainsi que pour d'autres questions sur le thème des données personnelles, vous pouvez vous adresser à moi à tout moment.\n\n**Droit d'opposition (Art. 21 RGPD) :** Lorsque je traite vos données personnelles sur la base d'intérêts légitimes (Art. 6 al. 1 lit. f RGPD), vous avez le droit de vous opposer à tout moment à ce traitement pour des raisons tenant à votre situation particulière. Cela concerne tout traitement pour lequel la présente politique de confidentialité indique l'Art. 6 al. 1 lit. f RGPD comme base juridique. Je ne traite alors plus les données concernées, à moins que je ne démontre des motifs légitimes et impérieux pour le traitement qui prévalent sur vos intérêts, droits et libertés, ou que le traitement ne serve à la constatation, à l'exercice ou à la défense de droits en justice.\n\nLorsqu'un traitement repose sur votre consentement (Art. 6 al. 1 lit. a RGPD), vous pouvez le retirer à tout moment avec effet pour l'avenir (Art. 7 al. 3 RGPD) ; le retrait ne remet pas en cause la licéité du traitement fondé sur le consentement effectué avant ce retrait.\n\nEn outre, vous avez un droit de recours auprès de l'autorité de surveillance compétente.",
          title: 'Vos droits',
        },
        title: '2. Remarques générales et informations obligatoires',
      },
      '3': {
        netlify: {
          content:
            "Ce site est hébergé par un prestataire de services externe (hébergeur). KiwiCV utilise pour l'hébergement le fournisseur **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107**.\n\nL'utilisation de Netlify a pour but une mise à disposition sûre, rapide et efficace de l'offre en ligne par un prestataire professionnel (Art. 6 al. 1 lit. f RGPD). Netlify utilise un Content Delivery Network (CDN) mondial, par lequel les données (comme votre adresse IP) peuvent être routées via des serveurs dans le monde entier afin de minimiser les temps de chargement du site. Les fichiers log du serveur (données d'accès) qui en résultent sont généralement conservés par Netlify pendant 90 jours (et jusqu'à 1 an hors ligne) pour des raisons de sécurité, puis supprimés.\n\nNetlify exploite également les fonctions serveur de KiwiCV, situées aux USA. Chaque requête adressée aux fonctionnalités d'IA de la section 8 transite par elles avec son contenu (par exemple le texte de votre CV, une offre d'emploi ou un fichier de CV téléversé) avant d'atteindre Google. Il en va de même pour la synchronisation avec Google Drive (section 4), les paiements (section 6) et la suppression de votre compte (section 7). Pour les fonctionnalités d'IA et la synchronisation avec Google Drive, la base juridique est celle indiquée dans leur section ; les paiements sont traités pour l'exécution du contrat conclu avec vous (Art. 6 al. 1 lit. b RGPD), et votre compte est supprimé pour respecter l'obligation légale d'effacer vos données (Art. 6 al. 1 lit. c RGPD en liaison avec l'Art. 17 RGPD).\n\nLe transfert de données vers les USA est fondé sur les clauses contractuelles types de la Commission européenne ainsi que sur le cadre de confidentialité des données UE-USA (DPF), en vertu duquel Netlify est certifié.\n\n**Sous-traitance :** J'ai conclu un contrat de sous-traitance (AVV) pour l'utilisation du service mentionné ci-dessus, qui garantit que Netlify ne traite les données personnelles des visiteurs de notre site que selon mes instructions et dans le respect du RGPD.",
          title: 'Hébergement externe (Netlify)',
        },
        sanity: {
          content:
            "Les articles du blog KiwiCV et leurs images, ainsi que les témoignages de la page d'accueil et leurs photos, sont gérés avec la plateforme de contenu Sanity (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Norvège, et Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, USA). Lorsque vous ouvrez le blog ou un article, ou faites défiler la page d'accueil vers un témoignage, votre navigateur charge ce contenu directement depuis les serveurs de Sanity (sanity.io). Sanity reçoit alors votre adresse IP et les données techniques que toute requête transmet (par exemple le type de votre navigateur et l'heure de la requête).\n\nL'utilisation de Sanity repose sur notre intérêt légitime à mettre le blog et le contenu du site à disposition de manière efficace (Art. 6 al. 1 lit. f RGPD). Des données peuvent alors être transférées vers les USA ; le contrat de traitement des données de Sanity fonde ces transferts sur les clauses contractuelles types de la Commission européenne.",
          title: 'Contenu du blog et du site (Sanity)',
        },
        title: '3. Hébergement et réseaux de diffusion de contenu (CDN)',
      },
      '4': {
        drive: {
          content:
            "KiwiCV propose une synchronisation optionnelle des données de votre CV avec votre Google Drive personnel. Si vous activez cette fonction, les fichiers de votre CV sont transférés vers votre compte Google Drive (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) et y sont stockés dans un dossier créé par KiwiCV.\n\nTechniquement, cette synchronisation est acheminée via nos fonctions serveur : le contenu de votre CV et le jeton d'accès requis pour le transfert (refresh token) y sont traités de manière transitoire pour la durée de la requête et ne sont pas stockés de manière permanente sur nos serveurs. Le refresh token est autrement stocké exclusivement localement dans votre navigateur. KiwiCV n'obtient l'accès qu'aux fichiers qu'il a lui-même créés (périmètre Google \"drive.file\") et à aucun moment au reste de votre Drive.\n\nLe transfert de données s'effectue exclusivement sur la base de votre consentement actif (Art. 6, par. 1, let. a du RGPD) en associant volontairement votre compte Google. Vous pouvez le révoquer à tout moment avec \"Déconnecter Google Drive\" dans la rubrique \"Synchronisation et stockage\" des paramètres et \"Déconnecter et retirer l'accès\", ce qui révoque également l'autorisation accordée à KiwiCV auprès de Google. Vous pouvez aussi retirer KiwiCV dans les accès tiers de votre compte Google (myaccount.google.com/connections). Notez que Google, en tant qu'entreprise américaine, transfère des données vers les États-Unis ; ce transfert est basé sur le cadre de protection des données UE-États-Unis (DPF), dans le cadre duquel Google est certifié, ainsi que sur les clauses contractuelles types de la Commission européenne.",
          title: 'Synchronisation Google Drive (Optionnelle)',
        },
        github: {
          content:
            "Cette application offre la possibilité d'interagir directement avec votre compte GitHub (par ex. pour enregistrer ou synchroniser vos données de CV) via un Personal Access Token (PAT) GitHub fourni volontairement par vous.\n\nSi vous utilisez cette fonction, votre navigateur établit une connexion directe avec les serveurs de GitHub (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). Votre adresse IP ainsi que les données saisies dans l'application sont alors transmises directement à GitHub et y sont traitées.\n\nCe qui parvient à GitHub dépend du dépôt que vous choisissez. Un dépôt privé qui n'est pas publié avec GitHub Pages reçoit l'intégralité des données de votre CV, y compris les entrées que vous avez masquées, votre lettre de motivation et les données que KiwiCV conserve à partir d'un fichier importé. Un dépôt que tout le monde peut lire (public, ou publié avec GitHub Pages) reçoit votre CV sans les entrées et sections que vous avez masquées, sans votre lettre de motivation et sans les données conservées à partir de fichiers importés. Il comprend en revanche vos paramètres de design, votre photo de profil si vous ne la masquez pas, les noms et coordonnées des références que vous avez indiquées, ainsi que les noms de fichier et de dossier que vous choisissez lors de l'exportation, qui apparaissent aussi dans les messages de commit et peuvent nommer l'entreprise et le poste auxquels vous postulez. Si vous rendez ensuite un dépôt public ou le publiez avec GitHub Pages, ce qu'il contient déjà, y compris son historique, peut lui aussi devenir public.\n\nVotre PAT GitHub n'est jamais envoyé aux serveurs de KiwiCV. Il est stocké uniquement dans votre navigateur, sur cet appareil, et n'est utilisé que pour autoriser les demandes que votre navigateur envoie à GitHub en votre nom : pour la session de navigation en cours ou, si vous choisissez \"Stocker le jeton dans ce navigateur\", jusqu'à ce que vous le retiriez. Comme le jeton appartient à cet appareil et non à votre compte KiwiCV, il est conservé lorsque vous vous déconnectez de votre compte KiwiCV, sauf si vous choisissez \"Retirer GitHub et se déconnecter\" ; la suppression de votre compte le retire si vous laissez coché \"Retirer aussi la connexion GitHub de cet appareil\".\n\nLe transfert de données à GitHub s'effectue exclusivement sur la base de votre consentement actif (Art. 6 al. 1 lit. a RGPD), en utilisant volontairement la fonction et en saisissant votre jeton. Vous pouvez retirer ce consentement à tout moment avec \"Déconnecter GitHub\" dans la rubrique \"Synchronisation et stockage\" des paramètres et \"Déconnecter et supprimer le jeton\", ce qui supprime votre jeton et les paramètres du dépôt de cet appareil et n'envoie rien à GitHub. Les données déjà présentes dans votre dépôt y restent jusqu'à ce que vous les supprimiez sur GitHub. Notez que GitHub, en tant qu'entreprise américaine, transfère des données aux USA. Vous trouverez de plus amples informations sur la protection des données chez GitHub ici :",
          link: {
            text: 'Déclaration de confidentialité de GitHub',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Interaction avec GitHub via Personal Access Token (PAT)',
        },
        storage: {
          content:
            "Pour fournir et faire fonctionner le générateur de CV, KiwiCV utilise la technique de stockage web (local storage). Dans ce cadre, vos saisies (telles que les données textuelles pour le CV ou les photos de profil traitées localement au format Base64) sont mises en cache localement dans le navigateur de votre équipement terminal. Cela évite que vos données ne soient perdues en cas de rechargement accidentel de la page.\n\nSi vous importez un fichier de CV contenant des sections de premier niveau que KiwiCV n'utilise pas (par exemple, celles rédigées par une autre application), KiwiCV les conserve avec votre CV, dans la limite d'une taille maximale, afin que l'exportation du fichier les restitue à l'identique. Elles sont stockées, exportées et sauvegardées avec votre CV (sur Google Drive ou dans un dépôt GitHub privé qui n'est pas publié avec GitHub Pages) et apparaissent dans la vue JSON brut, mais ne sont jamais affichées sur votre CV ni dans l'éditeur, ni envoyées aux fonctionnalités d'IA.\n\nSi vous utilisez « Adapter à mon style d'écriture » pour une lettre de motivation, l'échantillon d'écriture que vous saisissez (jusqu'à 5 000 caractères) est également conservé dans le local storage, séparément de votre CV, afin d'être prêt pour votre prochaine lettre. Il est transmis aux fonctionnalités d'IA de la section 8 chaque fois qu'une lettre de motivation est rédigée dans votre style ; il ne fait pas partie de vos sauvegardes Google Drive ou GitHub. Il reste sur votre équipement terminal jusqu'à ce que vous l'effaciez dans la fenêtre de la lettre de motivation, que vous vous déconnectiez, que vous vous connectiez avec un autre compte ou que vous vidiez le stockage de votre navigateur ; la suppression de votre compte le supprime également de l'appareil sur lequel vous supprimez le compte, car elle vous déconnecte.\n\nCes données sont traitées localement sur votre équipement terminal et ne sont transmises à aucun serveur, sauf si vous utilisez activement l'une des fonctionnalités optionnelles décrites dans la présente politique (par exemple la sauvegarde Google Drive dans cette section ou les fonctionnalités d'IA à la section 8). Je n'ai accès à aucun moment à ces données stockées localement.\n\nSi vous vous connectez, votre navigateur enregistre également votre session de connexion, qui accompagne vos requêtes vers nos serveurs (voir la section 5), une copie de votre profil et l'identifiant de votre compte, qui indique à quel compte appartiennent les identifiants d'accès enregistrés localement et l'échantillon d'écriture. Leur stockage est strictement nécessaire à la connexion que vous avez demandée (§ 25, par. 2, n° 2 de la TDDDG) ; tous trois sont supprimés lorsque vous vous déconnectez.\n\nLe stockage de ces données est techniquement strictement nécessaire au fonctionnement principal de l'application. La base légale du stockage et de la lecture des données sur votre équipement terminal est le § 25, par. 2, n° 2 de la TDDDG. Le traitement ultérieur est basé sur mon intérêt légitime à fournir le service de manière conviviale conformément à l'art. 6, par. 1, al. f du RGPD. Sauf indication contraire ci-dessus, les données restent sur votre équipement terminal jusqu'à ce que vous vidiez manuellement le stockage (cache/local storage) de votre navigateur.",
          title: 'Utilisation du Web Storage (Local Storage)',
        },
        title: '4. Collecte de données dans notre application',
      },
      '5': {
        account: {
          content:
            "Lorsque vous créez un compte utilisateur (via Google OAuth), nous stockons votre adresse e-mail, votre nom et votre photo de profil Google pour gérer votre accès et vos données personnalisées. Notez que les fonctionnalités premium ne sont accessibles qu'aux utilisateurs enregistrés. Nous stockons également des informations sur votre Pro Pass actif ainsi que des métadonnées sur vos requêtes IA, que la section 8 décrit. Nous ne stockons de manière permanente aucune entrée (prompts) ni sortie (résultats) de l'optimisation par IA sur nos serveurs ; le stockage temporaire en cache pendant le traitement est décrit à la section 8.\n\n**Fournisseur de base de données :** Ces données de compte sont stockées chez notre sous-traitant **Supabase, Inc.** dans un projet hébergé dans l'Union européenne. Un contrat de sous-traitance conforme à l'Art. 28 du RGPD est en place avec Supabase.",
          title: 'Informations sur le compte et le profil',
        },
        title: '5. Compte et données utilisateur',
      },
      '6': {
        stripe: {
          content:
            "Nous utilisons Stripe Payments Europe, Limited (Irlande) pour le traitement des paiements. Pendant le processus de paiement, Stripe collecte directement vos informations de paiement. Nous ne stockons pas de données de paiement sensibles (comme les numéros de carte de crédit) sur nos propres serveurs ; nous recevons uniquement des informations d'état concernant la transaction de la part de Stripe. La base juridique est l'exécution de votre achat (Art. 6, par. 1, let. b du RGPD) et, pour les justificatifs de facturation à conserver, une obligation légale (Art. 6, par. 1, let. c du RGPD, voir section 7). Stripe traite également des données aux États-Unis (Stripe, LLC) ; ce transfert est basé sur le cadre de protection des données UE-États-Unis (DPF), dans le cadre duquel Stripe est certifié, ainsi que sur les clauses contractuelles types de la Commission européenne.",
          title: 'Gestion des transactions via Stripe',
        },
        title: '6. Traitement des paiements',
      },
      '7': {
        deletion_scope: {
          content:
            'Lors de la suppression de votre compte utilisateur, votre profil et toutes les métadonnées associées (par exemple, le statut de votre Pro Pass, les enregistrements de paiement et les journaux d\'utilisation) seront immédiatement et définitivement supprimés de notre base de données exploitée par Supabase (voir section 5). Veuillez noter que les données de votre CV sont stockées dans le stockage local de votre navigateur et, si vous utilisez la sauvegarde Google Drive ou la synchronisation GitHub, dans votre Google Drive personnel ou votre dépôt GitHub ; aucun de ces emplacements n\'est affecté par la suppression de compte côté serveur. Un jeton GitHub stocké sur cet appareil est également retiré si vous laissez coché "Retirer aussi la connexion GitHub de cet appareil" (voir section 4).',
          title: 'Étendue de la suppression',
        },
        retention_legal: {
          content:
            "Veuillez noter que nous sommes légalement tenus de conserver les données de facturation liées aux transactions (en particulier les preuves d'achats effectués via Stripe) pendant une période de 10 ans. Cela se fait sur la base des exigences fiscales et commerciales (ex: selon l'AO et le HGB allemands). La base juridique est l'Art. 6, par. 1, let. c du RGPD.",
          title: 'Obligations légales de conservation',
        },
        stripe_retention: {
          content:
            "Ces données spécifiques restent stockées chez notre prestataire de services de paiement, Stripe, pour la durée des délais légaux afin d'assurer une documentation appropriée pour les autorités fiscales.",
          title: 'Conservation via Stripe',
        },
        title: '7. Suppression et conservation des données',
      },
      '8': {
        logging_metrics: {
          content:
            "Pour chaque requête IA terminée, KiwiCV enregistre des métadonnées liées à votre compte dans notre base de données exploitée par Supabase (voir section 5). Ce journal ne contient jamais le contenu de vos prompts ni des résultats ; la manière dont ceux-ci sont conservés brièvement pendant l'exécution d'une requête est décrite sous \"Stockage Temporaire\" ci-dessous. Les éléments suivants sont stockés :\n\n**Type de requête :** la nature de la requête (par exemple, \"Optimisation de CV\", \"Lettre de motivation\", \"Analyse de CV par IA\"), le mode IA que vous avez choisi et ce sur quoi elle portait (le CV entier, ou un type de section comme \"Expérience Professionnelle\"), jamais le texte lui-même.\n\n**Données d'utilisation :** l'heure de la requête, le nombre de jetons utilisés et si un Pro Pass l'a couverte ; pour les requêtes effectuées lorsque KiwiCV proposait encore une période d'essai gratuite, si cette période d'essai l'a couverte.\n\n**Données techniques :** la durée de la requête, le modèle d'IA, la région du serveur, la version de nos instructions à l'IA, la manière dont la requête s'est terminée, si le résultat a modifié quelque chose et s'il s'agissait d'une exécution de test.\n\n**Classification de sécurité :** pour les optimisations de CV et les lettres de motivation, les scores que les systèmes de sécurité automatisés de Google attribuent à la réponse de l'IA lorsque Google les fournit, par exemple la probabilité qu'elle contienne du harcèlement ou des contenus dangereux. Ils sont dérivés du texte, mais n'en contiennent rien.\n\nNous utilisons ces données pour décompter vos requêtes de votre quota quotidien, pour appliquer notre politique d'utilisation équitable (évitement d'une utilisation abusive et automatisée) et pour le diagnostic d'erreurs. Pour améliorer les fonctionnalités d'IA, nous ne les évaluons que de manière agrégée et ne les utilisons jamais pour établir un profil de vous. Le décompte de vos requêtes est nécessaire à la fourniture du service (Art. 6 al. 1 lit. b RGPD) ; les autres finalités reposent sur notre intérêt légitime à prévenir les abus, à corriger les erreurs et à améliorer les fonctionnalités d'IA (Art. 6 al. 1 lit. f RGPD). Les données sont conservées tant que votre compte existe et sont supprimées avec lui (voir section 7).",
          title: "Journalisation et mesures d'utilisation",
        },
        privacy_training: {
          content:
            "La protection de vos données est notre priorité absolue. Lors de l'utilisation de l'API Google Cloud (Vertex AI), les garanties de sécurité suivantes s'appliquent :\n\n**Aucun entraînement de modèle :** Google exclut explicitement l'utilisation de vos données saisies (prompts) pour entraîner ses modèles d'IA globaux. Vos données restent dans notre environnement Google Cloud isolé.\n\n**Emplacement des données :** Google traite vos requêtes sur des serveurs situés dans l'Union européenne (multi-région Google Cloud UE \"eu\", restreinte aux États membres de l'UE) afin de garantir un niveau de protection des données approprié conformément au RGPD. Avant d'atteindre Google, elles transitent par nos fonctions serveur aux USA (voir section 3).\n\n**Aucun stockage permanent chez le fournisseur :** Google traite les données pour répondre à la requête et ne les stocke pas de manière permanente. Google peut mettre en cache les entrées et les résultats pendant 24 heures au maximum. Si les systèmes de sécurité automatisés de Google signalent une requête, Google peut conserver le prompt jusqu'à 30 jours afin de vérifier l'absence d'abus ; il n'est pas utilisé pour entraîner des modèles.",
          title: "Protection des données et exclusion d'entraînement",
        },
        processing_scope: {
          content:
            "Pour vous fournir des fonctionnalités d'optimisation intelligente et de création de CV et de lettres de motivation, nous utilisons la plateforme Vertex AI de Google Cloud. Dans ce cadre, les textes que vous saisissez sont transmis et traités sur les serveurs de Google ; en chemin, ils transitent par nos fonctions serveur chez Netlify aux USA (voir section 3). Les fonctions d'IA ne s'exécutent que lorsque vous les déclenchez activement ; la base juridique de ce traitement est l'Art. 6, par. 1, let. b du RGPD (fourniture du service demandé).",
          title: 'Type et étendue du traitement',
        },
        temporary_storage: {
          content:
            "Pour garantir un traitement stable des requêtes d'IA, KiwiCV utilise des processus d'arrière-plan asynchrones. Les documents d'entrée téléchargés (tels que les fichiers de CV) ainsi que les résultats générés par l'IA sont temporairement stockés dans notre base de données exploitée par Supabase (voir section 5) pendant une courte période (généralement pas plus de quelques minutes, et jamais plus de 24 heures) jusqu'à ce que votre navigateur les récupère avec succès. Après cette période, ou une fois récupérés, ces résultats temporaires et données d'entrée téléchargées sont automatiquement et complètement supprimés. KiwiCV utilise ces entrées et résultats temporaires uniquement pour fournir le résultat que vous avez demandé, et jamais pour le profilage ou pour entraîner des modèles d'IA.",
          title: 'Stockage Temporaire',
        },
        title: "8. Utilisation des services d'IA (Google Cloud Vertex AI)",
      },
      '9': {
        posthog: {
          content:
            "Pour mieux comprendre comment les utilisateurs interagissent avec KiwiCV et pour améliorer nos services, nous utilisons l'outil d'analyse PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, USA). Pour protéger votre vie privée, nous avons configuré PostHog de manière strictement anonyme et sans cookies.\n\n**Suivi anonyme :** Nous n'utilisons aucun cookie de suivi et ne stockons aucune identification personnelle dans votre navigateur. PostHog est configuré pour utiliser une persistance uniquement en mémoire (memory-only), ce qui signifie que toutes les données de session sont perdues dès que vous fermez ou rechargez la page.\n\n**Résidence des données (UE) :** Toutes les données sont envoyées et stockées sur les serveurs européens de PostHog (Région : Francfort, Allemagne - https://eu.i.posthog.com) pour garantir le respect des normes européennes de protection des données.\n\n**Reconnaissance de session :** Pour une reconnaissance de session anonyme, une valeur de hachage à court terme est générée côté serveur, qui est automatiquement supprimée après 24 heures. Cela nous permet de voir les modèles d'interaction (par exemple, quels thèmes sont populaires ou combien de CV sont exportés) sans pouvoir vous identifier individuellement.\n\nL'utilisation de PostHog est basée sur notre intérêt légitime pour la conception orientée vers la demande et l'optimisation continue de notre site web (Art. 6 al. 1 lit. f RGPD).",
          title: 'Analyse Web anonyme (PostHog)',
        },
        title: '9. Analyse Web',
      },
      '10': {
        email: {
          content:
            "Si vous nous contactez par e-mail (par exemple à {{email}} ou à une autre adresse indiquée sur ce site), nous enregistrons vos informations, y compris vos coordonnées, afin de traiter votre demande et d'éventuelles questions complémentaires.\n\n**Transfert des e-mails (Cloudflare) :** Les e-mails envoyés aux adresses kiwicanopy.com sont reçus par **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** via son service Email Routing et transférés vers notre boîte de réception. Le contenu n'est pas stocké ; Cloudflare enregistre l'expéditeur, le destinataire, l'objet, l'heure et le statut de distribution. Un accord de traitement des données a été conclu avec Cloudflare (Cloudflare Customer DPA).\n\n**Boîte de réception (Google) :** La boîte de réception est hébergée par Google (Gmail) ; le fournisseur est Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Tout transfert vers les États-Unis (vers Cloudflare ou Google LLC) repose sur l'EU-US Data Privacy Framework et, à défaut, sur les clauses contractuelles types de la Commission européenne.\n\nLa base juridique est l'art. 6, par. 1, lit. b RGPD lorsque votre demande vise un contrat, sinon notre intérêt légitime à y répondre (art. 6, par. 1, lit. f RGPD). Les données sont supprimées dès qu'elles ne sont plus nécessaires à cette fin et qu'aucune obligation légale de conservation ne s'y oppose.",
          title: 'Transfert des e-mails et boîte de réception',
        },
        title: '10. Contact par e-mail',
      },
    },
    tabLabel: 'Confidentialité',
    title: 'Politique de Confidentialité',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            "Les demandes de traitement par l'IA sont effectuées de manière asynchrone. L'utilisateur est responsable de la récupération des résultats en temps voulu. Pour des raisons de sécurité et d'optimisation des ressources, les résultats temporairement mis en cache sont irrévocablement supprimés au plus tard après 24 heures. Il n'existe aucun droit à la conservation permanente de ces données temporaires.",
          title: 'Traitement Asynchrone et Fourniture de Données',
        },
        daily_limit: {
          content:
            'Afin d’éviter les abus et de garantir la disponibilité pour tous les utilisateurs, le nombre de demandes d’IA par compte Pro est limité à {{limit}} demandes par 24 heures. Ce quota est réinitialisé quotidiennement à minuit (heure allemande, CET/CEST).',
          title: 'Quota d’utilisation',
        },
        purpose: {
          content:
            "Les fonctionnalités d'IA de KiwiCV ne peuvent être utilisées que pour créer et améliorer des documents de candidature au sein de la plateforme. L'utilisation à des fins étrangères au système n'est pas autorisée.",
          title: 'Lien avec la finalité',
        },
        technical_limits: {
          content:
            "Nous nous réservons le droit de limiter le nombre maximum de jetons par demande à un niveau raisonnable pour l'optimisation du CV. L'utilisation automatisée ou l'extraction massive de réponses d'IA est interdite.",
          title: 'Restrictions techniques',
        },
        title: '1. Politique d’utilisation équitable',
      },
      '2': {
        ai_usage: {
          content:
            'Les titulaires d’un Pro Pass ont accès à des fonctionnalités d’optimisation pilotées par l’IA sans facturation individuelle par demande. Cet accès est destiné à un usage privé dans le cadre de la recherche d’emploi.',
          title: 'Accès IA (Détenteurs du Pro Pass)',
        },
        one_time_payment: {
          content:
            "L'achat d'un Pro Pass représente un paiement unique effectué pour un service spécifique. Il ne s'agit pas d'un abonnement ; il n'y a pas de renouvellement automatique.",
          title: 'Paiement unique',
        },
        refunds: {
          content:
            "En tant que consommateur, vous disposez d'un droit légal de rétractation de 14 jours à compter de la conclusion du contrat. Les conditions, le délai et la procédure sont définis dans notre Instruction de rétractation, qui contient également le modèle de formulaire de rétractation.\n\nSi vous vous rétractez pendant ce délai, nous vous remboursons l'intégralité du prix payé. En dehors du droit légal de rétractation, nous ne proposons aucun remboursement. Un Pro Pass n'est pas transférable entre comptes d'utilisateurs.",
          title: 'Droit de rétractation, remboursements et transférabilité',
        },
        stacking: {
          content:
            "Lors de l'achat de plusieurs Pro Pass à durée limitée, les périodes de validité sont cumulées (« stacking »). La durée du nouveau pass ne commence qu'après l'expiration de la période actuellement active.",
          title: 'Cumul de Pro Pass (Stacking)',
        },
        title: '2. Utilisation Premium (Pass)',
        validity_timezone: {
          content:
            "Les périodes d'accès et les limites d'utilisation quotidienne sont calculées selon l'heure d'Europe centrale (CET/CEST). Les pass à durée limitée expirent à 23:59:59 le dernier jour de la période d'accès totale accumulée.",
          title: 'Politique de fuseau horaire',
        },
      },
      '3': {
        termination: {
          content:
            'Vous pouvez supprimer votre compte utilisateur à tout moment sans avoir à fournir de motif. En cas de suppression du compte, la relation contractuelle prend fin avec effet immédiat.',
          title: 'Suppression de compte',
        },
        title: '3. Résiliation et suppression de compte',
      },
    },
    tabLabel: 'CGU',
    title: "Conditions Générales d'Utilisation",
  },
  translation_note:
    'Ceci est une traduction automatique de la version originale allemande pour votre commodité. En cas de divergence, la version allemande prévaut.',
  update: {
    button: 'Accepter & Continuer',
    changes_desc:
      "La section 2 mentionne désormais aussi vos droits à la limitation du traitement et à la portabilité des données, présente séparément votre droit de vous opposer à un traitement fondé sur des intérêts légitimes et précise que vous pouvez retirer un consentement à tout moment. La section 3 explique désormais que les fonctions serveur de KiwiCV sont exploitées par Netlify aux USA et que les requêtes d'IA, y compris leur contenu, y transitent en chemin vers les serveurs de Google dans l'UE ; elle nomme aussi Sanity, depuis lequel votre navigateur charge le blog et les témoignages de la page d'accueil. La section 4 explique désormais comment retirer votre consentement à Google Drive et à la synchronisation GitHub avec les boutons de déconnexion, que le jeton GitHub reste sur l'appareil et quand il est retiré, nomme les données de connexion que votre navigateur enregistre et indique que l'échantillon d'écriture pour les lettres de motivation est également supprimé lorsque vous vous déconnectez ou qu'un autre compte se connecte, ainsi que sur l'appareil sur lequel vous supprimez votre compte. La section 5 ne mentionne plus la période d'essai gratuite, qui a pris fin ; la section 8 ne la mentionne plus que pour les requêtes effectuées pendant qu'elle était proposée. La section 6 nomme désormais Stripe Payments Europe comme prestataire de paiement, la base juridique des paiements et les garanties applicables au traitement par Stripe aux USA. La section 7 cite désormais vos données de paiement parmi les données supprimées avec votre compte. La section 8 indique désormais tout ce que le journal d'utilisation de l'IA enregistre, dans quel but, sur quelle base juridique et pour combien de temps, et précise que les documents téléversés et les résultats de l'IA ne sont en général conservés temporairement que quelques minutes au plus.",
    changes_title: "Qu'est-ce qui a changé ?",
    checkbox:
      "J'accepte les Conditions d'utilisation et la Politique de confidentialité mises à jour.",
    intro:
      "La politique de confidentialité de KiwiCV a été mise à jour : elle mentionne désormais aussi votre droit d'opposition et la manière de retirer un consentement, explique que les requêtes transitent par des fonctions serveur aux USA, nomme Sanity pour le blog et les témoignages de la page d'accueil et indique en détail ce que le journal d'utilisation de l'IA enregistre.",
    link_privacy: 'Politique de confidentialité',
    link_terms: "Conditions d'utilisation",
    links_desc: 'Vous pouvez lire les documents complets ici :',
    success: "Merci d'avoir accepté les conditions mises à jour !",
    title: 'Mise à jour des Conditions & de la Confidentialité',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            'Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours. Le délai de rétractation expire quatorze jours après le jour de la conclusion du contrat.\n\nPour exercer le droit de rétractation, vous devez nous notifier :\n\n{{name}}\n{{address}}\n{{email}}\n\nvotre décision de rétractation du présent contrat au moyen d’une déclaration dénuée d’ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce n’est pas obligatoire.\n\nPour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l’exercice du droit de rétractation avant l’expiration du délai de rétractation.',
          title: 'Votre droit de rétractation',
        },
        title: '1. Droit de rétractation',
      },
      '2': {
        email_note: {
          content:
            'Afin de nous aider à retrouver votre commande, veuillez indiquer également l’adresse e-mail utilisée lors de l’achat. Cela n’est pas nécessaire pour que votre rétractation prenne effet.',
          title: 'Identification de votre commande',
        },
        form: {
          content:
            '_À l’attention de {{name}}, {{address}}, {{email}} :_\n\nJe/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la prestation de service ci-dessous :\n\n— Commandé le (*) / reçu le (*) :\n\n— Nom du (des) consommateur(s) :\n\n— Adresse du (des) consommateur(s) :\n\n— Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :\n\n— Date :\n\n_(*) Biffez la mention inutile._',
          title:
            'Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat',
        },
        title: '2. Modèle de formulaire de rétractation',
      },
      '3': {
        refund: {
          content:
            'En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat.\n\nNous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d’un moyen différent ; en tout état de cause, ce remboursement n’occasionnera pas de frais pour vous.',
          title: 'Remboursement',
        },
        title: '3. Effets de la rétractation',
      },
    },
    tabLabel: 'Rétractation',
    title: 'Droit de rétractation',
  },
};
