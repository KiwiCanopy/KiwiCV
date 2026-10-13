import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Rubriques personnalisées',
      content:
        "Ton CV n'est plus limité aux rubriques standard. Ajoutes-en d'autres — Conférences, Réalisations clés, tout ce qui raconte ton parcours —, remplis-les comme n'importe quelle autre rubrique, et elles s'adaptent à chaque design, dans l'aperçu comme dans le PDF. « Améliorer avec l'IA » et la traduction fonctionnent aussi dessus.",
      title: 'Tes propres rubriques',
    },
  },
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  feat_custom_sections:
    "Ajoute tes propres rubriques à ton CV — Conférences, Réalisations clés ou tout ce que les rubriques standard ne couvrent pas. Tu trouveras « Ajouter une rubrique » à la fin de la liste des rubriques : donne un titre à ta rubrique et remplis-la d'entrées comme n'importe quelle autre — nom, dates, lien, résumé et points forts. Les rubriques personnalisées s'intègrent à chaque design, dans l'aperçu comme dans le PDF, et se déplacent d'une colonne à l'autre dans l'éditeur de mise en page comme les autres. « Améliorer avec l'IA » fonctionne sur elles et sur chacune de leurs entrées, et traduire ton CV traduit aussi leurs titres et leurs entrées.",
  feat_json_round_trip:
    "Importer un fichier de CV issu d'un autre outil ne fait plus disparaître ce que KiwiCV ne peut pas afficher. Les blocs supplémentaires du fichier, ainsi que les rôles et les mots-clés de tes projets, sont conservés avec ton CV et reviennent à l'identique quand tu l'exportes ou le sauvegardes sur Google Drive ou dans un dépôt GitHub privé. Ils n'apparaissent jamais sur ton CV et n'atteignent jamais l'IA, et l'import t'indique quels blocs il a conservés.",
  feat_privacy_by_design:
    "KiwiCV continue de construire ses flux de travail autour de ta vie privée. Un dépôt GitHub que tout le monde peut lire — public, ou publié avec GitHub Pages — ne reçoit désormais que ce que ton CV affiche : les entrées masquées, les éléments d'adresse que tu as omis et ta lettre de motivation restent à l'écart. Un dépôt privé conserve la sauvegarde complète, et la boîte de dialogue de connexion t'indique de quel cas il s'agit. Les photos d'un fichier de CV importé perdent leurs métadonnées d'appareil photo, localisation GPS comprise, avant d'être enregistrées.",
  fix_hidden_entries_stay_hidden:
    "Ce que tu masques reste masqué. Modifier, déplacer, trier ou supprimer une autre entrée pouvait en faire réapparaître une masquée, tout comme une réorganisation de tes compétences par l'IA ou l'aperçu d'exemple d'un CV vide. Ces mêmes actions n'acceptent en outre plus discrètement une suggestion de l'IA à laquelle tu n'as pas encore répondu.",
  fix_keyboard_screen_reader:
    "Plus fluide au clavier et avec un lecteur d'écran : une nouvelle première entrée s'ouvre aussitôt, le champ réseau fonctionne comme une vraie liste et les boutons sont annoncés par leur nom.",
  fix_language_polish:
    "Finitions linguistiques dans toute l'application : intitulés de rubriques corrigés en italien, bulgare, turc et portugais, un İ majuscule avec point dans les CV turcs, les derniers écrans anglais traduits et un vrai contenu d'exemple dans un CV vide en douze langues.",
  fix_reduced_json_hides_sections:
    "Le JSON « Réduit » de la page JSON brut laisse désormais de côté tout ce que ton CV masque — une rubrique entière que tu as masquée et une photo de profil masquée —, ainsi que les éléments d'adresse que ton CV omet et les champs de projet conservés uniquement depuis un fichier importé.",
};
