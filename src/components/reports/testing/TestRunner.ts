import { Property } from '../../../types';
import { generatePDF } from '../exporters/pdf';
import { generateCSV } from '../exporters/csv';
import { generateJSON } from '../exporters/json';
import { generateXML } from '../exporters/xml';

// Enhanced mock data generators
export const generateMockProperties = (count: number): Property[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `prop-${i}`,
    address: `${i} Market Street`,
    value: Math.floor(Math.random() * 1000000) + 100000,
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
    cluster: `cluster-${Math.floor(i / 100)}`,
  }));
};

export const generateMockClusters = (properties: Property[]) => {
  const clusters = new Map<string, Property[]>();
  
  properties.forEach(property => {
    if (!clusters.has(property.cluster)) {
      clusters.set(property.cluster, []);
    }
    clusters.get(property.cluster)!.push(property);
  });

  return Array.from(clusters.entries()).map(([name, props]) => ({
    name,
    averageValue: props.reduce((sum, p) => sum + p.value, 0) / props.length,
    count: props.length,
    properties: props,
  }));
};

// Performance monitoring
interface PerformanceMetrics {
  duration: number;
  memoryUsage: number;
  success: boolean;
  error?: string;
}

const measurePerformance = async (
  operation: () => Promise<void>
): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  try {
    await operation();
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return {
      duration: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      success: true,
    };
  } catch (error) {
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return {
      duration: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Enhanced test runners with performance metrics
export const runPDFTest = async (dataSize: 'small' | 'medium' | 'large' | 'extreme') => {
  console.log(`Starting PDF test with ${dataSize} dataset...`);

  const counts = {
    small: 100,
    medium: 1000,
    large: 10000,
    extreme: 100000,
  };

  const properties = generateMockProperties(counts[dataSize]);
  const clusters = generateMockClusters(properties);

  const metrics = await measurePerformance(async () => {
    await generatePDF({ properties, clusters, options: ['heatmap', 'clusters'] });
  });

  console.log(`PDF Test Results (${dataSize}):`);
  console.log(`- Duration: ${metrics.duration.toFixed(2)}ms`);
  console.log(`- Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- Success: ${metrics.success}`);
  if (!metrics.success) console.error(`- Error: ${metrics.error}`);

  return metrics;
};

// Similar enhancements for CSV, JSON, and XML tests...
export const runCSVTest = async (dataSize: 'small' | 'medium' | 'large' | 'extreme') => {
  console.log(`Starting CSV test with ${dataSize} dataset...`);

  const counts = {
    small: 100,
    medium: 1000,
    large: 10000,
    extreme: 100000,
  };

  const properties = generateMockProperties(counts[dataSize]);
  const clusters = generateMockClusters(properties);

  const metrics = await measurePerformance(async () => {
    await generateCSV({ properties, clusters, options: ['all'] });
  });

  console.log(`CSV Test Results (${dataSize}):`);
  console.log(`- Duration: ${metrics.duration.toFixed(2)}ms`);
  console.log(`- Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- Success: ${metrics.success}`);
  if (!metrics.success) console.error(`- Error: ${metrics.error}`);

  return metrics;
};

// Concurrent export testing
export const runConcurrentTests = async (dataSize: 'small' | 'medium' | 'large') => {
  console.log(`Starting concurrent export tests with ${dataSize} dataset...`);

  const properties = generateMockProperties(
    { small: 100, medium: 1000, large: 10000 }[dataSize]
  );
  const clusters = generateMockClusters(properties);
  const data = { properties, clusters, options: ['all'] };

  const startTime = performance.now();

  try {
    const results = await Promise.all([
      generatePDF(data),
      generateCSV(data),
      generateJSON(data),
      generateXML(data),
    ]);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Concurrent Test Results:`);
    console.log(`- Total Duration: ${duration.toFixed(2)}ms`);
    console.log(`- All exports completed successfully`);

    return {
      success: true,
      duration,
    };
  } catch (error) {
    console.error('Concurrent test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Comprehensive test suite
export const runAllTests = async () => {
  const results = {
    individual: {
      pdf: {} as Record<string, PerformanceMetrics>,
      csv: {} as Record<string, PerformanceMetrics>,
      json: {} as Record<string, PerformanceMetrics>,
      xml: {} as Record<string, PerformanceMetrics>,
    },
    concurrent: {} as Record<string, any>,
  };

  const sizes: Array<'small' | 'medium' | 'large' | 'extreme'> = [
    'small',
    'medium',
    'large',
    'extreme',
  ];

  // Run individual format tests
  for (const size of sizes) {
    results.individual.pdf[size] = await runPDFTest(size);
    results.individual.csv[size] = await runCSVTest(size);
    results.individual.json[size] = await runJSONTest(size);
    results.individual.xml[size] = await runXMLTest(size);
  }

  // Run concurrent tests (excluding 'extreme' size)
  for (const size of sizes.slice(0, -1)) {
    results.concurrent[size] = await runConcurrentTests(size);
  }

  return results;
};

// Memory leak detection
export const detectMemoryLeaks = async () => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const iterations = 10;
  const memoryUsage: number[] = [];

  for (let i = 0; i < iterations; i++) {
    await runAllTests();
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    memoryUsage.push(currentMemory);
  }

  const memoryGrowth = memoryUsage[memoryUsage.length - 1] - initialMemory;
  const hasLeak = memoryGrowth > 50 * 1024 * 1024; // Flag if growth exceeds 50MB

  return {
    hasLeak,
    memoryGrowth: memoryGrowth / 1024 / 1024, // Convert to MB
    memoryUsage: memoryUsage.map(m => m / 1024 / 1024), // Convert to MB
  };
};