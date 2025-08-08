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
import type { HandleAnswer } from '../types/QuestionTypes';
import type {
  Progress,
  ProgressEvent,
  ProgressEventListener,
} from '../types/ProgressTypes';
import type { ProgressState } from '../domain/progression';
import {
  awardXPIfEligible,
  computeCampaignCompletion,
  computeLevelFromXP,
  computeSectionCompletion,
  markQuestionAnswered,
} from '../domain/progression';
import { getProgress, saveProgress } from '../domain/progressStore';

const ProgressContext = createContext<Progress | undefined>(undefined);

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

export function ProgressProvider({ userId, children }: ProviderProps) {
  const [state, setState] = useState<ProgressState>(() => getProgress());

  const listeners = useRef(new Set<ProgressEventListener>());
  const emit = useCallback((event: ProgressEvent) => {
    listeners.current.forEach((fn) => fn(event));
  }, []);
  const subscribe = useCallback((fn: ProgressEventListener) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  useEffect(() => {
    setState(getProgress());
  }, [userId]);

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const awardXP = useCallback(
    (amount: number) => {
      setState((prev) => {
        const prevLevel = computeLevelFromXP(prev.xp);
        const newState = awardXPIfEligible(prev, amount);
        const newLevel = computeLevelFromXP(newState.xp);
        if (newLevel > prevLevel) emit({ type: 'level', level: newLevel, xp: amount });
        return newState;
      });
    },
    [emit],
  );

  const markSectionComplete = useCallback(
    async (section: number) => {
      setState((prev) => {
        const prevLevel = computeLevelFromXP(prev.xp);
        const { state: s, awardedXP } = computeSectionCompletion(prev, section);
        const newLevel = computeLevelFromXP(s.xp);
        if (awardedXP) {
          emit({ type: 'section', xp: awardedXP });
          if (newLevel > prevLevel)
            emit({ type: 'level', level: newLevel, xp: awardedXP });
        }
        return s;
      });
    },
    [emit],
  );

  const markCampaignComplete = useCallback(
    async (campaignId: string) => {
      setState((prev) => {
        const prevLevel = computeLevelFromXP(prev.xp);
        const { state: s, awardedXP } = computeCampaignCompletion(prev, campaignId);
        const newLevel = computeLevelFromXP(s.xp);
        if (awardedXP) {
          emit({ type: 'campaign', xp: awardedXP });
          if (newLevel > prevLevel)
            emit({ type: 'level', level: newLevel, xp: awardedXP });
          window.dispatchEvent(new Event('campaignProgressChanged'));
        }
        return s;
      });
    },
    [emit],
  );

  const handleAnswer: HandleAnswer = useCallback(
    ({ questionId, isCorrect, xp: earnedXP = 0 }) => {
      setState((prev) => {
        const prevLevel = computeLevelFromXP(prev.xp);
        const { state: s, awardedXP } = markQuestionAnswered(
          prev,
          questionId,
          isCorrect,
          earnedXP,
        );
        const newLevel = computeLevelFromXP(s.xp);
        if (awardedXP && newLevel > prevLevel)
          emit({ type: 'level', level: newLevel, xp: awardedXP });
        return s;
      });
    },
    [emit],
  );

  const level = useMemo(() => computeLevelFromXP(state.xp), [state.xp]);
  const title = 'Adventurer';

  const value: Progress = {
    xp: state.xp,
    level,
    streak: state.streak,
    completedSections: state.completedSections,
    completedCampaigns: state.completedCampaigns,
    answeredQuestions: state.answeredQuestions,
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
