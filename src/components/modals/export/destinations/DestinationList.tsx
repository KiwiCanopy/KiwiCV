import { type ReactNode } from 'react';
import { GoFileZip } from 'react-icons/go';
import { SiGithub } from 'react-icons/si';

import { DestinationRow } from '@/components/modals/export/destinations/DestinationRow';
import {
  type DestinationId,
  type DestinationRunState,
  type ExportDestination,
} from '@/components/modals/export/types';
import { GoogleDriveIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';

interface DestinationListProps {
  destinations: ExportDestination[];
  rows: Partial<Record<DestinationId, DestinationRunState>>;
  /** True while a run is in flight: every switch locks. */
  locked: boolean;
  onToggle: (id: DestinationId, enabled: boolean) => void;
  /** Extra controls rendered inside a specific row. */
  extras?: Partial<Record<DestinationId, ReactNode>>;
}

export function DestinationList({
  destinations,
  rows,
  locked,
  onToggle,
  extras,
}: DestinationListProps) {
  const { t } = useTranslation();

  /**
   * Icon and copy per destination, keyed by the id so a new member of
   * `DESTINATION_IDS` cannot be added without answering for its row.
   *
   * Built in the render rather than at module scope so every key is a literal
   * `t()` argument: `i18n:check` resolves call sites statically and a composed
   * key would hide all eight of them.
   */
  const meta: Record<DestinationId, { icon: ReactNode; label: string; desc: string }> = {
    zip: {
      icon: <GoFileZip className="h-5 w-5" />,
      label: t('sync.export_dialog.dest_zip_label'),
      desc: t('sync.export_dialog.dest_zip_desc'),
    },
    github_repo: {
      icon: <SiGithub className="h-5 w-5" />,
      label: t('sync.export_dialog.dest_github_repo_label'),
      desc: t('sync.export_dialog.dest_github_repo_desc'),
    },
    google_drive: {
      icon: <GoogleDriveIcon size={20} className="h-5 w-5" />,
      label: t('sync.export_dialog.dest_google_drive_label'),
      desc: t('sync.export_dialog.dest_google_drive_desc'),
    },
    github_pages: {
      icon: <Globe className="h-5 w-5" />,
      label: t('sync.export_dialog.dest_github_pages_label'),
      desc: t('sync.export_dialog.dest_github_pages_desc'),
    },
  };

  return (
    <div className="space-y-2">
      {destinations.map((destination) => {
        const row = meta[destination.id];
        const run = rows[destination.id];

        return (
          <DestinationRow
            key={destination.id}
            icon={row.icon}
            label={row.label}
            description={destination.pending ? t('sync.checking_connection') : row.desc}
            checked={destination.enabled}
            // A finished destination locks: rerunning what already wrote is not
            // what the retry means.
            disabled={locked || destination.pending || run?.status === 'done'}
            run={run}
            onCheckedChange={(next) => onToggle(destination.id, next)}
          >
            {extras?.[destination.id]}
          </DestinationRow>
        );
      })}
    </div>
  );
}
