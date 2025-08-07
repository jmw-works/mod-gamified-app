import { createContext, useContext, useState, type ReactNode } from 'react';

type ActiveCampaignContextType = {
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
};

const ActiveCampaignContext = createContext<ActiveCampaignContextType | undefined>(undefined);

export function ActiveCampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  return (
    <ActiveCampaignContext.Provider value={{ activeCampaignId, setActiveCampaignId }}>
      {children}
    </ActiveCampaignContext.Provider>
  );
}

export function useActiveCampaign() {
  const ctx = useContext(ActiveCampaignContext);
  if (!ctx) {
    throw new Error('useActiveCampaign must be used within ActiveCampaignProvider');
  }
  return ctx;
}
