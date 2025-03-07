import { ScraperConfig } from './types';

export const defaultConfig: ScraperConfig = {
  batchSize: 20,
  delayBetweenBatches: 2000,
  maxRetries: 3,
  retryDelay: 1000,
  maxConcurrentBatches: 2,
  validationRules: {
    minValue: 50000,
    maxValue: 10000000,
    minSquareFootage: 200,
    maxSquareFootage: 20000,
    minYearBuilt: 1800,
    allowedConditions: ['Excellent', 'Good', 'Fair', 'Poor']
  }
};