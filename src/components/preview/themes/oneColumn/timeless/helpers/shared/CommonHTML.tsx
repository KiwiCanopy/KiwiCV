import type { TimelessPalette } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/types';

export const SectionHeader = ({ label, p }: { label: string; p: TimelessPalette }) => {
  return (
    <h2
      style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: p.textLight,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: '24px',
        borderBottom: `1px solid ${p.border}`,
        paddingBottom: '8px',
      }}
    >
      {label}
    </h2>
  );
};
