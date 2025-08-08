import { useEffect, useState, useCallback } from 'react';
import { listCampaigns } from '../services/campaignService';
import {
  listCampaignProgress,
  createCampaignProgress,
  updateCampaignProgress,
} from '../services/progressService';
import { ensureSeedData } from '../utils/seedData';
import { fallbackCampaigns } from '../utils/fallbackContent';

export type UICampaign = {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  infoText?: string | null;
  order: number;
  isActive: boolean;
  locked: boolean;      // derived for UI
  completed: boolean;   // derived from CampaignProgress
  icon?: string | null;
};

type CampaignRow = {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  infoText?: string | null;
  order?: number | null;
  isActive?: boolean | null;
  icon?: string | null;
};

export function useCampaigns(userId?: string | null) {
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Ensure placeholder data exists for development/testing
      await ensureSeedData();

      // 1) fetch all active campaigns
      const cRes = await listCampaigns({
        filter: { isActive: { eq: true } },
        selectionSet: ['id', 'title', 'description', 'thumbnailUrl', 'order', 'isActive', 'infoText'],
        authMode: 'identityPool',
      });

      let raw: CampaignRow[] = (cRes.data ?? [])
        .filter((c) => c.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // When no campaigns are returned for unauthenticated users, fall back to
      // locally bundled seed campaigns so the public shell still has content.
      if (!userId && raw.length === 0) {
        raw = fallbackCampaigns as CampaignRow[];
      }

      // 2) fetch user campaign progress
      const completedIds = new Set<string>();
      if (userId) {
        const pRes = await listCampaignProgress({
          filter: { userId: { eq: userId } },
          selectionSet: ['id', 'campaignId', 'completed'],
          authMode: 'userPool',
        });
        for (const row of pRes.data ?? []) {
          if (row.completed) completedIds.add(row.campaignId);
        }
      }

      // 3) derive locked/unlocked based on order + completions
      const ordered = raw.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description ?? null,
        thumbnailUrl: r.thumbnailUrl ?? null,
        infoText: r.infoText ?? null,
        order: r.order ?? 0,
        isActive: r.isActive !== false,
      }));

      const unlocked: boolean[] = [];
      const isCompleted: boolean[] = [];
      ordered.forEach((c, idx) => {
        const prevAllCompleted = idx === 0
          ? true
          : ordered.slice(0, idx).every(x => completedIds.has(x.id));
        unlocked.push(prevAllCompleted);
        isCompleted.push(completedIds.has(c.id));
      });

      const ui: UICampaign[] = ordered.map((c, i) => ({
        ...c,
        locked: !unlocked[i],
        completed: isCompleted[i],
      }));

      setCampaigns(ui);
    } catch (e) {
      console.error('Error loading campaigns', e);
      if (!userId) {
        const ui: UICampaign[] = fallbackCampaigns.map((c, i) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? null,
          thumbnailUrl: null,
          infoText: c.infoText ?? null,
          order: c.order,
          isActive: true,
          locked: i !== 0,
          completed: false,
          icon: c.icon ?? null,
        }));
        setCampaigns(ui);
      } else {
        setErr(e as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => {
      load();
    };
    window.addEventListener('campaignProgressChanged', handler);
    return () => window.removeEventListener('campaignProgressChanged', handler);
  }, [load]);

  const markCampaignCompleted = useCallback(async (campaignId: string) => {
    if (!userId) return;
    try {
      const list = await listCampaignProgress({
        filter: { userId: { eq: userId }, campaignId: { eq: campaignId } },
        selectionSet: ['id', 'completed'],
      });

      const row = list.data?.[0] ?? null;
      if (row) {
        if (!row.completed) {
          await updateCampaignProgress({ id: row.id, completed: true });
        }
      } else {
        await createCampaignProgress({ userId, campaignId, completed: true });
      }

      await load(); // refresh gallery lock state
    } catch (e) {
      console.error('Error marking campaign completed', e);
      setErr(e as Error);
    }
  }, [userId, load]);

  return { campaigns, loading, error, refresh: load, markCampaignCompleted };
}


