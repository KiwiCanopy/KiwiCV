export type ProfilePdfIconName =
  | 'link'
  | 'github'
  | 'linkedin'
  | 'x'
  | 'twitter'
  | 'gitlab'
  | 'stackoverflow'
  | 'discord'
  | 'behance'
  | 'dribbble'
  | 'medium'
  | 'twitch'
  | 'reddit'
  | 'codepen'
  | 'bluesky'
  | 'mastodon'
  | 'telegram'
  | 'facebook'
  | 'instagram'
  | 'youtube';

/**
 * Resolves a network name to a fitting PDF icon name.
 */
export function getProfileIconPDF(network: string): ProfilePdfIconName {
  const n = (network || '').toLowerCase();
  if (n.includes('github')) return 'github';
  if (n.includes('linkedin')) return 'linkedin';
  if (n.includes('x.com') || n === 'x') return 'x';
  if (n.includes('twitter')) return 'twitter';
  if (n.includes('gitlab')) return 'gitlab';
  if (n.includes('stack overflow') || n.includes('stackoverflow')) return 'stackoverflow';
  if (n.includes('discord')) return 'discord';
  if (n.includes('behance')) return 'behance';
  if (n.includes('dribbble')) return 'dribbble';
  if (n.includes('medium')) return 'medium';
  if (n.includes('twitch')) return 'twitch';
  if (n.includes('reddit')) return 'reddit';
  if (n.includes('codepen')) return 'codepen';
  if (n.includes('bluesky')) return 'bluesky';
  if (n.includes('mastodon')) return 'mastodon';
  if (n.includes('telegram') || n === 'tg') return 'telegram';
  if (n.includes('facebook')) return 'facebook';
  if (n.includes('instagram')) return 'instagram';
  if (n.includes('youtube')) return 'youtube';
  return 'link';
}

/**
 * Get profile display information for PDF themes.
 */
export function getProfileDisplayPDF(profile: { network: string; username?: string }) {
  const iconName = getProfileIconPDF(profile.network);
  const isStandard = iconName !== 'link';
  const text = isStandard
    ? profile.username || profile.network
    : `${profile.network}${profile.username ? ': ' + profile.username : ''}`;

  return { iconName, text, isStandard };
}
