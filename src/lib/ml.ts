import { Property } from '../types';

// Simulated ML model weights (in a real app, these would come from a trained model)
const FEATURE_WEIGHTS = {
  'location': 0.4,
  'size': 0.3,
  'age': 0.3,
};

interface PredictionResult {
  predictedValue: number;
  confidence: number;
  featureContributions: {
    feature: string;
    contribution: number;
    impact: number;
  }[];
}

export function predictPropertyValue(
  property: Property,
  weights: Record<string, number>
): PredictionResult {
  // Simulate ML prediction based on feature weights
  const baseValue = property.value;
  let predictedValue = baseValue;
  
  // Adjust value based on weight importance
  Object.entries(weights).forEach(([feature, weight]) => {
    const featureWeight = FEATURE_WEIGHTS[feature as keyof typeof FEATURE_WEIGHTS];
    predictedValue *= (1 + (weight - 0.5) * featureWeight);
  });

  // Calculate feature contributions
  const featureContributions = Object.entries(weights).map(([feature, weight]) => {
    const featureWeight = FEATURE_WEIGHTS[feature as keyof typeof FEATURE_WEIGHTS];
    const contribution = (weight - 0.5) * featureWeight;
    const impact = baseValue * contribution;

    return {
      feature,
      contribution: contribution * 100, // Convert to percentage
      impact,
    };
  });

  // Simulate confidence based on weight deviation from baseline
  const confidence = 1 - Math.abs(predictedValue - baseValue) / baseValue;

  return {
    predictedValue,
    confidence: Math.max(0.5, Math.min(0.95, confidence)), // Clamp between 50-95%
    featureContributions,
  };
}

export function calculateRegionStats(properties: Property[], weights: Record<string, number>) {
  if (properties.length === 0) {
    return {
      averageValue: 0,
      medianValue: 0,
      valueRange: [0, 0] as [number, number],
      dominantFeatures: [],
      marketTrends: [],
    };
  }

  // Calculate basic statistics
  const values = properties.map(p => p.value).sort((a, b) => a - b);
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;
  const medianValue = values[Math.floor(values.length / 2)];
  const valueRange: [number, number] = [values[0], values[values.length - 1]];

  // Simulate dominant features based on weights
  const dominantFeatures = Object.entries(weights)
    .map(([feature, weight]) => ({
      feature,
      impact: weight * FEATURE_WEIGHTS[feature as keyof typeof FEATURE_WEIGHTS],
    }))
    .sort((a, b) => b.impact - a.impact);

  // Simulate market trends
  const marketTrends = [
    { trend: 'Year-over-Year Growth', value: 0.15 },
    { trend: 'Price per Sq Ft', value: 0.08 },
    { trend: 'Days on Market', value: -0.12 },
  ];

  return {
    averageValue,
    medianValue,
    valueRange,
    dominantFeatures,
    marketTrends,
  };
}

// Enhanced ROI calculations for property improvements
export function calculateROI(
  property: Property,
  improvement: { type: string; cost: number; value: number }
) {
  const flatROI = (improvement.value - improvement.cost) / improvement.cost;
  const percentageValue = property.value * (improvement.value / property.value);
  const percentageROI = (percentageValue - improvement.cost) / improvement.cost;
  
  const paybackPeriod = improvement.cost / (improvement.value / 5); // Assume 5-year depreciation

  return {
    flatROI,
    percentageROI,
    difference: percentageROI - flatROI,
    paybackPeriod,
    recommendation: percentageROI > 0.2 ? 'Recommended' : 'Not Recommended',
  };
}

// New function to analyze regional patterns with percentage vs flat comparisons
export function analyzeRegionalPatterns(properties: Property[]) {
  // Group properties by cluster
  const clusters = properties.reduce((acc, property) => {
    if (!acc[property.cluster]) {
      acc[property.cluster] = [];
    }
    acc[property.cluster].push(property);
    return acc;
  }, {} as Record<string, Property[]>);

  // Calculate cluster statistics with both adjustment methods
  return Object.entries(clusters).map(([cluster, props]) => {
    const avgValue = props.reduce((sum, p) => sum + p.value, 0) / props.length;
    const flatAdjustments = calculateFlatAdjustments(props);
    const percentageAdjustments = calculatePercentageAdjustments(props);

    return {
      cluster,
      averageValue: avgValue,
      count: props.length,
      dominantFeatures: calculateDominantFeatures(props),
      adjustmentComparison: {
        flat: flatAdjustments,
        percentage: percentageAdjustments,
        difference: percentageAdjustments.total - flatAdjustments.total,
      },
    };
  });
}

function calculateDominantFeatures(properties: Property[]) {
  // Enhanced feature analysis with percentage impact
  return [
    { feature: 'location', importance: 0.4, percentageImpact: 8 },
    { feature: 'size', importance: 0.3, percentageImpact: 6 },
    { feature: 'age', importance: 0.3, percentageImpact: 5 },
  ].sort((a, b) => b.importance - a.importance);
}

function calculateFlatAdjustments(properties: Property[]) {
  // Simulate flat dollar adjustments
  const total = properties.reduce((sum, p) => sum + p.value * 0.1, 0); // 10% flat adjustment
  return {
    total,
    average: total / properties.length,
  };
}

function calculatePercentageAdjustments(properties: Property[]) {
  // Calculate percentage-based adjustments
  const total = properties.reduce((sum, p) => {
    const basePercentage = 0.1; // 10% base adjustment
    const scaleFactor = Math.log10(p.value / 100000) + 1; // Scale with property value
    return sum + (p.value * basePercentage * scaleFactor);
  }, 0);

  return {
    total,
    average: total / properties.length,
  };
}