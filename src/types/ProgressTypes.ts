// src/types/ProgressTypes.ts
export type Progress = {
  id: string;
  userId: string;
  totalXP: number;
  answeredQuestions: string[];
  completedSections: number[];
  dailyStreak: number;
  lastBlazeAt: string | null;
};

export function createEmptyProgress(userId: string): Progress {
  return {
    id: 'temp',
    userId: userId || 'unknown',
    totalXP: 0,
    answeredQuestions: [],
    completedSections: [],
    dailyStreak: 0,
    lastBlazeAt: null,
  };
}

