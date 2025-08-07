import { ServiceError } from './serviceError';
import { client } from './client';

export async function listCampaigns(
  options: Parameters<typeof client.models.Campaign.list>[0] = {}
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseSelection = (options as any).selectionSet ?? [];
    const selection = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Set([...(baseSelection as any[]), 'infoText'])
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (client.models.Campaign.list as any)({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options as any),
      selectionSet: selection,
    });
  } catch (err) {
    throw new ServiceError('Failed to list campaigns', { cause: err });
  }
}

export async function createCampaign(
  input: Parameters<typeof client.models.Campaign.create>[0]
) {
  try {
    return await client.models.Campaign.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create campaign', { cause: err });
  }
}

export async function updateCampaign(
  input: Parameters<typeof client.models.Campaign.update>[0]
) {
  try {
    return await client.models.Campaign.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update campaign', { cause: err });
  }
}
