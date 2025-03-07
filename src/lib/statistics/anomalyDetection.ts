import { Property } from '../../types';

export interface Anomaly {
  property: Property;
  score: number;
  type: 'value' | 'spatial' | 'temporal';
  confidence: number;
  factors: Array<{
    name: string;
    contribution: number;
  }>;
}

export class AnomalyDetector {
  private readonly zScoreThreshold = 3;
  private readonly isolationThreshold = 0.95;
  private readonly temporalThreshold = 0.9;

  detectAnomalies(properties: Property[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Value-based anomalies
    const valueAnomalies = this.detectValueAnomalies(properties);
    anomalies.push(...valueAnomalies);
    
    // Spatial anomalies
    const spatialAnomalies = this.detectSpatialAnomalies(properties);
    anomalies.push(...spatialAnomalies);
    
    // Temporal anomalies
    const temporalAnomalies = this.detectTemporalAnomalies(properties);
    anomalies.push(...temporalAnomalies);
    
    return this.deduplicateAnomalies(anomalies);
  }

  private detectValueAnomalies(properties: Property[]): Anomaly[] {
    const values = properties.map(p => p.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const std = Math.sqrt(
      values.reduce((a, b) => a + (b - mean) ** 2) / values.length
    );

    return properties
      .map(property => {
        const zScore = Math.abs((property.value - mean) / std);
        if (zScore > this.zScoreThreshold) {
          return {
            property,
            score: zScore,
            type: 'value' as const,
            confidence: this.calculateConfidence(zScore),
            factors: this.analyzeValueFactors(property, mean, std)
          };
        }
        return null;
      })
      .filter((a): a is Anomaly => a !== null);
  }

  private detectSpatialAnomalies(properties: Property[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    properties.forEach(property => {
      const neighbors = this.findNeighbors(property, properties);
      const isolation = this.calculateIsolation(property, neighbors);
      
      if (isolation > this.isolationThreshold) {
        anomalies.push({
          property,
          score: isolation,
          type: 'spatial',
          confidence: this.calculateConfidence(isolation),
          factors: this.analyzeSpatialFactors(property, neighbors)
        });
      }
    });
    
    return anomalies;
  }

  private detectTemporalAnomalies(properties: Property[]): Anomaly[] {
    // Sort properties by timestamp
    const sorted = [...properties].sort((a, b) => 
      a.timestamp - b.timestamp
    );
    
    const anomalies: Anomaly[] = [];
    const windowSize = 5;
    
    for (let i = windowSize; i < sorted.length; i++) {
      const window = sorted.slice(i - windowSize, i);
      const current = sorted[i];
      
      const temporalScore = this.calculateTemporalAnomaly(current, window);
      if (temporalScore > this.temporalThreshold) {
        anomalies.push({
          property: current,
          score: temporalScore,
          type: 'temporal',
          confidence: this.calculateConfidence(temporalScore),
          factors: this.analyzeTemporalFactors(current, window)
        });
      }
    }
    
    return anomalies;
  }

  private findNeighbors(
    property: Property,
    properties: Property[],
    radius = 1000 // meters
  ) {
    return properties.filter(p => 
      p !== property && 
      this.calculateDistance(property, p) <= radius
    );
  }

  private calculateDistance(p1: Property, p2: Property): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(p1.latitude);
    const φ2 = this.toRadians(p2.latitude);
    const Δφ = this.toRadians(p2.latitude - p1.latitude);
    const Δλ = this.toRadians(p2.longitude - p1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
             
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private calculateIsolation(property: Property, neighbors: Property[]): number {
    if (neighbors.length === 0) return 1;
    
    const distances = neighbors.map(n => this.calculateDistance(property, n));
    const meanDistance = distances.reduce((a, b) => a + b) / distances.length;
    
    return 1 / (1 + Math.exp(-meanDistance / 1000));
  }

  private calculateTemporalAnomaly(
    current: Property,
    window: Property[]
  ): number {
    const values = window.map(p => p.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const std = Math.sqrt(
      values.reduce((a, b) => a + (b - mean) ** 2) / values.length
    );
    
    return Math.abs((current.value - mean) / std);
  }

  private calculateConfidence(score: number): number {
    return 1 / (1 + Math.exp(-score + 3));
  }

  private analyzeValueFactors(
    property: Property,
    mean: number,
    std: number
  ) {
    return [
      {
        name: 'absolute_deviation',
        contribution: Math.abs(property.value - mean) / std
      },
      {
        name: 'relative_size',
        contribution: property.value / mean
      }
    ];
  }

  private analyzeSpatialFactors(property: Property, neighbors: Property[]) {
    if (neighbors.length === 0) {
      return [{ name: 'isolation', contribution: 1 }];
    }
    
    const neighborValues = neighbors.map(n => n.value);
    const meanValue = neighborValues.reduce((a, b) => a + b) / neighbors.length;
    
    return [
      {
        name: 'value_difference',
        contribution: Math.abs(property.value - meanValue) / meanValue
      },
      {
        name: 'spatial_isolation',
        contribution: this.calculateIsolation(property, neighbors)
      }
    ];
  }

  private analyzeTemporalFactors(property: Property, window: Property[]) {
    const values = window.map(p => p.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const trend = this.calculateTrend(window);
    
    return [
      {
        name: 'trend_deviation',
        contribution: Math.abs(property.value - (mean + trend))
      },
      {
        name: 'velocity',
        contribution: Math.abs(
          (property.value - values[values.length - 1]) / values[values.length - 1]
        )
      }
    ];
  }

  private calculateTrend(window: Property[]): number {
    const x = Array.from(
      { length: window.length }, 
      (_, i) => i
    );
    const y = window.map(p => p.value);
    
    const n = window.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private deduplicateAnomalies(anomalies: Anomaly[]): Anomaly[] {
    const uniqueAnomalies = new Map<string, Anomaly>();
    
    anomalies.forEach(anomaly => {
      const existingAnomaly = uniqueAnomalies.get(anomaly.property.id);
      
      if (!existingAnomaly || anomaly.score > existingAnomaly.score) {
        uniqueAnomalies.set(anomaly.property.id, anomaly);
      }
    });
    
    return Array.from(uniqueAnomalies.values());
  }
}

export const anomalyDetector = new AnomalyDetector();