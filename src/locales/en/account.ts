export const account = {
  extend: 'Extend',
  get_premium: 'Get Premium',
  joined_on: 'Joined {{date}}',
  member_fallback: 'Member',
  modals: {
    delete_account: {
      confirm_btn: 'Permanently Delete Account',
      consent_label:
        'I am okay with losing all remaining days of my Premium Pass and I understand that this cannot be reverted.',
      description:
        'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
      error_message: 'Failed to delete account. Please try again or contact support.',
      premium_warning: 'Your premium status (active until {{date}}) will be cancelled immediately.',
      remove_github: 'Also remove the GitHub connection from this device',
      success_message: 'Your account has been successfully deleted.',
      title: 'Delete Account',
    },
    profile_missing: {
      description:
        'Your user profile could not be found in the database. Please try signing out and in again. If the problem persists, please contact the KiwiCV team via {{email}} or delete your account to start fresh.',
      title: 'Profile Not Found',
    },
  },
  renew: 'Renew',
  security_privacy: 'Security & Privacy',
  status: 'Status',
  status_free: 'Free',
  status_pro: 'Pro',
  valid_until: 'Valid until',
};
