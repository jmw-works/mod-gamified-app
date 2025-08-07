// src/hooks/useUserProfile.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schema } from '../../amplify/data/resource'; // <- make sure this path is correct
import {
  listUserProfiles,
  createUserProfile,
  updateUserProfile,
} from '../services/userProfileService';

type UserProfileModel = Schema['UserProfile']['type'];

export function useUserProfile(userId?: string, email?: string | null) {
  const [profile, setProfile] = useState<UserProfileModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const hasIdentity = Boolean(userId);

  useEffect(() => {
    if (!hasIdentity) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listUserProfiles({
          filter: { userId: { eq: userId! } },
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
  }, [hasIdentity, userId]);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!hasIdentity) return;
      setLoading(true);
      setError(null);
      try {
        if (profile?.id) {
          // Update existing profile
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
          // Create first-time profile
            const created = await createUserProfile({
              userId: userId!,                 // required by your schema
              email: email ?? null,            // many schemas use Nullable<string>
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
      } finally {
        setLoading(false);
      }
    },
    [profile, hasIdentity, userId, email]
  );

  return useMemo(
    () => ({ profile, loading, error, updateDisplayName }),
    [profile, loading, error, updateDisplayName]
  );
}















