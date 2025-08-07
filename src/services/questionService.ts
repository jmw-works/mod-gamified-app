import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function listQuestions(
  options?: Parameters<typeof client.models.Question.list>[0]
) {
  return client.models.Question.list(options);
}

export function createQuestion(
  input: Parameters<typeof client.models.Question.create>[0]
) {
  return client.models.Question.create(input);
}

export function updateQuestion(
  input: Parameters<typeof client.models.Question.update>[0]
) {
  return client.models.Question.update(input);
}
