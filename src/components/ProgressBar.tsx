import { Text, useTheme } from '@aws-amplify/ui-react';
import { useEffect, useRef } from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  percent: number;
  label?: string;
  fillColor?: string;
  title?: string;
}

/** Generic progress bar component */
export default function ProgressBar({ percent, label, fillColor = '#4caf50', title }: ProgressBarProps) {
  const { tokens } = useTheme();
  const barRef = useRef<HTMLDivElement>(null);
  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const shown = Math.round(clamped);
  const barBg = tokens.colors.neutral['20'].value;
  const barHeight = '8px';
  const radius = tokens.radii.small.value;

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.setProperty('--progress-percent', `${clamped}%`);
    el.style.setProperty('--progress-fill', fillColor);
    el.style.setProperty('--progress-track-bg', barBg);
    el.style.setProperty('--progress-radius', radius);
    el.style.setProperty('--progress-height', barHeight);
  }, [clamped, fillColor, barBg, radius, barHeight]);

  return (
    <div
      aria-label={label ?? 'progress'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      className={styles.container}
      ref={barRef}
    >
      {label && (
        <div className={styles.labelRow}>
          <Text fontSize="0.75rem" color={tokens.colors.font.secondary}>
            {label}
          </Text>
          <div className={styles.labelRight}>
            {title && (
              <Text fontSize="0.75rem" color={tokens.colors.font.secondary}>
                {title}
              </Text>
            )}
            <Text fontSize="0.75rem" color={tokens.colors.font.secondary}>
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

