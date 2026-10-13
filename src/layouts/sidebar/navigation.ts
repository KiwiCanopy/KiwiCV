import { BookOpen, Braces, FileText, FolderOpen, Settings, Sparkles } from 'lucide-react';

export const primaryNavItems = [
  { icon: FileText, label: 'sidebar.builder', path: 'dashboard' },
  { icon: FolderOpen, label: 'sidebar.my_cvs', path: 'cvs' },
] as const;

export const learnNavItems = [{ icon: BookOpen, label: 'sidebar.blog', path: 'blog' }] as const;

export const moreNavItems = [
  { icon: Sparkles, label: 'sidebar.extras', path: 'extras' },
  { icon: Braces, label: 'sidebar.raw_json', path: 'json' },
  { icon: Settings, label: 'sidebar.settings', path: 'settings' },
] as const;

export type SidebarNavItem =
  (typeof primaryNavItems)[number] | (typeof learnNavItems)[number] | (typeof moreNavItems)[number];
