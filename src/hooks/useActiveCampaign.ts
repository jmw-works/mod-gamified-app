// src/hooks/useActiveCampaign.ts
import { createContext, useContext } from 'react';

export type ActiveCampaignContextValue = {
  activeCampaignId: string | null;
  setActiveCampaignId?: (id: string | null) => void;
};

export const ActiveCampaignContext = createContext<ActiveCampaignContextValue>({
  activeCampaignId: null,
  setActiveCampaignId: undefined,
});

export function useActiveCampaign() {
  return useContext(ActiveCampaignContext);
}

