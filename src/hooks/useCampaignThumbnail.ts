// src/hooks/useCampaignThumbnail.ts
import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';

// Simple in-memory cache for resolved URLs
const urlCache = new Map<string, string>();

type Options = {
  key?: string | null;
  fallbackUrl?: string | null; // optional absolute URL stored in Campaign
};

export function useCampaignThumbnail({ key, fallbackUrl }: Options) {
  const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
  const [loading, setLoading] = useState<boolean>(!!key);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!key) {
        setLoading(false);
        setUrl(fallbackUrl ?? null);
        return;
      }

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
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [key, fallbackUrl]);

  return { url, loading, error };
}

