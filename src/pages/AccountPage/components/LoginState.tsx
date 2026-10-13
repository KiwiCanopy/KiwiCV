import React, { useEffect } from 'react';

import { AuthView } from '@/components/auth/AuthView';
import { useFlowStore } from '@/store/ui/useFlowStore';

interface LoginStateProps {
  onSuccess?: () => void;
}

export const LoginState: React.FC<LoginStateProps> = ({ onSuccess }) => {
  const setAuthSource = useFlowStore((state) => state.setAuthSource);

  useEffect(() => {
    setAuthSource('account_guest');
  }, [setAuthSource]);

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <AuthView variant="modal" onSuccess={onSuccess} />
    </div>
  );
};
