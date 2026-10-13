import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Lettergrootte schaal',
    },
  },
  cv_defaults: {
    title: 'CV-standaarden',
  },
  danger: {
    delete_btn: 'Alles wissen',
    delete_data: 'Gegevens Verwijderen',
    delete_data_desc: 'Dit zal al je lokale gegevens onherstelbaar verwijderen.',
    title: 'Gevarenzone',
  },
  export: {
    available_variables: 'Variabelen',
    format_tokens: 'FORMAT-tokens:',
    pattern_error_brackets: 'Ongeldig patroon: niet-overeenkomende haakjes.',
    pattern_tip: '{date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}',
    project_name: 'Naam',
    project_name_desc: 'Definieer de basis voor de projectnaam voor je export.',
  },
  github: {
    disconnect_success: 'GitHub is succesvol losgekoppeld.',
    error_forbidden: 'Toegang geweigerd of limiet bereikt',
    error_invalid_token: 'Ongeldig GitHub-token. Controleer je PAT.',
    error_repo_not_found: 'Repository niet gevonden',
    hide_token: 'Token verbergen',
    modal_connect_btn: 'Verbinden en synchroniseren',
    modal_description:
      'Verbind je GitHub-repository om je cv gesynchroniseerd te houden over apparaten en te implementeren op GitHub Pages.',
    modal_pat_placeholder: 'ghp_je_persoonlijke_toegangstoken',
    modal_repo_placeholder: 'gebruikersnaam/repository',
    modal_title: 'Synchroniseren met GitHub',
    pat_creation_tip:
      "Vergeet niet 'Only select repositories' te selecteren en de gewenste vervaldatum op te geven.",
    pat_security_note:
      "Veiligheidstip: Gebruik een 'Fine-grained' Personal Access Token met alleen 'Contents' lees-/schrijftoegang tot je specifieke repository voor maximale veiligheid. Je kunt er een aanmaken via de volgende link: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'In een openbare repository, of een repository die met GitHub Pages is gepubliceerd, laten back-ups alles weg wat je hebt verborgen, je sollicitatiebrief en gegevens uit geïmporteerde bestanden. Ze bevatten nog steeds de namen en contactgegevens van je referenties en de bestands- en mapnamen die je bij het exporteren kiest, waarin het bedrijf waarop je solliciteert kan staan. Als je een privérepository later openbaar maakt of met GitHub Pages publiceert, kan ook wat er al in staat openbaar worden.',
    remember_pat: 'Token permanent opslaan in deze browser',
    remember_pat_tip:
      'Indien uitgeschakeld, wordt het token alleen voor de huidige sessie opgeslagen en gewist wanneer je het tabblad sluit.',
    repo_name: 'Repositorynaam',
    show_token: 'Token tonen',
  },
  interface: {
    appearance: 'Uiterlijk',
    install: {
      action: 'KiwiCV installeren',
      description: 'Open KiwiCV zoals elke andere app, in een eigen venster.',
      installed: 'Geïnstalleerd op dit apparaat',
      ios_hint: 'Tik op Deel en daarna op Zet op beginscherm.',
      label: 'App',
      unsupported:
        'Kan je browser apps installeren, zoek dan naar Installeren in de adresbalk of het menu.',
    },
    language: 'UI-Taal',
    language_description: 'Selecteer je voorkeurstaal voor de interface van de applicatie.',
    theme_description: 'Kies thema.',
    theme_options: {
      dark: 'Donker',
      light: 'Licht',
      system: 'Systeem',
    },
    title: 'Applicatie',
  },
  title: 'Instellingen',
};
