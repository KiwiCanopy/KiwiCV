import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Skala för teckensnitt',
    },
  },
  cv_defaults: {
    title: 'Standardinställningar för CV',
  },
  danger: {
    delete_btn: 'Radera all data',
    delete_data: 'Radera all lokal data',
    delete_data_desc:
      'När du raderar din lokala data finns det ingen återvändo. Denna åtgärd kommer att ta bort alla CV:n som lagras i webbläsarens LocalStorage.',
    title: 'Riskzon',
  },
  export: {
    available_variables: 'Tillgängliga variabler',
    format_tokens: 'FORMAT-token:',
    pattern_error_brackets: 'Ogiltigt mönster: obalanserade hakparenteser.',
    pattern_tip:
      'Ersätt FORMAT med valfri kombination av symboler, t.ex. {date-YYYYMMDD} eller {date-YYYY-MM-DD_HHmm}. Ändringar gäller endast nya exporter.',
    project_name: 'Standardnamn på projekt',
    project_name_desc: 'Definiera basen för projektnamnet för dina exporter.',
  },
  github: {
    disconnect_success: 'GitHub kopplades från framgångsrikt.',
    error_forbidden: 'Åtkomst nekad eller begränsad (rate limit)',
    error_invalid_token: 'Ogiltig GitHub-token. Kontrollera din PAT.',
    error_repo_not_found: 'Arkivet hittades inte',
    hide_token: 'Dölj token',
    modal_connect_btn: 'Anslut & synka',
    modal_description:
      'Anslut ditt GitHub-arkiv för att hålla ditt CV synkroniserat mellan enheter och publicera på GitHub Pages.',
    modal_pat_placeholder: 'ghp_din_personliga_åtkomsttoken',
    modal_repo_placeholder: 'användarnamn/arkiv',
    modal_title: 'Synka med GitHub',
    pat_creation_tip:
      "Kom ihåg att välja 'Only select repositories' (endast valda arkiv) och ange önskat utgångsdatum.",
    pat_security_note:
      "Säkerhetstips: Använd en 'Fine-grained' Personal Access Token med endast läs- och skrivbehörighet för 'Contents' till ditt specifika arkiv för maximal säkerhet. Du kan skapa en via följande länk: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'I ett offentligt arkiv, eller ett som publiceras med GitHub Pages, innehåller säkerhetskopior inget av det du har dolt, inte heller ditt personliga brev eller data från importerade filer. De innehåller fortfarande namn och kontaktuppgifter för dina referenser och de fil- och mappnamn du väljer vid export, som kan nämna företaget du söker tjänst hos. Om du senare gör ett privat arkiv offentligt eller publicerar det med GitHub Pages kan det som redan finns i det också bli offentligt.',
    remember_pat: 'Spara token permanent i denna webbläsare',
    remember_pat_tip:
      'Om inaktiverat lagras token endast för den aktuella sessionen och rensas när du stänger fliken.',
    repo_name: 'Arkivnamn',
    show_token: 'Visa token',
  },
  interface: {
    appearance: 'Utseende',
    install: {
      action: 'Installera KiwiCV',
      description: 'Öppna KiwiCV som vilken annan app som helst, i ett eget fönster.',
      installed: 'Installerad på denna enhet',
      ios_hint: 'Tryck på Dela och sedan på Lägg till på hemskärmen.',
      label: 'App',
      unsupported:
        'Om din webbläsare kan installera appar, leta efter Installera i adressfältet eller menyn.',
    },
    language: 'Gränssnittsspråk',
    language_description: 'Välj ditt föredragna språk för applikationens gränssnitt.',
    theme_description: 'Välj ditt föredragna temaläge.',
    theme_options: {
      dark: 'Mörkt',
      light: 'Ljust',
      system: 'System',
    },
    title: 'App-gränssnitt',
  },
  title: 'Inställningar',
};
