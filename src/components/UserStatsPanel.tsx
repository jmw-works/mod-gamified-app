// src/components/UserStatsPanel.tsx
import {
  Flex,
  Heading,
  Text,
  View,
  useTheme,
  Divider,
  Badge,
  useAuthenticator,
} from '@aws-amplify/ui-react';
import { useEffect, useRef } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useUserProfile } from '../context/UserProfileContext';
import {
  xpForLevel,
  getXPWithinLevel,
  calculateXPProgress,
  getXPToNextLevel,
} from '../utils/xp';
import XPBar from './XPBar';
import styles from './UserStatsPanel.module.css';

interface UserStatsPanelProps {
  headerHeight: number;
  spacing: number;
}

export default function UserStatsPanel({ headerHeight, spacing }: UserStatsPanelProps) {
  const { tokens } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.style.setProperty(
      '--user-stats-top',
      `${headerHeight + spacing}px`
    );
  }, [headerHeight, spacing]);
  const { xp, level, title } = useProgress();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();
  const { user } = useAuthenticator((ctx) => [ctx.user]);

  // Defensive defaults
  const safeXP = Number.isFinite(xp) ? Math.max(0, xp) : 0;

  // Prefer saved display name; fall back to username/email
  const loginId = user?.signInDetails?.loginId;
  const shownName =
    (typeof profile?.displayName === 'string' && profile.displayName) ||
    user?.username ||
    loginId ||
    'Friend';

  const email =
    (typeof profile?.email === 'string' && profile.email) ||
    loginId ||
    'N/A';

  // XP calculations
  const requiredXP = xpForLevel(level);
  const progressWithinLevel = getXPWithinLevel(safeXP);
  const levelPercent =
    level >= 160
      ? 100
      : calculateXPProgress(
          progressWithinLevel,
          Number.isFinite(requiredXP) ? requiredXP : 1
        );
  const nextLevelIn = level >= 160 ? 0 : getXPToNextLevel(safeXP);

  if (profileLoading)
    return (
      <View padding={spacing} className={styles.container} ref={containerRef}>
        Loading profile…
      </View>
    );
  if (profileError)
    return (
      <View padding={spacing} className={styles.container} ref={containerRef}>
        Error loading profile: {profileError.message}
      </View>
    );

  return (
    <View padding={spacing} className={styles.container} ref={containerRef}>
      <Heading level={3} marginBottom="small">
        User Stats
      </Heading>

      <Text marginBottom="xxs" color={tokens.colors.font.secondary}>
        Welcome,
      </Text>
      <Heading level={4} marginTop="xxs" marginBottom="small">
        {shownName}
      </Heading>

      <Flex direction="row" alignItems="center" gap="small" marginBottom="small">
        <Badge variation="info">Level {level}</Badge>
        <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
          {progressWithinLevel}/{Number.isFinite(requiredXP) ? requiredXP : '∞'} XP this level
        </Text>
      </Flex>

      <XPBar
        percent={levelPercent}
        label={level >= 160 ? 'Max Level' : `Progress to Level ${level + 1}`}
        title={title}
        fillColor="#e7bb73"
      />

      <Text marginTop="xs" color={tokens.colors.font.secondary} fontSize="0.9rem">
        {level >= 160
          ? 'Maximum level achieved — congrats!'
          : nextLevelIn === 0
          ? 'Level up ready — keep going!'
          : `Only ${nextLevelIn} XP to reach Level ${level + 1}`}
      </Text>

      <Divider marginTop="medium" marginBottom="small" />

      <Flex
        direction="column"
        gap="0.25rem"
        padding="0.75rem"
        borderRadius="0.75rem"
        className={styles.currentTitleBox}
        marginBottom="small"
      >
        <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
          Current Title
        </Text>
        <Text fontWeight={800} className={styles.titleText}>
          {title}
        </Text>
      </Flex>

      <Divider marginTop="small" marginBottom="small" />

      <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
        Email: {email}
      </Text>
    </View>
  );
}
















