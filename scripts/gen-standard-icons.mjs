import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Regenerates `src/assets/pdf-icons/StandardIcons.tsx` from `lucide-react`'s
 * pinned per-icon node data (`__iconData.node`, or the older `__iconNode` export).
 *
 * The PDF catalogue is a hand-copy of lucide described in its own header as
 * "Lucide-aligned". A fingerprint pass found six entries — `phone`,
 * `book-open`, `heart`, `folder-open`, `heart-handshake`, `messages-square` —
 * drawing a *different* glyph from the lucide icon of the same name, plus a
 * seventh (`map`) that drew `map-pin`. A section could therefore agree by name
 * in both outputs and still be drawn differently on screen and in the PDF; the
 * stale `phone` alone was live on eleven theme/placement rows.
 *
 * Patching the drifted entries by hand is what produced the drift. Run this
 * instead, and let `iconGeometryParity.test.ts` prove the result matches lucide.
 *
 *   node scripts/gen-standard-icons.mjs && npx prettier --write src/assets/pdf-icons/StandardIcons.tsx
 *
 * ⚠️ The key list is read back out of the existing file rather than written
 * here, so regenerating never silently adds or drops an entry. Adding a new icon
 * to the catalogue is a deliberate edit to that file followed by a run of this.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = `${ROOT}/src/assets/pdf-icons/StandardIcons.tsx`;
// Module resolution, not ROOT/node_modules: a nested worktree has none of its own.
const require = createRequire(import.meta.url);

/**
 * The only two keys that are not themselves lucide icon names. The serializers
 * emit these spellings, which is why a name comparison between the two outputs
 * is the wrong test — see the header this script writes.
 */
const ALIAS = { work: 'briefcase', edu: 'graduation-cap' };

/**
 * lucide puts the paint on the root `<svg>`; `serializeIconsMap` throws that
 * root away and re-wraps the children, so each child has to carry it here.
 */
const STYLE = [
  ['fill', '"none"'],
  ['stroke', '{color}'],
  ['strokeWidth', '"2"'],
  ['strokeLinecap', '"round"'],
  ['strokeLinejoin', '"round"'],
];

const existing = readFileSync(TARGET, 'utf8');
const keys = [...existing.matchAll(/^ {2}'?([a-z0-9-]+)'?: \(color\) =>/gm)].map((m) => m[1]);
if (!keys.length) throw new Error(`found no icon keys in ${TARGET}`);

function element(tag, attrs) {
  const all = [
    ...Object.entries(attrs)
      .filter(([k]) => k !== 'key')
      .map(([k, v]) => [k, `"${v}"`]),
    ...STYLE,
  ];
  return `      <${tag}\n${all.map(([k, v]) => `        ${k}=${v}`).join('\n')}\n      />`;
}

const entries = [];
for (const key of keys) {
  const lucideName = ALIAS[key] || key;
  const mod = await import(
    pathToFileURL(require.resolve(`lucide-react/dist/esm/icons/${lucideName}.mjs`)).href
  );
  const iconNode = mod.__iconData?.node ?? mod.__iconNode;
  if (!Array.isArray(iconNode)) throw new Error(`no icon node data for lucide \`${lucideName}\``);
  const nodes = iconNode.map(([tag, attrs]) => element(tag, attrs));
  const propKey = /^[a-z][a-zA-Z0-9]*$/.test(key) ? key : `'${key}'`;
  const note = ALIAS[key] ? ` // lucide \`${lucideName}\`` : '';
  const body =
    nodes.length === 1
      ? nodes[0].replace(/^ {6}/gm, '    ')
      : `    <>\n${nodes.join('\n')}\n    </>`;
  entries.push(`  ${propKey}: (color) => (${note}\n${body}\n  ),`);
}

const header = `import React from 'react';

/**
 * Standard UI icons for PDF themes.
 * ViewBox: 0 0 24 24
 * Style: Lucide-aligned (2px stroke, rounded, no fill)
 *
 * ⚠️ **Generated from \`lucide-react\`'s per-icon node data — do not hand-edit
 * the geometry.** These were once hand-copied, and six of them (\`phone\`,
 * \`book-open\`, \`heart\`, \`folder-open\`, \`heart-handshake\`, \`messages-square\`) had
 * drifted into drawing a *different* glyph from the lucide icon of the same name,
 * so a section could agree by name in both outputs and still be drawn differently.
 * \`iconGeometryParity.test.ts\` compares every entry here against lucide by drawn
 * geometry and fails on any drift, which is only sound while this file is a
 * faithful copy. Regenerate rather than patch: \`scripts/gen-standard-icons.mjs\`.
 *
 * ⚠️ Two keys are **not** lucide names. \`work\` is lucide's \`briefcase\` and \`edu\`
 * is its \`graduation-cap\`; the serializers emit those spellings. That is why a
 * name comparison is the wrong test — it reads \`work\` vs \`briefcase\` as a defect
 * and \`briefcase\` vs \`briefcase-business\` as a match, and both are backwards.
 */
export const StandardIcons: Record<string, (color: string) => React.ReactNode> = {
`;

writeFileSync(TARGET, header + entries.join('\n') + '\n};\n');
console.log(`regenerated ${keys.length} icons in ${TARGET}`);
