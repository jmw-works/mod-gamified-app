import { uploadData, getUrl } from 'aws-amplify/storage';
import { ServiceError } from './serviceError';

export async function uploadMarkdownImage(key: string, file: File | Blob) {
  try {
    await uploadData({
      key,
      data: file,
      options: { contentType: (file as File).type },
    }).result;
    const { url } = await getUrl({ key });
    return url.toString();
  } catch (err) {
    throw new ServiceError('Failed to upload image', { cause: err });
  }
}

export async function getMarkdownImageUrl(key: string) {
  try {
    const { url } = await getUrl({ key });
    return url.toString();
  } catch (err) {
    throw new ServiceError('Failed to get image URL', { cause: err });
  }
}
