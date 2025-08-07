import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { ServiceError } from './serviceError';

const client = generateClient<Schema>();

export async function listUserResponses(
  options?: Parameters<typeof client.models.UserResponse.list>[0]
) {
  try {
    return await client.models.UserResponse.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list user responses', { cause: err });
  }
}

export async function createUserResponse(
  input: Parameters<typeof client.models.UserResponse.create>[0]
) {
  try {
    return await client.models.UserResponse.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create user response', { cause: err });
  }
}

export async function updateUserResponse(
  input: Parameters<typeof client.models.UserResponse.update>[0]
) {
  try {
    return await client.models.UserResponse.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update user response', { cause: err });
  }
}
