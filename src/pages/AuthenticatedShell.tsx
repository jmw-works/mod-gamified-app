// src/pages/AuthenticatedShell.tsx
import { useEffect, useRef, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CampaignGallery from '../components/CampaignGallery';
import CampaignCanvas from '../components/CampaignCanvas';
import UserStatsPanel from '../components/UserStatsPanel';

import { useUserProfile } from '../context/UserProfileContext';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { ProgressProvider } from '../context/ProgressContext';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { UserProfileProvider } from '../context/UserProfileContext';
import DisplayNamePrompt from '../components/DisplayNamePrompt';
import './AuthenticatedShell.css';

export default function AuthenticatedShell() {
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [ctx.user, ctx.authStatus]);
  const userId = user?.userId ?? '';

  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let mounted = true;
    if (authStatus !== 'authenticated') return;

    fetchUserAttributes()
      .then((a) => mounted && setAttrs((a ?? {}) as Record<string, string>))
      .catch(() => mounted && setAttrs(null));

    return () => {
      mounted = false;
    };
  }, [authStatus]);

  const emailFromAttrs = attrs?.email ?? null;

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 24;

  return (
    <UserProfileProvider userId={userId} email={emailFromAttrs}>
      <ActiveCampaignProvider>
        <ProgressProvider userId={userId}>
          <DisplayNamePrompt />
          <div className="authenticated-grid">
            <div className="auth-header">
              <HeaderBar ref={headerRef} signOut={signOut} />
            </div>

            <div className="auth-banner">
              <AnnouncementBanner />
            </div>

            <div className="auth-gallery">
              <CampaignGallery />
            </div>

            <div className="auth-canvas">
              <CampaignCanvas userId={userId} />
            </div>

            <div className="auth-stats">
              <UserStatsPanelWithProfile
                username={user?.username}
                email={emailFromAttrs ?? undefined}
                headerHeight={headerHeight}
                spacing={spacing}
              />
            </div>
          </div>
        </ProgressProvider>
      </ActiveCampaignProvider>
    </UserProfileProvider>
  );
}

// Helper component to use profile inside stats panel
function UserStatsPanelWithProfile({
  username,
  email,
  headerHeight,
  spacing,
}: {
  username?: string;
  email?: string;
  headerHeight: number;
  spacing: number;
}) {
  const { profile } = useUserProfile();

  return (
    <UserStatsPanel
      user={{
        username,
        attributes: {
          name: profile?.displayName ?? '',
          email,
        },
      }}
      headerHeight={headerHeight}
      spacing={spacing}
    />
  );
}


