import type { Translations } from '@/locales/en';

export const roadmap: Translations['roadmap'] = {
  contact_subtitle:
    'Hjälp KiwiCV att bygga det ultimata arbetsverktyget för CV:n. Dina idéer driver vår roadmap — låt oss skapa något fantastiskt tillsammans.',
  contact_text: 'Har du en vision för framtiden?',
  intro: 'Här är de planerade funktionerna och förbättringarna för kommande versioner av KiwiCV.',
  items: {
    ai_cover_letters: {
      desc: 'Skriv och finjustera ett personligt brev med AI, anpassat till ditt CV och jobbet du söker.',
      title: 'AI-assisterade personliga brev',
    },
    cloud_sync: {
      desc: 'Säkerhetskopiera och återställ CV:n via din egen lagring på Google Drive eller GitHub.',
      title: 'Säkerhetskopiering och återställning i molnet',
    },
    layout_switch: {
      desc: 'Flytta sektioner mellan kolumner, ändra sidofältets position och lägg till manuella sidbrytningar.',
      title: 'Flexibel CV-layout',
    },
    live_preview: {
      desc: 'Redigera bredvid en live-förhandsgranskning i HTML eller PDF.',
      title: 'Live-förhandsgranskning av CV',
    },
    llm_integration: {
      desc: 'Importera ett befintligt CV med AI och anpassa innehållet för en specifik jobbannons.',
      title: 'AI-assisterad import och anpassning',
    },
    matching_cover_letters: {
      desc: 'Skapa personliga brev som visuellt matchar din valda CV-mall.',
      title: 'Matchande personliga brev',
    },
    mobile_support: {
      desc: 'Fortsätt förbättra arbetsflöden för redigering och förhandsgranskning på små skärmar.',
      title: 'Fler mobila förbättringar',
    },
    mobile_support_v1: {
      desc: 'Redigera ditt CV med touch-vänliga kontroller på telefoner.',
      title: 'Mobilredigering med touchkontroller',
    },
    more_themes: {
      desc: 'Lägg till fler professionella mallar utan att ändra ditt befintliga innehåll.',
      title: 'Fler CV-mallar',
    },
  },
  mail: 'Mejl',
  status: {
    planned: 'Planerad',
    released: 'Släppt',
  },
  suggest_via: 'Föreslå en ny funktion via',
  title: 'Roadmap',
};
