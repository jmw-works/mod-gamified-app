import { ServiceError } from './serviceError';
import { client } from './client';

export async function listTitles(
  options: Parameters<typeof client.models.Title.list>[0] = {}
) {
  try {
    return await client.models.Title.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list titles', { cause: err });
  }
}
