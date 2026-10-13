import { memo } from 'react';

interface SectionLabelProps {
  label: string;
  icon?: React.ReactNode;
  variant?: 'sidebar' | 'minimal';
}

export const SectionLabel = memo(({ label, icon, variant = 'sidebar' }: SectionLabelProps) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
        <h3 className="text-muted-foreground text-[10px] font-extrabold tracking-[0.1em] uppercase">
          {label}
        </h3>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {icon && <div className="text-primary-strong/70">{icon}</div>}
      <h2 className="text-foreground truncate text-lg font-extrabold">{label}</h2>
    </div>
  );
});

SectionLabel.displayName = 'SectionLabel';
