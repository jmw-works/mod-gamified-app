import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { ServiceError } from './serviceError';

const client = generateClient<Schema>();

export async function listSections(
  options?: Parameters<typeof client.models.Section.list>[0]
) {
  try {
    return await client.models.Section.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list sections', { cause: err });
  }
}

export async function createSection(
  input: Parameters<typeof client.models.Section.create>[0]
) {
  try {
    return await client.models.Section.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create section', { cause: err });
  }
}

export async function updateSection(
  input: Parameters<typeof client.models.Section.update>[0]
) {
  try {
    return await client.models.Section.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update section', { cause: err });
  }
}
