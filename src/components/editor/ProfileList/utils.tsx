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

import { Globe } from 'lucide-react';

export const getIcon = (network: string) => {
  const n = (network || '').toLowerCase();
  if (n.includes('github')) return <FiGithub className="h-5 w-5" />;
  if (n.includes('linkedin')) return <FiLinkedin className="h-5 w-5" />;
  if (n.includes('x.com') || n === 'x') return <SiX className="h-5 w-5" />;
  if (n.includes('twitter')) return <FiTwitter className="h-5 w-5" />;
  if (n.includes('gitlab')) return <FiGitlab className="h-5 w-5" />;
  if (n.includes('stack overflow') || n.includes('stackoverflow'))
    return <SiStackoverflow className="h-5 w-5" />;
  if (n.includes('discord')) return <SiDiscord className="h-5 w-5" />;
  if (n.includes('behance')) return <SiBehance className="h-5 w-5" />;
  if (n.includes('dribbble')) return <FiDribbble className="h-5 w-5" />;
  if (n.includes('medium')) return <SiMedium className="h-5 w-5" />;
  if (n.includes('twitch')) return <FiTwitch className="h-5 w-5" />;
  if (n.includes('reddit')) return <SiReddit className="h-5 w-5" />;
  if (n.includes('codepen')) return <FiCodepen className="h-5 w-5" />;
  if (n.includes('bluesky')) return <SiBluesky className="h-5 w-5" />;
  if (n.includes('mastodon')) return <SiMastodon className="h-5 w-5" />;
  if (n.includes('telegram') || n === 'tg') return <SiTelegram className="h-5 w-5" />;
  if (n.includes('facebook')) return <FiFacebook className="h-5 w-5" />;
  if (n.includes('instagram')) return <FiInstagram className="h-5 w-5" />;
  if (n.includes('youtube')) return <FiYoutube className="h-5 w-5" />;
  return <Globe className="h-5 w-5" />;
};
