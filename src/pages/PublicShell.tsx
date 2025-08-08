// src/pages/PublicShell.tsx
import { Suspense, lazy } from 'react';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { GuestProgressProvider } from '../context/ProgressContext';
import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import Skeleton from '../components/Skeleton';
const CampaignGallery = lazy(() => import('../components/CampaignGallery'));
const CampaignCanvas = lazy(() => import('../components/CampaignCanvas'));
import styles from './PublicShell.module.css';

interface PublicShellProps {
  onRequireAuth: () => void;
}

export default function PublicShell({ onRequireAuth }: PublicShellProps) {
  return (
    <ActiveCampaignProvider>
      <GuestProgressProvider>
        <div className={styles.shellGrid}>
          <div className={styles.headerArea}>
            <HeaderBar />
          </div>
          <div className={styles.bannerArea}>
            <AnnouncementBanner />
          </div>
          <div className={styles.galleryArea}>
            <Suspense fallback={<Skeleton height="180px" />}>
              <CampaignGallery />
            </Suspense>
          </div>
          <div className={styles.canvasArea}>
            <Suspense fallback={<Skeleton height="200px" />}>
              <CampaignCanvas onRequireAuth={onRequireAuth} publicMode />
            </Suspense>
          </div>
        </div>
      </GuestProgressProvider>
    </ActiveCampaignProvider>
  );
}

