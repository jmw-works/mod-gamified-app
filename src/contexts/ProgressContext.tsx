import { createContext, type ReactNode } from 'react';

export interface ProgressContextValue {
  level: number;
  currentXP: number;
  maxXP: number;
  percentage: number;
  completedSectionsCount: number;
  dailyStreak: number;
}

export const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

export function ProgressProvider({
  value,
  children,
}: {
  value: ProgressContextValue;
  children: ReactNode;
}) {
  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}
