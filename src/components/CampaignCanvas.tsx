import React from 'react';

interface CampaignCanvasProps {
  campaignId: string | null;
  userId: string;
}

export default function CampaignCanvas({ campaignId, userId }: CampaignCanvasProps) {
  return <div data-campaign-id={campaignId ?? ''} data-user-id={userId}>Campaign content</div>;
}
