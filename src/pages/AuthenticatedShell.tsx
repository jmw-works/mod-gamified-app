// src/pages/AuthenticatedShell.tsx
import { Suspense, lazy, useRef, useState } from 'react';

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
import { AUTH_DISABLED } from '../config/runtime';

export default function AuthenticatedShell() {
  const [userId] = useState(() => {
    let id = localStorage.getItem('guestUserId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('guestUserId', id);
    }
    return id;
  });

  const emailFromAttrs = null;

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
              <HeaderBar ref={headerRef} />
            </div>

            <div className="auth-banner">
              <AnnouncementBanner />
            </div>

            <div className="auth-gallery">
              <Suspense fallback={<Skeleton height="180px" />}>
                <CampaignGallery publicMode={AUTH_DISABLED} />
              </Suspense>
            </div>

            <div className="auth-canvas">
              <Suspense fallback={<Skeleton height="200px" />}>
                <CampaignCanvas publicMode={AUTH_DISABLED} />
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


