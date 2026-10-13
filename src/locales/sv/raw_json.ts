import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Kopiera till urklipp',
  data_label: 'Rådata',
  download: 'Ladda ner JSON',
  full: 'Fullständig',
  full_desc: 'Meta + Synliga flaggor (Bäst för import till KiwiCV)',
  full_title: 'Fullständigt app-läge',
  passthrough: {
    desc: 'Sparas så att andra verktyg fortfarande kan läsa din fil. Ingår i dina JSON-exporter och i säkerhetskopior i Drive och privata GitHub-repon; visas aldrig i ditt CV och skickas aldrig till AI:n.',
    remove_confirm_message:
      'Filer som du exporterar från KiwiCV innehåller inte längre det här blocket. Detta kan inte ångras.',
    remove_confirm_title: 'Ta bort ”{{name}}”?',
    removed_desc:
      'Din nästa synkronisering ersätter din nuvarande säkerhetskopia. Tidigare ögonblicksbilder och äldre versioner som Drive och GitHub sparar innehåller det fortfarande tills du tar bort dem där.',
    removed_title: '”{{name}}” har tagits bort från den här webbläsaren',
    title: 'Extra data från en importerad fil',
  },
  reduced: 'Reducerad',
  reduced_desc: 'Dolda objekt borttagna',
  reduced_title: 'Reducerad JSON',
  standard: 'Standard',
  standard_desc: 'Inget Meta, Alla objekt',
  standard_title: 'Standard JSON',
};
