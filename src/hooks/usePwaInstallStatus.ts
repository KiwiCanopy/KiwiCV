import { useSyncExternalStore } from 'react';

import {
  type PwaInstallStatus,
  getPwaInstallStatus,
  subscribePwaInstall,
} from '@/services/pwaInstall';

export const usePwaInstallStatus = (): PwaInstallStatus =>
  useSyncExternalStore(subscribePwaInstall, getPwaInstallStatus, () => 'unsupported');
