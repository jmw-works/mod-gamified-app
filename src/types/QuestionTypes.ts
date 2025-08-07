/**
 * Shared quiz question type definitions.
 */

export interface Question {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  educationalText?: string;
  correctAnswer: string;
  hint?: string;
  explanation?: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface SubmitArgs {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  xp?: number;
  sectionId?: string;
}

export interface HandleAnswer {
  (args: SubmitArgs): void | Promise<void>;
}

