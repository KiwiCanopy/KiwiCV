import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { REPO_ROOT } from '../../src/test/sourceFiles.ts';

// Whether each label exists is GitHub state; `file-issue` checks it live with
// `gh label list` before creating. A copy checked in here would rot.
const TEMPLATE_DIR = path.join(REPO_ROOT, '.github/ISSUE_TEMPLATE');

const declaredLabels = (source) => {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const line = frontmatter.match(/^labels:\s*\[(.*)\]\s*$/m)?.[1];
  if (line === undefined) return [];
  return [...line.matchAll(/'([^']*)'|"([^"]*)"/g)].map((match) => match[1] ?? match[2]);
};

test('every issue template declares at least one label', () => {
  const templates = fs.readdirSync(TEMPLATE_DIR).filter((name) => name.endsWith('.md'));
  assert.ok(templates.length >= 7, `found only ${templates.length} templates`);

  for (const name of templates) {
    const labels = declaredLabels(fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8'));
    assert.ok(
      labels.some((label) => label.trim()),
      `${name}: no label in its \`labels: [...]\` frontmatter`,
    );
  }
});
