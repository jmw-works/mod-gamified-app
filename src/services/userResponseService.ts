import { ServiceError } from './serviceError';
import { client } from './client';

export async function listUserResponses(
  options?: Parameters<typeof client.models.UserResponse.list>[0]
) {
  try {
    return await client.models.UserResponse.list({ authMode: 'userPool', ...options });
  } catch (err) {
    throw new ServiceError('Failed to list user responses', { cause: err });
  }
}

export async function createUserResponse(
  input: Parameters<typeof client.models.UserResponse.create>[0]
) {
  try {
    return await client.models.UserResponse.create(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to create user response', { cause: err });
  }
}

export async function updateUserResponse(
  input: Parameters<typeof client.models.UserResponse.update>[0]
) {
  try {
    return await client.models.UserResponse.update(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to update user response', { cause: err });
  }
}
