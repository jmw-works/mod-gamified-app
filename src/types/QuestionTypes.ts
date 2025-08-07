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
}

export interface SubmitArgs {
  questionId: string;
  responseText: string;
  isCorrect: boolean;
  xp?: number;
  responseText?: string;
  sectionId?: string;
}

export interface HandleAnswer {
  (args: SubmitArgs): void | Promise<void>;
}

