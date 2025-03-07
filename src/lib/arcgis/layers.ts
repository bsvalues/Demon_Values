import { LayerSpecificCache } from './layerCache';
import { metadataManager, LayerMetadata } from './metadata';
import { styleManager, LayerStyle } from './styling';
import { eventManager } from './events';

export interface ArcGISLayer {
  id: string;
  name: string;
  url: string;
  type: 'FeatureServer' | 'MapServer';
  enabled: boolean;
  fields: string[];
  renderer?: LayerStyle;
  metadata?: LayerMetadata;
}

export class LayerManager {
  private layers: Map<string, ArcGISLayer> = new Map();
  private baseUrl: string;
  private cache: LayerSpecificCache<any>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.cache = new LayerSpecificCache();
  }

  async addLayer(layer: Omit<ArcGISLayer, 'url'>) {
    const url = `${this.baseUrl}/${layer.id}/${layer.type}`;
    const fullLayer = { ...layer, url };
    
    try {
      // Fetch metadata
      const metadata = await metadataManager.fetchMetadata(layer.id, url);
      fullLayer.metadata = metadata;

      // Set initial style if provided
      if (layer.renderer) {
        styleManager.setStyle(layer.id, layer.renderer);
      }

      this.layers.set(layer.id, fullLayer);

      // Emit layer added event
      eventManager.emit({
        type: 'load',
        layerId: layer.id,
        timestamp: Date.now(),
        data: fullLayer
      });
    } catch (error) {
      eventManager.emit({
        type: 'error',
        layerId: layer.id,
        timestamp: Date.now(),
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      throw error;
    }
  }

  removeLayer(id: string) {
    const layer = this.layers.get(id);
    if (layer) {
      this.layers.delete(id);
      this.cache.clearLayer(id);
      metadataManager.clearMetadata(id);
      eventManager.emit({
        type: 'update',
        layerId: id,
        timestamp: Date.now(),
        data: { action: 'removed' }
      });
    }
  }

  async updateStyle(id: string, style: LayerStyle) {
    const layer = this.layers.get(id);
    if (layer) {
      styleManager.setStyle(id, style);
      eventManager.emit({
        type: 'style',
        layerId: id,
        timestamp: Date.now(),
        data: { style }
      });
    }
  }

  toggleLayer(id: string, enabled?: boolean) {
    const layer = this.layers.get(id);
    if (layer) {
      layer.enabled = enabled ?? !layer.enabled;
      this.layers.set(id, layer);
      eventManager.emit({
        type: 'visibility',
        layerId: id,
        timestamp: Date.now(),
        data: { enabled: layer.enabled }
      });
    }
  }

  getLayer(id: string): ArcGISLayer | undefined {
    return this.layers.get(id);
  }

  getLayers(): ArcGISLayer[] {
    return Array.from(this.layers.values());
  }

  getEnabledLayers(): ArcGISLayer[] {
    return this.getLayers().filter(layer => layer.enabled);
  }

  getLayerCache(layerId: string): LayerSpecificCache<any> {
    return this.cache;
  }

  clearCache(layerId?: string): void {
    if (layerId) {
      this.cache.clearLayer(layerId);
    } else {
      this.cache.clearAll();
    }
  }
}