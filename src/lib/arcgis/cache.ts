interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class SpatialCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(maxEntries = 100, ttlMinutes = 5) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}