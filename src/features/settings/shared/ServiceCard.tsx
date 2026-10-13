import React, { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import type { FocusAnchor } from '@/utils/focus';
import { Info, SquarePen, Unplug } from 'lucide-react';

export interface ServiceMetadata {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  statusBadge?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  metadata?: ServiceMetadata | ServiceMetadata[];
  onEdit?: () => void;
  editLabel?: string;
  isLocked?: boolean;
  lockedMessage?: string;
  onLockedClick?: () => void;
  isActionRequired?: boolean;
  actionRequiredMessage?: string;
  actionRequiredShort?: string;
  onActionRequiredClick?: () => void;
  isConfigured?: boolean;
  isLoading?: boolean;
  activeIconClassName?: string;
  /**
   * Removes the stored connection without touching the switch. `onClick` gets
   * the card's control that outlives the button, for the dialog to return focus to.
   */
  disconnect?: { onClick: (restoreFocusTo: FocusAnchor) => void; label: string };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  statusBadge,
  isEnabled,
  onToggle,
  metadata,
  onEdit,
  editLabel,
  isLocked,
  lockedMessage,
  onLockedClick,
  isActionRequired = false,
  actionRequiredMessage,
  actionRequiredShort,
  onActionRequiredClick,
  isConfigured = true,
  isLoading,
  activeIconClassName,
  disconnect,
}) => {
  const { t } = useTranslation();
  const editRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Never a control that acts on Enter: after a Drive disconnect the switch and
  // Grant would both start a new authorization.
  const disconnectFocusAnchor: FocusAnchor = () => editRef.current ?? headingRef.current;
  const isCardInteractive = isLocked || isActionRequired;

  // Independent of the switch, and of a pending Grant: a stored connection must
  // be removable without authorizing anything first.
  const disconnectButton = disconnect && (
    <Button
      variant="quiet"
      onClick={(event) => {
        event.stopPropagation();
        disconnect.onClick(disconnectFocusAnchor);
      }}
      className="text-destructive hover:bg-destructive/10 h-10 w-full"
    >
      <Unplug className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{disconnect.label}</span>
    </Button>
  );

  return (
    <div
      onClick={isLocked ? onLockedClick : isActionRequired ? onActionRequiredClick : undefined}
      className={cn(
        'bg-card relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300',
        isEnabled
          ? 'border-primary-strong/20 ring-primary-strong/5 shadow-md ring-1'
          : 'border-border/50 shadow-sm',
        isLocked &&
          'border-muted hover:border-primary-strong/30 cursor-pointer opacity-70 grayscale-[0.8] hover:shadow-md active:scale-[0.99]',
        isActionRequired &&
          'cursor-pointer border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:shadow-md active:scale-[0.99]',
      )}
    >
      {/* Locked Banner */}
      {isCardInteractive && (
        <div className="pointer-events-none absolute top-0 right-0 z-20 h-56 w-56 overflow-hidden">
          <div
            className={cn(
              'absolute top-[50px] right-[-70px] w-[300px] rotate-45 border-y py-2 text-center shadow-xl',
              // ⚠️ Both branches state their label colour. Neither fill can
              // carry the inherited `--foreground`: kiwi and the premium gold
              // are both LIGHT, so in dark the label came out near-white on
              // them — 1.71:1 on the kiwi. Ink is 8.84:1 and 9.49:1.
              isLocked
                ? 'bg-primary text-primary-foreground border-primary-foreground/10'
                : 'bg-premium text-premium-foreground border-premium-deep/30',
            )}
          >
            <span className="px-4 text-[10px] font-black tracking-[0.2em] uppercase">
              {isLocked
                ? t('auth.login_to_enable_short')
                : actionRequiredShort || t('sync.drive_access_required_short')}
            </span>
          </div>
        </div>
      )}

      {/* Content wrapper to disable internal clicks when the card should act as one locked surface */}
      <div
        className={cn(
          'flex h-full flex-col',
          (isLocked || isActionRequired) && 'pointer-events-none',
        )}
      >
        {/* Header Section */}
        <div className="mb-6 flex items-center gap-4">
          {/* Icon Box - Centered vertically relative to Title + Description */}
          <div className="shrink-0">
            <div
              className={cn(
                'bg-background flex h-16 w-16 items-center justify-center rounded-xl border p-3 shadow-sm transition-colors',
                isConfigured
                  ? cn('border-primary-strong/10', activeIconClassName || 'text-primary-strong')
                  : 'border-border text-muted-foreground',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center">{icon}</div>
            </div>
          </div>

          {/* Content & Toggle */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3
                  ref={headingRef}
                  /* Disconnect's landing target: focusable programmatically, not in the tab order. */
                  tabIndex={-1}
                  className={cn(
                    'text-lg leading-none font-extrabold tracking-tight',
                    // The softer place-marker ring `SectionPage`'s heading uses.
                    'focus-visible:border-l-foreground -ml-3 border-l-2 border-l-transparent pl-3 focus-visible:shadow-none focus-visible:outline-none',
                  )}
                >
                  {title}
                </h3>
                {statusBadge && isEnabled && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase ring-1 ring-emerald-500/20 ring-inset">
                    {statusBadge}
                  </span>
                )}
              </div>

              {/* The switch names itself with the service title and carries
                  role/aria-checked, which the old hand-rolled button lacked.
                  stopPropagation keeps a toggle from also firing the card's
                  locked/action-required click. */}
              <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                label={title}
                onClick={(event) => event.stopPropagation()}
                className="shrink-0"
              />
            </div>

            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Metadata / Status Box */}
        <div className="flex min-h-[64px] flex-1 flex-col gap-2">
          {metadata && isConfigured ? (
            (Array.isArray(metadata) ? metadata : [metadata]).map((item, idx) => (
              <div
                key={idx}
                className="bg-muted/40 border-border/40 animate-in fade-in slide-in-from-top-1 flex items-center gap-3 rounded-lg border p-2.5 duration-300"
              >
                {item.icon && <div className="text-muted-foreground shrink-0">{item.icon}</div>}
                <div className="flex min-w-0 flex-col">
                  <span className="text-muted-foreground/60 text-[10px] leading-tight font-bold tracking-wider uppercase">
                    {item.label}
                  </span>
                  <span className="bg-primary/10 text-primary-strong border-primary-strong/20 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-tight">
                    {item.value}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground flex items-center gap-2 px-1 text-xs italic">
              <Info className="h-3 w-3" />
              {isLocked
                ? lockedMessage || t('auth.login_to_enable')
                : isActionRequired
                  ? actionRequiredMessage || t('sync.drive_access_required')
                  : isConfigured
                    ? isEnabled
                      ? t('sync.configured')
                      : t('sync.not_enabled')
                    : t('sync.not_configured')}
            </div>
          )}
        </div>

        {isActionRequired && onActionRequiredClick ? (
          <div className="pointer-events-auto mt-auto flex flex-col gap-2 pt-6">
            <Button
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                onActionRequiredClick();
              }}
              loading={isLoading}
              className="h-10 w-full border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:border-amber-400/40 dark:text-amber-400"
            >
              <Info className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="truncate">{t('sync.grant_permission')}</span>
            </Button>
            {disconnectButton}
          </div>
        ) : (
          (onEdit || disconnect) && (
            <div className="mt-auto flex flex-col gap-2 pt-6">
              {onEdit && (
                <Button
                  ref={editRef}
                  variant="primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  loading={isLoading}
                  className="h-10 w-full"
                >
                  <SquarePen className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {isConfigured ? editLabel || t('common.edit') : t('sync.setup')}
                  </span>
                </Button>
              )}
              {disconnectButton}
            </div>
          )
        )}
      </div>
    </div>
  );
};
