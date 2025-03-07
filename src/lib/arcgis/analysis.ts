import { Property } from '../../types';

interface AnalysisResult {
  type: string;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

export class AnalysisManager {
  private results = new Map<string, AnalysisResult[]>();

  async analyzeHotspots(properties: Property[]): Promise<AnalysisResult> {
    const result = await this.calculateHotspots(properties);
    this.storeResult('hotspots', result);
    return result;
  }

  async analyzeOutliers(properties: Property[]): Promise<AnalysisResult> {
    const result = await this.detectOutliers(properties);
    this.storeResult('outliers', result);
    return result;
  }

  async analyzePatterns(properties: Property[]): Promise<AnalysisResult> {
    const result = await this.findPatterns(properties);
    this.storeResult('patterns', result);
    return result;
  }

  private async calculateHotspots(properties: Property[]): Promise<AnalysisResult> {
    // Implement Getis-Ord Gi* statistic
    const hotspots = properties.map(property => {
      const neighbors = this.findNeighbors(property, properties);
      const localMean = this.calculateLocalMean(property, neighbors);
      const zscore = this.calculateZScore(property.value, localMean);
      
      return {
        ...property,
        hotspotScore: zscore,
        confidence: this.calculateConfidence(zscore)
      };
    });

    return {
      type: 'hotspots',
      timestamp: Date.now(),
      data: hotspots
    };
  }

  private async detectOutliers(properties: Property[]): Promise<AnalysisResult> {
    // Implement Local Moran's I statistic
    const mean = properties.reduce((sum, p) => sum + p.value, 0) / properties.length;
    const stdDev = Math.sqrt(
      properties.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / properties.length
    );

    const outliers = properties.map(property => {
      const zScore = (property.value - mean) / stdDev;
      return {
        ...property,
        outlierScore: zScore,
        isOutlier: Math.abs(zScore) > 2
      };
    });

    return {
      type: 'outliers',
      timestamp: Date.now(),
      data: outliers
    };
  }

  private async findPatterns(properties: Property[]): Promise<AnalysisResult> {
    // Implement pattern detection using spatial autocorrelation
    const patterns = this.calculateSpatialAutocorrelation(properties);

    return {
      type: 'patterns',
      timestamp: Date.now(),
      data: patterns
    };
  }

  private findNeighbors(property: Property, properties: Property[]): Property[] {
    const searchRadius = 0.01; // Approximately 1km
    return properties.filter(p => 
      p.id !== property.id &&
      this.calculateDistance(property, p) <= searchRadius
    );
  }

  private calculateDistance(p1: Property, p2: Property): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(p2.latitude - p1.latitude);
    const dLon = this.toRad(p2.longitude - p1.longitude);
    const lat1 = this.toRad(p1.latitude);
    const lat2 = this.toRad(p2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private calculateLocalMean(property: Property, neighbors: Property[]): number {
    if (neighbors.length === 0) return property.value;
    return neighbors.reduce((sum, n) => sum + n.value, 0) / neighbors.length;
  }

  private calculateZScore(value: number, mean: number): number {
    return (value - mean) / mean;
  }

  private calculateConfidence(zscore: number): number {
    return Math.min(0.99, 1 - 2 * (1 - this.normalCDF(Math.abs(zscore))));
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0/(1.0 + p*x);
    const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

    return sign * y;
  }

  private calculateSpatialAutocorrelation(properties: Property[]) {
    // Implement Moran's I calculation
    return properties.map(property => {
      const neighbors = this.findNeighbors(property, properties);
      const correlation = this.calculateLocalCorrelation(property, neighbors);
      return {
        ...property,
        correlation,
        patternType: this.classifyPattern(correlation)
      };
    });
  }

  private calculateLocalCorrelation(property: Property, neighbors: Property[]): number {
    if (neighbors.length === 0) return 0;
    const weights = neighbors.map(n => 1 / this.calculateDistance(property, n));
    const weightSum = weights.reduce((a, b) => a + b, 0);
    return weights.reduce((sum, w, i) => 
      sum + (w / weightSum) * neighbors[i].value, 0) / property.value;
  }

  private classifyPattern(correlation: number): string {
    if (correlation > 0.5) return 'cluster';
    if (correlation < -0.5) return 'dispersed';
    return 'random';
  }

  private storeResult(type: string, result: AnalysisResult): void {
    const typeResults = this.results.get(type) || [];
    typeResults.push(result);
    this.results.set(type, typeResults);
  }

  getResults(type: string): AnalysisResult[] {
    return this.results.get(type) || [];
  }
}

export const analysisManager = new AnalysisManager();