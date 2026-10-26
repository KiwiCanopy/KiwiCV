export interface VersionHighlight {
  id: string;
  desktopOnly?: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  id: string; // The translation object key, e.g., 'v_001_000_000'
  highlights?: VersionHighlight[];
  isMajor?: boolean;
}

function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (nb > na) return -1;
  }
  return 0;
}

const allChangelogs: ChangelogEntry[] = [
  {
    version: '5.2.0',
    date: '2026-10-26',
    id: 'v_005_002_000',
  },
  {
    version: '5.1.0',
    date: '2026-10-26',
    id: 'v_005_001_000',
    highlights: [{ id: 'job_posting_link' }],
  },
  {
    version: '5.0.2',
    date: '2026-10-24',
    id: 'v_005_000_002',
  },
  {
    version: '5.0.1',
    date: '2026-10-13',
    id: 'v_005_000_001',
  },
  {
    version: '5.0.0',
    date: '2026-10-13',
    id: 'v_005_000_000',
    highlights: [{ id: 'open_source' }, { id: 'one_day_pass' }],
  },
  {
    version: '4.5.1',
    date: '2026-10-08',
    id: 'v_004_005_001',
  },
  {
    version: '4.5.0',
    date: '2026-10-06',
    id: 'v_004_005_000',
    highlights: [{ id: 'custom_sections' }],
  },
  {
    version: '4.4.2',
    date: '2026-10-02',
    id: 'v_004_004_002',
  },
  {
    version: '4.4.1',
    date: '2026-09-24',
    id: 'v_004_004_001',
  },
  {
    version: '4.4.0',
    date: '2026-09-08',
    id: 'v_004_004_000',
    highlights: [{ id: 'ai_cover_letters' }],
  },
  {
    version: '4.3.5',
    date: '2026-09-04',
    id: 'v_004_003_005',
  },
  {
    version: '4.3.4',
    date: '2026-09-03',
    id: 'v_004_003_004',
  },
  {
    version: '4.3.3',
    date: '2026-09-01',
    id: 'v_004_003_003',
  },
  {
    version: '4.3.2',
    date: '2026-08-30',
    id: 'v_004_003_002',
  },
  {
    version: '4.3.1',
    date: '2026-08-29',
    id: 'v_004_003_001',
  },
  {
    version: '4.3.0',
    date: '2026-08-26',
    id: 'v_004_003_000',
  },
  {
    version: '4.2.4',
    date: '2026-08-25',
    id: 'v_004_002_004',
  },
  {
    version: '4.2.3',
    date: '2026-08-16',
    id: 'v_004_002_003',
  },
  {
    version: '4.2.2',
    date: '2026-08-13',
    id: 'v_004_002_002',
  },
  {
    version: '4.2.1',
    date: '2026-08-10',
    id: 'v_004_002_001',
  },
  {
    version: '4.2.0',
    date: '2026-08-09',
    id: 'v_004_002_000',
  },
  {
    version: '4.1.3',
    date: '2026-08-02',
    id: 'v_004_001_003',
  },
  {
    version: '4.1.2',
    date: '2026-08-02',
    id: 'v_004_001_002',
  },
  {
    version: '4.1.1',
    date: '2026-08-01',
    id: 'v_004_001_001',
  },
  {
    // Pre-staged for 4.1.0. Gated out of the app until APP_VERSION reaches
    // 4.1.0; `npm run release` overwrites the placeholder date with the real
    // release day (it updates an existing entry rather than duplicating it).
    version: '4.1.0',
    date: '2026-07-30',
    id: 'v_004_001_000',
    highlights: [{ id: 'matching-cover-letters' }],
  },
  {
    version: '4.0.1',
    date: '2026-07-23',
    id: 'v_004_000_001',
  },
  {
    version: '4.0.0',
    date: '2026-07-22',
    id: 'v_004_000_000',
    isMajor: true,
    highlights: [{ id: 'kiwicv-rebrand' }],
  },
  {
    version: '3.9.0',
    date: '2026-07-03',
    id: 'v_003_009_000',
  },
  {
    version: '3.8.1',
    date: '2026-06-27',
    id: 'v_003_008_001',
  },
  {
    version: '3.8.0',
    date: '2026-06-20',
    id: 'v_003_008_000',
  },
  {
    version: '3.7.1',
    date: '2026-06-12',
    id: 'v_003_007_001',
  },
  {
    version: '3.7.0',
    date: '2026-06-10',
    id: 'v_003_007_000',
  },
  {
    version: '3.6.3',
    date: '2026-06-02',
    id: 'v_003_006_003',
  },
  {
    version: '3.6.2',
    date: '2026-05-29',
    id: 'v_003_006_002',
  },
  {
    version: '3.6.1',
    date: '2026-05-27',
    id: 'v_003_006_001',
  },
  {
    version: '3.6.0',
    date: '2026-05-27',
    id: 'v_003_006_000',
  },
  {
    version: '3.5.0',
    date: '2026-05-25',
    id: 'v_003_005_000',
  },
  {
    version: '3.4.2',
    date: '2026-05-23',
    id: 'v_003_004_002',
  },
  {
    version: '3.4.1',
    date: '2026-05-21',
    id: 'v_003_004_001',
  },
  {
    version: '3.4.0',
    date: '2026-05-20',
    id: 'v_003_004_000',
  },
  {
    version: '3.3.3',
    date: '2026-05-18',
    id: 'v_003_003_003',
  },
  {
    version: '3.3.2',
    date: '2026-05-16',
    id: 'v_003_003_002',
  },
  {
    version: '3.3.1',
    date: '2026-05-15',
    id: 'v_003_003_001',
  },
  {
    version: '3.3.0',
    date: '2026-05-14',
    id: 'v_003_003_000',
    highlights: [{ id: 'landing' }, { id: 'blog' }],
  },
  {
    version: '3.2.2',
    date: '2026-05-05',
    id: 'v_003_002_002',
  },
  {
    version: '3.2.1',
    date: '2026-05-03',
    id: 'v_003_002_001',
  },
  {
    version: '3.2.0',
    date: '2026-05-01',
    id: 'v_003_002_000',
    highlights: [
      { id: 'cv-management' },
      { id: 'unified-export' },
      { id: 'resizable-dashboard', desktopOnly: true },
    ],
  },
  {
    version: '3.1.0',
    date: '2026-04-28',
    id: 'v_003_001_000',
  },
  {
    version: '3.0.5',
    date: '2026-04-27',
    id: 'v_003_000_005',
  },
  {
    version: '3.0.4',
    date: '2026-04-27',
    id: 'v_003_000_004',
  },
  {
    version: '3.0.3',
    date: '2026-04-26',
    id: 'v_003_000_003',
  },
  {
    version: '3.0.2',
    date: '2026-04-26',
    id: 'v_003_000_002',
  },
  {
    version: '3.0.1',
    date: '2026-04-26',
    id: 'v_003_000_001',
  },
  {
    version: '3.0.0',
    date: '2026-04-25',
    id: 'v_003_000_000',
    isMajor: true,
    highlights: [{ id: 'google-drive' }, { id: 'ai-import' }, { id: 'webhosting' }],
  },

  {
    version: '2.0.3',
    date: '2026-04-06',
    id: 'v_002_000_003',
  },
  {
    version: '2.0.2',
    date: '2026-04-05',
    id: 'v_002_000_002',
  },
  {
    version: '2.0.1',
    date: '2026-04-04',
    id: 'v_002_000_001',
  },
  {
    version: '2.0.0',
    date: '2026-04-01',
    id: 'v_002_000_000',
    isMajor: true,
    highlights: [{ id: 'dashboard-view' }],
  },
  {
    version: '1.1.1',
    date: '2026-03-24',
    id: 'v_001_001_001',
  },
  {
    version: '1.1.0',
    date: '2026-03-16',
    id: 'v_001_001_000',
  },
  {
    version: '1.0.0',
    date: '2026-03-04',
    id: 'v_001_000_000',
    isMajor: true,
  },
];

// Single source of truth for the app version.
// Fallback to the latest changelog entry if Vite's __APP_VERSION__ is missing (e.g. in tests).
export const APP_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : allChangelogs[0]?.version || '0.0.0';

export const changelog: ChangelogEntry[] = allChangelogs
  .filter((entry) => compareSemver(entry.version, APP_VERSION) <= 0)
  .sort((a, b) => compareSemver(b.version, a.version));
