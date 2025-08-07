import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// CampaignProgress
export function listCampaignProgress(
  options?: Parameters<typeof client.models.CampaignProgress.list>[0]
) {
  return client.models.CampaignProgress.list(options);
}

export function createCampaignProgress(
  input: Parameters<typeof client.models.CampaignProgress.create>[0]
) {
  return client.models.CampaignProgress.create(input);
}

export function updateCampaignProgress(
  input: Parameters<typeof client.models.CampaignProgress.update>[0]
) {
  return client.models.CampaignProgress.update(input);
}

// SectionProgress
export function listSectionProgress(
  options?: Parameters<typeof client.models.SectionProgress.list>[0]
) {
  return client.models.SectionProgress.list(options);
}

export function createSectionProgress(
  input: Parameters<typeof client.models.SectionProgress.create>[0]
) {
  return client.models.SectionProgress.create(input);
}

export function updateSectionProgress(
  input: Parameters<typeof client.models.SectionProgress.update>[0]
) {
  return client.models.SectionProgress.update(input);
}

// UserProgress
export function listUserProgress(
  options?: Parameters<typeof client.models.UserProgress.list>[0]
) {
  return client.models.UserProgress.list(options);
}

export function createUserProgress(
  input: Parameters<typeof client.models.UserProgress.create>[0]
) {
  return client.models.UserProgress.create(input);
}

export function updateUserProgress(
  input: Parameters<typeof client.models.UserProgress.update>[0]
) {
  return client.models.UserProgress.update(input);
}
