import { useCallback, useEffect, useState } from 'react';
import { listSections } from '../services/sectionService';
import { listSectionProgress } from '../services/progressService';
import { ensureSeedData } from '../utils/seedData';

export interface CampaignProgressInfo {
  total: number;
  completed: number;
}

export function useCampaignProgress(userId?: string | null) {
  const [progress, setProgress] = useState<Record<string, CampaignProgressInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureSeedData();
      const sectionRes = await listSections({ selectionSet: ['id', 'campaignId'] });
      const totals: Record<string, number> = {};
      const sectionToCampaign: Record<string, string> = {};
      for (const s of sectionRes.data ?? []) {
        const cid = s.campaignId as string;
        if (!cid) continue;
        totals[cid] = (totals[cid] ?? 0) + 1;
        sectionToCampaign[s.id] = cid;
      }

      const completedCounts: Record<string, number> = {};
      if (userId) {
        const progRes = await listSectionProgress({
          filter: { userId: { eq: userId }, completed: { eq: true } },
          selectionSet: ['sectionId'],
        });
        for (const row of progRes.data ?? []) {
          const cid = sectionToCampaign[row.sectionId];
          if (cid) completedCounts[cid] = (completedCounts[cid] ?? 0) + 1;
        }
      }

      const map: Record<string, CampaignProgressInfo> = {};
      for (const [cid, total] of Object.entries(totals)) {
        map[cid] = { total, completed: completedCounts[cid] ?? 0 };
      }
      setProgress(map);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { progress, loading, error, refresh: load };
}

