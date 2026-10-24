import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  fix_composer_translate_tick:
    "Après qu'Améliorer avec l'IA a traduit ton CV, l'exécution suivante ne le traduit plus une seconde fois : « Traduire aussi mon CV » se désactive désormais tout seul une fois la traduction terminée.",
  fix_pending_bar_wraps:
    "Dans un éditeur étroit, la barre des propositions de l'IA à examiner replie maintenant ses boutons sur plusieurs lignes, et Tout ignorer n'est plus coupé.",
  fix_skills_false_change:
    "Les compétences que tu n'as pas touchées n'apparaissent plus comme modifiées après Améliorer avec l'IA ou une traduction, et annuler les modifications d'une traduction ne remet plus tes compétences dans l'ancienne langue.",
  fix_skills_reorder_is_change:
    "Quand Améliorer avec l'IA ne fait que réordonner tes compétences, tu reçois désormais une modification à examiner, avec les compétences déplacées signalées, au lieu d'un message « Inchangé ».",
  ui_composer_addon_summary:
    "Quand la barre IA est fermée en mode Professionnel, les options qui s'exécutent avec — comme une traduction ou une restructuration des compétences — sont maintenant nommées à côté d'Améliorer mon CV, et un clic dessus ouvre la barre.",
  ui_export_closes_on_success:
    "Après un export entièrement réussi, la fenêtre d'export se ferme désormais toute seule et une notification le confirme pendant dix secondes. Si une destination échoue, la fenêtre reste ouverte pour que tu puisses réessayer.",
  ui_export_improve_apart:
    "Exporter et Améliorer mon CV se distinguent mieux : Améliorer se place maintenant au début de la barre IA, et le bouton Exporter de l'en-tête n'est plus vert. Quand tu pars d'une offre d'emploi ou de tes propres instructions, Améliorer attend que la barre soit ouverte, pour ne jamais s'exécuter sur un texte que tu ne vois pas.",
  ui_page_break_toggle_on_row:
    "Le bouton de saut de page est de retour sur chaque ligne de section de l'onglet Design : tu vois d'un coup d'œil où commence une nouvelle page PDF.",
};
