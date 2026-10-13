import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  fix_ai_proposal_diff:
    'Les propositions de l’IA sont plus faciles à lire et à traiter. Les lignes ajoutées et supprimées disposent désormais de leur propre nuance d’arrière-plan en plus de la couleur du texte, les deux choix restent parfaitement lisibles en mode sombre et s’affichent sous le texte concerné : conserve ta version à gauche, adopte la proposition à droite.',
  fix_ai_stuck_dialog:
    'Un traitement d’IA bloqué ne laisse plus sa fenêtre de progression ouverte indéfiniment. La fenêtre refusait de se fermer lorsqu’une tâche était figée, et recharger la page la rouvrait aussitôt en relançant le même traitement — la seule issue ne faisait qu’empirer les choses. Elle reste désormais toujours fermable, et recharger la page la laisse fermée.',
  fix_ai_translate_addon:
    'Cocher « Traduire aussi mon CV » traduit désormais réellement le document. Le sélecteur de langue adjacent s’ouvrait sur la langue actuelle du CV, ce que le traitement interprétait comme « rien à traduire » : le CV revenait bien adapté à l’offre d’emploi mais toujours dans sa langue d’origine, sans indiquer que la demande avait été ignorée.',
  fix_cover_letter_footer:
    'La ligne de signature de ta lettre de motivation suit désormais tes réglages de « Pied de page PDF », tout comme celle de ton CV. Elle reprenait auparavant le champ de date situé en haut de la lettre : effacer ce champ vidait donc aussi la signature, rendant impossible d’avoir deux valeurs distinctes.',
  fix_cvs_connect_button:
    'Connecter le stockage cloud depuis « Mes CV » fonctionne de nouveau de bout en bout. Le bouton « Connecter le stockage cloud » ne réagissait pas si tu étais connecté sans fournisseur associé, et la boîte de dialogue ouverte affichait un bouton qui te ramenait simplement sur la page où tu te trouvais déjà.',
};
