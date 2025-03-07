export interface ScrapedProperty {
  address: string;
  value: number;
  latitude: number;
  longitude: number;
  cluster: string;
  details: {
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    lotSize: number;
    condition: string;
    lastSale?: {
      date: string;
      price: number;
    };
  };
}

export interface ScraperConfig {
  batchSize: number;
  delayBetweenBatches: number;
  maxRetries: number;
  retryDelay: number;
  maxConcurrentBatches: number;
  validationRules: {
    minValue: number;
    maxValue: number;
    minSquareFootage: number;
    maxSquareFootage: number;
    minYearBuilt: number;
    allowedConditions: string[];
  };
}

export interface ScraperResult {
  success: boolean;
  scraped: number;
  errors: string[];
  warnings: string[];
  duration: number;
  stats: {
    avgValue: number;
    medianValue: number;
    totalProperties: number;
    byCluster: Record<string, number>;
  };
}

export interface ScraperProgress {
  total: number;
  current: number;
  percentage: number;
  status: string;
  currentBatch?: {
    number: number;
    size: number;
    processed: number;
  };
  estimatedTimeRemaining?: number;
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
}