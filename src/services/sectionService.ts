import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function listSections(
  options?: Parameters<typeof client.models.Section.list>[0]
) {
  return client.models.Section.list(options);
}

export function createSection(
  input: Parameters<typeof client.models.Section.create>[0]
) {
  return client.models.Section.create(input);
}

export function updateSection(
  input: Parameters<typeof client.models.Section.update>[0]
) {
  return client.models.Section.update(input);
}
