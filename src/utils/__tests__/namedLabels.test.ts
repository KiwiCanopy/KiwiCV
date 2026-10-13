import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * An accessible name is one translated sentence with the item inside it
 * (`common.delete_named`), never a verb glued to a name after a colon — that
 * fixes English word order and a colon in all fifteen locales. The PDF error's
 * "Pro-tip: …" is a lead-in to prose, not a control's name, and is allowed.
 */
/** The one prose lead-in allowed to use a colon, matched by its key, not its file. */
const ALLOWED_LINE = /pdf_render_error_pro_tip/;

/**
 * A colon join inside a name-carrying attribute, whatever spells its parts
 * (a call, a ternary, a member), or a translated call glued to a name anywhere.
 */
const GLUED = [
  /(?:aria-label|ariaLabel|label|title)=\{\s*`[^`]*\}:\s*\$\{/,
  /\$\{\s*t\([^`]*?\)\s*\}:\s*\$\{/,
  /\$\{\w+(?:Label|Title|Action|Name)\}:\s*\$\{/,
];

describe('named labels', () => {
  it('no control glues a translated verb and a name with a colon', () => {
    const all = sourceFiles('src', { extensions: ['.ts', '.tsx'], skip: [named('__tests__')] });
    expect(all.length).toBeGreaterThan(100);
    const glued = all
      .map((file) => path.relative(process.cwd(), file).split(path.sep).join('/'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8')
          .split('\n')
          .filter((line) => !ALLOWED_LINE.test(line))
          .join('\n');
        return GLUED.some((pattern) => pattern.test(source));
      });
    expect(glued).toEqual([]);
  });
});
