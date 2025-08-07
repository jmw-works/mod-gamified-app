import { useEffect, useRef, useState } from 'react';
import { Card, Button, Heading, Text } from '@aws-amplify/ui-react';
import { useProgress } from '../context/ProgressContext';
import type { ProgressEvent } from '../types/ProgressTypes';
import styles from './AnnouncementBanner.module.css';

type AnnouncementBannerProps = {
  /** Optional callback when a level up occurs. Useful for analytics. */
  onLevelUp?: (level: number) => void;
  /** Optional callback when the banner is dismissed. */
  onDismiss?: () => void;
};

export default function AnnouncementBanner({ onLevelUp, onDismiss }: AnnouncementBannerProps) {
  const { subscribe } = useProgress();

  const queue = useRef<ProgressEvent[]>([]);
  const [current, setCurrent] = useState<ProgressEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const currentRef = useRef<ProgressEvent | null>(null);
  const dismissedRef = useRef(false);

  currentRef.current = current;
  dismissedRef.current = dismissed;

  useEffect(() => {
    const unsub = subscribe((evt) => {
      if (!currentRef.current && dismissedRef.current) {
        setCurrent(evt);
        setDismissed(false);
      } else if (!currentRef.current) {
        setCurrent(evt);
      } else {
        queue.current.push(evt);
      }
    });
    return () => unsub();
  }, [subscribe]);

  useEffect(() => {
    if (current?.type === 'level') {
      onLevelUp?.(current.level);
    }
  }, [current, onLevelUp]);

  const [title, description, indicator] = (() => {
    if (!current) return [null, null, null] as const;
    switch (current.type) {
      case 'section':
        return [
          'Section complete!',
          `You earned ${current.xp} XP.`,
          '✓',
        ] as const;
      case 'campaign':
        return [
          'Campaign complete!',
          `You earned ${current.xp} XP.`,
          '✓',
        ] as const;
      case 'level':
        return [
          'Level up!',
          `Level ${current.level} achieved! (+${current.xp} XP)`,
          String(current.level),
        ] as const;
      default:
        return [null, null, null] as const;
    }
  })();

  if (dismissed || !current) return null;

  return (
    <Card
      variation="elevated"
      borderRadius="l"
      boxShadow="medium"
      marginBottom="large"
      className={styles.bannerCard}
    >
      <div className={styles.bannerContent}>
        {indicator && (
          <div aria-hidden className={styles.indicator}>
            {indicator}
          </div>
        )}
        <div className={styles.textBlock}>
          <Heading level={4} className={styles.title}>
            {title}
          </Heading>
          {description && <Text>{description}</Text>}
        </div>

        <Button
          onClick={() => {
            onDismiss?.();
            const next = queue.current.shift() ?? null;
            if (next) {
              setCurrent(next);
            } else {
              setDismissed(true);
              setCurrent(null);
            }
          }}
          variation="link"
        >
          Dismiss
        </Button>
      </div>
    </Card>
  );
}

