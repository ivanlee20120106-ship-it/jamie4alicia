interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class SmartCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    entry.lastAccessed = Date.now();
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 3600): void {
    if (this.cache.size >= this.maxSize) {
      // Evict LRU (first entry in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      lastAccessed: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  cleanExpired(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  stats() {
    const total = this.hits + this.misses;
    const expiredCount = [...this.cache.values()].filter(
      (e) => Date.now() > e.expiresAt
    ).length;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(1) : '0.0',
      expiredCount,
      memoryEstimateKB: Math.round(
        JSON.stringify([...this.cache.entries()]).length / 1024
      ),
    };
  }
}

// Singleton
export const smartCache = new SmartCache(100);
