import { createPortal } from 'react-dom';

import { usePortalTarget } from '@/hooks/usePortalTarget';

export const HeaderActions = ({ children }: { children: React.ReactNode }) => {
  const container = usePortalTarget('header-actions');

  if (!container) return null;

  return createPortal(children, container);
};
