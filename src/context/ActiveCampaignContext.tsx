/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveCampaignContextValue {
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
}

const ActiveCampaignContext = createContext<ActiveCampaignContextValue | undefined>(undefined);

export function ActiveCampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const value: ActiveCampaignContextValue = {
    activeCampaignId,
    setActiveCampaignId,
  };

  return <ActiveCampaignContext.Provider value={value}>{children}</ActiveCampaignContext.Provider>;
}

export function useActiveCampaign() {
  const ctx = useContext(ActiveCampaignContext);
  if (!ctx) throw new Error('useActiveCampaign must be used within ActiveCampaignProvider');
  return ctx;
}

export default ActiveCampaignContext;
