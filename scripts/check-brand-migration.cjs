const fs = require('fs');
const path = require('path');

const REPOSITORY_ROOT = path.join(__dirname, '..');
const SCAN_TARGETS = [
  '.github/ISSUE_TEMPLATE',
  'README.md',
  'index.html',
  'netlify/functions',
  'package-lock.json',
  'package.json',
  'public',
  'scripts',
  'src',
];
const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
]);
const FORMER_BRAND_PATTERN =
  /CVCanvas|CV Canvas|CV-Canvas|cvcanvas(?:\.app|\.io)?|cv_canvas|cv-canvas/gi;

const ALLOWED_COMPATIBILITY_REFERENCES = [
  {
    path: /^src\/locales\/[^/]+\/migration\.ts$/,
    line: /CVCanvas/,
    reason: 'The migration gateway explains the former product name.',
  },
  {
    // Pinned to v_004_000_000 rather than the changelog directory: that entry
    // announces the rename and cannot state it without the former name, but a
    // *later* changelog mentioning CVCanvas is a real finding and must fail.
    path: /^src\/locales\/[^/]+\/changelog\/v_004_000_000\.ts$/,
    line: /CVCanvas/,
    reason: 'The v4.0.0 changelog announces the rename and must name the former product.',
  },
  {
    path: /^src\/config\/(?:brand\.ts|__tests__\/brand\.test\.ts)$/,
    // `x\.com` was in this alternation only to permit the old
    // `https://x.com/cvcanvas` profile URL. The handle moved to `@kiwicvapp`
    // on 2026-07-23, so the term is dropped rather than left behind: it would
    // have quietly exempted any future `x.com` line carrying a former-brand
    // name, which is the opposite of what this check is for.
    line: /legacy|cvcanvas\.app/,
    reason: 'Centralized host and storage compatibility values.',
  },
  {
    path: /^src\/constants\/cloud\.ts$/,
    line: /GOOGLE_DRIVE_LEGACY_ROOT/,
    reason: 'The supported read-only Drive root remains CVCanvas.',
  },
  {
    path: /^netlify\/functions\/lib\/(?:brand-config|google-drive-discovery)(?:\.test)?\.(?:js|mjs)$/,
    line: /CVCanvas|CV-Canvas/,
    reason: 'Drive discovery verifies the supported and retired roots.',
  },
  {
    // Scoped by the property — a former-brand *storage key* — and not by a
    // filename convention. The path regex used to end in
    // `(?:\.test\.ts|Store\.ts|Migration\.ts)`, which covered `useUIStore.ts`,
    // the *reader* of `cv_canvas_migration_ui`, and not `resume/migrations.ts`,
    // its *writer*: lowercase and plural, that file matched neither spelling, so
    // the one file this entry's own reason describes — a storage migration — was
    // the one file it did not cover, and `brand:check` was red on `main` for it
    // `*Store.ts` is a spelling; "keeps a former-brand key" is the
    // property.
    //
    // ⚠️ The line regex is the tightening that makes the wider path safe. It
    // requires the former brand to be followed by a `_` or `-` and more key,
    // which is what every retained key looks like (`cv_canvas_migration_ui`,
    // `cvcanvas-ui-prefs`, `cv-canvas-ui-prefs`, `cv_canvas_last_seen_version`).
    // A bare `CVCanvas` or `cvcanvas.app` in prose or in a user-facing string
    // under `src/store/` now fails, where the old `line: /…|CVCanvas/` exempted
    // it — the same over-broad-term hazard the `src/config/brand.ts` entry above
    // already had to correct.
    path: /^src\/(?:store|services)\//,
    line: /(?:cv[_-]canvas|cvcanvas)[_-][a-z0-9][\w-]*/i,
    reason: 'Storage migrations and the tests covering them retain former keys for existing users.',
  },
  {
    // Not covered by the entry above, and deliberately not folded into it: this
    // is the retired Drive root of `GOOGLE_DRIVE_LEGACY_ROOT`
    // (`src/constants/cloud.ts`), a folder *name* rather than a storage key, so
    // it has neither the separator nor the suffix that pattern requires.
    // `.test.ts` here is the property — a test asserting the retired root — not
    // a stand-in for one.
    path: /^src\/store\/.+\.test\.ts$/,
    line: /driveRoot: 'CVCanvas'/,
    reason: 'The supported read-only Drive root remains CVCanvas where a store asserts it.',
  },
  {
    path: /^src\/utils\/avatar-cache\.ts$/,
    line: /cv_canvas_avatar_/,
    reason: 'The brand-neutral cache key remains stable to preserve cached avatars.',
  },
  {
    path: /^src\/pages\/Blog\/utils\/category(?:\.test)?\.ts$/,
    line: /inside cvcanvas/i,
    reason: 'Published Sanity categories remain sortable during the content transition.',
  },
  {
    path: /^scripts\/generate-sitemap\.cjs$/,
    line: /replace\(\/https:/,
    reason: 'Offline regeneration rewrites entries from the former canonical origin.',
  },
  {
    path: /^public\/logos\/kiwicv\/README\.md$/,
    line: /CVCanvas/,
    reason: 'Asset documentation records which former launch assets were retired.',
  },
];

function collectFiles(relativeTarget) {
  const absoluteTarget = path.join(REPOSITORY_ROOT, relativeTarget);
  if (!fs.existsSync(absoluteTarget)) return [];

  const stat = fs.statSync(absoluteTarget);
  if (stat.isFile()) return [relativeTarget];

  return fs.readdirSync(absoluteTarget, { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relativeTarget, entry.name);
    if (entry.isDirectory()) return collectFiles(child);
    return [child];
  });
}

function isTextFile(relativePath) {
  return TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

/**
 * The allowance covering this line, or `null`. Returns the entry rather than a
 * boolean so the suite can ask which allowance is carrying which line, and
 * therefore which allowance is carrying none.
 */
function findAllowance(relativePath, line) {
  return (
    ALLOWED_COMPATIBILITY_REFERENCES.find(
      (allowance) => allowance.path.test(relativePath) && allowance.line.test(line),
    ) ?? null
  );
}

/**
 * Every former-brand line in the scanned tree, each tagged with the allowance
 * that exempts it — or `null` when nothing does, which is a violation.
 *
 * Returned rather than printed so `tests/lint/brand-migration.test.mjs` can hold
 * this check to its own result. It was red on `main` and stayed red because
 * nothing failed when it did; `npm run brand:check` is a command someone
 * has to remember to type, and the suite is not.
 */
function scanBrandReferences() {
  const files = SCAN_TARGETS.flatMap(collectFiles).filter(isTextFile);
  const matches = [];

  for (const relativePath of files) {
    if (relativePath === 'scripts/check-brand-migration.cjs') continue;

    const lines = fs.readFileSync(path.join(REPOSITORY_ROOT, relativePath), 'utf8').split('\n');
    lines.forEach((line, index) => {
      FORMER_BRAND_PATTERN.lastIndex = 0;
      if (!FORMER_BRAND_PATTERN.test(line)) return;
      matches.push({
        file: relativePath,
        line: index + 1,
        text: line.trim(),
        allowance: findAllowance(relativePath, line),
      });
    });
  }

  return { fileCount: files.length, matches };
}

module.exports = { ALLOWED_COMPATIBILITY_REFERENCES, scanBrandReferences };

if (require.main === module) {
  const { fileCount, matches } = scanBrandReferences();
  const violations = matches.filter((match) => !match.allowance);

  if (violations.length > 0) {
    console.error('Unexpected former-brand references found:');
    violations.forEach((violation) =>
      console.error(`- ${violation.file}:${violation.line}: ${violation.text}`),
    );
    process.exit(1);
  }

  console.log(
    `Brand migration check passed across ${fileCount} active product and repository files.`,
  );
}
