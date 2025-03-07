import { supabase } from '../supabase';
import { RateLimiter } from './rateLimiter';
import { DataIntegrityChecker } from './dataIntegrity';
import { ValidatedPropertyReport, sanitizePropertyReport } from './validation';
import { geocodeAddress } from './geocoder';

interface SyncResult {
  success: boolean;
  processed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
  integrityChecks: Array<{
    type: 'warning' | 'error';
    field: string;
    message: string;
  }>;
}

export class NARRPRClient {
  private rateLimiter: RateLimiter;
  private dataIntegrityChecker: DataIntegrityChecker;

  constructor() {
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000, // 1 minute
    });
    this.dataIntegrityChecker = new DataIntegrityChecker();
  }

  async fetchAllData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      processed: 0,
      errors: [],
      integrityChecks: [],
    };

    try {
      // Fetch all available reports in batches
      let hasMore = true;
      let offset = 0;
      const batchSize = 50;

      while (hasMore) {
        await this.rateLimiter.execute(async () => {
          const reports = await this.fetchReportBatch(offset, batchSize);
          
          if (reports.length < batchSize) {
            hasMore = false;
          }

          // Process each report
          for (const report of reports) {
            try {
              const validatedReport = sanitizePropertyReport(report);
              const integrityResults = this.dataIntegrityChecker.checkReport(validatedReport);
              result.integrityChecks.push(...integrityResults);

              // Geocode address
              const { latitude, longitude } = await geocodeAddress(validatedReport.address);

              // Store comprehensive data
              await this.storePropertyData({
                ...validatedReport,
                latitude,
                longitude,
                marketTrends: await this.fetchMarketTrends(validatedReport.id),
                comparables: await this.fetchComparables(validatedReport.id),
                demographics: await this.fetchDemographics(validatedReport.id),
                schoolData: await this.fetchSchoolData(validatedReport.id),
                zoning: await this.fetchZoningData(validatedReport.id),
              });

              result.processed++;
            } catch (error) {
              result.errors.push({
                id: report.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          offset += reports.length;
        });
      }

      result.success = true;
    } catch (error) {
      console.error('Failed to fetch all NARRPR data:', error);
      throw error;
    }

    return result;
  }

  private async fetchReportBatch(offset: number, limit: number) {
    // Simulate fetching a batch of reports
    // In production, this would call the actual NARRPR API
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `report-${offset + i}`,
      address: `${offset + i} Market Street`,
      value: 100000 + Math.random() * 900000,
      details: {
        squareFootage: 1000 + Math.random() * 4000,
        bedrooms: Math.floor(2 + Math.random() * 4),
        bathrooms: Math.floor(2 + Math.random() * 3),
        yearBuilt: 1950 + Math.floor(Math.random() * 70),
        lotSize: 5000 + Math.random() * 15000,
      },
    }));
  }

  private async storePropertyData(data: any) {
    const { error } = await supabase
      .from('properties')
      .upsert({
        id: data.id,
        address: data.address,
        value: data.value,
        latitude: data.latitude,
        longitude: data.longitude,
        details: data.details,
        market_trends: data.marketTrends,
        comparables: data.comparables,
        demographics: data.demographics,
        school_data: data.schoolData,
        zoning: data.zoning,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  private async fetchMarketTrends(reportId: string) {
    // Simulate fetching market trends
    return {
      historical: Array.from({ length: 12 }, (_, i) => ({
        month: i,
        value: 100000 + Math.random() * 50000,
        sales: Math.floor(10 + Math.random() * 40),
      })),
      forecast: Array.from({ length: 6 }, (_, i) => ({
        month: i,
        value: 150000 + Math.random() * 50000,
        confidence: 0.7 + Math.random() * 0.3,
      })),
    };
  }

  private async fetchComparables(reportId: string) {
    // Simulate fetching comparable properties
    return Array.from({ length: 5 }, (_, i) => ({
      id: `comp-${i}`,
      address: `${i} Comparable Street`,
      value: 100000 + Math.random() * 900000,
      similarity: 0.7 + Math.random() * 0.3,
      adjustments: {
        size: Math.random() * 50000,
        location: Math.random() * 30000,
        condition: Math.random() * 20000,
      },
    }));
  }

  private async fetchDemographics(reportId: string) {
    // Simulate fetching demographic data
    return {
      population: 50000 + Math.random() * 100000,
      medianIncome: 50000 + Math.random() * 100000,
      ageDistribution: {
        under18: 0.2 + Math.random() * 0.1,
        '18-35': 0.3 + Math.random() * 0.1,
        '36-65': 0.35 + Math.random() * 0.1,
        over65: 0.15 + Math.random() * 0.1,
      },
      education: {
        highSchool: 0.9 + Math.random() * 0.1,
        bachelor: 0.4 + Math.random() * 0.3,
        graduate: 0.2 + Math.random() * 0.2,
      },
    };
  }

  private async fetchSchoolData(reportId: string) {
    // Simulate fetching school data
    return Array.from({ length: 3 }, (_, i) => ({
      name: `School ${i + 1}`,
      type: ['Elementary', 'Middle', 'High'][i],
      rating: 7 + Math.random() * 3,
      distance: 0.5 + Math.random() * 2,
      scores: {
        math: 70 + Math.random() * 30,
        reading: 70 + Math.random() * 30,
        science: 70 + Math.random() * 30,
      },
    }));
  }

  private async fetchZoningData(reportId: string) {
    // Simulate fetching zoning data
    return {
      code: ['R1', 'R2', 'C1'][Math.floor(Math.random() * 3)],
      description: 'Residential Single Family',
      restrictions: {
        maxHeight: 35,
        setbacks: {
          front: 20,
          side: 5,
          rear: 20,
        },
        maxLotCoverage: 0.4,
      },
      allowedUses: [
        'Single Family Residential',
        'Home Office',
        'Accessory Dwelling',
      ],
    };
  }
}

export const narrprClient = new NARRPRClient();