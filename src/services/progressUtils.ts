import {
  listUserProgress,
  createUserProgress,
  updateUserProgress,
  listSectionProgress,
  createSectionProgress,
  updateSectionProgress,
  listCampaignProgress,
  createCampaignProgress,
  updateCampaignProgress,
} from './progressService';
import { getLevelFromXP, xpForLevel } from '../utils/xp';
import type { Schema } from '../../amplify/data/resource';

const STORAGE_KEY = 'guestProgress';

export interface StoredProgress {
  xp: number;
  streak: number;
  answeredQuestions: string[];
  completedSections: number[];
  completedCampaigns: string[];
  lastBlazeAt: string | null;
  sectionProgress?: Record<string, {
    answeredQuestionIds?: string[];
    correctCount?: number;
    completed?: boolean;
  }>;
}

export function getLocalProgress(): StoredProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      answeredQuestions: Array.isArray(parsed.answeredQuestions)
        ? parsed.answeredQuestions.filter((id: unknown): id is string => typeof id === 'string')
        : [],
      completedSections: Array.isArray(parsed.completedSections)
        ? parsed.completedSections.filter((n: unknown): n is number => typeof n === 'number')
        : [],
      completedCampaigns: Array.isArray(parsed.completedCampaigns)
        ? parsed.completedCampaigns.filter((id: unknown): id is string => typeof id === 'string')
        : [],
      lastBlazeAt: typeof parsed.lastBlazeAt === 'string' ? parsed.lastBlazeAt : null,
      sectionProgress:
        typeof parsed.sectionProgress === 'object' && parsed.sectionProgress
          ? (parsed.sectionProgress as Record<string, {
              answeredQuestionIds?: string[];
              correctCount?: number;
              completed?: boolean;
            }>)
          : {},
    };
  } catch {
    return null;
  }
}

export function setLocalProgress(data: StoredProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

export function clearLocalProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export interface ServerProgress {
  user: Schema['UserProgress']['type'];
  sections: Schema['SectionProgress']['type'][];
  campaigns: Schema['CampaignProgress']['type'][];
}

export async function getServerProgress(userId: string): Promise<ServerProgress> {
  const uRes = await listUserProgress({
    filter: { userId: { eq: userId } },
    selectionSet: ['id', 'totalXP', 'answeredQuestions', 'completedSections'],
  });
  let user = uRes.data?.[0] as Schema['UserProgress']['type'] | undefined;
  if (!user) {
    const created = await createUserProgress({ userId });
    user = (created as { data?: Schema['UserProgress']['type'] }).data as Schema['UserProgress']['type'];
  }

  const sRes = await listSectionProgress({
    filter: { userId: { eq: userId } },
    selectionSet: ['id', 'sectionId', 'answeredQuestionIds', 'correctCount', 'completed'],
  });
  const cRes = await listCampaignProgress({
    filter: { userId: { eq: userId } },
    selectionSet: ['id', 'campaignId', 'completed'],
  });

  return { user, sections: sRes.data ?? [], campaigns: cRes.data ?? [] };
}

export interface MergedProgress {
  xp: number;
  answeredQuestions: string[];
  completedSections: number[];
  completedCampaigns: string[];
  sectionProgress?: Record<string, {
    answeredQuestionIds?: string[];
    correctCount?: number;
    completed?: boolean;
  }>;
  newXP: number;
  newSections: number[];
  newCampaigns: string[];
  userProgressId: string;
}

export function mergeProgress(
  local: StoredProgress,
  server: { xp: number; answeredQuestions: string[]; completedSections: number[]; completedCampaigns: string[]; sectionProgress?: Record<string, { answeredQuestionIds?: string[]; correctCount?: number; completed?: boolean }>;
    userProgressId: string; }
): MergedProgress {
  const answered = new Set(server.answeredQuestions);
  local.answeredQuestions.forEach((id) => answered.add(id));

  const sections = new Set(server.completedSections);
  local.completedSections.forEach((n) => sections.add(n));

  const campaigns = new Set(server.completedCampaigns);
  local.completedCampaigns.forEach((c) => campaigns.add(c));

  const newSections = local.completedSections.filter((s) => !server.completedSections.includes(s));
  const newCampaigns = local.completedCampaigns.filter((c) => !server.completedCampaigns.includes(c));

  const mergedSectionProgress: Record<string, {
    answeredQuestionIds?: string[];
    correctCount?: number;
    completed?: boolean;
  }> = { ...(server.sectionProgress ?? {}) };
  for (const [sid, val] of Object.entries(local.sectionProgress ?? {})) {
    const existing = mergedSectionProgress[sid] ?? { answeredQuestionIds: [], correctCount: 0, completed: false };
    const answeredSet = new Set([...(existing.answeredQuestionIds ?? []), ...(val.answeredQuestionIds ?? [])]);
    mergedSectionProgress[sid] = {
      answeredQuestionIds: Array.from(answeredSet),
      correctCount: (existing.correctCount ?? 0) + (val.correctCount ?? 0),
      completed: Boolean(existing.completed || val.completed),
    };
  }

  return {
    xp: server.xp + local.xp,
    answeredQuestions: Array.from(answered),
    completedSections: Array.from(sections),
    completedCampaigns: Array.from(campaigns),
    sectionProgress: mergedSectionProgress,
    newXP: local.xp,
    newSections,
    newCampaigns,
    userProgressId: server.userProgressId,
  };
}

export async function saveServerProgress(userId: string, merged: MergedProgress): Promise<void> {
  await updateUserProgress({
    id: merged.userProgressId,
    totalXP: merged.xp,
    answeredQuestions: merged.answeredQuestions,
    completedSections: merged.completedSections,
  });

  for (const [sectionId, val] of Object.entries(merged.sectionProgress ?? {})) {
    const res = await listSectionProgress({
      filter: { and: [{ userId: { eq: userId } }, { sectionId: { eq: sectionId } }] },
      selectionSet: ['id', 'answeredQuestionIds', 'correctCount', 'completed'],
    });
    const row = res.data?.[0];
    if (row) {
      const ans = Array.from(new Set([...(row.answeredQuestionIds ?? []), ...(val.answeredQuestionIds ?? [])]));
      await updateSectionProgress({
        id: row.id,
        answeredQuestionIds: ans,
        correctCount: (row.correctCount ?? 0) + (val.correctCount ?? 0),
        completed: row.completed || val.completed,
      });
    } else {
      await createSectionProgress({
        userId,
        sectionId,
        answeredQuestionIds: val.answeredQuestionIds ?? [],
        correctCount: val.correctCount ?? 0,
        completed: val.completed ?? false,
      });
    }
  }

  for (const campaignId of merged.completedCampaigns) {
    const res = await listCampaignProgress({
      filter: { and: [{ userId: { eq: userId } }, { campaignId: { eq: campaignId } }] },
      selectionSet: ['id', 'completed'],
    });
    const row = res.data?.[0];
    if (row) {
      if (!row.completed) await updateCampaignProgress({ id: row.id, completed: true });
    } else {
      await createCampaignProgress({ userId, campaignId, completed: true });
    }
  }
}

export const computeLevel = getLevelFromXP;
export const xpToNext = xpForLevel;
