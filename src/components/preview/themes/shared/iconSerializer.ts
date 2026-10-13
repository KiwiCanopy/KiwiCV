import React from 'react';

import { SocialIcons } from '@/assets/pdf-icons/SocialIcons';
import { StandardIcons } from '@/assets/pdf-icons/StandardIcons';
import type { IconFills } from '@/components/preview/ThemeRegistry';
import { getProfileIconPDF } from '@/components/preview/themes/shared/profiles';
import { type ResumeData } from '@/types/resume';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderNodeToSvgString(node: any): string {
  if (!node) return '';
  if (Array.isArray(node)) {
    return node.map(renderNodeToSvgString).join('');
  }

  const props = node.props || {};

  // A node is a drawing shape if it has specific SVG geometry or path props
  const isDrawingNode = !!(
    props.d ||
    props.cx ||
    props.cy ||
    props.r ||
    props.width ||
    props.height ||
    props.x1 ||
    props.y1 ||
    props.points
  );

  // If it's a container node (like React.Fragment or a generic wrapper) without drawing attributes,
  // we just traverse its children directly.
  if (props.children && !isDrawingNode) {
    return renderNodeToSvgString(props.children);
  }

  // Serialize properties to standard XML attributes
  const attrs = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'style')
    .map(([key, val]) => {
      // Map camelCase React props to standard SVG XML attribute names
      const attrName = key
        .replace(/strokeWidth/g, 'stroke-width')
        .replace(/strokeLinecap/g, 'stroke-linecap')
        .replace(/strokeLinejoin/g, 'stroke-linejoin')
        .replace(/strokeDasharray/g, 'stroke-dasharray');
      return `${attrName}="${val}"`;
    })
    .join(' ');

  // Detect tag name based on the properties present on the node
  let tagName = 'g';
  if (props.d) {
    tagName = 'path';
  } else if (props.cx || props.cy || props.r) {
    tagName = 'circle';
  } else if (props.width || props.height) {
    tagName = 'rect';
  } else if (props.x1 || props.y1 || props.x2 || props.y2) {
    tagName = 'line';
  } else if (props.points) {
    const typeName = node.type?.displayName || node.type?.name || '';
    tagName = typeName.toLowerCase().includes('polyline') ? 'polyline' : 'polygon';
  }

  if (isDrawingNode) {
    return `<${tagName} ${attrs} />`;
  }

  if (props.children) {
    return `<g ${attrs}>${renderNodeToSvgString(props.children)}</g>`;
  }

  return '';
}

/**
 * ⚠️ `fills` is **required**. Its predecessor `color` defaulted to `'#718096'` —
 * the seventh copy of the grey removed from the six call sites, and
 * the only one that was still reachable, since omitting the argument is what
 * selected it. No registered theme resolves that colour, so a caller taking the
 * default painted icons a grey nothing else on the page uses; that is the state
 * the render tool was found in. All seven callers pass `paletteIconFills(…)`,
 * so having no default costs nothing and makes the omission a build error.
 *
 * ⚠️ **This function now knows no theme names, and that is the change.**
 * It used to dispatch on the résumé's own theme — `isLunar`/`isTimeless`/
 * `isJavascript`/`isSoft` — and override the colour it had just been handed, so
 * the argument reached the emitted SVGs on **24 of the 40** palettes and was
 * discarded on the other 16. Two defects lived in that:
 *
 * - it resolved the **palette** a third way (`params?.palette || 'light'` for
 *   javascript, neither `resolvePalette` nor `getActivePalette`), which agreed
 *   with `getActivePalette` on all nine boundary inputs by luck rather than by
 *   construction — javascript happens to have exactly two palettes with `light`
 *   both first and the literal default — and would have diverged silently the
 *   day javascript gained a third;
 * - it resolved the **theme** separately from its callers, so a résumé stored as
 *   `'Lunar'` took lunar's colour at the call site and missed `isLunar` here
 *   (fixed by routing through `resolveThemeId`, but the second
 *   resolution remained).
 *
 * Both are gone rather than corrected: the caller resolves theme and palette
 * once, and hands over two colours. There is nothing left here to disagree with.
 * The `isSoft` arm was a **no-op** (`iconColor = color`, already the value) and
 * went with them.
 *
 * ⚠️ `resume` is still read — for `basics.profiles`, to know which social icons
 * to emit. That is résumé *data*; the theme state it used to read is not.
 */
export function serializeIconsMap(resume: ResumeData, fills: IconFills): Record<string, string> {
  const iconNames = new Set<string>([
    'mail',
    'phone',
    'globe',
    'map-pin',
    'external-link',
    'folder',
    'trophy',
    'award',
    'book-open',
    'heart',
    'work',
    'edu',
    'languages',
    'zap',
    'rocket',
    'users',
    'sparkles',
    'user',
    'graduation-cap',
    'brain',
    'briefcase-business',
    'folder-open',
    'heart-handshake',
    'messages-square',
    'layout-list',
  ]);

  // Collect any social network icons present in profiles
  if (resume.basics?.profiles) {
    resume.basics.profiles.forEach((profile) => {
      if (profile.network) {
        try {
          const iconName = getProfileIconPDF(profile.network);
          if (iconName) {
            iconNames.add(iconName);
          }
        } catch (_e) {
          // ignore profile mapping errors
        }
      }
    });
  }

  const iconsMap: Record<string, string> = {};

  // ⚠️ `external-link` is the only de-emphasised icon, and `muted` equals `icon`
  // on eleven of twelve themes — so this is a one-theme distinction that the
  // palette states rather than the serializer infers. See `ThemePaletteMeta`.
  iconNames.forEach((name) => {
    const iconColor = name === 'external-link' ? fills.muted : fills.icon;

    let node: React.ReactNode = null;
    if (StandardIcons[name]) {
      node = StandardIcons[name](iconColor);
    } else if (SocialIcons[name]) {
      node = SocialIcons[name](iconColor);
    }

    if (node) {
      const viewBox = '0 0 24 24';
      const innerSvg = renderNodeToSvgString(node);
      iconsMap[name] =
        `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${innerSvg}</svg>`;
    }
  });

  return iconsMap;
}
