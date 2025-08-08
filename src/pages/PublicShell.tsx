// src/pages/PublicShell.tsx
import { Suspense, lazy } from 'react';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { ProgressProvider } from '../context/ProgressContext';
import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import Skeleton from '../components/Skeleton';
const CampaignGallery = lazy(() => import('../components/CampaignGallery'));
const CampaignCanvas = lazy(() => import('../components/CampaignCanvas'));
import styles from './PublicShell.module.css';

interface PublicShellProps {
  onRequireAuth: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PublicShell(_props: PublicShellProps) {
  return (
      <ActiveCampaignProvider>
        <ProgressProvider userId="guest">
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
              {/* TODO: re-enable auth gating */}
              <CampaignCanvas publicMode />
            </Suspense>
          </div>
        </div>
        </ProgressProvider>
      </ActiveCampaignProvider>
  );
}

