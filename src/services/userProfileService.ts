import { ServiceError } from './serviceError';
import { client } from './client';

export async function listUserProfiles(
  options?: Parameters<typeof client.models.UserProfile.list>[0]
) {
  try {
    return await client.models.UserProfile.list({ authMode: 'userPool', ...options });
  } catch (err) {
    throw new ServiceError('Failed to list user profiles', { cause: err });
  }
}

export async function createUserProfile(
  input: Parameters<typeof client.models.UserProfile.create>[0]
) {
  try {
    return await client.models.UserProfile.create(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to create user profile', { cause: err });
  }
}

export async function updateUserProfile(
  input: Parameters<typeof client.models.UserProfile.update>[0]
) {
  try {
    return await client.models.UserProfile.update(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to update user profile', { cause: err });
  }
}
