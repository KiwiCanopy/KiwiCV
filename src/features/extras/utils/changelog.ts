import { Bug, FileText, Hammer, Package, Palette, Sparkles, Wrench, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const TYPE_ORDER = ['feat', 'ui', 'perf', 'fix', 'refactor', 'chore', 'docs', 'other'];

export const TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  feat: { icon: Sparkles, color: 'text-amber-500', bgColor: 'bg-amber-500' },
  ui: { icon: Palette, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  perf: { icon: Zap, color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
  fix: { icon: Bug, color: 'text-rose-500', bgColor: 'bg-rose-500' },
  refactor: { icon: Hammer, color: 'text-indigo-500', bgColor: 'bg-indigo-500' },
  chore: { icon: Wrench, color: 'text-slate-400', bgColor: 'bg-slate-400' },
  docs: { icon: FileText, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
  other: { icon: Package, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground/50' },
};

export function parseChangelogType(key: string) {
  const keyLower = key.toLowerCase();
  if (keyLower.startsWith('feat_')) return 'feat';
  if (keyLower.startsWith('ui_') || keyLower.startsWith('style_')) return 'ui';
  if (keyLower.startsWith('perf_')) return 'perf';
  if (keyLower.startsWith('fix_')) return 'fix';
  if (keyLower.startsWith('refactor_')) return 'refactor';
  if (keyLower.startsWith('chore_')) return 'chore';
  if (keyLower.startsWith('docs_')) return 'docs';
  if (keyLower.startsWith('other_')) return 'other';
  return null;
}

export function parseChangelogEntry(key: string, text: string) {
  const type = parseChangelogType(key);
  return { type, content: text };
}
