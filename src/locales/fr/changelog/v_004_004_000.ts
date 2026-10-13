import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'IA',
      content:
        "KiwiCV rédige désormais ta lettre de motivation. Colle l'offre d'emploi et obtiens une lettre conçue à partir de ton CV actuel : choisis sa longueur et son ton, ou fournis un échantillon de tes écrits pour qu'elle adopte ton propre style. Elle s'affiche sous forme de proposition que tu peux lire à côté de ton brouillon et valider paragraphe par paragraphe.",
      title: 'Des lettres de motivation rédigées pour toi',
    },
  },
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  feat_ai_cover_letters:
    "Ta lettre de motivation peut désormais être rédigée pour toi, à partir d'une offre d'emploi et de ton CV actuel. Choisis une longueur et un ton, ou fournis un extrait de tes propres écrits pour que KiwiCV reproduise ton style. La lettre t'est proposée sous la forme d'une suggestion que tu peux comparer à ton brouillon et accepter paragraphe par paragraphe, que ta lettre soit vide ou déjà commencée. La section s'ouvre désormais directement sur le texte de la lettre, plutôt que sur cinq champs d'adresse pour un contenu que tu n'avais pas encore rédigé.",
  fix_ai_large_cv_wait:
    "Améliorer ou traduire un grand CV ne s'arrête plus sur une erreur au bout d'une minute — le délai d'attente augmente désormais avec la taille du CV.",
  fix_dates:
    "Les dates fonctionnent à nouveau correctement. Une date saisie pouvait reculer d'un jour hors d'Europe, et une année seule pouvait disparaître entièrement ; dans le sélecteur, un clic involontaire près du bord de la grille basculait discrètement vers le mois et l'année voisins ; et « Trier les entrées par ordre chronologique » ne savait pas lire les dates commençant par le jour comme 15.03.2019, reléguant ces entrées tout en bas comme si elles n'avaient pas de date.",
  fix_keyboard_navigation:
    "L'utilisation du clavier ne te renvoie plus tout en haut de la page. Fermer une boîte de dialogue te replace sur le bouton qui l'a ouverte, supprimer une entrée ou un CV enregistré te positionne sur l'élément suivant, et répondre à une suggestion d'IA te maintient là où tu travaillais. Ta photo de profil est désormais entièrement accessible au clavier : la vignette ne répondait qu'au clic de souris, rendant « Modifier », « Remplacer » et « Supprimer » inaccessibles.",
  fix_main_badge_overlaps_label:
    "Le badge « main » à côté de l'intitulé d'un champ ne chevauche plus le texte du libellé. Il était affiché dans un conteneur dimensionné pour une icône, de sorte qu'un badge plus large débordait et masquait les mots situés à côté.",
};
