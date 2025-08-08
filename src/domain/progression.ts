import { getLevelFromXP } from '../utils/xp';

export interface ProgressState {
  xp: number;
  streak: number;
  completedSections: number[];
  completedCampaigns: string[];
  answeredQuestions: string[];
  lastBlazeAt: string | null;
}

export const XP_FOR_SECTION = 40;
export const XP_FOR_CAMPAIGN = 150;

function startOfDay(d: Date) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

export function awardXPIfEligible(
  state: ProgressState,
  amount: number,
  now = new Date(),
): ProgressState {
  let { streak, lastBlazeAt, xp } = state;
  const todayStart = startOfDay(now);
  const last = lastBlazeAt ? new Date(lastBlazeAt) : null;
  if (!last) {
    streak = 1;
  } else {
    const lastStart = startOfDay(last);
    const diff = Math.floor((todayStart.getTime() - lastStart.getTime()) / 86400000);
    if (diff === 1) streak = Math.max(1, streak) + 1;
    else if (diff > 1) streak = 1;
    else streak = Math.max(1, streak);
  }
  lastBlazeAt = now.toISOString();
  xp += amount;
  return { ...state, xp, streak, lastBlazeAt };
}

export function computeLevelFromXP(xp: number): number {
  return getLevelFromXP(xp);
}

export function markQuestionAnswered(
  state: ProgressState,
  questionId: string,
  isCorrect: boolean,
  xp = 0,
): { state: ProgressState; awardedXP: number } {
  if (!isCorrect || state.answeredQuestions.includes(questionId)) {
    return { state, awardedXP: 0 };
  }
  const newState = awardXPIfEligible(state, xp);
  return {
    state: {
      ...newState,
      answeredQuestions: [...newState.answeredQuestions, questionId],
    },
    awardedXP: xp,
  };
}

export function computeSectionCompletion(
  state: ProgressState,
  sectionNumber: number,
): { state: ProgressState; awardedXP: number } {
  if (state.completedSections.includes(sectionNumber)) {
    return { state, awardedXP: 0 };
  }
  const newState = awardXPIfEligible(state, XP_FOR_SECTION);
  return {
    state: {
      ...newState,
      completedSections: [...newState.completedSections, sectionNumber],
    },
    awardedXP: XP_FOR_SECTION,
  };
}

export function computeCampaignCompletion(
  state: ProgressState,
  campaignId: string,
): { state: ProgressState; awardedXP: number } {
  if (state.completedCampaigns.includes(campaignId)) {
    return { state, awardedXP: 0 };
  }
  const newState = awardXPIfEligible(state, XP_FOR_CAMPAIGN);
  return {
    state: {
      ...newState,
      completedCampaigns: [...newState.completedCampaigns, campaignId],
    },
    awardedXP: XP_FOR_CAMPAIGN,
  };
}

export function canUnlock<T>(id: T, completed: Set<T> | T[], ordered: T[]): boolean {
  const completedSet = completed instanceof Set ? completed : new Set(completed);
  const idx = ordered.indexOf(id);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!completedSet.has(ordered[i])) return false;
  }
  return true;
}
