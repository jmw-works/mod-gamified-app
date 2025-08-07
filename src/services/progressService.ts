import { ServiceError } from './serviceError';
import { client } from './client';

// CampaignProgress
export async function listCampaignProgress(
  options?: Parameters<typeof client.models.CampaignProgress.list>[0]
) {
  try {
    return await client.models.CampaignProgress.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list campaign progress', { cause: err });
  }
}

export async function createCampaignProgress(
  input: Parameters<typeof client.models.CampaignProgress.create>[0]
) {
  try {
    return await client.models.CampaignProgress.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create campaign progress', { cause: err });
  }
}

export async function updateCampaignProgress(
  input: Parameters<typeof client.models.CampaignProgress.update>[0]
) {
  try {
    return await client.models.CampaignProgress.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update campaign progress', { cause: err });
  }
}

// SectionProgress
export async function listSectionProgress(
  options?: Parameters<typeof client.models.SectionProgress.list>[0]
) {
  try {
    return await client.models.SectionProgress.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list section progress', { cause: err });
  }
}

export async function createSectionProgress(
  input: Parameters<typeof client.models.SectionProgress.create>[0]
) {
  try {
    return await client.models.SectionProgress.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create section progress', { cause: err });
  }
}

export async function updateSectionProgress(
  input: Parameters<typeof client.models.SectionProgress.update>[0]
) {
  try {
    return await client.models.SectionProgress.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update section progress', { cause: err });
  }
}

// UserProgress
export async function listUserProgress(
  options?: Parameters<typeof client.models.UserProgress.list>[0]
) {
  try {
    return await client.models.UserProgress.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list user progress', { cause: err });
  }
}

export async function createUserProgress(
  input: Parameters<typeof client.models.UserProgress.create>[0]
) {
  try {
    return await client.models.UserProgress.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create user progress', { cause: err });
  }
}

export async function updateUserProgress(
  input: Parameters<typeof client.models.UserProgress.update>[0]
) {
  try {
    return await client.models.UserProgress.update(input);
  } catch (err) {
    throw new ServiceError('Failed to update user progress', { cause: err });
  }
}

// UserResponse
export async function createUserResponse(
  input: Parameters<typeof client.models.UserResponse.create>[0]
) {
  try {
    return await client.models.UserResponse.create(input);
  } catch (err) {
    throw new ServiceError('Failed to create user response', { cause: err });
  }
}

export async function listUserResponses(
  options?: Parameters<typeof client.models.UserResponse.list>[0]
) {
  try {
    return await client.models.UserResponse.list(options);
  } catch (err) {
    throw new ServiceError('Failed to list user responses', { cause: err });
  }
}
