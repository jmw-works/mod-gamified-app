import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function listCampaigns(
  options?: Parameters<typeof client.models.Campaign.list>[0]
) {
  return client.models.Campaign.list(options);
}

export function createCampaign(
  input: Parameters<typeof client.models.Campaign.create>[0]
) {
  return client.models.Campaign.create(input);
}

export function updateCampaign(
  input: Parameters<typeof client.models.Campaign.update>[0]
) {
  return client.models.Campaign.update(input);
}
