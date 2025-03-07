import { BehaviorSubject } from 'rxjs';
import { supabase } from '../supabase';
import { ScrapedProperty, ScraperConfig, ScraperResult, ScraperProgress, ValidationError } from './types';
import { defaultConfig } from './config';

export class PropertyScraper {
  private config: ScraperConfig;
  private progress$ = new BehaviorSubject<ScraperProgress>({
    total: 0,
    current: 0,
    percentage: 0,
    status: 'idle'
  });
  private startTime: number = 0;
  private batchResults: Map<number, { success: boolean; count: number }> = new Map();

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async scrapeProperties(location: string): Promise<ScraperResult> {
    this.startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let scrapedCount = 0;

    try {
      // Check authentication status
      const session = await supabase?.auth.getSession();
      if (!session?.data.session) {
        throw new Error('Authentication required. Please sign in to Supabase first.');
      }

      this.updateProgress({
        total: 100,
        current: 0,
        percentage: 0,
        status: 'initializing',
        estimatedTimeRemaining: 0
      });

      // Process batches with concurrency control
      const totalBatches = 5;
      const batchPromises: Promise<void>[] = [];
      
      for (let i = 0; i < totalBatches; i++) {
        if (batchPromises.length >= this.config.maxConcurrentBatches) {
          await Promise.race(batchPromises);
          batchPromises.splice(0, batchPromises.length - this.config.maxConcurrentBatches + 1);
        }

        const batchPromise = this.processBatch(location, i, totalBatches)
          .then(result => {
            if (result.success) {
              scrapedCount += result.count;
            }
            this.batchResults.set(i, result);
          })
          .catch(error => {
            errors.push(`Batch ${i + 1} error: ${error.message}`);
          });

        batchPromises.push(batchPromise);
        
        if (i < totalBatches - 1) {
          await this.delay();
        }
      }

      await Promise.all(batchPromises);

      // Calculate statistics
      const stats = this.calculateStats();

      return {
        success: errors.length === 0,
        scraped: scrapedCount,
        errors,
        warnings,
        duration: Date.now() - this.startTime,
        stats
      };
    } catch (error) {
      return {
        success: false,
        scraped: scrapedCount,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        duration: Date.now() - this.startTime,
        stats: this.calculateStats()
      };
    } finally {
      this.updateProgress({
        total: 100,
        current: 100,
        percentage: 100,
        status: 'complete'
      });
    }
  }

  private async processBatch(location: string, batchIndex: number, totalBatches: number) {
    const batchNumber = batchIndex + 1;
    let retryCount = 0;
    
    while (retryCount <= this.config.maxRetries) {
      try {
        const properties = await this.scrapeBatch(location, batchIndex);
        const validatedProperties = this.validateProperties(properties);
        
        if (validatedProperties.length < properties.length) {
          const invalidCount = properties.length - validatedProperties.length;
          throw new Error(`${invalidCount} properties failed validation`);
        }

        // Store in database
        const { error } = await supabase
          ?.from('properties')
          .upsert(
            validatedProperties.map(p => ({
              address: p.address,
              value: p.value,
              latitude: p.latitude,
              longitude: p.longitude,
              cluster: p.cluster,
              details: {
                squareFootage: p.details.squareFootage,
                bedrooms: p.details.bedrooms,
                bathrooms: p.details.bathrooms,
                yearBuilt: p.details.yearBuilt,
                lotSize: p.details.lotSize,
                condition: p.details.condition,
                lastSale: p.details.lastSale
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );

        if (error) {
          if (error.code === '42501') {
            throw new Error('Permission denied. Please check your authentication status.');
          }
          throw error;
        }

        this.updateProgress({
          total: totalBatches,
          current: batchNumber,
          percentage: (batchNumber / totalBatches) * 100,
          status: `Processing batch ${batchNumber}/${totalBatches}`,
          currentBatch: {
            number: batchNumber,
            size: properties.length,
            processed: validatedProperties.length
          },
          estimatedTimeRemaining: this.estimateTimeRemaining(batchNumber, totalBatches)
        });

        return { success: true, count: validatedProperties.length };
      } catch (error) {
        retryCount++;
        if (retryCount <= this.config.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, retryCount - 1))
          );
          continue;
        }
        throw error;
      }
    }

    return { success: false, count: 0 };
  }

  private validateProperties(properties: ScrapedProperty[]): ScrapedProperty[] {
    return properties.filter(property => {
      const errors = this.validateProperty(property);
      return errors.length === 0;
    });
  }

  private validateProperty(property: ScrapedProperty): ValidationError[] {
    const errors: ValidationError[] = [];
    const rules = this.config.validationRules;

    // Value validation
    if (property.value < rules.minValue || property.value > rules.maxValue) {
      errors.push({
        field: 'value',
        value: property.value,
        message: `Value must be between ${rules.minValue} and ${rules.maxValue}`
      });
    }

    // Square footage validation
    if (property.details.squareFootage < rules.minSquareFootage || 
        property.details.squareFootage > rules.maxSquareFootage) {
      errors.push({
        field: 'squareFootage',
        value: property.details.squareFootage,
        message: `Square footage must be between ${rules.minSquareFootage} and ${rules.maxSquareFootage}`
      });
    }

    // Year built validation
    if (property.details.yearBuilt < rules.minYearBuilt || 
        property.details.yearBuilt > new Date().getFullYear()) {
      errors.push({
        field: 'yearBuilt',
        value: property.details.yearBuilt,
        message: `Year built must be between ${rules.minYearBuilt} and ${new Date().getFullYear()}`
      });
    }

    // Condition validation
    if (!rules.allowedConditions.includes(property.details.condition)) {
      errors.push({
        field: 'condition',
        value: property.details.condition,
        message: `Condition must be one of: ${rules.allowedConditions.join(', ')}`
      });
    }

    // Coordinate validation
    if (property.latitude < -90 || property.latitude > 90) {
      errors.push({
        field: 'latitude',
        value: property.latitude,
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (property.longitude < -180 || property.longitude > 180) {
      errors.push({
        field: 'longitude',
        value: property.longitude,
        message: 'Longitude must be between -180 and 180'
      });
    }

    return errors;
  }

  private calculateStats() {
    const values: number[] = [];
    const clusterCounts: Record<string, number> = {};

    this.batchResults.forEach(result => {
      if (result.success) {
        // Add stats calculation logic here
        values.push(result.count);
      }
    });

    return {
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
      medianValue: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
      totalProperties: values.reduce((a, b) => a + b, 0),
      byCluster: clusterCounts
    };
  }

  private estimateTimeRemaining(currentBatch: number, totalBatches: number): number {
    const elapsed = Date.now() - this.startTime;
    const averageTimePerBatch = elapsed / currentBatch;
    return Math.round(averageTimePerBatch * (totalBatches - currentBatch));
  }

  private async scrapeBatch(location: string, page: number): Promise<ScrapedProperty[]> {
    // Simulate scraping a batch of properties
    return Array.from({ length: this.config.batchSize }, (_, i) => {
      const id = page * this.config.batchSize + i;
      const baseValue = 200000 + Math.random() * 800000;
      const lat = 46.2087 + (Math.random() - 0.5) * 0.1; // Centered on Tri-Cities
      const lng = -119.1372 + (Math.random() - 0.5) * 0.1;

      return {
        address: `${id + 1} ${['Main', 'Oak', 'Maple', 'Cedar'][Math.floor(Math.random() * 4)]} St, ${location}`,
        value: Math.round(baseValue),
        latitude: lat,
        longitude: lng,
        cluster: ['residential', 'commercial'][Math.floor(Math.random() * 2)],
        details: {
          squareFootage: Math.round(1000 + Math.random() * 3000),
          bedrooms: Math.floor(2 + Math.random() * 4),
          bathrooms: Math.floor(2 + Math.random() * 3),
          yearBuilt: Math.floor(1950 + Math.random() * 70),
          lotSize: Math.round(5000 + Math.random() * 15000),
          condition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
          lastSale: Math.random() > 0.3 ? {
            date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            price: Math.round(baseValue * (0.9 + Math.random() * 0.2))
          } : undefined
        }
      };
    });
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, this.config.delayBetweenBatches));
  }

  getProgress() {
    return this.progress$.asObservable();
  }

  private updateProgress(progress: ScraperProgress) {
    this.progress$.next(progress);
  }
}

export const propertyScraper = new PropertyScraper();