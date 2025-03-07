import { ArcGISLayer } from './layers';
import { metadataManager } from './metadata';

interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'enum' | 'pattern' | 'custom';
  params?: any;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: {
    timestamp: number;
    duration: number;
    recordsChecked: number;
  };
}

interface ValidationError {
  field: string;
  rule: string;
  message: string;
  records: string[];
}

interface ValidationWarning {
  field: string;
  type: string;
  message: string;
  records: string[];
}

export class ValidationManager {
  private rules = new Map<string, ValidationRule[]>();

  addRule(layerId: string, rule: ValidationRule): void {
    const layerRules = this.rules.get(layerId) || [];
    layerRules.push(rule);
    this.rules.set(layerId, layerRules);
  }

  async validateLayer(layer: ArcGISLayer, data: any[]): Promise<ValidationResult> {
    const startTime = performance.now();
    const rules = this.rules.get(layer.id) || [];
    const metadata = await metadataManager.fetchMetadata(layer.id, layer.url);

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate field existence and types
    metadata.fields.forEach(field => {
      const invalidRecords = data.filter(record => {
        const value = record.attributes[field.name];
        return !this.validateFieldType(value, field.type);
      });

      if (invalidRecords.length > 0) {
        errors.push({
          field: field.name,
          rule: 'type',
          message: `Invalid type for field ${field.name}`,
          records: invalidRecords.map(r => r.attributes.OBJECTID)
        });
      }
    });

    // Apply custom validation rules
    rules.forEach(rule => {
      const invalidRecords = data.filter(record => {
        const value = record.attributes[rule.field];
        return !this.validateRule(value, rule);
      });

      if (invalidRecords.length > 0) {
        errors.push({
          field: rule.field,
          rule: rule.type,
          message: rule.message,
          records: invalidRecords.map(r => r.attributes.OBJECTID)
        });
      }
    });

    // Check for potential data quality issues
    this.checkDataQuality(data).forEach(warning => {
      warnings.push(warning);
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        timestamp: Date.now(),
        duration: performance.now() - startTime,
        recordsChecked: data.length
      }
    };
  }

  private validateFieldType(value: any, type: string): boolean {
    if (value === null || value === undefined) return true;

    switch (type) {
      case 'esriFieldTypeString':
        return typeof value === 'string';
      case 'esriFieldTypeDouble':
      case 'esriFieldTypeSingle':
      case 'esriFieldTypeInteger':
      case 'esriFieldTypeSmallInteger':
        return typeof value === 'number' && !isNaN(value);
      case 'esriFieldTypeDate':
        return !isNaN(Date.parse(value));
      case 'esriFieldTypeOID':
        return Number.isInteger(value) && value > 0;
      default:
        return true;
    }
  }

  private validateRule(value: any, rule: ValidationRule): boolean {
    if (value === null || value === undefined) {
      return rule.type !== 'required';
    }

    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      case 'range':
        return value >= rule.params.min && value <= rule.params.max;
      case 'enum':
        return rule.params.values.includes(value);
      case 'pattern':
        return new RegExp(rule.params.pattern).test(value);
      case 'custom':
        return rule.params.validate(value);
      default:
        return true;
    }
  }

  private checkDataQuality(data: any[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for outliers in numeric fields
    const numericFields = new Set(['VALUE', 'AREA', 'LENGTH']);
    numericFields.forEach(field => {
      const values = data
        .map(d => d.attributes[field])
        .filter(v => typeof v === 'number');

      if (values.length > 0) {
        const stats = this.calculateStats(values);
        const outliers = data.filter(d => {
          const value = d.attributes[field];
          return typeof value === 'number' && 
                 Math.abs((value - stats.mean) / stats.stdDev) > 3;
        });

        if (outliers.length > 0) {
          warnings.push({
            field,
            type: 'outlier',
            message: `Found ${outliers.length} statistical outliers in ${field}`,
            records: outliers.map(r => r.attributes.OBJECTID)
          });
        }
      }
    });

    // Check for duplicate geometries
    const geometryHashes = new Map<string, string[]>();
    data.forEach(record => {
      if (record.geometry) {
        const hash = this.hashGeometry(record.geometry);
        const existing = geometryHashes.get(hash) || [];
        existing.push(record.attributes.OBJECTID);
        geometryHashes.set(hash, existing);
      }
    });

    geometryHashes.forEach((objectIds, hash) => {
      if (objectIds.length > 1) {
        warnings.push({
          field: 'geometry',
          type: 'duplicate',
          message: `Found ${objectIds.length} records with identical geometries`,
          records: objectIds
        });
      }
    });

    return warnings;
  }

  private calculateStats(values: number[]) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return {
      mean,
      stdDev: Math.sqrt(variance)
    };
  }

  private hashGeometry(geometry: any): string {
    // Simple geometry hashing for duplicate detection
    if (geometry.x !== undefined && geometry.y !== undefined) {
      return `${geometry.x.toFixed(6)},${geometry.y.toFixed(6)}`;
    }
    if (geometry.rings) {
      return geometry.rings
        .map((ring: number[][]) => 
          ring.map(coord => coord.map(v => v.toFixed(6)).join(','))
            .join('|')
        )
        .join(';');
    }
    return JSON.stringify(geometry);
  }
}

export const validationManager = new ValidationManager();