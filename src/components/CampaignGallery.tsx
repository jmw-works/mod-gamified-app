// src/components/CampaignGallery.tsx
import { memo, useContext, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './CampaignGallery.module.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import { useCampaigns, type UICampaign } from '../hooks/useCampaigns';
import { useCampaignThumbnail } from '../hooks/useCampaignThumbnail';
import ProgressContext from '../context/ProgressContext';


// Optional thumbnail props for campaigns
type CampaignCard = UICampaign & {
  thumbnailKey?: string | null;
  thumbnailAlt?: string | null;
};

function CampaignCardView({
  c,
  active,
  onClick,
}: {
  c: CampaignCard;
  active: boolean;
  onClick: () => void;
}) {
  const { url } = useCampaignThumbnail({
    key: c.thumbnailKey ?? undefined,
    fallbackUrl: c.thumbnailUrl ?? undefined,
  });

  return (
    <div
      role="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${styles.card} ${active ? styles.cardActive : ''}`}
    >
      {/* Thumbnail */}
      {url ? (
        <img
          src={url}
          alt={c.thumbnailAlt ?? `${c.title} thumbnail`}
          className={styles.thumb}
          draggable={false}
        />
      ) : (
        <div className={`${styles.thumb} ${styles.thumbPlaceholder}`}>
          No image
        </div>
      )}

      {/* Content */}
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>
          {c.title}
          {c.locked ? ' 🔒' : ''}
        </h4>
        {c.description ? (
          <p className={styles.cardDescription}>{c.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function CampaignGalleryInner() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const userId = user?.userId;
  const { campaigns, loading, error, refresh } = useCampaigns(userId);
  const { activeCampaignId, setActiveCampaignId } = useActiveCampaign();
  const progress = useContext(ProgressContext);
  const completedCampaigns = progress?.completedCampaigns;
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    galleryRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Refresh campaigns whenever progress changes (unlocking new ones)
  useEffect(() => {
    refresh();
  }, [completedCampaigns, refresh]);

  // Ensure active campaign is set to the first unlocked campaign
  useEffect(() => {
    if (loading) return;
    const firstUnlocked = campaigns.find((c) => !c.locked) || null;
    const current = campaigns.find((c) => c.id === activeCampaignId) || null;
    if (!firstUnlocked) {
      setActiveCampaignId(null);
      return;
    }
    if (!current || current.locked) {
      setActiveCampaignId(firstUnlocked.id);
    }
  }, [campaigns, loading, activeCampaignId, setActiveCampaignId]);

  if (loading) return <div>Loading campaigns…</div>;
  if (error) return <div>Error loading campaigns: {error.message}</div>;
  if (!campaigns?.length) return <div>No campaigns yet.</div>;

  return (
    <div className={styles.galleryWrapper}>
      <button
        className={styles.galleryNavButton}
        aria-label="Scroll left"
        onClick={() => scrollBy(-240)}
      >
        <FaChevronLeft />
      </button>
      <div
        className={styles.campaignGallery}
        ref={galleryRef}
        tabIndex={0}
      >
        {campaigns.map((c) => (
          <CampaignCardView
            key={c.id}
            c={c}
            active={c.id === activeCampaignId}
            onClick={() => !c.locked && setActiveCampaignId(c.id)}
          />
        ))}
      </div>
      <button
        className={styles.galleryNavButton}
        aria-label="Scroll right"
        onClick={() => scrollBy(240)}
      >
        <FaChevronRight />
      </button>
    </div>
  );
}

export default memo(CampaignGalleryInner);


