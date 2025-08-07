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

export type ProgressEvent =
  | { type: 'section'; xp: number }
  | { type: 'campaign'; xp: number }
  | { type: 'level'; xp: number; level: number };

type ProgressEventListener = (event: ProgressEvent) => void;

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
  subscribe: (listener: ProgressEventListener) => () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

const XP_FOR_SECTION = 40;
const XP_FOR_CAMPAIGN = 150;

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
  const [titles, setTitles] = useState<Schema['Title']['type'][]>([]);
  const [progressId, setProgressId] = useState<string | null>(null);

  const listeners = useRef(new Set<ProgressEventListener>());

  const emit = useCallback((event: ProgressEvent) => {
    listeners.current.forEach((fn) => fn(event));
  }, []);

  const subscribe = useCallback((fn: ProgressEventListener) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

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
          row = (created as { data?: UserProgressModel }).data ?? (created as unknown as UserProgressModel);
        }

        if (cancelled || !row) return;

        setProgressId(row.id);
        setXP(row.totalXP ?? 0);
        setStreak(row.dailyStreak ?? 0);
        setLastBlazeAt(row.lastBlazeAt ?? null);

        setAnsweredQuestions((row.answeredQuestions ?? []).filter((id): id is string => typeof id === 'string'));
        setCompletedSections((row.completedSections ?? []).filter((n): n is number => typeof n === 'number'));

        const cpRes = await listCampaignProgress({
          filter: { and: [{ userId: { eq: userId } }, { completed: { eq: true } }] },
          selectionSet: ['campaignId'],
        });

        if (!cancelled) {
          setCompletedCampaigns(cpRes.data?.map((c) => c.campaignId) ?? []);

          // After loading server-side progress, merge any guest progress stored locally
          const guestRaw = localStorage.getItem('guestProgress');
          if (guestRaw) {
            try {
              const guest = JSON.parse(guestRaw);

              // Extract and sanitize guest values
              const guestXP = typeof guest.xp === 'number' ? guest.xp : 0;
              const guestAnswered: string[] = Array.isArray(guest.answeredQuestions)
                ? guest.answeredQuestions.filter((id: unknown): id is string => typeof id === 'string')
                : [];
              const guestSections: number[] = Array.isArray(guest.completedSections)
                ? guest.completedSections.filter((n: unknown): n is number => typeof n === 'number')
                : [];
              const guestCampaigns: string[] = Array.isArray(guest.completedCampaigns)
                ? guest.completedCampaigns.filter((id: unknown): id is string => typeof id === 'string')
                : [];

              // Determine new merged values and track which items are newly added
              const prevXP = row.totalXP ?? 0;
              const mergedXP = prevXP + guestXP;

              const currentAnswered = new Set(
                (row.answeredQuestions ?? []).filter((id): id is string => typeof id === 'string')
              );
              const currentSections = new Set(
                (row.completedSections ?? []).filter((n): n is number => typeof n === 'number')
              );
              const currentCampaigns = new Set(cpRes.data?.map((c) => c.campaignId) ?? []);

              guestAnswered.forEach((id) => currentAnswered.add(id));
              guestSections.forEach((n) => currentSections.add(n));
              guestCampaigns.forEach((id) => currentCampaigns.add(id));

              const mergedAnswered = Array.from(currentAnswered);
              const mergedSections = Array.from(currentSections);
              const mergedCampaigns = Array.from(currentCampaigns);

              setXP(mergedXP);
              setAnsweredQuestions(mergedAnswered);
              setCompletedSections(mergedSections);
              setCompletedCampaigns(mergedCampaigns);

              // Persist merged user progress
              await updateUserProgress({
                id: row.id,
                totalXP: mergedXP,
                answeredQuestions: mergedAnswered,
                completedSections: mergedSections,
              });

              // Persist section progress details if provided
              if (guest.sectionProgress && typeof guest.sectionProgress === 'object') {
                for (const [sectionId, raw] of Object.entries(
                  guest.sectionProgress as Record<string, unknown>
                )) {
                  const val = raw as {
                    answeredQuestionIds?: unknown;
                    correctCount?: unknown;
                    completed?: unknown;
                  };
                  try {
                    const spRes = await listSectionProgress({
                      filter: {
                        and: [
                          { userId: { eq: userId } },
                          { sectionId: { eq: sectionId } },
                        ],
                      },
                      selectionSet: ['id', 'answeredQuestionIds', 'correctCount', 'completed'],
                    });
                    const rowSP = spRes.data?.[0];
                    const answered = Array.isArray(val.answeredQuestionIds)
                      ? val.answeredQuestionIds.filter(
                          (id: unknown): id is string => typeof id === 'string'
                        )
                      : [];
                    const correct =
                      typeof val.correctCount === 'number' ? val.correctCount : 0;
                    const completed = Boolean(val.completed);

                    if (rowSP) {
                      const mergedAns = Array.from(
                        new Set([...(rowSP.answeredQuestionIds ?? []), ...answered])
                      );
                      await updateSectionProgress({
                        id: rowSP.id,
                        answeredQuestionIds: mergedAns,
                        correctCount: (rowSP.correctCount ?? 0) + correct,
                        completed: rowSP.completed || completed,
                      });
                    } else {
                      await createSectionProgress({
                        userId,
                        sectionId,
                        answeredQuestionIds: answered,
                        correctCount: correct,
                        completed,
                      });
                    }
                  } catch (err) {
                    console.warn('Failed to merge section progress', err);
                  }
                }
              }

              // Persist campaign completions if needed
              const existingCampaigns = new Set(cpRes.data?.map((c) => c.campaignId) ?? []);
              for (const campaignId of guestCampaigns) {
                if (!existingCampaigns.has(campaignId)) {
                  try {
                    const cRes = await listCampaignProgress({
                      filter: {
                        and: [
                          { userId: { eq: userId } },
                          { campaignId: { eq: campaignId } },
                        ],
                      },
                      selectionSet: ['id', 'completed'],
                    });
                    const existing = cRes.data?.[0];
                    if (existing && !existing.completed)
                      await updateCampaignProgress({ id: existing.id, completed: true });
                    else if (!existing)
                      await createCampaignProgress({ userId, campaignId, completed: true });
                  } catch (err) {
                    console.warn('Failed to merge campaign progress', err);
                  }
                }
              }

              // Emit events to update UI
              const prevLevel = getLevelFromXP(prevXP);
              const newLevel = getLevelFromXP(mergedXP);
              if (newLevel > prevLevel) emit({ type: 'level', level: newLevel, xp: guestXP });

              const newSections = guestSections.filter((s) => !(row.completedSections ?? []).includes(s));
              newSections.forEach(() => emit({ type: 'section', xp: XP_FOR_SECTION }));
              const newCampaigns = guestCampaigns.filter(
                (c) => !cpRes.data?.some((cp) => cp.campaignId === c)
              );
              newCampaigns.forEach(() => emit({ type: 'campaign', xp: XP_FOR_CAMPAIGN }));

              localStorage.removeItem('guestProgress');
              // Optional notification
              try {
                window.dispatchEvent(new Event('guestProgressImported'));
              } catch {
                /* noop */
              }
            } catch (err) {
              console.warn('Failed to merge guest progress', err);
            }
          }
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

  const level = useMemo(() => getLevelFromXP(xp), [xp]);
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

  const awardXP = useCallback((amount: number) => {
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
  }, [progressId, lastBlazeAt, streak, emit]);

  const markQuestionAnswered = useCallback((questionId: string, sectionId?: string, isCorrect?: boolean) => {
    if (isCorrect) {
      setAnsweredQuestions((prev) => {
        if (prev.includes(questionId)) return prev;
        const updated = [...prev, questionId];
        if (progressId) {
          updateUserProgress({ id: progressId, answeredQuestions: updated }).catch((e) =>
            console.warn('Failed to persist answer', e)
          );
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
          const updatedAnswered = answered.includes(questionId) ? answered : [...answered, questionId];
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
  }, [progressId, userId]);

  const handleAnswer: HandleAnswer = useCallback(async ({ questionId, isCorrect, xp = 0, userAnswer = '', sectionId }: SubmitArgs) => {
    try {
      await createUserResponse({ userId, questionId, responseText: userAnswer, isCorrect });
    } catch (e) {
      console.warn('Failed to persist user response', e);
    }

    markQuestionAnswered(questionId, sectionId, isCorrect);

    if (isCorrect && !answeredQuestions.includes(questionId)) {
      awardXP(xp);
    }
  }, [answeredQuestions, awardXP, markQuestionAnswered, userId]);

  const markSectionComplete = useCallback(async (section: number, sectionId?: string) => {
    const alreadyCompleted = completedSections.includes(section);
    if (!alreadyCompleted) {
      setCompletedSections((prev) => [...prev, section]);
      emit({ type: 'section', xp: XP_FOR_SECTION });
      awardXP(XP_FOR_SECTION);
    }

    if (progressId) {
      updateUserProgress({ id: progressId, completedSections: [...completedSections, section] }).catch((e) =>
        console.warn('Failed to persist section', e)
      );
    }

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
        if (row && !row.completed) await updateSectionProgress({ id: row.id, completed: true });
        else if (!row) await createSectionProgress({ userId, sectionId, completed: true });
      } catch (e) {
        console.warn('Failed to persist section progress', e);
      }
    }
  }, [progressId, userId, completedSections, emit, awardXP]);

  const markCampaignComplete = useCallback(async (campaignId: string) => {
    const alreadyCompleted = completedCampaigns.includes(campaignId);
    if (!alreadyCompleted) {
      setCompletedCampaigns((prev) => [...prev, campaignId]);
      emit({ type: 'campaign', xp: XP_FOR_CAMPAIGN });
      awardXP(XP_FOR_CAMPAIGN);
    }

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
      if (row && !row.completed) await updateCampaignProgress({ id: row.id, completed: true });
      else if (!row) await createCampaignProgress({ userId, campaignId, completed: true });
    } catch (e) {
      console.warn('Failed to persist campaign progress', e);
    } finally {
      window.dispatchEvent(new Event('campaignProgressChanged'));
    }
  }, [userId, completedCampaigns, emit, awardXP]);

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

export function GuestProgressProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [lastBlazeAt, setLastBlazeAt] = useState<string | null>(null);
  const [titles, setTitles] = useState<Schema['Title']['type'][]>([]);

  const listeners = useRef(new Set<ProgressEventListener>());

  const emit = useCallback((event: ProgressEvent) => {
    listeners.current.forEach((fn) => fn(event));
  }, []);

  const subscribe = useCallback((fn: ProgressEventListener) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  const STORAGE_KEY = 'guestProgress';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setXP(typeof parsed.xp === 'number' ? parsed.xp : 0);
        setStreak(typeof parsed.streak === 'number' ? parsed.streak : 0);
        setCompletedSections(
          Array.isArray(parsed.completedSections)
            ? parsed.completedSections.filter((n: unknown): n is number => typeof n === 'number')
            : []
        );
        setCompletedCampaigns(
          Array.isArray(parsed.completedCampaigns)
            ? parsed.completedCampaigns.filter((s: unknown): s is string => typeof s === 'string')
            : []
        );
        setAnsweredQuestions(
          Array.isArray(parsed.answeredQuestions)
            ? parsed.answeredQuestions.filter((s: unknown): s is string => typeof s === 'string')
            : []
        );
        setLastBlazeAt(typeof parsed.lastBlazeAt === 'string' ? parsed.lastBlazeAt : null);
      }
    } catch (e) {
      console.warn('Failed to load guest progress', e);
    }
  }, []);

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to persist guest progress', e);
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
    async (section: number, sectionId?: string) => {
      void sectionId;
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
    async ({ questionId, isCorrect, xp: earnedXP = 0 }) => {
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




