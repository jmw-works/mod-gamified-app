// XP scaling per level. Caps out at level 160.
// Uses a polynomial curve to keep early levels quick while
// making later levels progressively harder.
export function xpForLevel(level: number): number {
  if (level >= 160) return Infinity;
  // base requirement plus quadratic growth
  return Math.floor(100 + 10 * Math.pow(level, 2));
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

