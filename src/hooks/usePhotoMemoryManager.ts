import { useRef, useCallback } from "react";

interface CacheEntry {
  url: string;
  size: number;
  lastAccess: number;
}

const MAX_MEMORY = 60 * 1024 * 1024; // 60MB

export const usePhotoMemoryManager = () => {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const currentMemory = useRef(0);

  const evictIfNeeded = useCallback(() => {
    const threshold = MAX_MEMORY * 0.8;
    if (currentMemory.current <= threshold) return;

    // Sort by lastAccess ascending (oldest first)
    const entries = [...cache.current.entries()].sort(
      (a, b) => a[1].lastAccess - b[1].lastAccess
    );

    while (currentMemory.current > threshold && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      URL.revokeObjectURL(entry.url);
      currentMemory.current -= entry.size;
      cache.current.delete(key);
    }
  }, []);

  const loadPhoto = useCallback(
    async (src: string): Promise<string> => {
      const existing = cache.current.get(src);
      if (existing) {
        existing.lastAccess = Date.now();
        return existing.url;
      }

      evictIfNeeded();

      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        cache.current.set(src, {
          url: objectUrl,
          size: blob.size,
          lastAccess: Date.now(),
        });
        currentMemory.current += blob.size;
        return objectUrl;
      } catch {
        // Fallback to direct URL
        return src;
      }
    },
    [evictIfNeeded]
  );

  const preload = useCallback(
    (urls: string[]) => {
      urls.forEach((url) => {
        if (!cache.current.has(url)) {
          loadPhoto(url).catch(() => {});
        }
      });
    },
    [loadPhoto]
  );

  const cleanup = useCallback(() => {
    cache.current.forEach((entry) => URL.revokeObjectURL(entry.url));
    cache.current.clear();
    currentMemory.current = 0;
  }, []);

  return { loadPhoto, preload, cleanup };
};
