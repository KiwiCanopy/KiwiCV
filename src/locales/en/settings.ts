export const settings = {
  components: {
    font_size_scale: {
      label: 'Font Size Scale',
    },
  },
  cv_defaults: {
    title: 'CV Defaults',
  },
  danger: {
    delete_btn: 'Delete All Data',
    delete_data: 'Delete All Local Data',
    delete_data_desc:
      "Once you delete your local data, there is no going back. This action will remove all resumes stored in your browser's LocalStorage.",
    title: 'Danger Zone',
  },
  export: {
    available_variables: 'Available Variables',
    format_tokens: 'FORMAT tokens:',
    pattern_error_brackets: 'Invalid pattern: unbalanced brackets.',
    pattern_tip:
      'Replace FORMAT with any combination of tokens, e.g. {date-YYYYMMDD} or {date-YYYY-MM-DD_HHmm}. Changes apply to new exports only.',
    project_name: 'Default Project Name',
    project_name_desc: 'Define the project name basis for your exports.',
  },
  github: {
    disconnect_success: 'GitHub disconnected successfully.',
    error_forbidden: 'Access forbidden or Rate limited',
    error_invalid_token: 'Invalid GitHub token. Please check your PAT.',
    error_repo_not_found: 'Repository not found',
    hide_token: 'Hide token',
    modal_connect_btn: 'Connect & Sync',
    modal_description:
      'Connect your GitHub repository to keep your resume in sync across devices and deploy to GitHub Pages.',
    modal_pat_placeholder: 'ghp_your_personal_access_token',
    modal_repo_placeholder: 'username/repository',
    modal_title: 'Sync with GitHub',
    pat_creation_tip:
      "Remember to select 'Only select repositories' and specify your desired expiration date.",
    pat_security_note:
      "Security Tip: Use a 'Fine-grained' Personal Access Token with only 'Contents' read/write access to your specific repository for maximum security. You can create one at the following link: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      "In a public repository, or one published with GitHub Pages, backups leave out everything you have hidden, your cover letter and data from imported files. They still include your references' names and contact details and the file and folder names you choose when exporting, which can name the company you apply to. If you make a private repository public or publish it with GitHub Pages later, what is already in it can become public too.",
    remember_pat: 'Store token persistently in this browser',
    remember_pat_tip:
      'If disabled, the token is only stored for the current session and will be cleared when you close the tab.',
    repo_name: 'Repository Name',
    show_token: 'Show token',
  },
  interface: {
    appearance: 'Appearance',
    install: {
      action: 'Install KiwiCV',
      description: 'Open KiwiCV like any other app, in its own window.',
      installed: 'Installed on this device',
      ios_hint: 'Tap Share, then Add to Home Screen.',
      label: 'App',
      unsupported: 'If your browser can install apps, look for Install in its address bar or menu.',
    },
    language: 'UI-Language',
    language_description: 'Select your preferred language for the application interface.',
    theme_description: 'Choose your preferred theme mode.',
    theme_options: {
      dark: 'Dark',
      light: 'Light',
      system: 'System',
    },
    title: 'App Interface',
  },
  title: 'Settings',
};
