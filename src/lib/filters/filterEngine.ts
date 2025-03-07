import { Property } from '../../types';

export interface FilterDimension {
  id: string;
  name: string;
  field: string;
  type: 'range' | 'categorical' | 'boolean';
  min?: number;
  max?: number;
  options?: string[];
  weight: number;
  enabled: boolean;
}

export interface FilterState {
  dimensions: FilterDimension[];
  activeFilters: Record<string, any>;
}

export class FilterEngine {
  private dimensions: FilterDimension[];
  private cache: Map<string, Property[]> = new Map();

  constructor(dimensions: FilterDimension[]) {
    this.dimensions = dimensions;
  }

  applyFilters(properties: Property[], filters: Record<string, any>): Property[] {
    const cacheKey = this.generateCacheKey(filters);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const filtered = properties.filter(property => {
      return this.dimensions
        .filter(dim => dim.enabled)
        .every(dimension => {
          const filterValue = filters[dimension.id];
          if (!filterValue) return true;

          switch (dimension.type) {
            case 'range':
              const value = this.getPropertyValue(property, dimension.field);
              return value >= filterValue.min && value <= filterValue.max;
            case 'categorical':
              return filterValue.includes(
                this.getPropertyValue(property, dimension.field)
              );
            case 'boolean':
              return filterValue === this.getPropertyValue(property, dimension.field);
            default:
              return true;
          }
        });
    });

    // Cache the results
    this.cache.set(cacheKey, filtered);
    if (this.cache.size > 100) {
      // Clear oldest cache entries if cache gets too large
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    return filtered;
  }

  calculateScore(property: Property): number {
    return this.dimensions
      .filter(dim => dim.enabled)
      .reduce((score, dimension) => {
        const value = this.getPropertyValue(property, dimension.field);
        const normalizedValue = this.normalizeValue(value, dimension);
        return score + (normalizedValue * dimension.weight);
      }, 0);
  }

  private normalizeValue(value: any, dimension: FilterDimension): number {
    if (!dimension.enabled) return 0;

    switch (dimension.type) {
      case 'range':
        if (typeof value !== 'number' || !dimension.min || !dimension.max) return 0;
        return (value - dimension.min) / (dimension.max - dimension.min);
      case 'categorical':
        if (!dimension.options) return 0;
        return dimension.options.indexOf(value) / dimension.options.length;
      case 'boolean':
        return value ? 1 : 0;
      default:
        return 0;
    }
  }

  private getPropertyValue(property: Property, field: string): any {
    return field.split('.').reduce((obj: any, key) => obj?.[key], property);
  }

  private generateCacheKey(filters: Record<string, any>): string {
    return JSON.stringify(filters);
  }

  getDimensions(): FilterDimension[] {
    return this.dimensions;
  }

  updateDimension(id: string, updates: Partial<FilterDimension>) {
    const index = this.dimensions.findIndex(d => d.id === id);
    if (index !== -1) {
      this.dimensions[index] = { ...this.dimensions[index], ...updates };
      this.cache.clear(); // Clear cache when dimensions change
    }
  }
}