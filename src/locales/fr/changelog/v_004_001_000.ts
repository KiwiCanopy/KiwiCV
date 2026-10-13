import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Lettre de motivation',
      content:
        'Les lettres de motivation arrivent dans KiwiCV. Rédige une lettre qui reprend le design exact de ton CV et exporte les deux ensemble sous la forme d’un dossier de candidature élégant — fini les documents dépareillés.',
      title: 'Lettres de motivation, parfaitement assorties',
    },
  },
  chore_ai_model_upgrade:
    "L'IA de KiwiCV fonctionne désormais sur la toute dernière génération Gemini de Google (Gemini 3.1) pour des suggestions nettement meilleures. La confidentialité reste inchangée : le traitement reste exclusivement dans l'UE, conforme au RGPD, et tes données ne sont jamais utilisées pour entraîner des modèles d'IA.",
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  feat_matching_cover_letters:
    'Rédige une lettre de motivation assortie au design de ton CV et exporte l’ensemble en un seul dossier de candidature. Met en forme le texte avec du gras, de l’italique et des liens, choisis un style classique DIN 5008 ou assorti au thème, et affiche ou masque les blocs expéditeur, destinataire et signature selon chaque offre.',
  fix_design_settings_reset:
    "Tes paramètres de Design restent désormais intacts pendant que tu rédiges. Le choix d'en-tête en gras pour Expérience Professionnelle et Éducation, la disposition d'adresse personnalisée et le chemin de destination pour l'hébergement GitHub se réinitialisaient à leurs valeurs par défaut dès que tu ajoutais, réorganisais ou modifiais un élément dans une section de liste, sans avertissement ni possibilité d'annuler. Les en-têtes de section personnalisés d'un CV importé conservent aussi leurs modifications.",
  fix_elegant_page_breaks:
    "Les sauts de page manuels fonctionnent désormais sur le thème Elegant. Cocher cette option n'avait aucun effet sur le PDF exporté ; une nouvelle page commence maintenant exactement là où tu l'as demandé, comme sur tous les autres thèmes.",
  fix_empty_custom_address_layout:
    "Une disposition d'adresse personnalisée ne contenant plus aucun champ utilisable ne supprime plus ton adresse. Retirer tous les champs de la disposition personnalisée dans Design effaçait complètement l'adresse de ton CV et de ton PDF sans explication à l'écran. KiwiCV réutilise désormais la disposition standard de ton pays.",
  fix_footer_date_round_trip:
    "Désactiver la date dans le pied de page du CV reste désormais effectif après un export et un réimport, et une date saisie manuellement est conservée exactement telle quelle au lieu d'être effacée.",
  fix_import_list_warnings:
    "Les avertissements d'importation prennent désormais en compte les listes. Lorsque KiwiCV doit ignorer un élément illisible parmi les points forts d'un emploi, les cours d'un diplôme ou les mots-clés d'une compétence, l'élément et le champ sont précisés dans le résumé d'importation au lieu de raccourcir la liste silencieusement.",
  fix_import_warning_headings:
    "Les avertissements d'importation indiquent désormais la section exacte de ton CV dont ils proviennent, y compris tes coordonnées personnelles, au lieu d'afficher un identifiant interne.",
  fix_imported_list_fields:
    "Un fichier de CV dont les listes à puces comportent des erreurs n'interrompt plus ton aperçu. Si un fichier JSON importé enregistrait les points forts d'un emploi, les cours d'un diplôme ou les mots-clés d'une compétence sous forme de ligne de texte unique au lieu d'une liste, l'aperçu et le PDF ne s'affichaient plus. KiwiCV lit désormais ce qu'il peut et ignore le reste sans erreur.",
  fix_imported_text_fields:
    "Des coordonnées reçues dans un format incorrect n'endommagent plus ton CV. Si un fichier importé enregistrait ton nom, site web, téléphone ou ville autrement qu'en texte brut, l'aperçu ou le PDF pouvait s'arrêter complètement. KiwiCV lit désormais ce qu'il peut et nettoie les espaces superflus autour de ton nom et de ton adresse afin que les thèmes séparant le nom sur deux lignes n'affichent plus de première ligne vide.",
  fix_imported_theme_name:
    "Un CV importé avec un nom de thème non reconnu affiche désormais l'intégralité de ses sections au lieu de revenir presque vide.",
  fix_missing_sections_single_column:
    "Les sections que tu complètes après avoir réorganisé ta mise en page ne disparaissent plus sur les thèmes à colonne unique : chaque section contenant du texte apparaît dans l'aperçu et le PDF exporté.",
  fix_pdf_special_characters:
    'Les caractères spéciaux et les liens de ton CV s’exportent désormais parfaitement dans le PDF de chaque thème.',
  fix_preview_pdf_parity:
    "Ce que tu vois correspond désormais à ce que tu exportes. Les titres de section renommés, les détails propres à chaque thème, les icônes à côté d'eux et les sections de projet sur plusieurs thèmes à deux colonnes pouvaient différer entre l'aperçu à l'écran et le PDF exporté – les deux s'affichent désormais de manière identique.",
  fix_reload_repairs_cv:
    "Recharger l'éditeur répare désormais automatiquement les fichiers CV corrompus ou anciens à la volée, évitant ainsi d'éventuels plantages de l'aperçu et de l'exportation.",
  fix_signature_footer:
    "Le pied de page de signature est corrigé : il laisse désormais de la place pour signer, ne génère plus de page finale vide sur les CV plus longs, et apparaît sur les thèmes Elegant, Plain et Plain 2 qui ne l'avaient pas.",
  fix_stackoverflow_page_breaks:
    "Les sauts de page manuels fonctionnent à nouveau sur le thème Stack Overflow. Ajouter un saut empêchait totalement la génération du PDF ; l'aperçu et l'exportation s'interrompent désormais exactement là où tu l'as indiqué.",
  fix_theme_fonts:
    "Elegant, Timeless et JavaScript s'affichent désormais avec leurs polices d'origine dans l'aperçu. L'aperçu basculait auparavant sur une police système générique et le PDF de Timeless s'exportait avec une autre police ; les trois thèmes conservent maintenant le même rendu à l'écran que sur le document final.",
  fix_two_column_stray_breaks:
    'Sur les thèmes Lunar, Misty et Swiss Grid, une section dont tu as masqué tous les éléments ne reporte plus son saut de page manuel dans le PDF exporté, évitant ainsi de laisser une colonne vide.',
  other_discord_community:
    'KiwiCV dispose désormais d’une communauté Discord — un espace pour échanger des retours, demander des modèles et se soutenir mutuellement dans la recherche d’emploi. Un lien t’attend dans le pied de page et sur la page d’accueil.',
  other_export_no_google_fonts:
    "L'ouverture d'un CV HTML exporté ne contacte plus Google pour télécharger des polices. Le fichier utilise directement les polices incluses dans KiwiCV, garantissant un affichage identique sans informer quiconque que tu l'as ouvert.",
  other_import_clear_warning:
    "Le résumé de l'importation t'avertit désormais clairement lorsque des valeurs non textuelles sont effacées de champs textuels, au lieu de les vider silencieusement.",
  other_kiwicanopy_family:
    'Découvre le reste de la famille KiwiCanopy — KiwiCV intègre désormais des liens vers KiwiCanopy et KiwiDesk depuis la page À propos.',
};
