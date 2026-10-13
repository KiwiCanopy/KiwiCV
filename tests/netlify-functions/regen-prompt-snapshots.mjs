/**
 * Regenerates the system-prompt and response-schema snapshots that
 * vertex-request.test.mjs pins.
 *
 * Guard: if a prompt's text or a schema changed but PROMPT_VERSION did not, this script
 * refuses — a prompt change without a version bump would silently lie to the
 * `prompt_version` field the functions write into usage_logs. Bump the
 * constant in netlify/functions/lib/ai/constants.js first, then rerun.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROMPT_VERSION } from '../../netlify/functions/lib/ai/constants.js';
import { ALL_SNAPSHOTS } from './prompt-snapshot-configs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, '__snapshots__');
mkdirSync(SNAPSHOT_DIR, { recursive: true });

let refused = false;

for (const { kind, name, file: fileName, build } of ALL_SNAPSHOTS) {
  const file = path.join(SNAPSHOT_DIR, fileName);
  const next = build();

  if (existsSync(file)) {
    const stored = readFileSync(file, 'utf8');
    const [versionLine, ...rest] = stored.split('\n');
    const storedVersion = versionLine.replace('PROMPT_VERSION: ', '');
    const storedText = rest.join('\n');

    if (storedText !== next && storedVersion === PROMPT_VERSION) {
      console.error(
        `✗ ${name}: ${kind} changed but PROMPT_VERSION is still ${PROMPT_VERSION}. ` +
          'Bump it in netlify/functions/lib/ai/constants.js, then rerun.',
      );
      refused = true;
      continue;
    }
    if (storedText === next && storedVersion === PROMPT_VERSION) {
      console.log(`= ${name}: unchanged`);
      continue;
    }
  }

  writeFileSync(file, `PROMPT_VERSION: ${PROMPT_VERSION}\n${next}`);
  console.log(`✓ ${name}: written (${PROMPT_VERSION})`);
}

if (refused) process.exit(1);
