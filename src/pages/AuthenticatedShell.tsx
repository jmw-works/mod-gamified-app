// src/pages/AuthenticatedShell.tsx
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import UserStatsPanel from '../components/UserStatsPanel';
import Skeleton from '../components/Skeleton';

const CampaignGallery = lazy(() => import('../components/CampaignGallery'));
const CampaignCanvas = lazy(() => import('../components/CampaignCanvas'));

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
              <Suspense fallback={<Skeleton height="180px" />}>
                <CampaignGallery />
              </Suspense>
            </div>

            <div className="auth-canvas">
              <Suspense fallback={<Skeleton height="200px" />}>
                <CampaignCanvas />
              </Suspense>
            </div>

            <div className="auth-stats">
              <UserStatsPanel headerHeight={headerHeight} spacing={spacing} />
            </div>
          </div>
        </ProgressProvider>
      </ActiveCampaignProvider>
    </UserProfileProvider>
  );
}


