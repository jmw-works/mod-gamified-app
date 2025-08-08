import { list, getUrl } from 'aws-amplify/storage';

// Cache the list of seed thumbnail paths in memory so we only
// hit S3 once per session.
let cachedPaths: string[] | null = null;

/**
 * Retrieve a random thumbnail URL from the `seed-thumbnails/` directory.
 * The directory lives at the root of the public bucket and contains PNG files.
 *
 * Returns `null` if no thumbnails are found.
 */
export async function fetchRandomSeedThumbnail(): Promise<string | null> {
  if (!cachedPaths) {
    const res = await list({ path: 'public/seed-thumbnails/' });
    cachedPaths =
      res.items?.filter((item) => item.path.toLowerCase().endsWith('.png')).map((i) => i.path) ?? [];
  }
  if (!cachedPaths.length) return null;
  const randomPath = cachedPaths[Math.floor(Math.random() * cachedPaths.length)];
  const urlRes = await getUrl({ path: randomPath });
  return urlRes.url.toString();
}
