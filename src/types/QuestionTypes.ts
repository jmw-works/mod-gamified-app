/**
 * Shared quiz question and answer type definitions.
 */

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  educationalText?: string;
  answers: Answer[];
}

export interface SubmitArgs {
  questionId: string;
  isCorrect: boolean;
  xp?: number;
}

export interface HandleAnswer {
  (args: SubmitArgs): void | Promise<void>;
}

