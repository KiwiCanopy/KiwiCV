import { type ResumeData } from '@/types/resume';
import { generateFilename } from '@/utils/filename';
import { stringifyResume } from '@/utils/passthrough';

export interface ExportFile {
  name: string;

  content: string | null;
  type: 'pdf' | 'json' | 'html';
  asyncContent?: () => Promise<string | Blob>;
}

export const getExportFiles = (resume: ResumeData): ExportFile[] => {
  const files: ExportFile[] = [];
  const innerName = 'resume';

  // 1. JSON (Backup)
  files.push({
    name: `${innerName}.json`,
    content: stringifyResume(resume),
    type: 'json',
  });

  // 2. PDF and HTML placeholders
  // The actual generation (React rendering) happens in the UI layer
  // but we define the requirement here.
  files.push({ name: `${innerName}.pdf`, content: null, type: 'pdf' });
  files.push({ name: 'index.html', content: null, type: 'html' });

  return files;
};

/**
 * Safely sanitizes a path segment (folder name) to be URL and Git friendly.
 *
 * A name made only of illegal characters (`...`, `///`) sanitizes down to
 * nothing. Where the result *is* the filename — `getProjectFilename` feeds it
 * straight into `${...}.pdf` and into Git paths — an empty string produces
 * `.pdf` or a broken path, so the default fallback stands in.
 *
 * Pass `fallback: ''` when the result is an *optional* segment rather than the
 * whole name. Substituting `'Resume'` for an absent company or a blank
 * `basics.label` would invent a value the user never typed, and
 * `constructBackupFilename` would then store it as real metadata.
 */
export function sanitizePath(name: string, fallback = 'Resume'): string {
  if (!name) return fallback;

  const sanitized = name
    .replace(/[\n\r\t]/g, ' ') // Flatten multi-line
    .replace(/[<>:"/\\|?*.]/g, '_') // Remove illegal chars and dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .substring(0, 50) // Truncate to avoid extremely long paths
    .replace(/^_+|_+$/g, ''); // Trim underscores

  return sanitized || fallback;
}

/** What GitHub Pages serves when no usable target path is configured. */
const DEFAULT_HOSTING_PATH = 'docs/index.html';

/**
 * Turns the user's hosting path into a repository file path.
 *
 * The stored default is `'/docs'`, and `'/docs'` is truthy — so the
 * `|| 'docs/index.html'` fallback the push used to rely on was dead, and the
 * literal `/docs` went to the Contents API as a `path`. A leading slash with no
 * filename does not write `docs/index.html`, which is what Pages serves.
 *
 * Three rules, in order: strip the slashes that make it look like a URL, treat
 * a last segment with no extension as a directory and put `index.html` in it,
 * and fall back when nothing usable is left.
 */
export function normalizeHostingPath(raw: string | undefined | null): string {
  const segments = (raw || '')
    .trim()
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return DEFAULT_HOSTING_PATH;

  const last = segments[segments.length - 1];
  if (!/\.[A-Za-z0-9]+$/.test(last)) segments.push('index.html');

  return segments.join('/');
}

export const getProjectFilename = (resume: ResumeData): string => {
  const exportMeta = resume.meta.export;
  const rawName = generateFilename(exportMeta.filenamePattern, resume);
  return sanitizePath(rawName);
};

export function constructBackupFilename(
  base: string,
  co?: string,
  pos?: string,
  theme?: string,
): string {
  // The three optional components sanitize with an empty fallback: a company of
  // `...` must not be stored as a company literally named "Resume", which would
  // then round-trip out of `parseBackupFilename` as real metadata.
  const safeBase = sanitizePath(base);
  const safeCo = sanitizePath(co || 'undefined', '');
  const safePos = sanitizePath(pos || 'undefined', '');
  const safeTheme = sanitizePath(theme || 'undefined', '');

  return `${safeBase}_position_${safePos}_company_${safeCo}_theme_${safeTheme}`;
}

export interface BackupMetadata {
  base: string;
  position?: string;
  company?: string;
  theme?: string;
}

/**
 * Parses a backup filename back into its metadata components.
 * The internal format is fixed: {base}_position_{pos}_company_{co}_theme_{theme}
 * This order is intentionally stable to preserve backward compatibility with
 * existing backup files. Only the visual display order (modal, folder name) differs.
 */
export function parseBackupFilename(filename: string): BackupMetadata {
  const withoutExt = filename.replace(/\.json$/i, '');
  const match = withoutExt.match(/^(.*?)_position_(.*?)_company_(.*?)_theme_(.*?)$/);

  const restoreSpaces = (str: string) => str.replace(/_/g, ' ');

  if (match) {
    const [, base, pos, co, theme] = match;
    return {
      base: restoreSpaces(base),
      position: pos === 'undefined' ? undefined : restoreSpaces(pos),
      company: co === 'undefined' ? undefined : restoreSpaces(co),
      theme: theme === 'undefined' ? undefined : theme,
    };
  }

  return { base: restoreSpaces(withoutExt) };
}

/**
 * Generates a clean project name for folders and ZIP files, preserving the metadata values
 * but stripping the internal keys (_position_, _company_, etc.).
 * Specifically excludes theme to keep the folder name concise as requested.
 */
export function getCleanProjectName(filename: string): string {
  const meta = parseBackupFilename(filename);
  if (meta.base === filename.replace(/\.json$/i, '')) {
    return sanitizePath(meta.base);
  }

  const parts = [meta.base, meta.company, meta.position]
    .filter(Boolean)
    .map((p) => sanitizePath(p as string))
    .filter(Boolean);

  return parts.join('_').replace(/_{2,}/g, '_');
}
