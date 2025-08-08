/* eslint react-refresh/only-export-components: off */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';

interface UserProfileModel {
  id: string;
  userId: string;
  email: string | null;
  displayName: string | null;
}

interface UserProfileContextValue {
  profile: UserProfileModel | null;
  loading: boolean;
  error: Error | null;
  updateDisplayName: (displayName: string) => Promise<void>;
}

const UserProfileContext =
  createContext<UserProfileContextValue | undefined>(undefined);

interface ProviderProps {
  userId: string;
  email?: string | null;
  children: ReactNode;
}

export function UserProfileProvider({
  userId,
  email,
  children,
}: ProviderProps) {
  const [profile, setProfile] = useState<UserProfileModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setError(null);
    const cacheKey = `userProfile:${userId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setProfile(JSON.parse(cached) as UserProfileModel);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }
    const initial: UserProfileModel = {
      id: cacheKey,
      userId,
      email: email ?? null,
      displayName: null,
    };
    setProfile(initial);
    setLoading(false);
    localStorage.setItem(cacheKey, JSON.stringify(initial));
  }, [userId, email]);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      const cacheKey = `userProfile:${userId}`;
      const updated: UserProfileModel = {
        ...(profile ?? { id: cacheKey, userId, email: email ?? null }),
        displayName,
      };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(updated));
        setProfile(updated);
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [profile, userId, email]
  );

  const value: UserProfileContextValue = { profile, loading, error, updateDisplayName };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}

export default UserProfileContext;
