/* eslint react-refresh/only-export-components: off */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getLevelFromXP } from '../utils/xp';
import type { HandleAnswer } from '../types/QuestionTypes';
import type {
  Progress,
  ProgressEvent,
  ProgressEventListener,
} from '../types/ProgressTypes';

const ProgressContext = createContext<Progress | undefined>(undefined);

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

const STORAGE_KEY = 'guestProgress';
const XP_FOR_SECTION = 40;
const XP_FOR_CAMPAIGN = 150;

function startOfDay(d: Date) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

export function ProgressProvider({ userId, children }: ProviderProps) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [lastBlazeAt, setLastBlazeAt] = useState<string | null>(null);

  const listeners = useRef(new Set<ProgressEventListener>());
  const emit = useCallback((event: ProgressEvent) => {
    listeners.current.forEach((fn) => fn(event));
  }, []);
  const subscribe = useCallback((fn: ProgressEventListener) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (typeof data.xp === 'number') setXP(data.xp);
        if (typeof data.streak === 'number') setStreak(data.streak);
        if (Array.isArray(data.completedSections))
          setCompletedSections(data.completedSections);
        if (Array.isArray(data.completedCampaigns))
          setCompletedCampaigns(data.completedCampaigns);
        if (Array.isArray(data.answeredQuestions))
          setAnsweredQuestions(data.answeredQuestions);
        if (typeof data.lastBlazeAt === 'string') setLastBlazeAt(data.lastBlazeAt);
      } catch {
        /* ignore */
      }
    }
  }, [userId]);

  useEffect(() => {
    const data = {
      xp,
      streak,
      completedSections,
      completedCampaigns,
      answeredQuestions,
      lastBlazeAt,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [xp, streak, completedSections, completedCampaigns, answeredQuestions, lastBlazeAt]);

  const awardXP = useCallback(
    (amount: number) => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const last = lastBlazeAt ? new Date(lastBlazeAt) : null;
      let newStreak = streak;
      if (!last) newStreak = 1;
      else {
        const lastStart = startOfDay(last);
        const diff = Math.floor((todayStart.getTime() - lastStart.getTime()) / 86400000);
        if (diff === 1) newStreak = Math.max(1, newStreak) + 1;
        else if (diff > 1) newStreak = 1;
        else newStreak = Math.max(1, newStreak);
      }
      const newLast = now.toISOString();
      setStreak(newStreak);
      setLastBlazeAt(newLast);

      setXP((prev) => {
        const newXP = prev + amount;
        const prevLevel = getLevelFromXP(prev);
        const newLevel = getLevelFromXP(newXP);
        if (newLevel > prevLevel) emit({ type: 'level', level: newLevel, xp: amount });
        return newXP;
      });
    },
    [lastBlazeAt, streak, emit]
  );

  const markSectionComplete = useCallback(
    async (section: number) => {
      setCompletedSections((prev) => {
        if (prev.includes(section)) return prev;
        emit({ type: 'section', xp: XP_FOR_SECTION });
        awardXP(XP_FOR_SECTION);
        return [...prev, section];
      });
    },
    [emit, awardXP]
  );

  const markCampaignComplete = useCallback(
    async (campaignId: string) => {
      setCompletedCampaigns((prev) => {
        if (prev.includes(campaignId)) return prev;
        emit({ type: 'campaign', xp: XP_FOR_CAMPAIGN });
        awardXP(XP_FOR_CAMPAIGN);
        window.dispatchEvent(new Event('campaignProgressChanged'));
        return [...prev, campaignId];
      });
    },
    [emit, awardXP]
  );

  const handleAnswer: HandleAnswer = useCallback(
    ({ questionId, isCorrect, xp: earnedXP = 0 }) => {
      setAnsweredQuestions((prev) => {
        if (isCorrect && !prev.includes(questionId)) {
          awardXP(earnedXP);
          return [...prev, questionId];
        }
        return prev;
      });
    },
    [awardXP]
  );

  const level = useMemo(() => getLevelFromXP(xp), [xp]);
  const title = 'Adventurer';

  const value: Progress = {
    xp,
    level,
    streak,
    completedSections,
    completedCampaigns,
    answeredQuestions,
    title,
    awardXP,
    markSectionComplete,
    markCampaignComplete,
    handleAnswer,
    subscribe,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

export default ProgressContext;
