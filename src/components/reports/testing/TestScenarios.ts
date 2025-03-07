import { Property } from '../../../types';

// Test scenario types
export interface TestScenario {
  name: string;
  description: string;
  dataSize: number;
  config: {
    includeHeatmap: boolean;
    includeClusters: boolean;
    includeOutliers: boolean;
    includePredictions: boolean;
  };
}

// Predefined test scenarios
export const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Basic Report',
    description: 'Simple report with minimal data',
    dataSize: 100,
    config: {
      includeHeatmap: false,
      includeClusters: true,
      includeOutliers: false,
      includePredictions: false,
    },
  },
  {
    name: 'Full Analysis',
    description: 'Complete report with all features',
    dataSize: 1000,
    config: {
      includeHeatmap: true,
      includeClusters: true,
      includeOutliers: true,
      includePredictions: true,
    },
  },
  {
    name: 'Large Dataset',
    description: 'Stress test with large dataset',
    dataSize: 100000,
    config: {
      includeHeatmap: true,
      includeClusters: true,
      includeOutliers: true,
      includePredictions: true,
    },
  },
  {
    name: 'Heatmap Focus',
    description: 'Report focused on heatmap analysis',
    dataSize: 5000,
    config: {
      includeHeatmap: true,
      includeClusters: false,
      includeOutliers: false,
      includePredictions: false,
    },
  },
  {
    name: 'Outlier Analysis',
    description: 'Report focused on outlier detection',
    dataSize: 10000,
    config: {
      includeHeatmap: false,
      includeClusters: true,
      includeOutliers: true,
      includePredictions: false,
    },
  },
];

// Enhanced data generators for test scenarios
export function generateTestData(scenario: TestScenario) {
  const properties: Property[] = [];
  const clusters = new Set<string>();
  
  for (let i = 0; i < scenario.dataSize; i++) {
    const cluster = `cluster-${Math.floor(i / 100)}`;
    clusters.add(cluster);
    
    // Generate more realistic property data
    const baseValue = 200000 + Math.random() * 800000;
    const outlierMultiplier = Math.random() > 0.95 ? 2.5 : 1; // 5% chance of outlier
    
    properties.push({
      id: `prop-${i}`,
      address: `${i} Market Street`,
      value: baseValue * outlierMultiplier,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1, // Centered around San Francisco
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      cluster,
    });
  }

  return {
    properties,
    clusters: Array.from(clusters),
    config: scenario.config,
  };
}

// Test scenario runner
export async function runTestScenario(scenario: TestScenario) {
  console.log(`Running test scenario: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Data size: ${scenario.dataSize} properties`);
  
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  try {
    const testData = generateTestData(scenario);
    
    // Run exports based on configuration
    const results = await Promise.all([
      scenario.config.includeHeatmap && generateHeatmapData(testData),
      scenario.config.includeClusters && generateClusterData(testData),
      scenario.config.includeOutliers && generateOutlierData(testData),
      scenario.config.includePredictions && generatePredictionData(testData),
    ].filter(Boolean));
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      scenario: scenario.name,
      success: true,
      duration: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      results,
    };
  } catch (error) {
    console.error(`Test scenario failed: ${scenario.name}`, error);
    return {
      scenario: scenario.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper functions for generating different types of report data
async function generateHeatmapData(data: any) {
  // Simulate heatmap data generation
  await new Promise(resolve => setTimeout(resolve, 100));
  return { type: 'heatmap', points: data.properties.length };
}

async function generateClusterData(data: any) {
  // Simulate cluster analysis
  await new Promise(resolve => setTimeout(resolve, 150));
  return { type: 'clusters', count: data.clusters.length };
}

async function generateOutlierData(data: any) {
  // Simulate outlier detection
  await new Promise(resolve => setTimeout(resolve, 200));
  const outliers = data.properties.filter(p => p.value > 1000000);
  return { type: 'outliers', count: outliers.length };
}

async function generatePredictionData(data: any) {
  // Simulate market predictions
  await new Promise(resolve => setTimeout(resolve, 250));
  return { type: 'predictions', count: Math.floor(data.properties.length / 100) };
}