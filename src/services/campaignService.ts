import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { ServiceError } from './serviceError';

const client = generateClient<Schema>();

export async function listCampaigns(
  options?: Parameters<typeof client.models.Campaign.list>[0]
) {
  try {
    return await client.models.Campaign.list(options);
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
