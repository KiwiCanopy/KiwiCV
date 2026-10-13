import { useSyncExternalStore } from 'react';

const subscribeToPortalTarget = (onStoreChange: () => void) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const observer = new MutationObserver(() => {
    onStoreChange();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};

const getPortalSnapshot = (id: string) => {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id);
};

export const usePortalTarget = (id: string) =>
  useSyncExternalStore(
    subscribeToPortalTarget,
    () => getPortalSnapshot(id),
    () => null,
  );
