import { ArcGISLayer } from './layers';

interface LayerCache<T> {
  data: T;
  timestamp: number;
  layerId: string;
}

export class LayerSpecificCache<T> {
  private caches = new Map<string, Map<string, LayerCache<T>>>();
  private readonly maxEntriesPerLayer: number;
  private readonly ttlMs: number;

  constructor(maxEntriesPerLayer = 50, ttlMinutes = 5) {
    this.maxEntriesPerLayer = maxEntriesPerLayer;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(layerId: string, key: string): T | undefined {
    const layerCache = this.caches.get(layerId);
    if (!layerCache) return undefined;

    const entry = layerCache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      layerCache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set(layerId: string, key: string, data: T): void {
    let layerCache = this.caches.get(layerId);
    if (!layerCache) {
      layerCache = new Map();
      this.caches.set(layerId, layerCache);
    }

    if (layerCache.size >= this.maxEntriesPerLayer) {
      const oldestKey = Array.from(layerCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      layerCache.delete(oldestKey);
    }

    layerCache.set(key, {
      data,
      timestamp: Date.now(),
      layerId
    });
  }

  clearLayer(layerId: string): void {
    this.caches.delete(layerId);
  }

  clearAll(): void {
    this.caches.clear();
  }
}