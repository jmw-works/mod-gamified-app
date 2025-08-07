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
import { useProgress } from '../context/ProgressContext';
import { useUserProfile } from '../context/UserProfileContext';
import {
  XP_PER_LEVEL,
  getXPWithinLevel,
  calculateXPProgress,
  getXPToNextLevel,
} from '../utils/xp';
import XPBar from './XPBar';

interface UserStatsPanelProps {
  headerHeight: number;
  spacing: number;
}

export default function UserStatsPanel({ headerHeight, spacing }: UserStatsPanelProps) {
  const { tokens } = useTheme();
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

  // Per-level math
  const progressWithinLevel = getXPWithinLevel(safeXP, XP_PER_LEVEL);
  const levelPercent = calculateXPProgress(progressWithinLevel, XP_PER_LEVEL);
  const nextLevelIn = getXPToNextLevel(safeXP, XP_PER_LEVEL);

  const containerStyle = {
    position: 'sticky' as const,
    top: headerHeight + spacing,
    maxWidth: 'clamp(240px, 50vw, 320px)',
  };

  if (profileLoading)
    return (
      <View padding={spacing} style={containerStyle}>
        Loading profile…
      </View>
    );
  if (profileError)
    return (
      <View padding={spacing} style={containerStyle}>
        Error loading profile: {profileError.message}
      </View>
    );

  return (
    <View
      padding={spacing}
      style={containerStyle}
    >
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
          {progressWithinLevel}/{XP_PER_LEVEL} XP this level
        </Text>
      </Flex>

      <XPBar
        percent={levelPercent}
        label={`Progress to Level ${level + 1}`}
        title={title}
        fillColor="#e7bb73"
      />

      <Text marginTop="xs" color={tokens.colors.font.secondary} fontSize="0.9rem">
        {nextLevelIn === 0
          ? 'Level up ready — keep going!'
          : `Only ${nextLevelIn} XP to reach Level ${level + 1}`}
      </Text>

      <Divider marginTop="medium" marginBottom="small" />

      <Flex
        direction="column"
        gap="0.25rem"
        padding="0.75rem"
        borderRadius="0.75rem"
        style={{
          background: 'rgba(231,187,115,0.12)',
          border: '1px solid rgba(231,187,115,0.35)',
        }}
        marginBottom="small"
      >
        <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
          Current Title
        </Text>
        <Text
          fontWeight={800}
          style={{ fontSize: '1.05rem', color: '#e7bb73', lineHeight: 1.1 }}
        >
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
















