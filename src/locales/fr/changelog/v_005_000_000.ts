import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Passe de 1 jour',
      content:
        "Tu hésites encore ? Le nouveau Passe de 1 jour débloque toutes les fonctions d'IA pour ta prochaine candidature, pour que tu saches à quoi t'en tenir avant de choisir un Passe plus long. Les cartes de tarifs proposent désormais 1, 7 et 30 jours.",
      title: 'Essaie pour une journée',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Chaque ligne de KiwiCV est désormais publique sur GitHub, sous licence AGPL. Vois exactement comment ton CV est traité, signale un bug ou propose une fonctionnalité : le code derrière les promesses de confidentialité est là, à la disposition de tous.',
      title: 'KiwiCV est open source',
    },
  },
  feat_ai_review_calmer:
    "Relire les propositions de l'IA est plus serein. Compétences et Langues ont désormais le panneau de relecture sur chaque entrée, les champs qu'une proposition a réécrits restent en lecture seule jusqu'à ce que tu choisisses « Garder la mienne » ou « Utiliser la proposition », et Améliorer attend ta décision, si bien qu'un deuxième passage ne peut pas remplacer une proposition que tu n'as pas vue. Les lecteurs d'écran annoncent chaque décision.",
  feat_ai_tailoring_keeps_facts:
    "Adapter ton CV à une offre d'emploi laisse désormais tes intitulés, employeurs, dates et compétences listées intacts. Une compétence que ton CV ne mentionne jamais est marquée « Absent de ton CV – accepte seulement si c’est vrai », pour que tu décides avant qu'elle n'entre dans ton CV.",
  feat_raw_data_extra_blocks:
    "La page JSON brut liste désormais les données supplémentaires qu'un fichier importé a apportées, comme le bloc de réglages d'un autre outil. Ouvre un bloc pour lire son JSON, ou supprime ceux que tu ne veux plus dans tes exports.",
  fix_dates:
    "Les dates jour d'abord comme 05.06.19 sont désormais lues comme le 5 juin, et non le 6 mai. Une date qui n'existe pas, comme 31.02.2019, reste telle que tu l'as saisie et reçoit la marque d'erreur rouge.",
  fix_drive_reconnect:
    "Reconnecter Google Drive va désormais toujours jusqu'au bout, réactive les sauvegardes et commence par un vrai envoi.",
  fix_photos:
    "Les photos d'un CV importé perdent leurs métadonnées d'appareil photo, position GPS comprise, et les photos GIF, HEIC et AVIF deviennent des JPEG. Les photos à fond transparent restent blanches après le recadrage au lieu de devenir noires.",
  fix_preview_pdf_match:
    "Ton aperçu en direct et ton PDF concordent désormais mieux dans Soft, Misty, Skyline, Swiss Grid, Lunar et Elegant : mêmes majuscules, mêmes chronologies, mêmes polices et mêmes liens. L'aperçu ne charge plus de polices depuis un serveur tiers, et le titre et l'auteur d'un PDF ne contiennent que ton nom.",
  fix_privacy_controls:
    "Tu décides de ce qui reste sur cet appareil. La connexion avec Google ne demande un accès durable que lorsque tu connectes Google Drive. Les cartes Google Drive et GitHub des Paramètres proposent toujours Déconnecter ; quand tu te déconnectes ou supprimes ton compte, KiwiCV te propose aussi de retirer la connexion GitHub, et ton échantillon d'écriture reste avec le compte qui l'a enregistré.",
  fix_privacy_policy:
    "La politique de confidentialité a été réécrite. Elle liste ce que KiwiCV conserve de tes requêtes d'IA (jamais ton texte), mentionne ton droit d'opposition et la façon de retirer ton consentement, et nomme chaque service impliqué et l'endroit où il fonctionne.",
  fix_small_things:
    "Faire pivoter une tablette avec le menu latéral ouvert ne fige plus les appuis, le bouton Aperçu flottant ne recouvre plus le menu du téléphone, un onglet resté ouvert pendant une mise à jour se recharge sur la nouvelle version, et un CV trop long à traduire est refusé d'emblée au lieu d'échouer après une longue attente.",
  ui_editor_polish:
    "De retour ? La page d'accueil affiche désormais Continuer l'édition, et Créer ton CV s'ouvre directement sur tes informations personnelles. Dans la lettre de motivation, Objet et Date se placent au-dessus du texte de la lettre et Destinataire s'ouvre dès qu'un nom est renseigné. Améliorer reste visible sur une section vide, avec une astuce sur ce qu'il faut ajouter en premier, et les compteurs de caractères de l'IA passent à l'ambre avant la limite.",
  ui_informal_address_more_languages:
    "L'espagnol, le néerlandais, le russe, l'ukrainien et le bulgare s'adressent désormais à toi de façon informelle dans toute l'appli, comme les autres langues.",
  ui_install_app:
    "Utilise KiwiCV comme une appli : Paramètres → Interface de l'App propose désormais un bouton Installer KiwiCV, et sur iPhone et iPad, KiwiCV obtient une vraie icône quand tu l'ajoutes à ton écran d'accueil.",
};
