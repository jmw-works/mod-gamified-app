/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface ProgressContextValue {
  xp: number;
  level: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  awardXP: (amount: number) => void;
  markSectionComplete: (section: number) => void;
  markCampaignComplete: (campaignId: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

interface ProviderProps {
  initialXP?: number;
  initialStreak?: number;
  initialCompletedSections?: number[];
  initialCompletedCampaigns?: string[];
  children: ReactNode;
}

const XP_PER_LEVEL = 100;

export function ProgressProvider({
  initialXP = 0,
  initialStreak = 0,
  initialCompletedSections = [],
  initialCompletedCampaigns = [],
  children,
}: ProviderProps) {
  const [xp, setXP] = useState(initialXP);
  const [streak, setStreak] = useState(initialStreak);
  const [completedSections, setCompletedSections] = useState<number[]>(initialCompletedSections);
  const [completedCampaigns, setCompletedCampaigns] = useState<string[]>(initialCompletedCampaigns);

  // Sync when props change
  useEffect(() => setXP(initialXP), [initialXP]);
  useEffect(() => setStreak(initialStreak), [initialStreak]);
  useEffect(() => setCompletedSections(initialCompletedSections), [initialCompletedSections]);
  useEffect(() => setCompletedCampaigns(initialCompletedCampaigns), [initialCompletedCampaigns]);

  const level = useMemo(() => Math.floor(xp / XP_PER_LEVEL) + 1, [xp]);

  const awardXP = (amount: number) => setXP((prev) => prev + amount);
  const markSectionComplete = (section: number) =>
    setCompletedSections((prev) => (prev.includes(section) ? prev : [...prev, section]));
  const markCampaignComplete = (campaignId: string) =>
    setCompletedCampaigns((prev) => (prev.includes(campaignId) ? prev : [...prev, campaignId]));

  const value: ProgressContextValue = {
    xp,
    level,
    streak,
    completedSections,
    completedCampaigns,
    awardXP,
    markSectionComplete,
    markCampaignComplete,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

export default ProgressContext;
