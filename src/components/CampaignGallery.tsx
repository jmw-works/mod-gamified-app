// src/components/CampaignGallery.tsx
import { memo, useContext, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaLock } from 'react-icons/fa';
import styles from './CampaignGallery.module.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import { useCampaigns, type UICampaign } from '../hooks/useCampaigns';
import { useCampaignThumbnail } from '../hooks/useCampaignThumbnail';
import ProgressContext from '../context/ProgressContext';
import Skeleton from './Skeleton';
import ProgressBar from './ProgressBar';
import { useCampaignProgress } from '../hooks/useCampaignProgress';


// Optional thumbnail props for campaigns
type CampaignCard = UICampaign & {
  thumbnailKey?: string | null;
  thumbnailAlt?: string | null;
  icon?: string | null;
};

function CampaignCardView({
  c,
  active,
  onClick,
  progress,
}: {
  c: CampaignCard;
  active: boolean;
  onClick: () => void;
  progress?: { completed: number; total: number };
}) {
  const { url } = useCampaignThumbnail({
    key: c.thumbnailKey ?? undefined,
    fallbackUrl: c.thumbnailUrl ?? undefined,
  });

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-disabled={c.locked}
      disabled={c.locked}
      onClick={onClick}
      className={`${styles.card} ${active ? styles.cardActive : ''} ${
        c.locked ? styles.cardLocked : ''
      }`}
    >
      {c.locked && <FaLock className={styles.lockIcon} aria-hidden />}
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
          {c.icon ?? 'No image'}
        </div>
      )}

      {/* Content */}
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{c.title}</h4>
        {c.description ? (
          <p className={styles.cardDescription}>{c.description}</p>
        ) : null}
        {progress && (
          <ProgressBar
            percent={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}
            label={`${progress.completed}/${progress.total}`}
          />
        )}
      </div>
    </button>
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
  const { progress: campaignProgress, refresh: refreshCampaignProgress } = useCampaignProgress(userId);

  const scrollBy = (offset: number) => {
    galleryRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Refresh campaigns only when the number of completed campaigns changes
  const prevCompleted = useRef<number>(completedCampaigns?.length ?? 0);
  useEffect(() => {
    const len = completedCampaigns?.length ?? 0;
    if (len !== prevCompleted.current) {
      prevCompleted.current = len;
      refresh();
    }
  }, [completedCampaigns, refresh]);

  useEffect(() => {
    refreshCampaignProgress();
  }, [progress?.completedSections.length, progress?.answeredQuestions.length, refreshCampaignProgress]);

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

  if (loading)
    return (
      <div className={styles.campaignGallery}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.card}>
            <Skeleton className={styles.thumb} />
            <div className={styles.cardContent}>
              <Skeleton height="20px" width="80%" />
              <Skeleton height="14px" width="60%" />
            </div>
          </div>
        ))}
      </div>
    );
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
            progress={campaignProgress[c.id]}
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


