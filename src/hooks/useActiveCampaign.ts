import { useContext } from 'react';
import { ActiveCampaignContext } from './ActiveCampaignContext';

export function useActiveCampaign() {
  const ctx = useContext(ActiveCampaignContext);
  if (!ctx) {
    throw new Error('useActiveCampaign must be used within ActiveCampaignProvider');
  }
  return ctx;
}
