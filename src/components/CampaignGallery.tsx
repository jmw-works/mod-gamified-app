// src/components/CampaignGallery.tsx
import { memo, type CSSProperties, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActiveCampaign } from '../context/ActiveCampaignContext';
import { useCampaigns, type UICampaign } from '../hooks/useCampaigns';
import { useCampaignThumbnail } from '../hooks/useCampaignThumbnail';
import { useProgress } from '../context/ProgressContext';


// Optional thumbnail props for campaigns
type CampaignCard = UICampaign & {
  thumbnailKey?: string | null;
  thumbnailAlt?: string | null;
};

const containerStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  overflowX: 'auto',
  padding: '8px 0',
  scrollbarWidth: 'thin',
};

const cardStyle: CSSProperties = {
  minWidth: 220,
  maxWidth: 240,
  flex: '0 0 auto',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  background: '#fff',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const thumbStyle: CSSProperties = {
  width: '100%',
  height: 120,
  objectFit: 'cover',
  background: '#F3F4F6',
};

const contentStyle: CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const titleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
};

const descStyle: CSSProperties = {
  fontSize: 13,
  color: '#4B5563',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
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
      style={{
        ...cardStyle,
        outline: active ? '2px solid #2563EB' : 'none',
      }}
    >
      {/* Thumbnail */}
      {url ? (
        <img
          src={url}
          alt={c.thumbnailAlt ?? `${c.title} thumbnail`}
          style={thumbStyle}
          draggable={false}
        />
      ) : (
        <div style={{ ...thumbStyle, display: 'grid', placeItems: 'center', color: '#9CA3AF' }}>
          No image
        </div>
      )}

      {/* Content */}
      <div style={contentStyle}>
        <h4 style={titleStyle}>
          {c.title}
          {c.locked ? ' 🔒' : ''}
        </h4>
        {c.description ? <p style={descStyle}>{c.description}</p> : null}
      </div>
    </div>
  );
}

function CampaignGalleryInner() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const userId = user?.userId;
  const { campaigns, loading, error, refresh } = useCampaigns(userId);
  const { activeCampaignId, setActiveCampaignId } = useActiveCampaign();
  const { completedCampaigns } = useProgress();

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
    <div style={containerStyle}>
      {campaigns.map((c) => (
        <CampaignCardView
          key={c.id}
          c={c}
          active={c.id === activeCampaignId}
          onClick={() => !c.locked && setActiveCampaignId(c.id)}
        />
      ))}
    </div>
  );
}

export default memo(CampaignGalleryInner);


