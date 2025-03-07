export interface Property {
  id: string;
  address: string;
  value: number;
  latitude: number;
  longitude: number;
  cluster: string;
  timestamp?: number;
  details?: {
    squareFootage?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    lotSize?: number;
    garageSpaces?: number;
    condition?: string;
    lastSale?: {
      date: string;
      price: number;
    };
  };
}

export interface FilterState {
  minValue: number;
  maxValue: number;
  cluster: string;
  weights: {
    location: number;
    size: number;
    age: number;
  };
}

export interface AdjustmentResult {
  flatValue: number;
  percentageValue: number;
  difference: number;
  percentageDiff: number;
  recommendation: string;
}

export interface RegionalAnalysis {
  cluster: string;
  averageValue: number;
  count: number;
  dominantFeatures: Array<{
    feature: string;
    importance: number;
    percentageImpact: number;
  }>;
  adjustmentComparison: {
    flat: {
      total: number;
      average: number;
    };
    percentage: {
      total: number;
      average: number;
    };
    difference: number;
  };
}