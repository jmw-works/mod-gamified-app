export const XP_PER_LEVEL = 100;

export function calculateXPProgress(
  currentXP: number,
  maxXP: number = XP_PER_LEVEL,
): number {
  const pct = (currentXP / maxXP) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function getLevelFromXP(
  xp: number,
  xpPerLevel: number = XP_PER_LEVEL,
): number {
  return Math.floor(xp / xpPerLevel) + 1;
}

export function getXPWithinLevel(
  xp: number,
  xpPerLevel: number = XP_PER_LEVEL,
): number {
  return xp % xpPerLevel;
}

export function getXPToNextLevel(
  xp: number,
  xpPerLevel: number = XP_PER_LEVEL,
): number {
  return Math.max(0, xpPerLevel - getXPWithinLevel(xp, xpPerLevel));
}

