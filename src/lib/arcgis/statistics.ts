import { Property } from '../../types';
import { eventManager } from './events';

interface StatisticDefinition {
  onField: string;
  statisticType: StatisticType;
  outField?: string;
}

type StatisticType = 
  | 'count' 
  | 'sum' 
  | 'min' 
  | 'max' 
  | 'avg' 
  | 'stddev' 
  | 'var' 
  | 'percentile_cont';

interface AggregationOptions {
  groupByFields?: string[];
  orderByFields?: string[];
  where?: string;
  geometry?: any;
  statisticDefinitions: StatisticDefinition[];
}

interface StatisticsResult {
  statistics: Record<string, number>;
  groupedResults?: Array<{
    group: Record<string, any>;
    statistics: Record<string, number>;
  }>;
  metadata: {
    timestamp: number;
    duration: number;
    recordCount: number;
  };
}

export class StatisticsManager {
  async calculateStatistics(
    properties: Property[],
    options: AggregationOptions
  ): Promise<StatisticsResult> {
    const startTime = performance.now();

    try {
      let results: StatisticsResult = {
        statistics: {},
        metadata: {
          timestamp: Date.now(),
          duration: 0,
          recordCount: properties.length
        }
      };

      // Filter by geometry if provided
      let filteredProperties = properties;
      if (options.geometry) {
        filteredProperties = this.filterByGeometry(properties, options.geometry);
      }

      // Apply where clause if provided
      if (options.where) {
        filteredProperties = this.filterByWhereClause(filteredProperties, options.where);
      }

      // Calculate basic statistics
      results.statistics = this.calculateBasicStatistics(
        filteredProperties,
        options.statisticDefinitions
      );

      // Calculate grouped statistics if groupByFields are provided
      if (options.groupByFields && options.groupByFields.length > 0) {
        results.groupedResults = this.calculateGroupedStatistics(
          filteredProperties,
          options.groupByFields,
          options.statisticDefinitions
        );

        // Apply ordering if specified
        if (options.orderByFields) {
          results.groupedResults = this.sortGroupedResults(
            results.groupedResults,
            options.orderByFields
          );
        }
      }

      results.metadata.duration = performance.now() - startTime;

      // Emit statistics calculated event
      eventManager.emit({
        type: 'data',
        layerId: 'statistics',
        timestamp: Date.now(),
        data: {
          action: 'statistics-calculated',
          results
        }
      });

      return results;
    } catch (error) {
      eventManager.emit({
        type: 'error',
        layerId: 'statistics',
        timestamp: Date.now(),
        error: error instanceof Error ? error : new Error('Statistics calculation failed')
      });
      throw error;
    }
  }

  private calculateBasicStatistics(
    properties: Property[],
    definitions: StatisticDefinition[]
  ): Record<string, number> {
    const results: Record<string, number> = {};

    definitions.forEach(def => {
      const values = properties.map(p => this.getFieldValue(p, def.onField))
        .filter(v => v !== null && v !== undefined);

      const outField = def.outField || `${def.statisticType}_${def.onField}`;
      results[outField] = this.computeStatistic(values, def.statisticType);
    });

    return results;
  }

  private calculateGroupedStatistics(
    properties: Property[],
    groupByFields: string[],
    definitions: StatisticDefinition[]
  ) {
    // Group properties
    const groups = this.groupProperties(properties, groupByFields);

    // Calculate statistics for each group
    return Array.from(groups.entries()).map(([groupKey, groupProperties]) => {
      const groupValues = JSON.parse(groupKey);
      return {
        group: groupValues,
        statistics: this.calculateBasicStatistics(groupProperties, definitions)
      };
    });
  }

  private groupProperties(
    properties: Property[],
    groupByFields: string[]
  ): Map<string, Property[]> {
    const groups = new Map<string, Property[]>();

    properties.forEach(property => {
      const groupValues = groupByFields.reduce((acc, field) => {
        acc[field] = this.getFieldValue(property, field);
        return acc;
      }, {} as Record<string, any>);

      const groupKey = JSON.stringify(groupValues);
      const group = groups.get(groupKey) || [];
      group.push(property);
      groups.set(groupKey, group);
    });

    return groups;
  }

  private computeStatistic(values: number[], type: StatisticType): number {
    if (values.length === 0) return 0;

    switch (type) {
      case 'count':
        return values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'stddev':
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
      case 'var':
        const meanVar = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffsVar = values.map(value => Math.pow(value - meanVar, 2));
        return squareDiffsVar.reduce((a, b) => a + b, 0) / values.length;
      case 'percentile_cont':
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.floor(values.length * 0.5);
        return sorted[index];
      default:
        throw new Error(`Unsupported statistic type: ${type}`);
    }
  }

  private getFieldValue(property: Property, field: string): any {
    const parts = field.split('.');
    return parts.reduce((obj: any, part) => obj?.[part], property);
  }

  private filterByGeometry(properties: Property[], geometry: any): Property[] {
    // Implement geometry filtering based on your needs
    // This is a simplified example
    const { minX, minY, maxX, maxY } = this.getBoundingBox(geometry);
    
    return properties.filter(property => 
      property.longitude >= minX &&
      property.longitude <= maxX &&
      property.latitude >= minY &&
      property.latitude <= maxY
    );
  }

  private getBoundingBox(geometry: any) {
    // Implement based on your geometry types
    // This is a simplified example
    return {
      minX: geometry.bbox[0],
      minY: geometry.bbox[1],
      maxX: geometry.bbox[2],
      maxY: geometry.bbox[3]
    };
  }

  private filterByWhereClause(properties: Property[], where: string): Property[] {
    // Implement where clause filtering
    // This is a simplified example that supports basic comparison
    const [field, operator, value] = where.split(/\s+/);
    
    return properties.filter(property => {
      const fieldValue = this.getFieldValue(property, field);
      switch (operator) {
        case '=':
          return fieldValue === value;
        case '>':
          return fieldValue > value;
        case '<':
          return fieldValue < value;
        case '>=':
          return fieldValue >= value;
        case '<=':
          return fieldValue <= value;
        case '!=':
          return fieldValue !== value;
        default:
          return true;
      }
    });
  }

  private sortGroupedResults(
    results: Array<{
      group: Record<string, any>;
      statistics: Record<string, number>;
    }>,
    orderByFields: string[]
  ) {
    return results.sort((a, b) => {
      for (const field of orderByFields) {
        const [fieldName, direction] = field.split(' ');
        const aValue = this.getNestedValue(a, fieldName);
        const bValue = this.getNestedValue(b, fieldName);
        
        if (aValue !== bValue) {
          return direction?.toLowerCase() === 'desc'
            ? bValue - aValue
            : aValue - bValue;
        }
      }
      return 0;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, part) => current?.[part], obj);
  }
}

export const statisticsManager = new StatisticsManager();