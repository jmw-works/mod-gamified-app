import { createContext } from 'react';

export type ActiveCampaignContextType = {
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
};

export const ActiveCampaignContext = createContext<ActiveCampaignContextType | undefined>(undefined);
