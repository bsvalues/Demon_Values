export interface LayerMetadata {
  name: string;
  description?: string;
  type: string;
  geometryType: string;
  fields: Array<{
    name: string;
    type: string;
    alias: string;
    domain?: any;
  }>;
  extent: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
    };
  };
  capabilities: string[];
  maxRecordCount: number;
}

export class MetadataManager {
  private metadata = new Map<string, LayerMetadata>();

  async fetchMetadata(layerId: string, url: string): Promise<LayerMetadata> {
    const cached = this.metadata.get(layerId);
    if (cached) return cached;

    try {
      const response = await fetch(`${url}?f=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const data = await response.json();
      this.metadata.set(layerId, data);
      return data;
    } catch (error) {
      throw new Error(`Metadata fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getMetadata(layerId: string): LayerMetadata | undefined {
    return this.metadata.get(layerId);
  }

  clearMetadata(layerId: string): void {
    this.metadata.delete(layerId);
  }
}

export const metadataManager = new MetadataManager();