// src/pages/AuthenticatedShell.tsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CampaignGallery from '../components/CampaignGallery';
import CampaignCanvas from '../components/CampaignCanvas';
import UserStatsPanel from '../components/UserStatsPanel';

import { useUserProfile } from '../hooks/useUserProfile';
import { useCampaigns } from '../hooks/useCampaigns';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { ProgressProvider } from '../context/ProgressContext';

export default function AuthenticatedShell() {
  const { user, signOut, authStatus } = useAuthenticator((ctx) => [ctx.user, ctx.authStatus]);
  const userId = user?.userId ?? '';

  const [attrs, setAttrs] = useState<Record<string, string> | null>(null);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

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
  const { profile } = useUserProfile(userId, emailFromAttrs);

  const { campaigns, loading: campaignsLoading } = useCampaigns(userId);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useHeaderHeight(headerRef);
  const spacing = 24;

  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateAreas: `"header header header" "banner banner banner" "gallery canvas stats"`,
      gridTemplateColumns: '1fr 2fr 1fr',
      gridAutoRows: 'auto',
      minHeight: '100vh',
      gap: spacing,
    }),
    [spacing]
  );

  return (
    <ProgressProvider userId={userId}>
      <div style={gridStyle}>
        <div style={{ gridArea: 'header' }}>
          <HeaderBar ref={headerRef} signOut={signOut} />
        </div>

        <div style={{ gridArea: 'banner' }}>
          <AnnouncementBanner />
        </div>

        <div style={{ gridArea: 'gallery' }}>
          <CampaignGallery
            campaigns={campaigns}
            loading={campaignsLoading}
            activeCampaignId={activeCampaignId}
            onSelect={setActiveCampaignId}
          />
        </div>

        <div style={{ gridArea: 'canvas' }}>
          <CampaignCanvas campaignId={activeCampaignId} userId={userId} />
        </div>

        <div style={{ gridArea: 'stats' }}>
          <UserStatsPanel
            user={{
              username: user?.username,
              attributes: { name: profile?.displayName ?? '', email: emailFromAttrs ?? undefined },
            }}
            headerHeight={headerHeight}
            spacing={spacing}
          />
        </div>
      </div>
    </ProgressProvider>
  );
}

