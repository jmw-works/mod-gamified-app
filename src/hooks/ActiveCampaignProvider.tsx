import { useState, type ReactNode } from 'react';
import { ActiveCampaignContext } from './ActiveCampaignContext';

export function ActiveCampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  return (
    <ActiveCampaignContext.Provider value={{ activeCampaignId, setActiveCampaignId }}>
      {children}
    </ActiveCampaignContext.Provider>
  );
}
