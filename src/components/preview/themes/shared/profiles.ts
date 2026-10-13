import {
  FiCodepen,
  FiDribbble,
  FiFacebook,
  FiGithub,
  FiGitlab,
  FiInstagram,
  FiLinkedin,
  FiTwitch,
  FiTwitter,
  FiYoutube,
} from 'react-icons/fi';
import {
  SiBehance,
  SiBluesky,
  SiDiscord,
  SiMastodon,
  SiMedium,
  SiReddit,
  SiStackoverflow,
  SiTelegram,
  SiX,
} from 'react-icons/si';

import { Link } from 'lucide-react';

/**
 * Resolves a network name to a fitting HTML icon component.
 */
export function getProfileIconHTML(network: string) {
  const n = (network || '').toLowerCase();
  if (n.includes('github')) return FiGithub;
  if (n.includes('linkedin')) return FiLinkedin;
  if (n.includes('x.com') || n === 'x') return SiX;
  if (n.includes('twitter')) return FiTwitter;
  if (n.includes('gitlab')) return FiGitlab;
  if (n.includes('stack overflow') || n.includes('stackoverflow')) return SiStackoverflow;
  if (n.includes('discord')) return SiDiscord;
  if (n.includes('behance')) return SiBehance;
  if (n.includes('dribbble')) return FiDribbble;
  if (n.includes('medium')) return SiMedium;
  if (n.includes('twitch')) return FiTwitch;
  if (n.includes('reddit')) return SiReddit;
  if (n.includes('codepen')) return FiCodepen;
  if (n.includes('bluesky')) return SiBluesky;
  if (n.includes('mastodon')) return SiMastodon;
  if (n.includes('telegram') || n === 'tg') return SiTelegram;
  if (n.includes('facebook')) return FiFacebook;
  if (n.includes('instagram')) return FiInstagram;
  if (n.includes('youtube')) return FiYoutube;
  return Link;
}

export {
  getProfileIconPDF,
  getProfileDisplayPDF,
} from '@/components/preview/themes/shared/profiles-pdf';

/**
 * Get profile display information for HTML themes.
 */
export function getProfileDisplayHTML(profile: { network: string; username?: string }) {
  const Icon = getProfileIconHTML(profile.network);
  const isStandard = Icon !== Link;
  const text = isStandard
    ? profile.username || profile.network
    : `${profile.network}${profile.username ? ': ' + profile.username : ''}`;

  return { Icon, text, isStandard };
}
