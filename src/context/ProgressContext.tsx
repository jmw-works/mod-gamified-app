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
  listSectionProgress,
  createSectionProgress,
  updateSectionProgress,
} from '../services/progressService';
import { createUserResponse } from '../services/userResponseService';
import type { Schema } from '../../amplify/data/resource';
import { getLevelFromXP } from '../utils/xp';
import type { HandleAnswer, SubmitArgs } from '../types/QuestionTypes';
import { listTitles } from '../services/titleService';

type ProgressListener = (state: {
  xp: number;
  level: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  answeredQuestions: string[];
  title: string;
}) => void;

interface ProgressContextValue {
  xp: number;
  level: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  answeredQuestions: string[];
  title: string;
  awardXP: (amount: number) => void;
  markSectionComplete: (section: number, sectionId?: string) => Promise<void>;
  markCampaignComplete: (campaignId: string) => Promise<void>;
  handleAnswer: HandleAnswer;
  subscribe: (listener: ProgressListener) => () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

const XP_PER_LEVEL = 100;
// XP bonuses for completing major milestones
const SECTION_COMPLETION_XP = 50;
const CAMPAIGN_COMPLETION_XP = 200;
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
  const [titles, setTitles] = useState<Schema['Title']['type'][]>([]);

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
        setLastBlazeAt(row.lastBlazeAt ?? null);

        const answered = (row.answeredQuestions ?? []).filter(
          (id): id is string => typeof id === 'string'
        );
        setAnsweredQuestions(answered);

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

  useEffect(() => {
    let cancelled = false;
    async function loadTitles() {
      try {
        const res = await listTitles({ selectionSet: ['name', 'minLevel'] });
        if (!cancelled) setTitles(res.data ?? []);
      } catch (e) {
        console.warn('Failed to load titles', e);
      }
    }
    loadTitles();
    return () => {
      cancelled = true;
    };
  }, []);

  const level = useMemo(() => getLevelFromXP(xp, XP_PER_LEVEL), [xp]);
  const title = useMemo(() => {
    if (!titles.length) return '';
    let current: Schema['Title']['type'] | null = null;
    for (const t of titles) {
      const min = t.minLevel ?? 0;
      if (level >= min && (!current || min > (current.minLevel ?? 0))) {
        current = t;
      }
    }
    return current?.name ?? '';
  }, [titles, level]);

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
    async (section: number, sectionId?: string) => {
      let alreadyCompleted = completedSections.includes(section);

      setCompletedSections((prev) => {
        if (prev.includes(section)) {
          alreadyCompleted = true;
          return prev;
        }
        const updated = [...prev, section];
        if (progressId) {
          updateUserProgress({
            id: progressId,
            completedSections: updated,
          }).catch((e) => console.warn('Failed to persist section', e));
        }
        return updated;
      });

      if (sectionId) {
        try {
          const res = await listSectionProgress({
            filter: {
              and: [
                { userId: { eq: userId } },
                { sectionId: { eq: sectionId } },
              ],
            },
            selectionSet: ['id', 'completed'],
          });
          const row = res.data?.[0];
          if (row) {
            if (!row.completed)
              await updateSectionProgress({ id: row.id, completed: true });
            else alreadyCompleted = true;
          } else {
            await createSectionProgress({
              userId,
              sectionId,
              completed: true,
            });
          }
        } catch (e) {
          console.warn('Failed to persist section progress', e);
        }
      }

      if (!alreadyCompleted) {
        awardXP(SECTION_COMPLETION_XP);
      }
    },
    [progressId, userId, completedSections, awardXP]
  );

  const markQuestionAnswered = useCallback(
    (questionId: string, sectionId?: string, isCorrect?: boolean) => {
      if (isCorrect) {
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
      }

      if (sectionId) {
        (async () => {
          try {
            const res = await listSectionProgress({
              filter: {
                and: [
                  { userId: { eq: userId } },
                  { sectionId: { eq: sectionId } },
                ],
              },
              selectionSet: ['id', 'answeredQuestionIds', 'correctCount'],
            });
            const row = res.data?.[0];
            const answered = row?.answeredQuestionIds ?? [];
            const updatedAnswered = answered.includes(questionId)
              ? answered
              : [...answered, questionId];
            const newCount = (row?.correctCount ?? 0) + (isCorrect ? 1 : 0);
            if (row) {
              await updateSectionProgress({
                id: row.id,
                answeredQuestionIds: updatedAnswered,
                correctCount: newCount,
              });
            } else {
              await createSectionProgress({
                userId,
                sectionId,
                answeredQuestionIds: [questionId],
                correctCount: isCorrect ? 1 : 0,
                completed: false,
              });
            }
          } catch (e) {
            console.warn('Failed to persist question progress', e);
          }
        })();
      }
    },
    [progressId, userId]
  );

  const handleAnswer: HandleAnswer = useCallback(
    async ({
      questionId,
      isCorrect,
      xp = 0,
      userAnswer = '',
      sectionId,
    }: SubmitArgs) => {
      try {
        await createUserResponse({
          userId,
          questionId,
          responseText: userAnswer,
          isCorrect,
        });
      } catch (e) {
        console.warn('Failed to persist user response', e);
      }

      markQuestionAnswered(questionId, sectionId, isCorrect);

      if (!isCorrect) return;

      const alreadyAnswered = answeredQuestions.includes(questionId);
      if (!alreadyAnswered) {
        awardXP(xp);
      }
    },
    [answeredQuestions, awardXP, markQuestionAnswered, userId]
  );

  const markCampaignComplete = useCallback(
    async (campaignId: string) => {
      let alreadyCompleted = completedCampaigns.includes(campaignId);

      setCompletedCampaigns((prev) => {
        if (prev.includes(campaignId)) {
          alreadyCompleted = true;
          return prev;
        }
        return [...prev, campaignId];
      });
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
          else alreadyCompleted = true;
        } else {
          await createCampaignProgress({ userId, campaignId, completed: true });
        }
      } catch (e) {
        console.warn('Failed to persist campaign progress', e);
      } finally {
        window.dispatchEvent(new Event('campaignProgressChanged'));
      }

      if (!alreadyCompleted) {
        awardXP(CAMPAIGN_COMPLETION_XP);
      }
    },
    [userId, completedCampaigns, awardXP]
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
      title,
    };
    listeners.current.forEach((fn) => fn(snapshot));
  }, [xp, level, streak, completedSections, completedCampaigns, answeredQuestions, title]);

  const value: ProgressContextValue = {
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


