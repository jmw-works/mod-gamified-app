import { useEffect, useRef, useState } from 'react';
import { Card, Button, Heading, Text } from '@aws-amplify/ui-react';
import { useProgress, type ProgressEvent } from '../context/ProgressContext';

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

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    dismissedRef.current = dismissed;
  }, [dismissed]);

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
    return unsub;
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
