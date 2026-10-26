import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Stellenanzeigen',
      content:
        'Füge den Link zur Stellenanzeige im Export-Dialog ein, wenn du einen Lebenslauf in Google Drive oder in einem privaten GitHub-Repository sicherst, und öffne ihn jederzeit unter „Meine Lebensläufe“. Öffentliche Repositorys erhalten den Link nie.',
      title: 'Merk dir, wo du dich beworben hast',
    },
  },
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  feat_cover_letter_style_default:
    'Hast du eine Schreibprobe gespeichert, starten deine Anschreiben jetzt mit „An meinen Schreibstil anpassen“ – auch in einem neuen Browser-Tab. Wählst du stattdessen einen Ton, behält KiwiCV ihn für diesen Tab.',
  feat_export_cmd_enter:
    'Drücke im Export-Dialog Cmd+Enter (unter Windows Ctrl+Enter), um den Export zu starten, ohne nach dem Button zu greifen.',
  feat_export_cover_letter_switch:
    'Der Export-Dialog zeigt jetzt, ob dein Anschreiben dabei ist, und bietet einen Schalter, um es hinzuzufügen oder wegzulassen. Passt das Anschreiben womöglich nicht zur Stellenanzeige, auf die du deinen Lebenslauf gerade zugeschnitten hast, warnt er dich – so kannst du es vor dem Absenden prüfen.',
  feat_job_posting_link:
    'Füge den Link zur Stellenanzeige hinzu, wenn du einen Lebenslauf in Google Drive oder in einem privaten GitHub-Repository sicherst, und öffne ihn dann direkt bei dieser Version unter „Meine Lebensläufe“. Öffentliche GitHub-Repositorys erhalten ihn nie.',
  fix_basics_proposal_gap:
    'Ein KI-Vorschlag in den Grunddaten klebt nicht mehr direkt an deinem Foto.',
  fix_json_resume_import_levels:
    'Beim Import einer JSON-Resume-Datei übernimmt KiwiCV jetzt das Sprachniveau, etwa „Native“ oder „B2“, und liest auch Kompetenzniveaus, die als Wörter angegeben sind, etwa „Expert“. Enthält eine Berufserfahrung eine Firmenbeschreibung, weist dich der Import jetzt darauf hin, dass KiwiCV dafür kein Feld hat, statt sie stillschweigend zu verwerfen.',
  fix_sign_out_forgets_export_details:
    'Beim Abmelden vergisst KiwiCV jetzt auch das Unternehmen, die Position und den Link zur Stellenanzeige, die du im Export-Dialog eingegeben hast, damit die nächste Person, die sich in diesem Browser anmeldet, sie nicht sieht.',
  fix_tailoring_matches_job_ad:
    'Die Stellenanpassung schreibt deine Berufserfahrung jetzt auf die Stellenanzeige hin um und passt deine Berufsbezeichnung an, statt nur deine Kompetenzen neu zu strukturieren.',
  ui_export_footer_pinned:
    '„Exportieren“ und „Abbrechen“ bleiben auf kleineren Bildschirmen jetzt unten im Export-Dialog sichtbar.',
  ui_restructure_skills_default:
    '„Kompetenzen neu strukturieren“ ist jetzt vorausgewählt, wenn du deinen ganzen Lebenslauf verbesserst, sodass die Stellenanpassung deine Kompetenzen standardmäßig auf die Stelle hin neu gruppiert. Entferne den Haken, um deine eigene Struktur zu behalten; jede Änderung kommt weiterhin als Vorschlag, den du annehmen oder verwerfen kannst.',
};
