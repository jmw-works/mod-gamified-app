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
import {
  listUserProgress,
  createUserProgress,
  updateUserProgress,
  listCampaignProgress,
  createCampaignProgress,
  updateCampaignProgress,
} from '../services/progressService';
import type { Schema } from '../../amplify/data/resource';
import { getLevelFromXP } from '../utils/xp';

type ProgressListener = (state: {
  xp: number;
  level: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  answeredQuestions: string[];
}) => void;

interface ProgressContextValue {
  xp: number;
  level: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  answeredQuestions: string[];
  awardXP: (amount: number) => void;
  markSectionComplete: (section: number) => void;
  markCampaignComplete: (campaignId: string) => void;
  markQuestionAnswered: (questionId: string) => void;
  subscribe: (listener: ProgressListener) => () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

const XP_PER_LEVEL = 100;
type UserProgressModel = Schema['UserProgress']['type'];

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
  const [progressId, setProgressId] = useState<string | null>(null);

  // Load progress from backend
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await listUserProgress({
          filter: { userId: { eq: userId } },
          selectionSet: [
            'id',
            'totalXP',
            'dailyStreak',
            'completedSections',
            'answeredQuestions',
            'lastBlazeAt',
          ],
        });

        let row: UserProgressModel | null = (res.data ?? [])[0] ?? null;

        if (!row) {
          const created = await createUserProgress({ userId });
          row =
            (created as { data?: UserProgressModel }).data ??
            ((created as unknown) as UserProgressModel);
        }

        if (cancelled || !row) return;

        setProgressId(row.id);
        setXP(row.totalXP ?? 0);
        setStreak(row.dailyStreak ?? 0);
        const answered = (row.answeredQuestions ?? []).filter(
          (id): id is string => typeof id === 'string'
        );
        setAnsweredQuestions(answered);
        setLastBlazeAt(row.lastBlazeAt ?? null);

        const sections = (row.completedSections ?? []).filter(
          (n): n is number => typeof n === 'number'
        );
        setCompletedSections(sections);

        const cpRes = await listCampaignProgress({
          filter: { and: [{ userId: { eq: userId } }, { completed: { eq: true } }] },
          selectionSet: ['campaignId'],
        });

        if (!cancelled) {
          setCompletedCampaigns(cpRes.data?.map((c) => c.campaignId) ?? []);
        }
      } catch (e) {
        console.warn('Failed to load progress', e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const level = useMemo(() => getLevelFromXP(xp, XP_PER_LEVEL), [xp]);

  const awardXP = useCallback(
    (amount: number) => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const last = lastBlazeAt ? new Date(lastBlazeAt) : null;
      let newStreak = streak;
      if (!last) newStreak = 1;
      else {
        const lastStart = startOfDay(last);
        const diff = Math.floor(
          (todayStart.getTime() - lastStart.getTime()) / 86400000
        );
        if (diff === 1) newStreak = Math.max(1, newStreak) + 1;
        else if (diff > 1) newStreak = 1;
        else newStreak = Math.max(1, newStreak);
      }
      const newLast = now.toISOString();
      setStreak(newStreak);
      setLastBlazeAt(newLast);

      setXP((prev) => {
        const newXP = prev + amount;
        if (progressId) {
          updateUserProgress({
            id: progressId,
            totalXP: newXP,
            dailyStreak: newStreak,
            lastBlazeAt: newLast,
          }).catch((e) => console.warn('Failed to persist XP', e));
        }
        return newXP;
      });
    },
    [progressId, lastBlazeAt, streak]
  );

  const markSectionComplete = useCallback(
    (section: number) => {
      setCompletedSections((prev) => {
        if (prev.includes(section)) return prev;
        const updated = [...prev, section];
        if (progressId) {
          updateUserProgress({
            id: progressId,
            completedSections: updated,
          }).catch((e) => console.warn('Failed to persist section', e));
        }
        return updated;
      });
    },
    [progressId]
  );

  const markQuestionAnswered = useCallback(
    (questionId: string) => {
      setAnsweredQuestions((prev) => {
        if (prev.includes(questionId)) return prev;
        const updated = [...prev, questionId];
        if (progressId) {
          updateUserProgress({
            id: progressId,
            answeredQuestions: updated,
          }).catch((e) => console.warn('Failed to persist answer', e));
        }
        return updated;
      });
    },
    [progressId]
  );

  const markCampaignComplete = useCallback(
    async (campaignId: string) => {
      setCompletedCampaigns((prev) =>
        prev.includes(campaignId) ? prev : [...prev, campaignId]
      );
      try {
        const res = await listCampaignProgress({
          filter: {
            and: [
              { userId: { eq: userId } },
              { campaignId: { eq: campaignId } },
            ],
          },
          selectionSet: ['id', 'completed'],
        });
        const row = res.data?.[0];
        if (row) {
          if (!row.completed)
            await updateCampaignProgress({ id: row.id, completed: true });
        } else {
          await createCampaignProgress({ userId, campaignId, completed: true });
        }
      } catch (e) {
        console.warn('Failed to persist campaign progress', e);
      }
    },
    [userId]
  );

  const listeners = useRef(new Set<ProgressListener>());

  const subscribe = useCallback((fn: ProgressListener) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  useEffect(() => {
    const snapshot = {
      xp,
      level,
      streak,
      completedSections,
      completedCampaigns,
      answeredQuestions,
    };
    listeners.current.forEach((fn) => fn(snapshot));
  }, [xp, level, streak, completedSections, completedCampaigns, answeredQuestions]);

  const value: ProgressContextValue = {
    xp,
    level,
    streak,
    completedSections,
    completedCampaigns,
    answeredQuestions,
    awardXP,
    markSectionComplete,
    markCampaignComplete,
    markQuestionAnswered,
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

