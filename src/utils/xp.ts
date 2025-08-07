// XP required to advance from the given level to the next.
// Uses a tiered curve so early levels feel quick and later levels
// require more effort. Caps out at level 160.
export function xpForLevel(level: number): number {
  if (level >= 160) return Infinity;

  if (level <= 40) return 125;
  if (level <= 80) return 175;
  if (level <= 120) return 225;
  return 265; // levels 121-159
}

export function calculateXPProgress(currentXP: number, maxXP: number): number {
  const pct = (currentXP / maxXP) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (level < 160) {
    const needed = xpForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level;
}

export function getXPWithinLevel(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (level < 160) {
    const needed = xpForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level >= 160 ? 0 : remaining;
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  const needed = xpForLevel(level);
  if (!Number.isFinite(needed)) return 0;
  const current = getXPWithinLevel(xp);
  return Math.max(0, needed - current);
}

