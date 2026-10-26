import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: "Offres d'emploi",
      content:
        "Colle le lien vers l'offre dans la fenêtre d'export quand tu sauvegardes un CV sur Google Drive ou dans un dépôt GitHub privé, puis ouvre-le depuis « Mes CV » dès que tu en as besoin. Les dépôts publics ne reçoivent jamais le lien.",
      title: 'Retrouve où tu as postulé',
    },
  },
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  feat_cover_letter_style_default:
    "Si tu as enregistré un échantillon d'écriture, tes lettres de motivation démarrent désormais sur « Adapter à mon style d'écriture », même dans un nouvel onglet du navigateur. Choisis plutôt un ton et KiwiCV le garde pour cet onglet.",
  feat_export_cmd_enter:
    "Appuie sur Cmd+Entrée (Ctrl+Entrée sous Windows) dans la fenêtre d'export pour lancer l'export sans aller chercher le bouton.",
  feat_export_cover_letter_switch:
    "La fenêtre d'export indique désormais si ta lettre de motivation est incluse, avec un interrupteur pour l'ajouter ou la retirer, et t'avertit quand la lettre risque de ne pas correspondre à l'offre d'emploi à laquelle tu viens d'adapter ton CV, pour que tu puisses la vérifier avant l'envoi.",
  feat_job_posting_link:
    "Ajoute le lien vers l'offre quand tu sauvegardes un CV sur Google Drive ou dans un dépôt GitHub privé, puis ouvre-le directement depuis cette version dans « Mes CV ». Les dépôts GitHub publics ne le reçoivent jamais.",
  fix_basics_proposal_gap:
    "Une proposition de l'IA dans « Informations de Base » ne colle plus à ta photo.",
  fix_json_resume_import_levels:
    'L’importation d’un fichier JSON Resume convertit désormais le niveau de maîtrise d’une langue, par exemple « Native » ou « B2 », en niveau de langue, et lit les niveaux de compétence écrits en toutes lettres, par exemple « Expert ». Si une expérience contient une description de l’entreprise, l’import t’indique désormais que KiwiCV n’a pas de champ pour la conserver, au lieu de l’ignorer sans rien dire.',
  fix_sign_out_forgets_export_details:
    'La déconnexion efface désormais aussi l’entreprise, le poste et le lien vers l’offre que tu as saisis dans la fenêtre d’export, pour que la personne suivante qui se connecte sur ce navigateur ne les voie pas.',
  fix_tailoring_matches_job_ad:
    "L'adaptation à une offre réécrit désormais ton expérience professionnelle en fonction de l'offre d'emploi et ajuste ton titre professionnel, au lieu de seulement restructurer tes compétences.",
  ui_export_footer_pinned:
    "Exporter et Annuler restent désormais visibles en bas de la fenêtre d'export sur les petits écrans.",
  ui_restructure_skills_default:
    "« Restructurer Compétences » est désormais coché quand tu améliores tout ton CV, pour que l'adaptation regroupe par défaut tes compétences en fonction du poste. Décoche-le pour garder ta propre structure ; chaque modification arrive toujours sous forme de proposition que tu peux accepter ou rejeter.",
};
