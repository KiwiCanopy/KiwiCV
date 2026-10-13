import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'Auf dem Smartphone funktioniert das Öffnen deines Lebenslaufs als Webseite wieder problemlos. Die HTML-Option im Vorschau-Menü blieb bisher bei der Erstellung hängen; jetzt zeigt sie dir direkt den fertig gerenderten Lebenslauf an.',
  perf_phone_preview:
    'Die Vorschau öffnet sich auf dem Smartphone jetzt schneller. KiwiCV bereitet die Dokumenten-Engine bereits vor, während du noch bearbeitest, statt erst beim Antippen zu starten. Und wenn du einen Lebenslauf erneut öffnest, den du seit der letzten Vorschau nicht verändert hast, entfällt die Wartezeit komplett.',
  ui_phone_layout:
    'Auf dem Smartphone geben der Editor und Meine Lebensläufe jedem Element wieder ausreichend Platz. Jede Sicherung zeigt Name, Sprache und Speicherdatum in einer eigenen Zeile an, statt unter der Schaltfläche Wiederherstellen zu verschwinden, die Karte „Mit KI verbessern“ trennt Titel und Guthabenhinweis auf eigene Zeilen, und der letzte Bereich im Editor liegt nicht mehr unter dem schwebenden Vorschau-Button.',
};
