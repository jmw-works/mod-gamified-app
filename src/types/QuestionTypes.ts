/**
 * Shared quiz question type definitions.
 */

export interface Question {
  id: string;
  text: string;
  section: number;
  xpValue?: number | null;
  educationalText?: string;
  educationalRichText?: string;
  correctAnswer: string;
  hint?: string;
  explanation?: string;
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

// Extended question model with optional user answer state
export interface QuestionWithAnswers extends Question {
  userAnswer?: string;
  isCorrect?: boolean;
}

