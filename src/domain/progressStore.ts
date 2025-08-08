import type { ProgressState } from './progression';

const STORAGE_KEY = 'guestProgress';

export function getProgress(): ProgressState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw) as ProgressState;
      return {
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        completedSections: Array.isArray(data.completedSections) ? data.completedSections : [],
        completedCampaigns: Array.isArray(data.completedCampaigns) ? data.completedCampaigns : [],
        answeredQuestions: Array.isArray(data.answeredQuestions) ? data.answeredQuestions : [],
        lastBlazeAt: data.lastBlazeAt ?? null,
      };
    } catch {
      /* ignore */
    }
  }
  return {
    xp: 0,
    streak: 0,
    completedSections: [],
    completedCampaigns: [],
    answeredQuestions: [],
    lastBlazeAt: null,
  };
}

export function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
