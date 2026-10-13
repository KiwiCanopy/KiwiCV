import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  fix_migration_notice:
    'Falls du KiwiCV noch über die frühere Webadresse aufrufst, zeigt der Hinweis dort nun das genaue Datum an, an dem diese Adresse eingestellt wird: 31. Oktober 2026.',
  fix_mobile_checkout:
    'Das Wischen durch die Preiskarten auf dem Smartphone löst nicht mehr versehentlich den Bezahlvorgang aus. Der Kauf wird nur noch über die Schaltfläche gestartet.',
  fix_preview_reliability:
    'Die Vorschau bleibt nicht mehr in einer endlosen Ladeanimation hängen. Ein blockiertes Pop-up informiert dich nun direkt darüber, ein hängender Rendervorgang bricht mit einer verständlichen Erklärung ab, und die Vorschau funktioniert selbst dann weiter, wenn ein externer Dienst langsam oder nicht erreichbar ist.',
  fix_save_status:
    'Der Hinweis „Auf diesem Gerät gespeichert“ spiegelt nun den tatsächlichen Speicherstatus wider, anstatt unabhängig vom Ergebnis immer dieselbe Bestätigung anzuzeigen.',
  fix_translations:
    '13 Texte korrigiert, die Zeichen aus dem falschen Alphabet enthalten hatten – etwa kyrillische Zeichen in spanischen und türkischen Wörtern oder koreanische und japanische Zeichen im Chinesischen – und die letzten Übersetzungslücken in allen 15 Sprachen geschlossen.',
  perf_preview_speed:
    'Die erste Vorschau erscheint viel schneller. Früher lud KiwiCV jede eventuell benötigte Schriftart vorab – einschließlich zweier sehr großer chinesischer und japanischer Schriften. Diese werden jetzt nur noch geladen, wenn dein Lebenslauf solche Zeichen tatsächlich enthält.',
  ui_polish:
    'Optischer Feinschliff: Überschriften nutzen eine echte extrafette Schrift statt einer vom Browser künstlich verstärkten, Formularbeschriftungen und Platzhalter sind leichter lesbar, und Sektionskarten teilen sich einen einheitlichen Akzent, anstatt jeweils eigene Farben zu wählen.',
};
