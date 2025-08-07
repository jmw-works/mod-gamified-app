// src/components/Header.tsx
import { forwardRef, useEffect } from 'react';
import { Button, Text } from '@aws-amplify/ui-react';
import { useProgress } from '../context/ProgressContext';
import styles from './Header.module.css';

export interface HeaderProps {
  signOut?: () => void;

  /** Controls overall header height (px). Default 140. */
  height?: number;
  /** Controls logo size (px square). Default 95. */
  logoSize?: number;
  /** Controls pill icon size (px square). Default 75. */
  iconSize?: number;
  /** Controls title font size (rem). Default 1.75. */
  titleSizeRem?: number;

  /** Color for the main label text inside each pill (e.g., "Level 3"). Default #ffffff. */
  pillLabelColor?: string;
  /** Color for the sublabel text inside each pill (e.g., "250/1000 XP"). Default #e0e0e0. */
  pillSubLabelColor?: string;
}


function StatPill({
  iconSrc,
  iconAlt,
  label,
  sublabel,
}: {
  iconSrc: string;
  iconAlt: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className={styles.pill}>
      <img src={iconSrc} alt={iconAlt} className={styles.pillIcon} />
      <div className={styles.pillText}>
        <Text className={styles.pillLabel}>{label}</Text>
        {sublabel && <Text className={styles.pillSublabel}>{sublabel}</Text>}
      </div>
    </div>
  );
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      signOut,
      height = 140,
      logoSize = 95,
      iconSize = 75,
      titleSizeRem = 1.75,
      pillLabelColor = '#ffffff',
      pillSubLabelColor = '#e0e0e0',
    },
    ref
  ) => {
    // Daily streak now comes directly from ProgressContext (updated via awardXP)
    const { xp, level, streak, completedSections } = useProgress();
    const maxXP = level * 100;
    const xpSub = `${xp}/${maxXP} XP`;
    const bountiesCompleted = completedSections.length;

    useEffect(() => {
      const root = document.documentElement;
      root.style.setProperty('--header-height', `${height}px`);
      root.style.setProperty('--logo-size', `${logoSize}px`);
      root.style.setProperty('--pill-icon-size', `${iconSize}px`);
      root.style.setProperty('--title-size', `${titleSizeRem}rem`);
      root.style.setProperty('--pill-label-color', pillLabelColor);
      root.style.setProperty('--pill-sublabel-color', pillSubLabelColor);
    }, [
      height,
      logoSize,
      iconSize,
      titleSizeRem,
      pillLabelColor,
      pillSubLabelColor,
    ]);

    return (
      <header ref={ref} className={styles.header}>
        {/* Left: logo + title */}
        <div className={styles.logoTitle}>
          <img
            src="/raccoon_bounty.png"
            alt="Raccoon Bounty"
            className={styles.logo}
          />
          <Text as="h1" className={styles.title}>
            Raccoon Bounty |{' '}
            <span className={styles.titleHighlight}>Treasure Hunting Gym</span>
          </Text>
        </div>

        {/* Center: stat pills */}
        <div className={styles.pills}>
          <StatPill
            iconSrc="/raccoon.png"
            iconAlt="Experience"
            label={`Level ${level}`}
            sublabel={xpSub}
          />
          <StatPill
            iconSrc="/totem.png"
            iconAlt="Bounties completed"
            label={`${bountiesCompleted} completed`}
            sublabel="bounties"
          />
          <StatPill
            iconSrc="/blaze.png"
            iconAlt="Daily streak"
            label={`${streak} day blaze`}
            sublabel="daily streak"
          />
        </div>

        {/* Right: actions */}
        <div className={styles.actions}>
          <Button
            onClick={signOut}
            variation="primary"
            size="small"
            className={styles.signOutButton}
          >
            Sign Out
          </Button>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';






