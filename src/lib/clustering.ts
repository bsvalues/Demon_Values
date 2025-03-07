import { Property, RegionalAnalysis } from '../types';

// K-means clustering implementation
export function kMeansClustering(properties: Property[], k: number = 3): Property[][] {
  // Initialize centroids randomly
  let centroids = properties
    .sort(() => 0.5 - Math.random())
    .slice(0, k)
    .map(p => ({ value: p.value, latitude: p.latitude, longitude: p.longitude }));

  let clusters: Property[][] = [];
  let previousClusters: Property[][] = [];
  let iterations = 0;
  const maxIterations = 100;

  do {
    previousClusters = clusters;
    clusters = Array.from({ length: k }, () => []);

    // Assign properties to nearest centroid
    properties.forEach(property => {
      const distances = centroids.map(centroid => 
        calculateDistance(property, centroid)
      );
      const nearestCentroidIndex = distances.indexOf(Math.min(...distances));
      clusters[nearestCentroidIndex].push(property);
    });

    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[clusters.indexOf(cluster)];
      return {
        value: cluster.reduce((sum, p) => sum + p.value, 0) / cluster.length,
        latitude: cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length,
        longitude: cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length,
      };
    });

    iterations++;
  } while (!areClustersEqual(clusters, previousClusters) && iterations < maxIterations);

  return clusters;
}

// DBSCAN clustering implementation
export function dbscanClustering(
  properties: Property[],
  eps: number = 0.5,
  minPoints: number = 3
): Property[][] {
  const visited = new Set<string>();
  const clusters: Property[][] = [];
  let noise: Property[] = [];

  properties.forEach(property => {
    if (visited.has(property.id)) return;
    visited.add(property.id);

    const neighbors = findNeighbors(property, properties, eps);
    
    if (neighbors.length < minPoints) {
      noise.push(property);
      return;
    }

    const cluster: Property[] = [property];
    let index = 0;

    while (index < cluster.length) {
      const current = cluster[index];
      const currentNeighbors = findNeighbors(current, properties, eps);

      if (currentNeighbors.length >= minPoints) {
        currentNeighbors.forEach(neighbor => {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            cluster.push(neighbor);
          }
        });
      }

      index++;
    }

    clusters.push(cluster);
  });

  if (noise.length > 0) {
    clusters.push(noise); // Add noise points as the last cluster
  }

  return clusters;
}

// Helper functions
function calculateDistance(p1: Property, p2: { latitude: number; longitude: number; value: number }) {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(p1.latitude);
  const lat2 = toRadians(p2.latitude);
  const deltaLat = toRadians(p2.latitude - p1.latitude);
  const deltaLon = toRadians(p2.longitude - p1.longitude);

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Normalize value difference
  const valueDiff = Math.abs(p1.value - p2.value) / Math.max(p1.value, p2.value);

  // Combine geographic and value distances
  return distance * (1 + valueDiff);
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function findNeighbors(property: Property, properties: Property[], eps: number): Property[] {
  return properties.filter(p => 
    p.id !== property.id && calculateDistance(property, p) <= eps
  );
}

function areClustersEqual(clusters1: Property[][], clusters2: Property[][]): boolean {
  if (!clusters2.length) return false;
  if (clusters1.length !== clusters2.length) return false;

  return clusters1.every((cluster, i) => 
    cluster.length === clusters2[i].length &&
    cluster.every(p => clusters2[i].some(p2 => p.id === p2.id))
  );
}

// Market force analysis
export function analyzeMarketForces(cluster: Property[]): RegionalAnalysis['dominantFeatures'] {
  const baseValue = cluster.reduce((sum, p) => sum + p.value, 0) / cluster.length;
  
  // Calculate feature importance using statistical analysis
  const features = [
    { feature: 'location', importance: calculateLocationImportance(cluster) },
    { feature: 'size', importance: calculateSizeImportance(cluster) },
    { feature: 'age', importance: calculateAgeImportance(cluster) }
  ];

  // Calculate percentage impact for each feature
  return features.map(f => ({
    ...f,
    percentageImpact: f.importance * 20 // Convert importance to percentage impact
  })).sort((a, b) => b.importance - a.importance);
}

function calculateLocationImportance(cluster: Property[]): number {
  // Calculate location importance based on geographic dispersion
  const latitudes = cluster.map(p => p.latitude);
  const longitudes = cluster.map(p => p.longitude);
  
  const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
  const lonSpread = Math.max(...longitudes) - Math.min(...longitudes);
  
  // Normalize the geographic spread to a 0-1 scale
  return 1 - Math.min(Math.sqrt(latSpread * latSpread + lonSpread * lonSpread) / 10, 1);
}

function calculateSizeImportance(cluster: Property[]): number {
  // Simulate size importance based on value correlation
  return 0.3 + Math.random() * 0.2; // Placeholder for actual size correlation
}

function calculateAgeImportance(cluster: Property[]): number {
  // Simulate age importance based on value correlation
  return 0.2 + Math.random() * 0.2; // Placeholder for actual age correlation
}

// Export clustering analysis functions
export function analyzeCluster(cluster: Property[]): RegionalAnalysis {
  const dominantFeatures = analyzeMarketForces(cluster);
  const averageValue = cluster.reduce((sum, p) => sum + p.value, 0) / cluster.length;

  return {
    cluster: `Cluster ${Math.random().toString(36).substr(2, 9)}`,
    averageValue,
    count: cluster.length,
    dominantFeatures,
    adjustmentComparison: calculateAdjustmentComparison(cluster)
  };
}

function calculateAdjustmentComparison(cluster: Property[]) {
  const flatTotal = cluster.reduce((sum, p) => sum + p.value * 0.1, 0);
  const percentageTotal = cluster.reduce((sum, p) => {
    const basePercentage = 0.1;
    const scaleFactor = Math.log10(p.value / 100000) + 1;
    return sum + (p.value * basePercentage * scaleFactor);
  }, 0);

  return {
    flat: {
      total: flatTotal,
      average: flatTotal / cluster.length
    },
    percentage: {
      total: percentageTotal,
      average: percentageTotal / cluster.length
    },
    difference: percentageTotal - flatTotal
  };
}