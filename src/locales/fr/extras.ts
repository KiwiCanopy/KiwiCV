import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      "KiwiCV est l'un des plus outils conçus sous l'égide de KiwiCanopy. Découvre le reste de la famille.",
    family_title: 'Fait partie de la famille KiwiCanopy',
    kiwicanopy_desc: 'Le foyer de la famille KiwiCanopy, où tous les outils vivent ensemble.',
    kiwidesk_desc: 'Une application sœur de la famille KiwiCanopy.',
    story_p1:
      "Que ce soit pour moi-même ou en discutant avec des amis et des connaissances, j'ai vécu à maintes reprises la même frustration : la tâche fastidieuse de réécrire mon CV pour chaque nouvelle candidature. Tout le monde souhaite adapter ses expériences de manière ciblée au poste en question, sans que le CV ne paraisse immédiatement surchargé. Mais les outils conventionnels font de cela un véritable calvaire : pour chaque petite modification, il faut souvent créer un document entièrement nouveau, ce qui tourne rapidement au chaos infini des versions.",
    story_p2:
      "C'est précisément pour cette raison que j'ai créé KiwiCV : un outil de création de CV modulaire où tu peux facilement activer ou désactiver des sections individuelles, déplacer des segments librement et exporter de manière flexible – le tout à partir d'une vue d'ensemble unique et centrale. Plus de copier-coller fastidieux entre d'innombrables documents Word. Toute ta carrière trouve un foyer permanent, et tu choisis sereinement ce que tu veux montrer pour chaque candidature.",
    story_title: "L'histoire derrière KiwiCV",
    title: 'À propos de KiwiCV',
    visit_site: 'Visiter le site',
  },
  howto: {
    core: {
      ai_assistant: 'Assistant IA',
      ai_assistant_desc:
        "Utilise l'assistant IA pour optimiser des éléments, des sections ou tout ton CV. Cherche l'icône {wardsymbol} !",
      hide_show: 'Masquer/Afficher',
      hide_show_desc:
        "Pour éviter d'avoir à supprimer et réinsérer sans cesse des entrées, tu peux masquer des éléments individuels ou des sections entières d'un clic.",
      move_items_desc:
        'Glisse-dépose des sections ou des éléments individuels entre la barre latérale et la colonne principale.',
      page_breaks: 'Sauts de page',
      page_breaks_desc:
        'Insère des sauts de page manuels pour que ton export PDF soit parfait. Cela n’affecte que le PDF, pas la version web.',
      rearrange: 'Réorganiser',
      rearrange_desc:
        "Réorganise les éléments d'une section pour mettre l'accent sur ce que tu souhaites souligner.",
      switch_sides: 'Changer de côté',
      switch_sides_desc:
        'Échange facilement la colonne principale et la barre latérale pour trouver la meilleure mise en page.',
      title: 'Fonctions de base',
    },
    footer: {
      message: 'Nous espérons que rédiger ton CV sera plus amusant avec KiwiCV ! Bonne chance !',
    },
    github: {
      create_pat_link: 'Créer un token sur GitHub',
      create_repo_link: 'Créer un dépôt sur GitHub',
      go_to_settings: 'Aller aux paramètres',
      intro:
        'Connecte ton CV avec un dépôt GitHub pour une gestion multi-langues automatique, le contrôle de version et un hébergement simple. Suis ces trois étapes:',
      pat_security_tip:
        "Conseil de sécurité : Utilise un Personal Access Token 'Fine-grained' avec uniquement un accès 'Contents' en lecture/écriture à ton dépôt spécifique. N'oublie pas de sélectionner 'Only select repositories' et de définir ta date d'expiration préférée.",
      step1_desc:
        "Crée un nouveau dépôt privé sur GitHub. Tu peux le laisser complètement vide pour l'instant (aucun README et aucun .gitignore ne sont nécessaires).",
      step1_title: 'Créer un dépôt',
      step2_desc:
        "Tu as besoin d'un Personal Access Token (PAT) pour permettre à KiwiCV de pousser vers ton dépôt. Je recommande un token fine-grained pour une sécurité maximale.",
      step2_title: 'Créer un Personal Access Token',
      step3_desc:
        'Va sur la page Paramètres et entre les détails de ton dépôt et ton token dans la section GitHub. Alternativement, clique sur le bouton GitHub en haut à droite pour ouvrir un formulaire où tu peux également saisir ton PAT.',
      step3_title: 'Connecter dans KiwiCV',
      title: 'Guide de connexion GitHub',
    },
    hosting: {
      automated_title: 'Option B : Hébergement automatisé (via GitHub)',
      github_pages_desc:
        'Utilise le fichier HTML généré par KiwiCV et télécharge-le sur un dépôt GitHub. Active GitHub Pages dans les paramètres du dépôt pour obtenir une URL publique gratuite pour ton CV.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Tu peux héberger gratuitement la version HTML générée de ton CV. Voici les options les plus courantes :',
      manual_title: 'Option A : Téléchargement manuel (aucun GitHub requis)',
      netlify_desc:
        "Des services comme Netlify ou Vercel proposent un hébergement statique gratuit avec un déploiement par glisser-déposer ou une synchronisation automatique avec ton dépôt GitHub. Tu peux y télécharger ton CV HTML sans exposer ton historique d'édition.",
      netlify_drop_desc:
        "Assure ton avantage concurrentiel avec une URL personnelle. Il existe de nombreux **fournisseurs gratuits** où tu peux mettre ton CV en ligne **en quelques secondes**. Que ce soit via l'outil lié ci-dessus ou des alternatives comme [Tiiny.host](https://tiiny.host) : un simple **glisser-déposer** de ton site web suffit pour avoir une présence professionnelle sur le web.",
      netlify_drop_title: 'Rapide et facile : Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        "Attention : À moins d'avoir un forfait GitHub payant, tu dois rendre ton dépôt public pour utiliser GitHub Pages. L'intégralité de l'historique de ton CV (tous les commits) sera visible par tous ! Si la confidentialité est importante pour toi, utilise plutôt la première option.",
      push_folder_hint:
        "KiwiCV prend en charge exclusivement le push du fichier HTML dans un dossier spécifique de ton dépôt. Consulte les paramètres avancés sur la page d'aperçu.",
      sensitive_data_warning:
        "Avertissement de confidentialité : Si tu héberges ton CV sur une URL publique, n'importe qui peut accéder à tes données. Envisage de supprimer les informations personnelles très sensibles telles que ton adresse exacte, ton numéro de téléphone et ton e-mail.",
      title: 'Héberger ton CV',
    },
    pdf_guide: {
      font_size: 'Taille de police',
      font_size_desc: 'Ajuste la taille de la police dans l’onglet Design pour optimiser l’espace.',
      intro:
        'Le rendu PDF est complexe. Expérimente avec les fonctionnalités suivantes pour obtenir le résultat souhaité :',
      rearrange_sections: 'Réorganiser',
      rearrange_sections_desc:
        'Réorganiser les sections peut corriger des sauts de page maladroits.',
      space_opt: "Optimisation de l'espace",
      space_opt_desc:
        'Déplacer une section courte vers la barre latérale peut libérer de l’espace.',
      title: 'Conseils mise en page PDF',
      use_pagebreaks: 'Utiliser les sauts de page',
      use_pagebreaks_desc:
        'Les éléments proches de la bordure peuvent parfois mal s’afficher. Utilise les sauts de page pour les déplacer proprement.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Le changement de langue déclenche une vérification pour voir si une version existe déjà dans le cloud.',
      auto_recognition_title: 'Reconnaissance automatique',
      desc: 'KiwiCV gère plusieurs langues. Lorsque tu sauvegardes ou crées une sauvegarde, l’application crée une version spécifique pour la langue actuellement active. Plus tard, elle reconnaîtra les sauvegardes existantes pour les restaurer.',
      language_specific_desc:
        'Chaque version linguistique est stockée comme une entrée séparée dans ton dépôt cloud.',
      language_specific_title: 'Spécifique à la langue',
      title: 'Sauvegardes linguistiques intelligentes',
    },
    toc_title: 'TABLE DES MATIÈRES',
  },
  page_description:
    "Contexte, support et vision : découvre comment tirer le meilleur parti de KiwiCV, où nous allons et l'histoire derrière ton créateur de CV.",
  page_title: 'Extras',
  tabs: {
    about: 'À propos de KiwiCV',
    changelog: 'Journal des modifications',
    howto: 'Guides',
    roadmap: 'Feuille de route',
  },
};
