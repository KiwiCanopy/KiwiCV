import { useState } from 'react';

import { LibraryNoVersionsState } from '@/features/cv-library/LibraryStates';
import { VersionRow } from '@/features/cv-library/VersionRow';
import type { CvVersion } from '@/features/cv-library/types';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { cvLibraryDeleteAnchor } from '@/utils/focus';

const noop = () => {};

const cvVersion = (label: string): CvVersion => ({
  key: `en:github:${label}.json`,
  locale: 'en',
  source: 'github',
  isMaster: false,
  file: { name: `${label}.json`, label, updatedAt: '2026-03-04T10:00:00Z', theme: 'lunar' },
});

/**
 * The CV library's rows with `useCvLibrary.remove` → `useCloudOperations.handleDelete`,
 * minus the provider: `closeOnConfirm: false`, then the same dialog rewritten into
 * the success report, which is the dialog that finally closes. One copy,
 * shared by every suite that deletes a library row. Mount `ConfirmModal` beside it.
 */
export function CvLibraryHarness({ labels }: { labels: string[] }) {
  const [versions, setVersions] = useState(() => labels.map(cvVersion));

  const remove = async (_target: CvVersion, index: number) => {
    const store = useConfirmStore.getState();
    const shouldDelete = await store.confirm({
      title: 'Delete',
      message: 'Delete this version?',
      variant: 'destructive',
      closeOnConfirm: false,
      restoreFocusTo: cvLibraryDeleteAnchor(index),
    });
    if (!shouldDelete) return;

    store.setLoading(true);
    setVersions((previous) => previous.filter((_, i) => i !== index));
    store.setOptions({
      title: 'Deleted',
      message: 'That version is gone.',
      confirmText: 'OK',
      cancelText: '',
      variant: 'primary',
      isLoading: false,
      closeOnConfirm: true,
    });
  };

  return versions.length === 0 ? (
    <LibraryNoVersionsState onBackupNow={noop} />
  ) : (
    versions.map((target, index) => (
      <VersionRow
        key={target.key}
        version={target}
        index={index}
        onRestore={noop}
        onDelete={remove}
        onDownload={noop}
      />
    ))
  );
}
