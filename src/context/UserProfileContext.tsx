/* eslint react-refresh/only-export-components: off */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Schema } from '../../amplify/data/resource';
import {
  listUserProfiles,
  createUserProfile,
  updateUserProfile,
} from '../services/userProfileService';

type UserProfileModel = Schema['UserProfile']['type'];

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

  // Load profile for current user
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await listUserProfiles({
          filter: { userId: { eq: userId } },
        });
        const first = (res?.data ?? [])[0] ?? null;
        if (!cancelled) setProfile(first);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      try {
        if (profile?.id) {
          const updated = await updateUserProfile({
            id: profile.id,
            displayName,
          });
          const updatedProfile =
            (updated as unknown as { data?: UserProfileModel }).data ??
            (updated as unknown as UserProfileModel) ??
            profile;
          setProfile(updatedProfile);
        } else {
          const created = await createUserProfile({
            userId,
            email: email ?? null,
            displayName,
          });
          const createdProfile =
            (created as unknown as { data?: UserProfileModel }).data ??
            (created as unknown as UserProfileModel) ??
            null;
          setProfile(createdProfile);
        }
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [profile, userId, email]
  );

  const value: UserProfileContextValue = { profile, loading, error, updateDisplayName };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}

export default UserProfileContext;

