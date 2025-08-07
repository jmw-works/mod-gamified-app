// src/components/XPBar.tsx
import { Text, useTheme } from '@aws-amplify/ui-react';
import { useEffect, useRef } from 'react';
import styles from './XPBar.module.css';

/** Gold, animated XP bar (extracted from UserStatsPanel) */
export default function XPBar({
  percent, // 0..100 (fractional allowed)
  label,
  fillColor = '#e7bb73', // gold to match header titles
  title,
}: {
  percent: number;
  label?: string;
  fillColor?: string;
  title?: string;
}) {
  const { tokens } = useTheme();
  const barRef = useRef<HTMLDivElement>(null);

  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const shown = Math.round(clamped);

  const barBg = tokens.colors.neutral['20'].value; // light gray track
  const barHeight = '12px';
  const radius = tokens.radii.small.value;

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.setProperty('--xpbar-percent', `${clamped}%`);
    el.style.setProperty('--xpbar-fill', fillColor);
    el.style.setProperty('--xpbar-track-bg', barBg);
    el.style.setProperty('--xpbar-radius', radius);
    el.style.setProperty('--xpbar-height', barHeight);
  }, [clamped, fillColor, barBg, radius, barHeight]);

  return (
    <div
      aria-label={label ?? 'XP progress'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      className={styles.container}
      ref={barRef}
    >
      {label && (
        <div className={styles.labelRow}>
          <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
            {label}
          </Text>
          <div className={styles.labelRight}>
            {title && (
              <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
                {title}
              </Text>
            )}
            <Text fontSize="0.85rem" color={tokens.colors.font.secondary}>
              {shown}%
            </Text>
          </div>
        </div>
      )}

      <div className={styles.track}>
        <div className={styles.fill} />
      </div>
    </div>
  );
}

