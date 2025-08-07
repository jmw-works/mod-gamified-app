import { ServiceError } from './serviceError';
import { client } from './client';

type CampaignListOptions = Parameters<typeof client.models.Campaign.list>[0] & {
  selectionSet?: string[];
};
type CampaignSelectionSet = string[];

function withInfoTextSelection(
  options: CampaignListOptions = {},
): CampaignListOptions {
  const baseSelection = (options.selectionSet ?? []) as CampaignSelectionSet;
  const selection = Array.from(new Set([...baseSelection, 'infoText'])) as CampaignSelectionSet;

  return {
    ...options,
    selectionSet: selection,
  } as CampaignListOptions;
}

export async function listCampaigns(
  options: CampaignListOptions = {},
) {
  try {
    return await client.models.Campaign.list(
      withInfoTextSelection(options),
    );
  } catch (err) {
    console.error('listCampaigns failed', err);
    throw new ServiceError('Failed to list campaigns', { cause: err });
  }
}

export async function createCampaign(
  input: Parameters<typeof client.models.Campaign.create>[0],
) {
  try {
    return await client.models.Campaign.create(input);
  } catch (err) {
    console.error('createCampaign failed', err);
    throw new ServiceError('Failed to create campaign', { cause: err });
  }
}

export async function updateCampaign(
  input: Parameters<typeof client.models.Campaign.update>[0],
) {
  try {
    return await client.models.Campaign.update(input);
  } catch (err) {
    console.error('updateCampaign failed', err);
    throw new ServiceError('Failed to update campaign', { cause: err });
  }
}
