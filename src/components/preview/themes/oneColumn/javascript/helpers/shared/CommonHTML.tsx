import { FONT_MONO } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { JavaScriptPalette } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/types';

/**
 * `fontMono` used to be a prop. Every one of the eleven call sites filled it
 * with its own local copy of the same literal, so it threaded a constant
 * through the tree while looking like a choice each section could make. It
 * reads `FONT_MONO` directly now that there is one.
 */
export const SectionHeader = ({ title, p }: { title: string; p: JavaScriptPalette }) => {
  return (
    <h2
      style={{
        fontFamily: FONT_MONO,
        fontSize: '1.125em',
        fontWeight: 700,
        color: p.slate900,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ color: p.slate300, fontWeight: 400 }}>//</span> {title}
    </h2>
  );
};
