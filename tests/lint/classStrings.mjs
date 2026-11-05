import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { PRODUCT_SOURCE_SKIP, sourceFiles } from '../../src/test/sourceFiles.ts';

/** Splits a Tailwind token on `:`, leaving arbitrary values like `data-[a:b]` whole. */
export const splitVariants = (token) => {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of token) {
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (char === ':' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  return [...parts, current];
};

/** Calls `visit(text, relativePath, line)` for every string in product source. */
export function walkStringLiterals(root, visit) {
  for (const file of sourceFiles(path.join(root, 'src'), {
    extensions: ['.ts', '.tsx'],
    skip: PRODUCT_SOURCE_SKIP,
  })) {
    const relative = path.relative(root, file);
    const tree = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const walk = (node) => {
      if (
        ts.isStringLiteralLike(node) ||
        ts.isTemplateMiddleOrTemplateTail(node) ||
        ts.isTemplateHead(node)
      ) {
        const { line } = tree.getLineAndCharacterOfPosition(node.getStart());
        visit(node.text, relative, line + 1);
      }
      ts.forEachChild(node, walk);
    };
    walk(tree);
  }
}
