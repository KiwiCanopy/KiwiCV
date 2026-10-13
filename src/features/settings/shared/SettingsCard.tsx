import type { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const SettingsCard = ({ title, icon, children }: SettingsCardProps) => {
  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm transition-colors">
      <div className="bg-muted/40 border-border flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-foreground text-lg font-extrabold">{title}</h2>
        {icon}
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
};
