import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { ServiceError } from './serviceError';

const client = generateClient<Schema>();

export async function listTitles(
  options: Parameters<typeof client.models.Title.list>[0] = {}
) {
  try {
    return await client.models.Title.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list titles', { cause: err });
  }
}
