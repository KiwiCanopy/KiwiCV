import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/ui/useToastStore';
import { useUIStore } from '@/store/ui/useUIStore';

/**
 * PurchaseSuccessHandler
 *
 * This component listens for 'success=true' or 'canceled=true' in the URL
 * and handles the post-purchase flow (verification polling, toasts, profile refresh, URL cleanup).
 * It is meant to be included in a global layout (e.g., MainLayout).
 */
export const PurchaseSuccessHandler: React.FC = () => {
  const { refreshProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const updateToast = useToastStore((state) => state.updateToast);
  const setIsVerifyingPayment = useUIStore((state) => state.setIsVerifyingPayment);

  const isProcessingRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSuccess = params.get('success') === 'true';
    const hasCanceled = params.get('canceled') === 'true';
    const sessionId = params.get('session_id');

    const cleanupUrl = () => {
      const p = new URLSearchParams(window.location.search);
      p.delete('success');
      p.delete('session_id');
      p.delete('canceled');
      p.delete('type');
      const newSearch = p.toString();
      const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newPath, { replace: true });
    };

    if (hasSuccess && sessionId) {
      // Prevent multiple polling loops for the same session
      if (isProcessingRef.current === sessionId) return;
      isProcessingRef.current = sessionId;

      const startFlow = async () => {
        // 1. Silent check first
        const { data: initialData } = await supabase
          .from('processed_payments')
          .select('stripe_session_id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (initialData) {
          addToast(t('monetization.fulfillment_successful'), 'success', 5000);
          await refreshProfile();
          isProcessingRef.current = null;
          cleanupUrl();
          return;
        }

        // 2. Not found yet, NOW show loading UI
        setIsVerifyingPayment(true);
        const toastId = addToast(t('monetization.processing_order'), 'info', 0);

        // 3. Proactive verification call (Manual Pull-based fallback)
        // This handles environments where webhooks might be delayed or unreachable (e.g. Previews)
        try {
          const {
            data: { session: authSession },
          } = await supabase.auth.getSession();

          const response = await fetch('/.netlify/functions/verify-stripe-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authSession?.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          });

          const result = await response.json();
          if (result.success) {
            updateToast(toastId, t('monetization.fulfillment_successful'), 'success', 5000);
            await refreshProfile();
            setIsVerifyingPayment(false);
            isProcessingRef.current = null;
            cleanupUrl();
            return;
          }
        } catch (e) {
          console.warn('[Verification] Proactive check failed, falling back to polling:', e);
        }

        let attempts = 0;
        const maxAttempts = 20;

        const poll = async () => {
          try {
            const { data } = await supabase
              .from('processed_payments')
              .select('stripe_session_id')
              .eq('stripe_session_id', sessionId)
              .maybeSingle();

            if (data) {
              updateToast(toastId, t('monetization.fulfillment_successful'), 'success', 5000);
              await refreshProfile();
              setIsVerifyingPayment(false);
              isProcessingRef.current = null;
              cleanupUrl();
              return;
            }

            attempts++;
            if (attempts >= maxAttempts) {
              updateToast(toastId, t('monetization.fulfillment_pending'), 'warning', 8000);
              setIsVerifyingPayment(false);
              isProcessingRef.current = null;
              cleanupUrl();
              return;
            }

            pollingRef.current = setTimeout(poll, 2000);
          } catch (err) {
            console.error('[Verification] Polling error:', err);
            if (attempts < maxAttempts) {
              pollingRef.current = setTimeout(poll, 2000);
            } else {
              setIsVerifyingPayment(false);
              isProcessingRef.current = null;
            }
          }
        };

        poll();
      };

      startFlow();

      return () => {
        if (pollingRef.current) clearTimeout(pollingRef.current);
      };
    } else if (hasCanceled) {
      addToast(t('monetization.canceled_message'), 'info');
      cleanupUrl();
    } else {
      // Failsafe: If we are on a clean URL but the store still thinks we are verifying, reset it.
      // This handles cases where the user navigated away or refreshed during a failed/delayed session.
      setIsVerifyingPayment(false);
    }
  }, [refreshProfile, navigate, addToast, updateToast, setIsVerifyingPayment, t]);

  return null;
};
