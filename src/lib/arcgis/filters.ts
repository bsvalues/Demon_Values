import { ArcGISLayer } from './layers';

export interface LayerFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  enabled: boolean;
}

type FilterOperator = 
  | '=' | '!=' 
  | '>' | '>=' 
  | '<' | '<=' 
  | 'LIKE' 
  | 'IN' 
  | 'BETWEEN';

export class FilterManager {
  private filters = new Map<string, LayerFilter[]>();

  addFilter(layerId: string, filter: Omit<LayerFilter, 'enabled'>): void {
    const layerFilters = this.filters.get(layerId) || [];
    layerFilters.push({ ...filter, enabled: true });
    this.filters.set(layerId, layerFilters);
  }

  removeFilter(layerId: string, filterId: string): void {
    const layerFilters = this.filters.get(layerId);
    if (layerFilters) {
      this.filters.set(
        layerId,
        layerFilters.filter(f => f.id !== filterId)
      );
    }
  }

  toggleFilter(layerId: string, filterId: string, enabled?: boolean): void {
    const layerFilters = this.filters.get(layerId);
    if (layerFilters) {
      const filter = layerFilters.find(f => f.id === filterId);
      if (filter) {
        filter.enabled = enabled ?? !filter.enabled;
      }
    }
  }

  getFilters(layerId: string): LayerFilter[] {
    return this.filters.get(layerId) || [];
  }

  buildWhereClause(layerId: string): string {
    const activeFilters = this.getFilters(layerId)
      .filter(f => f.enabled);

    if (activeFilters.length === 0) return '1=1';

    return activeFilters
      .map(filter => this.formatFilter(filter))
      .join(' AND ');
  }

  private formatFilter(filter: LayerFilter): string {
    const value = this.formatValue(filter.value);
    
    switch (filter.operator) {
      case 'BETWEEN':
        const [min, max] = filter.value;
        return `${filter.field} BETWEEN ${min} AND ${max}`;
      case 'IN':
        return `${filter.field} IN (${filter.value.map(this.formatValue).join(',')})`;
      case 'LIKE':
        return `${filter.field} LIKE ${value}`;
      default:
        return `${filter.field} ${filter.operator} ${value}`;
    }
  }

  private formatValue(value: any): string {
    if (typeof value === 'string') return `'${value}'`;
    if (Array.isArray(value)) return `(${value.map(this.formatValue).join(',')})`;
    return value.toString();
  }
}

export const filterManager = new FilterManager();