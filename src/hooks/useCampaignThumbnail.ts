// src/hooks/useCampaignThumbnail.ts
import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { fetchRandomSeedThumbnail } from '../utils/seedThumbnails';

// Simple in-memory cache for resolved URLs
const urlCache = new Map<string, string>();

type Options = {
  key?: string | null;
  fallbackUrl?: string | null; // optional absolute URL stored in Campaign
};

export function useCampaignThumbnail({ key, fallbackUrl }: Options) {
  // When running locally with no key/url provided, we can seed thumbnails
  // from the `seed-thumbnails` directory for testing.
  const shouldSeed = !key && !fallbackUrl && import.meta.env.DEV;

  const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
  const [loading, setLoading] = useState<boolean>(!!key || shouldSeed);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (key) {
        // Serve from cache if available
        const cached = urlCache.get(key);
        if (cached) {
          setUrl(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          // public level since our storage rule exposes public/*
          const result = await getUrl({ path: `public/${key}` });
          if (!cancelled) {
            const resolved = result.url.toString();
            urlCache.set(key, resolved);
            setUrl(resolved);
          }
        } catch (e) {
          if (!cancelled) {
            setError(e as Error);
            setUrl(fallbackUrl ?? null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // No key provided. If we are in development mode, attempt to
      // fetch a random seed thumbnail from S3.
      if (shouldSeed) {
        try {
          const seededUrl = await fetchRandomSeedThumbnail();
          if (!cancelled) setUrl(seededUrl);
        } catch (e) {
          if (!cancelled) {
            setError(e as Error);
            setUrl(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // Fall back to any absolute URL provided in the campaign data.
      setLoading(false);
      setUrl(fallbackUrl ?? null);
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [key, fallbackUrl, shouldSeed]);

  return { url, loading, error };
}

