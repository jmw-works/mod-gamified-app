// XP scaling per level. Caps out at level 160.
export function xpForLevel(level: number): number {
  if (level >= 160) return Infinity;
  // Exponential growth with a gentle curve
  return Math.floor(100 * Math.pow(1.05, level - 1));
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
  return remaining;
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  const needed = xpForLevel(level);
  if (!Number.isFinite(needed)) return 0;
  const current = getXPWithinLevel(xp);
  return Math.max(0, needed - current);
}

