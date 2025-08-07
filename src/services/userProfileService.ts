import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function listUserProfiles(
  options?: Parameters<typeof client.models.UserProfile.list>[0]
) {
  return client.models.UserProfile.list(options);
}

export function createUserProfile(
  input: Parameters<typeof client.models.UserProfile.create>[0]
) {
  return client.models.UserProfile.create(input);
}

export function updateUserProfile(
  input: Parameters<typeof client.models.UserProfile.update>[0]
) {
  return client.models.UserProfile.update(input);
}
