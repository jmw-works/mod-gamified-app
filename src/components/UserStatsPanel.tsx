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

/** Map user level → Title + Notes (from your table) */
function getRankForLevel(level: number): { title: string; notes: string; tier: number } {
  if (level >= 91) return { tier: 12, title: 'Eternal Keeper of Secrets', notes: 'Final endgame grind' };
  if (level >= 71) return { tier: 11, title: 'Mythic Treasure Hunter', notes: 'Big prestige; XP curve steep' };
  if (level >= 61) return { tier: 10, title: 'Legendary Expedition Leader', notes: 'Small player % reach here' };
  if (level >= 51) return { tier: 9, title: 'Lost City Adventurer', notes: 'Feels elite' };
  if (level >= 41) return { tier: 8, title: 'Tomb Raider', notes: 'Start of serious grind' };
  if (level >= 31) return { tier: 7, title: 'Artifact Appraiser', notes: 'More commitment required' };
  if (level >= 21) return { tier: 6, title: 'Crypt Delver', notes: 'Mid-game pace' };
  if (level >= 16) return { tier: 5, title: 'Temple Cartographer', notes: 'Starts feeling like an achievement' };
  if (level >= 11) return { tier: 4, title: 'Ruins Explorer', notes: 'Slightly longer per level' };
  if (level >= 6) return { tier: 3, title: 'Jungle Scout', notes: 'Still feels quick' };
  if (level >= 2) return { tier: 2, title: 'Desert Pathfinder', notes: 'Very fast to get' };
  return { tier: 1, title: 'Novice Relic Seeker', notes: 'First login/first XP gain' };
}

export default function UserStatsPanel({ headerHeight, spacing }: UserStatsPanelProps) {
  const { tokens } = useTheme();
  const { xp, level } = useProgress();
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
    'N/A';

  const email =
    (typeof profile?.email === 'string' && profile.email) ||
    loginId ||
    'N/A';

  // Per-level math
  const progressWithinLevel = getXPWithinLevel(safeXP, XP_PER_LEVEL);
  const levelPercent = calculateXPProgress(progressWithinLevel, XP_PER_LEVEL);
  const nextLevelIn = getXPToNextLevel(safeXP, XP_PER_LEVEL);

  const rank = getRankForLevel(level);

  const containerStyle = {
    position: 'sticky' as const,
    top: headerHeight + spacing,
    maxWidth: '320px',
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

      <XPBar percent={levelPercent} label={`Progress to Level ${level + 1}`} fillColor="#e7bb73" />

      <Text marginTop="xs" color={tokens.colors.font.secondary} fontSize="0.9rem">
        {nextLevelIn === 0
          ? 'Level up ready — keep going!'
          : `Only ${nextLevelIn} XP to reach Level ${level + 1}`}
      </Text>

      <Divider marginTop="medium" marginBottom="small" />

      {/* Dynamic Rank Title */}
      <Flex
        direction="column"
        gap="0.25rem"
        padding="0.75rem"
        borderRadius="0.75rem"
        style={{
          background: 'rgba(231,187,115,0.12)', // subtle gold tint
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
          {rank.tier} – {rank.title}
        </Text>
        <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
          {rank.notes}
        </Text>
      </Flex>

      <Divider marginTop="small" marginBottom="small" />

      <Text color={tokens.colors.font.secondary} fontSize="0.9rem">
        Email: {email}
      </Text>
    </View>
  );
}
















