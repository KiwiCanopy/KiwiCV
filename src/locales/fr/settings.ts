import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Échelle de taille de police',
    },
  },
  cv_defaults: {
    title: 'Paramètres CV',
  },
  danger: {
    delete_btn: 'Supprimer Toutes les Données',
    delete_data: 'Supprimer Toutes les Données Locales',
    delete_data_desc:
      "Une fois que tu supprimeras tes données locales, il n'y a pas de retour en arrière. Cette action supprimera tous les CV stockés dans le LocalStorage de ton navigateur.",
    title: 'Zone de Danger',
  },
  export: {
    available_variables: 'Variables Disponibles',
    format_tokens: 'Jetons FORMAT :',
    pattern_error_brackets: 'Motif non valide : crochets non équilibrés.',
    pattern_tip:
      "Remplace FORMAT par une combinaison, par ex. {date-YYYYMMDD} ou {date-YYYY-MM-DD_HHmm}. Les modifications s'appliquent aux nouvelles exportations.",
    project_name: 'Nom du Projet par Défaut',
    project_name_desc: 'Définis la base du nom du projet pour tes exportations.',
  },
  github: {
    disconnect_success: 'GitHub a été déconnecté avec succès.',
    error_forbidden: 'Accès interdit ou limite de débit atteinte',
    error_invalid_token: 'Jeton GitHub invalide. Vérifie ton PAT.',
    error_repo_not_found: 'Dépôt non trouvé',
    hide_token: 'Masquer le jeton',
    modal_connect_btn: 'Connecter et synchroniser',
    modal_description:
      'Connecte ton référentiel GitHub pour garder ton CV synchronisé sur tous les appareils et le déployer sur GitHub Pages.',
    modal_pat_placeholder: "ghp_ton_jeton_d'accès_personnel",
    modal_repo_placeholder: "nom d'utilisateur/référentiel",
    modal_title: 'Synchroniser avec GitHub',
    pat_creation_tip:
      "N'oublie pas de sélectionner 'Only select repositories' et de spécifier la date d'expiration souhaitée.",
    pat_security_note:
      "Conseil de sécurité : Utilise un Personal Access Token 'Fine-grained' avec uniquement un accès 'Contents' en lecture/écriture à ton dépôt spécifique pour une sécurité maximale. Tu peux en créer un via le lien suivant : {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      "Dans un dépôt public, ou publié avec GitHub Pages, les sauvegardes ne contiennent ni ce que tu as masqué, ni ta lettre de motivation, ni les données issues de fichiers importés. Elles incluent toujours les noms et coordonnées de tes références ainsi que les noms de fichier et de dossier que tu choisis lors de l'exportation, qui peuvent nommer l'entreprise à laquelle tu postules. Si tu rends un dépôt privé public ou le publies avec GitHub Pages plus tard, ce qu'il contient déjà peut devenir public lui aussi.",
    remember_pat: 'Stocker le jeton dans ce navigateur',
    remember_pat_tip:
      "Si désactivé, le jeton est stocké uniquement pour la session en cours et sera effacé à la fermeture de l'onglet.",
    repo_name: 'Nom du Dépôt',
    show_token: 'Afficher le jeton',
  },
  interface: {
    appearance: 'Apparence',
    install: {
      action: 'Installer KiwiCV',
      description: "Ouvre KiwiCV comme n'importe quelle autre application, dans sa propre fenêtre.",
      installed: 'Installé sur cet appareil',
      ios_hint: "Appuie sur « Partager », puis sur « Sur l'écran d'accueil ».",
      label: 'Application',
      unsupported:
        "Si ton navigateur peut installer des applications, cherche « Installer » dans sa barre d'adresse ou son menu.",
    },
    language: 'UI-Langue',
    language_description: "Sélectionne ta langue préférée pour l'interface de l'application.",
    theme_description: 'Choisis ton mode de thème préféré.',
    theme_options: {
      dark: 'Sombre',
      light: 'Clair',
      system: 'Système',
    },
    title: "Interface de l'App",
  },
  title: 'Paramètres',
};
