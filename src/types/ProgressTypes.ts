/**
 * Shared progress related type definitions.
 */
import type { HandleAnswer } from './QuestionTypes';

export type ProgressEvent =
  | { type: 'section'; xp: number }
  | { type: 'campaign'; xp: number }
  | { type: 'level'; xp: number; level: number };

export type ProgressEventListener = (event: ProgressEvent) => void;

export interface Progress {
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

export function createEmptyProgress(): Progress {
  return {
    xp: 0,
    level: 0,
    streak: 0,
    completedSections: [],
    completedCampaigns: [],
    answeredQuestions: [],
    title: '',
    awardXP: () => {},
    markSectionComplete: async () => {},
    markCampaignComplete: async () => {},
    handleAnswer: async () => {},
    subscribe: () => () => {},
  };
}
