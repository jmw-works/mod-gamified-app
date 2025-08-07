import { useContext, useEffect, useRef, useState } from 'react';
import { Card, Button, Heading, Text } from '@aws-amplify/ui-react';
import { ProgressContext } from '../contexts/ProgressContext';

type AnnouncementBannerProps = {
  /** Optional callback when a level up occurs. Useful for analytics. */
  onLevelUp?: (level: number) => void;
};

export default function AnnouncementBanner({ onLevelUp }: AnnouncementBannerProps) {
  const progress = useContext(ProgressContext);
  const prevLevel = useRef(progress?.level ?? 1);
  const prevCompleted = useRef(progress?.completedSectionsCount ?? 0);
  const prevXP = useRef(progress?.currentXP ?? 0);

  const [dismissed, setDismissed] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<string | null>(null);

  useEffect(() => {
    if (!progress) return;

    let newTitle: string | null = null;
    let newDesc: string | null = null;
    let newIndicator: string | null = null;
    if (progress.level > prevLevel.current) {
      newTitle = 'Level up!';
      newDesc = `Level ${progress.level} achieved!`;
      newIndicator = String(progress.level);
      onLevelUp?.(progress.level);
    } else if (progress.completedSectionsCount > prevCompleted.current) {
      const count = progress.completedSectionsCount;
      newTitle = 'Achievement unlocked!';
      newDesc = `${count} completed section${count === 1 ? '' : 's'}!`;
      newIndicator = '✓';
    } else if (progress.currentXP > prevXP.current) {
      const pct = Math.max(
        0,
        Math.min(100, Math.round((progress.currentXP / Math.max(1, progress.maxXP)) * 100))
      );
      newTitle = 'Leveling up!';
      newDesc = `You’ve earned ${progress.currentXP} XP toward ${progress.maxXP}. Keep going to unlock the next section.`;
      newIndicator = `${pct}%`;
    }

    if (newTitle) {
      setTitle(newTitle);
      setDescription(newDesc);
      setIndicator(newIndicator);
      setDismissed(false);
    }

    prevLevel.current = progress.level;
    prevCompleted.current = progress.completedSectionsCount;
    prevXP.current = progress.currentXP;
  }, [
    progress?.level,
    progress?.completedSectionsCount,
    progress?.currentXP,
    progress?.maxXP,
    onLevelUp,
  ]);

  if (dismissed || !title) return null;

  return (
    <Card
      variation="elevated"
      borderRadius="l"
      boxShadow="medium"
      marginBottom="large"
      style={{
        background: '#f9fbfd',
        border: '2px solid #3776ff',
        textAlign: 'center',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {indicator && (
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              border: '2px solid #3776ff',
              fontWeight: 800,
            }}
          >
            {indicator}
          </div>
        )}
        <div style={{ textAlign: 'left', flex: 1 }}>
          <Heading level={4} style={{ margin: 0 }}>
            {title}
          </Heading>
          {description && <Text>{description}</Text>}
        </div>

        <Button onClick={() => setDismissed(true)} variation="link">
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
