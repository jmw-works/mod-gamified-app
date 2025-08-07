import { useEffect, useRef, useState } from 'react';
import { Card, Button, Heading, Text } from '@aws-amplify/ui-react';
import { useProgress } from '../context/ProgressContext';
import {
  xpForLevel,
  getXPWithinLevel,
  calculateXPProgress,
} from '../utils/xp';

type AnnouncementBannerProps = {
  /** Optional callback when a level up occurs. Useful for analytics. */
  onLevelUp?: (level: number) => void;
  /** Optional callback when the banner is dismissed. */
  onDismiss?: () => void;
};

export default function AnnouncementBanner({ onLevelUp, onDismiss }: AnnouncementBannerProps) {
  const { xp, level, completedSections } = useProgress();

  const prevLevel = useRef(level);
  const prevCompleted = useRef(completedSections.length);
  const prevXP = useRef(xp);

  const [dismissed, setDismissed] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<string | null>(null);

  useEffect(() => {
    let newTitle: string | null = null;
    let newDesc: string | null = null;
    let newIndicator: string | null = null;

    if (level > prevLevel.current) {
      newTitle = 'Level up!';
      newDesc = `Level ${level} achieved!`;
      newIndicator = String(level);
      onLevelUp?.(level);
    } else if (completedSections.length > prevCompleted.current) {
      const count = completedSections.length;
      newTitle = 'Achievement unlocked!';
      newDesc = `${count} completed section${count === 1 ? '' : 's'}!`;
      newIndicator = '✓';
    } else if (xp > prevXP.current) {
      const currentXP = getXPWithinLevel(xp);
      const required = xpForLevel(level);
      if (!Number.isFinite(required)) {
        newTitle = 'Max level reached!';
        newDesc = 'You have hit the level cap.';
        newIndicator = String(level);
      } else {
        const pct = Math.round(
          calculateXPProgress(currentXP, required),
        );
        newTitle = 'Leveling up!';
        newDesc = `You’ve earned ${currentXP} XP toward ${required}. Keep going to unlock the next section.`;
        newIndicator = `${pct}%`;
      }
    }

    if (newTitle) {
      setTitle(newTitle);
      setDescription(newDesc);
      setIndicator(newIndicator);
      setDismissed(false);
    }

    prevLevel.current = level;
    prevCompleted.current = completedSections.length;
    prevXP.current = xp;
  }, [xp, level, completedSections, onLevelUp]);

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

        <Button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          variation="link"
        >
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
