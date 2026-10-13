import {
  BRAND_CONFIG,
  buildCanonicalMigrationUrl,
  classifyHostname,
  shouldShowMigrationGateway,
} from '@/config/brand';
import { describe, expect, it } from 'vitest';

describe('brand compatibility configuration', () => {
  it.each([
    ['kiwicv.kiwicanopy.com', 'canonical'],
    ['KIWICV.KIWICANOPY.COM.', 'canonical'],
    ['cvcanvas.app', 'legacy-gateway'],
    ['www.cvcanvas.app', 'legacy-gateway'],
    ['migration.localhost', 'migration-preview'],
    // ⚠️ Every loopback spelling must reach the app. `127.0.0.1` rendered the
    // gateway once, and it is the exact URL `npm run dev` prints.
    ['127.0.0.1', 'development'],
    // `location.hostname` serializes IPv6 hosts WITH brackets, so `[::1]` is the
    // spelling a browser can actually produce; the bare form cannot reach here.
    ['[::1]', 'development'],
    ['::1', 'development'],
    ['localhost', 'development'],
    ['app.localhost', 'development'],
    ['preview.example.com', 'unknown'],
  ] as const)('classifies %s as %s', (hostname, expected) => {
    expect(classifyHostname(hostname)).toBe(expected);
  });

  it('shows the gateway only on legacy and explicit preview hosts', () => {
    expect(shouldShowMigrationGateway('cvcanvas.app')).toBe(true);
    expect(shouldShowMigrationGateway('migration.localhost')).toBe(true);
    // The regression this pins: the dev server's own URL shows the app.
    expect(shouldShowMigrationGateway('127.0.0.1')).toBe(false);
    expect(shouldShowMigrationGateway('localhost')).toBe(false);
    expect(shouldShowMigrationGateway(BRAND_CONFIG.canonicalHostname)).toBe(false);
    expect(shouldShowMigrationGateway('deploy-preview-1--kiwicv.netlify.app')).toBe(false);
  });

  it('preserves paths, queries, and hashes when building the KiwiCV target', () => {
    expect(buildCanonicalMigrationUrl('/de/dashboard', '?tab=design', '#preview')).toBe(
      'https://kiwicv.kiwicanopy.com/de/dashboard?tab=design&from=migration#preview',
    );
  });

  it('adds the migration marker when no query exists', () => {
    expect(buildCanonicalMigrationUrl('/en', '', '')).toBe(
      'https://kiwicv.kiwicanopy.com/en?from=migration',
    );
  });
});
