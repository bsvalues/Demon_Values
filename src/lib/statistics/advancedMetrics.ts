import { Property } from '../../types';

export interface AdvancedMetrics {
  // Distribution metrics
  skewness: number;
  kurtosis: number;
  entropy: number;
  gini: number;

  // Time-based metrics
  momentum: number;
  acceleration: number;
  velocityOfChange: number;
  trendStrength: number;

  // Relationship metrics
  spatialAutocorrelation: number;
  crossCorrelation: number[];
  coherence: number;
  
  // Risk metrics
  valueAtRisk: number;
  conditionalVaR: number;
  sharpeRatio: number;
  beta: number;
}

export function calculateAdvancedMetrics(properties: Property[]): AdvancedMetrics {
  const values = properties.map(p => p.value);
  const n = values.length;
  
  // Calculate mean and standard deviation
  const mean = values.reduce((a, b) => a + b) / n;
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2) / n);

  // Distribution metrics
  const skewness = calculateSkewness(values, mean, std);
  const kurtosis = calculateKurtosis(values, mean, std);
  const entropy = calculateEntropy(values);
  const gini = calculateGiniCoefficient(values);

  // Time-based metrics
  const momentum = calculateMomentum(values);
  const acceleration = calculateAcceleration(values);
  const velocityOfChange = calculateVelocityOfChange(values);
  const trendStrength = calculateTrendStrength(values);

  // Relationship metrics
  const spatialAutocorrelation = calculateSpatialAutocorrelation(properties);
  const crossCorrelation = calculateCrossCorrelation(values);
  const coherence = calculateCoherence(values);

  // Risk metrics
  const valueAtRisk = calculateValueAtRisk(values);
  const conditionalVaR = calculateConditionalVaR(values);
  const sharpeRatio = calculateSharpeRatio(values);
  const beta = calculateBeta(values);

  return {
    skewness,
    kurtosis,
    entropy,
    gini,
    momentum,
    acceleration,
    velocityOfChange,
    trendStrength,
    spatialAutocorrelation,
    crossCorrelation,
    coherence,
    valueAtRisk,
    conditionalVaR,
    sharpeRatio,
    beta
  };
}

function calculateSkewness(values: number[], mean: number, std: number): number {
  const n = values.length;
  return values.reduce((acc, val) => acc + ((val - mean) / std) ** 3, 0) / n;
}

function calculateKurtosis(values: number[], mean: number, std: number): number {
  const n = values.length;
  return values.reduce((acc, val) => acc + ((val - mean) / std) ** 4, 0) / n - 3;
}

function calculateEntropy(values: number[]): number {
  const n = values.length;
  const probabilities = new Map<number, number>();
  
  values.forEach(val => {
    probabilities.set(val, (probabilities.get(val) || 0) + 1);
  });

  return -Array.from(probabilities.values())
    .map(count => count / n)
    .reduce((acc, p) => acc + p * Math.log2(p), 0);
}

function calculateGiniCoefficient(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b) / n;
  
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * i - n + 1) * sorted[i];
  }
  
  return numerator / (n * n * mean);
}

function calculateMomentum(values: number[]): number {
  if (values.length < 2) return 0;
  const recent = values.slice(-5);
  return (recent[recent.length - 1] - recent[0]) / recent[0];
}

function calculateAcceleration(values: number[]): number {
  if (values.length < 3) return 0;
  const velocities = [];
  for (let i = 1; i < values.length; i++) {
    velocities.push(values[i] - values[i - 1]);
  }
  return (velocities[velocities.length - 1] - velocities[0]) / velocities.length;
}

function calculateVelocityOfChange(values: number[]): number {
  if (values.length < 2) return 0;
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    changes.push(Math.abs((values[i] - values[i - 1]) / values[i - 1]));
  }
  return changes.reduce((a, b) => a + b) / changes.length;
}

function calculateTrendStrength(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b);
  const sumY = y.reduce((a, b) => a + b);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const yMean = sumY / n;
  const totalSS = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const regressionSS = y.reduce((sum, yi, i) => {
    const yPred = slope * x[i] + intercept;
    return sum + (yPred - yMean) ** 2;
  }, 0);
  
  return regressionSS / totalSS;
}

function calculateSpatialAutocorrelation(properties: Property[]): number {
  const n = properties.length;
  if (n < 2) return 0;
  
  let totalWeight = 0;
  let weightedSum = 0;
  const mean = properties.reduce((sum, p) => sum + p.value, 0) / n;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const weight = 1 / calculateDistance(properties[i], properties[j]);
      totalWeight += weight;
      weightedSum += weight * (properties[i].value - mean) * (properties[j].value - mean);
    }
  }
  
  const variance = properties.reduce((sum, p) => sum + (p.value - mean) ** 2, 0) / n;
  return weightedSum / (totalWeight * variance);
}

function calculateDistance(p1: Property, p2: Property): number {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(p1.latitude);
  const lat2 = toRadians(p2.latitude);
  const dLat = toRadians(p2.latitude - p1.latitude);
  const dLon = toRadians(p2.longitude - p1.longitude);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function calculateCrossCorrelation(values: number[]): number[] {
  const n = values.length;
  const maxLag = Math.min(10, Math.floor(n / 2));
  const correlations = [];
  
  for (let lag = 0; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < n - lag; i++) {
      correlation += values[i] * values[i + lag];
    }
    correlations.push(correlation / (n - lag));
  }
  
  return correlations;
}

function calculateCoherence(values: number[]): number {
  const correlations = calculateCrossCorrelation(values);
  const maxCorrelation = Math.max(...correlations.slice(1));
  return maxCorrelation / correlations[0];
}

function calculateValueAtRisk(values: number[], confidence = 0.95): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sorted.length);
  return sorted[index];
}

function calculateConditionalVaR(values: number[], confidence = 0.95): number {
  const sorted = [...values].sort((a, b) => a - b);
  const varIndex = Math.floor((1 - confidence) * sorted.length);
  const tailValues = sorted.slice(0, varIndex);
  return tailValues.reduce((a, b) => a + b) / tailValues.length;
}

function calculateSharpeRatio(values: number[]): number {
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const std = Math.sqrt(returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length);
  
  return mean / std;
}

function calculateBeta(values: number[]): number {
  const n = values.length;
  if (n < 2) return 1;
  
  const returns = [];
  for (let i = 1; i < n; i++) {
    returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }
  
  const marketReturns = returns.map(r => r * 1.1); // Simulated market returns
  const meanReturn = returns.reduce((a, b) => a + b) / returns.length;
  const meanMarket = marketReturns.reduce((a, b) => a + b) / marketReturns.length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < returns.length; i++) {
    covariance += (returns[i] - meanReturn) * (marketReturns[i] - meanMarket);
    marketVariance += (marketReturns[i] - meanMarket) ** 2;
  }
  
  return covariance / marketVariance;
}