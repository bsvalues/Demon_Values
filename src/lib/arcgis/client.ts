import { Property } from '../../types';
import { SpatialCache } from './cache';
import { layerManager } from './config';
import type { ArcGISLayer } from './layers';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class ArcGISClient {
  private cache: SpatialCache<Property[]>;
  private retryAttempts = 3;
  private retryDelay = 1000;
  private rateLimitDelay = 100;

  constructor() {
    this.cache = new SpatialCache<Property[]>(100, 5);
  }

  async getFeatures(bounds: Bounds): Promise<Property[]> {
    const cacheKey = this.generateCacheKey(bounds);
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const enabledLayers = layerManager.getEnabledLayers();
    if (enabledLayers.length === 0) {
      return [];
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }

        const features = await this.fetchAllLayerFeatures(bounds, enabledLayers);
        this.cache.set(cacheKey, features);
        return features;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (this.shouldRetry(error)) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
          );
          continue;
        }
        break;
      }
    }

    throw new Error(`Failed to fetch features after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  private async fetchAllLayerFeatures(bounds: Bounds, layers: ArcGISLayer[]): Promise<Property[]> {
    const features = await Promise.all(
      layers.map(layer => this.fetchLayerFeatures(bounds, layer))
    );
    return features.flat();
  }

  private async fetchLayerFeatures(bounds: Bounds, layer: ArcGISLayer): Promise<Property[]> {
    const bbox = this.formatBoundingBox(bounds);
    const url = this.buildUrl(layer, bbox);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ArcGIS request failed for layer ${layer.name}: ${response.status}`);
    }

    const data = await response.json();
    if (!data.features) {
      throw new Error(`Invalid response format from layer ${layer.name}`);
    }

    return this.transformFeatures(data.features, layer);
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof Error) {
      // Retry on network errors or 5xx server errors
      if (error.name === 'TypeError' || error.message.includes('500')) {
        return true;
      }
      // Don't retry on 4xx client errors (except 429 rate limit)
      if (error.message.includes('429')) {
        return true;
      }
    }
    return false;
  }

  private formatBoundingBox(bounds: Bounds): string {
    return `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
  }

  private buildUrl(layer: ArcGISLayer, bbox: string): string {
    const params = new URLSearchParams({
      f: 'json',
      geometry: bbox,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: layer.fields.join(','),
      returnGeometry: 'true'
    });

    return `${layer.url}/query?${params}`;
  }

  private generateCacheKey(bounds: Bounds): string {
    // Round coordinates to reduce cache fragmentation
    const precision = 5;
    return [
      bounds.north.toFixed(precision),
      bounds.south.toFixed(precision),
      bounds.east.toFixed(precision),
      bounds.west.toFixed(precision)
    ].join(':');
  }

  private transformFeatures(features: any[], layer: ArcGISLayer): Property[] {
    return features.map(feature => {
      try {
        return {
          id: feature.attributes.OBJECTID?.toString() || crypto.randomUUID(),
          address: feature.attributes.Address || 'Unknown Address',
          value: this.parseValue(feature.attributes.Value),
          latitude: feature.geometry?.y || 0,
          longitude: feature.geometry?.x || 0,
          cluster: feature.attributes.Type || 'unclassified'
        };
      } catch (error) {
        console.error('Error transforming feature:', error);
        return null;
      }
    }).filter((feature): feature is Property => feature !== null);
  }

  private parseValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const arcgisClient = new ArcGISClient();