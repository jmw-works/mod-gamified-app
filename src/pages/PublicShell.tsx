// src/pages/PublicShell.tsx
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { GuestProgressProvider } from '../context/ProgressContext';
import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CampaignGallery from '../components/CampaignGallery';
import CampaignCanvas from '../components/CampaignCanvas';
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
            <CampaignGallery />
          </div>
          <div className={styles.canvasArea}>
            <CampaignCanvas userId="" onRequireAuth={onRequireAuth} />
          </div>
        </div>
      </GuestProgressProvider>
    </ActiveCampaignProvider>
  );
}

