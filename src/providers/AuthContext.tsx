import { createContext } from 'react';

import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_tier: 'free' | 'pro';
  premium_until: string | null;
  stripe_customer_id: string | null;
  isPremium: boolean;
  accepted_terms: boolean;
  accepted_terms_at: string | null;
  accepted_privacy: boolean;
  accepted_privacy_at: string | null;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  googleSignin: (
    terms: boolean,
    privacy: boolean,
    options?: { requireDrive?: boolean },
  ) => Promise<void>;
  signInWithGoogle: (options?: { requireDrive?: boolean }) => Promise<void>;
  signOut: (showToast?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isPremium: boolean;
  hasDrivePermission: boolean | null;
  availableBackups: Record<string, import('@/services/google-drive').DriveFile[]> | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
