// src/pages/PublicShell.tsx
import { useMemo } from 'react';

import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { Header as HeaderBar } from '../components/Header';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CampaignGallery from '../components/CampaignGallery';
import CampaignCanvas from '../components/CampaignCanvas';

interface PublicShellProps {
  onRequireAuth: () => void;
}

export default function PublicShell({ onRequireAuth }: PublicShellProps) {
  const spacing = 24;
  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateAreas: `"header header" "banner banner" "gallery canvas"`,
      gridTemplateColumns: '1fr 2fr',
      gridAutoRows: 'auto',
      minHeight: '100vh',
      gap: spacing,
    }),
    [spacing]
  );

  return (
    <ActiveCampaignProvider>
      <div style={gridStyle}>
        <div style={{ gridArea: 'header' }}>
          <HeaderBar />
        </div>
        <div style={{ gridArea: 'banner' }}>
          <AnnouncementBanner />
        </div>
        <div style={{ gridArea: 'gallery' }}>
          <CampaignGallery />
        </div>
        <div style={{ gridArea: 'canvas' }}>
          <CampaignCanvas userId="" onRequireAuth={onRequireAuth} />
        </div>
      </div>
    </ActiveCampaignProvider>
  );
}

