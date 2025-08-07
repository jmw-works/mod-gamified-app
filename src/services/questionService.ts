import { ServiceError } from './serviceError';
import { client } from './client';

export async function listQuestions(
  options?: Parameters<typeof client.models.Question.list>[0]
) {
  try {
    return await client.models.Question.list({ authMode: 'identityPool', ...options });
  } catch (err) {
    throw new ServiceError('Failed to list questions', { cause: err });
  }
}

export async function createQuestion(
  input: Parameters<typeof client.models.Question.create>[0]
) {
  try {
    return await client.models.Question.create(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to create question', { cause: err });
  }
}

export async function updateQuestion(
  input: Parameters<typeof client.models.Question.update>[0]
) {
  try {
    return await client.models.Question.update(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to update question', { cause: err });
  }
}

export async function deleteQuestion(
  input: Parameters<typeof client.models.Question.delete>[0]
) {
  try {
    return await client.models.Question.delete(input, { authMode: 'userPool' });
  } catch (err) {
    throw new ServiceError('Failed to delete question', { cause: err });
  }
}
