import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    "Sur smartphone, ouvrir ton CV sous forme de page web fonctionne enfin. L'option HTML du menu Aperçu te laissait auparavant sur un onglet bloqué sur la génération; elle affiche désormais ton CV rendu.",
  perf_phone_preview:
    "L'aperçu s'ouvre plus rapidement sur téléphone. KiwiCV prépare désormais le moteur de documents pendant que tu rédiges encore au lieu de le démarrer au moment où tu appuies, et rouvrir un CV inchangé depuis le dernier aperçu supprime entièrement l'attente.",
  ui_phone_layout:
    "Sur smartphone, l'éditeur et Mes CV redonnent du souffle à chaque élément. Chaque sauvegarde affiche son nom, sa langue et sa date d'enregistrement sur sa propre ligne au lieu de glisser sous le bouton Restaurer, la carte « Améliorer avec l'IA » sépare son titre et son solde de crédits sur des lignes distinctes, et la dernière section de l'éditeur ne passe plus sous le bouton flottant Aperçu.",
};
