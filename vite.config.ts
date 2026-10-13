import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json' with { type: 'json' };

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    global: 'globalThis',
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  plugins: [react()],
  server: {
    // Under Node ≥17 `localhost` resolves to ::1 first, so Vite's default host
    // binds IPv6 only. `netlify dev` (netlify.toml [dev].targetPort) targets
    // one address family and its HEAD probes / proxy attempts against the
    // other family fail with ECONNREFUSED ("Could not proxy request"). Pin one
    // family so the proxy target is deterministic.
    host: '127.0.0.1',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Dummy credentials so modules that create clients at import time
    // (e.g. lib/supabase.ts) load without a local .env; tests never hit them.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
    },
  },
  build: {
    // Increase the chunk size limit to 5MB to avoid warnings for heavy vendor chunks
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "Use of eval" warnings specifically coming from vm-browserify
        if (warning.code === 'EVAL' && warning.id?.includes('vm-browserify')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split core React dependencies into a vendor chunk
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom') ||
              id.includes('zustand')
            ) {
              return 'vendor';
            }
            // Split UI libraries into a ui chunk
            if (id.includes('lucide-react') || id.includes('@dnd-kit')) {
              return 'ui';
            }
          }
        },
      },
    },
  },
});
