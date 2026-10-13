import { useEffect, useMemo, useState } from 'react';

import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { APP_VERSION, changelog } from '@/data/changelog';
import { useUIStore } from '@/store/ui/useUIStore';

function isNewerVersion(version: string, baseline: string) {
  const versionParts = version.split('.').map(Number);
  const baselineParts = baseline.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (versionParts[index] > (baselineParts[index] || 0)) return true;
    if (versionParts[index] < (baselineParts[index] || 0)) return false;
  }
  return false;
}

/**
 * Drives the "What's New" (VersionUpdateModal) surface for returning users: which
 * changelog versions they have missed since `lastSeenVersion`, and whether the
 * modal should open. The product tour was removed, so this no longer starts any
 * walkthrough — closing the modal simply stamps the current version as seen.
 */
export function useReleaseHighlights() {
  const firstTimeLanguageSelected = useUIStore((state) => state.firstTimeLanguageSelected);
  const [isUpdateModalDismissed, setIsUpdateModalDismissed] = useState(false);
  const currentVersion = APP_VERSION;

  const missedVersions = useMemo(() => {
    const lastSeenVersion = localStorage.getItem(BRAND_STORAGE_KEYS.lastSeenVersion);
    const legacyVisited = localStorage.getItem('has_visited_intro') === 'true';
    const previousVersion = changelog.length > 1 ? changelog[1].version : APP_VERSION;
    const effectiveLastSeen = lastSeenVersion || (legacyVisited ? previousVersion : null);

    if (!effectiveLastSeen || effectiveLastSeen === currentVersion) return [];
    return changelog
      .filter((entry) => isNewerVersion(entry.version, effectiveLastSeen))
      .map((entry) => entry.version);
  }, [currentVersion]);

  /**
   * ⚠️ Stamping a first visit is what keeps this surface reachable at all.
   *
   * `lastSeenVersion` was written in exactly one place — `closeUpdateModal`,
   * which only runs once the modal has opened. So a visitor holding neither
   * that key nor the legacy `has_visited_intro` computed
   * `effectiveLastSeen === null`, got no modal, was never stamped, and got no
   * modal on the next release either. Permanently opted out of "What's New",
   * and unable to self-heal: a fresh browser, a cleared profile, a private
   * window or a second device was enough to land there.
   *
   * Stamping here preserves the intent — someone who has never used KiwiCV is
   * not shown release notes for versions they never missed — while making the
   * *next* release visible to them.
   *
   * ⚠️ The legacy branch is deliberately excluded. With `has_visited_intro` set
   * and no `lastSeenVersion`, `effectiveLastSeen` resolves to the previous
   * version and the modal is *supposed* to open; stamping would suppress the
   * very modal that legacy path exists to show.
   */
  useEffect(() => {
    if (localStorage.getItem(BRAND_STORAGE_KEYS.lastSeenVersion)) return;
    if (localStorage.getItem('has_visited_intro') === 'true') return;
    localStorage.setItem(BRAND_STORAGE_KEYS.lastSeenVersion, currentVersion);
  }, [currentVersion]);

  const closeUpdateModal = () => {
    setIsUpdateModalDismissed(true);
    localStorage.setItem(BRAND_STORAGE_KEYS.lastSeenVersion, currentVersion);
  };

  return {
    closeUpdateModal,
    currentVersion,
    isUpdateModalOpen:
      firstTimeLanguageSelected && missedVersions.length > 0 && !isUpdateModalDismissed,
    missedVersions,
  };
}
