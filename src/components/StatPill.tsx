import { Text } from '@aws-amplify/ui-react';
import styles from './StatPill.module.css';

interface StatPillProps {
  iconSrc: string;
  /** Short label to display inside the pill. */
  label: string;
  /** Optional value displayed after a dot separator. */
  value?: string;
  /** Readable label for screen readers. */
  ariaLabel: string;
  /** Trigger scale animation on value change. */
  animate?: boolean;
}

export function StatPill({
  iconSrc,
  label,
  value,
  ariaLabel,
  animate = false,
}: StatPillProps) {
  const text = value ? `${label} • ${value}` : label;
  return (
    <div
      className={`${styles.pill} ${animate ? styles.pillPulse : ''}`}
      aria-label={ariaLabel}
    >
      <img
        src={iconSrc}
        alt=""
        aria-hidden="true"
        className={styles.icon}
      />
      <Text as="span" className={styles.text} title={text}>
        {text}
      </Text>
    </div>
  );
}

export default StatPill;
