import { useEffect, useState } from 'react';

import { fetchAIUsageStatus } from '@/utils/ai';

export const useAIUsage = (isOpen: boolean, isPremium: boolean, accessToken?: string) => {
  const [proRequestsToday, setProRequestsToday] = useState<number | null>(null);
  const [isResolvingUsage, setIsResolvingUsage] = useState(false);

  useEffect(() => {
    if (!isOpen || !isPremium || !accessToken) return;

    let isMounted = true;

    const loadUsageStatus = async () => {
      setIsResolvingUsage(true);
      try {
        const usageStatus = await fetchAIUsageStatus();
        if (isMounted) {
          setProRequestsToday(usageStatus.proRequestsToday);
        }
      } catch (error) {
        console.error('Failed to fetch AI usage status:', error);
      } finally {
        if (isMounted) {
          setIsResolvingUsage(false);
        }
      }
    };

    loadUsageStatus();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isPremium, accessToken]);

  const syncUsageStatus = async () => {
    if (!isPremium) {
      setProRequestsToday(0);
      return { proRequestsToday: 0, isDailyLimitReached: false };
    }

    setIsResolvingUsage(true);
    try {
      const usageStatus = await fetchAIUsageStatus();
      setProRequestsToday(usageStatus.proRequestsToday);
      return usageStatus;
    } catch (error) {
      console.error('Failed to refresh AI usage status:', error);
      return {
        proRequestsToday: proRequestsToday || 0,
        isDailyLimitReached: false, // Default to false on error to allow interaction
      };
    } finally {
      setIsResolvingUsage(false);
    }
  };

  return {
    proRequestsToday,
    isResolvingUsage,
    syncUsageStatus,
  };
};
