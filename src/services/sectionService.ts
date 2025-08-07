import { ServiceError } from './serviceError';
import { client } from './client';

export async function listSections(
  options?: Parameters<typeof client.models.Section.list>[0]
) {
  try {
    return await client.models.Section.list({ authMode: 'identityPool', ...options });
  } catch (err) {
    console.error('listSections failed', err);
    throw new ServiceError('Failed to list sections', { cause: err });
  }
}

export async function createSection(
  input: Parameters<typeof client.models.Section.create>[0]
) {
  try {
    return await client.models.Section.create(input, { authMode: 'userPool' });
  } catch (err) {
    console.error('createSection failed', err);
    throw new ServiceError('Failed to create section', { cause: err });
  }
}

export async function updateSection(
  input: Parameters<typeof client.models.Section.update>[0]
) {
  try {
    return await client.models.Section.update(input, { authMode: 'userPool' });
  } catch (err) {
    console.error('updateSection failed', err);
    throw new ServiceError('Failed to update section', { cause: err });
  }
}
