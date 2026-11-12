import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Champs actifs (Glisser pour réorganiser)',
  address_schema_apply_template: 'Appliquer le modèle',
  address_schema_available_fields: 'Champs disponibles (Cliquer pour inclure)',
  address_schema_desc:
    "Formate la mise en page de ton bloc d'adresse et ses séparateurs indépendamment de la langue du CV.",
  address_schema_mode_custom: 'Personnalisé',
  address_schema_mode_default: 'Selon la langue',
  address_schema_mode_default_desc:
    "Le schéma s'adapte automatiquement à la langue de ton CV. Si celle-ci diffère de la langue d'affichage définie, le code pays est également ajouté. Pour plus d'options de personnalisation, choisis « {customLayout} ».",
  address_schema_mode_label: 'Mode de mise en page',
  address_schema_no_active_fields:
    'Aucun champ actif. Clique sur les champs ci-dessous pour les ajouter.',
  address_schema_preset_european: 'Style européen',
  address_schema_preset_us_ca: 'Style US/CA',
  address_schema_restore: 'Restaurer les valeurs par défaut',
  address_schema_separator_comma: 'Virgule',
  address_schema_separator_dash: 'Tiret',
  address_schema_separator_space: 'Espace',
  address_schema_title: "Gestion du schéma d'adresse",
  address_schema_toggle_separator: 'Basculer le séparateur entre virgule et espace',
  bold_header: {
    desc: 'Choisis les détails qui doivent être affichés en gras (ligne principale)',
    title: "Mode d'en-tête en gras",
  },
  color_chooser: 'Palette de couleurs',
  column_empty: 'Aucune section',
  design_filter: {
    one_column: 'Une colonne',
    two_column: 'Deux colonnes',
  },
  empty_sections_subtitle:
    "Ces sections sont encore vides. Es-tu sûr de n'avoir rien à ajouter ? Chaque détail compte.",
  empty_sections_title: 'Sections supplémentaires disponibles',
  example_section: "Section d'exemple",
  formatting: 'formatage',
  groups: {
    details: 'Détails',
    layout: 'Mise en page',
    typography: 'Typographie',
  },
  layout_flip: 'Miroir de la mise en page',
  layout_main_column: 'Colonne principale',
  layout_side_column: 'Colonne latérale',
  layout_swap_tooltip: "Déplacer vers l'autre colonne",
  more_actions_named: "Plus d'actions pour « {{name}} »",
  page_break_disabled_first: 'Saut de page non disponible pour le premier élément',
  page_break_disabled_hidden: 'Saut de page non disponible pour les sections masquées',
  page_break_named: 'Saut de page avant « {{name}} »',
  page_break_removal_tooltip:
    'Supprimer le saut de page avant cette section (concerne uniquement la version PDF)',
  page_break_tooltip:
    'Ajouter un saut de page avant cette section (concerne uniquement la version PDF)',
  pdf_footer: {
    date: 'Inclure la date',
    desc: 'Inserer la ligne de signature, le lieu et la date en bas de page',
    location: 'Inclure le lieu',
    show: 'Afficher le pied de page',
    title: 'Pied de page PDF',
  },
  section_reordering: {
    hint: 'Les sections apparaissent dans ton CV dans cet ordre. Fais glisser une ligne par sa poignée pour la déplacer.',
    hint_touch:
      'Les sections apparaissent dans ton CV dans cet ordre. Utilise les flèches pour déplacer une ligne, ou maintiens sa poignée enfoncée et fais glisser.',
    title: 'Ordre des sections',
  },
  signature: {
    add: 'Ajouter une signature',
    change: 'Changer',
    crop_description:
      "Recadre, fais pivoter ou retourne l'image. Le fond du papier est retiré ensuite.",
    crop_title: 'Recadrer ta signature',
    device_note: 'Enregistrée uniquement sur cet appareil. Ni sauvegardée ni synchronisée.',
    dialog_title: 'Ta signature',
    draw_hint: 'Dessine avec ta souris, ton doigt ou un stylet.',
    draw_label: 'Zone de dessin pour ta signature',
    face_unavailable: 'Ce style ne peut pas afficher toutes les lettres de ce nom.',
    footer_off: 'Apparaît dans le pied de page PDF, qui est désactivé.',
    preview_alt: 'Ta signature',
    row_empty: 'Aucune signature sur cet appareil',
    row_label: 'Signature',
    tab_draw: 'Dessiner',
    tab_type: 'Saisir',
    tab_upload: 'Importer',
    type_name: 'Nom',
    type_style: 'Style',
    type_unavailable:
      'Les styles manuscrits ne peuvent pas afficher toutes les lettres de ce nom. Dessine-le ou importe-le plutôt.',
    upload_another: 'Choisir une autre',
    upload_choose: 'Choisir une image',
    upload_empty:
      'Aucune signature trouvée dans cette image. Un stylo foncé sur papier blanc donne le meilleur résultat.',
    upload_hint:
      "Une photo ou un scan sur papier blanc. Le fond est retiré sur cet appareil. Tu peux aussi coller une image. Depuis Aperçu sur macOS, exporte d'abord la signature en PNG.",
    upload_too_large: "L'image est trop volumineuse (max. {{size}} Mo).",
    upload_unreadable: 'Ce fichier ne peut pas être lu comme une image. Essaie un PNG ou un JPG.',
  },
  swap_column_named: "Déplacer « {{name}} » vers l'autre colonne",
  template: 'Modèle',
};
