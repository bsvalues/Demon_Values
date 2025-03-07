import { ValidatedPropertyReport } from './validation';

interface DataIntegrityCheck {
  type: 'warning' | 'error';
  field: string;
  message: string;
  value: any;
}

export class DataIntegrityChecker {
  private readonly valueThresholds = {
    min: 10000,    // $10,000
    max: 100000000 // $100M
  };

  private readonly sqftThresholds = {
    min: 100,   // 100 sq ft
    max: 50000  // 50,000 sq ft
  };

  checkReport(report: ValidatedPropertyReport): DataIntegrityCheck[] {
    const checks: DataIntegrityCheck[] = [];

    // Value checks
    if (report.value < this.valueThresholds.min) {
      checks.push({
        type: 'warning',
        field: 'value',
        message: 'Property value seems unusually low',
        value: report.value
      });
    }

    if (report.value > this.valueThresholds.max) {
      checks.push({
        type: 'warning',
        field: 'value',
        message: 'Property value seems unusually high',
        value: report.value
      });
    }

    // Square footage checks
    const sqft = report.details.squareFootage;
    if (sqft < this.sqftThresholds.min) {
      checks.push({
        type: 'warning',
        field: 'squareFootage',
        message: 'Square footage seems unusually low',
        value: sqft
      });
    }

    if (sqft > this.sqftThresholds.max) {
      checks.push({
        type: 'warning',
        field: 'squareFootage',
        message: 'Square footage seems unusually high',
        value: sqft
      });
    }

    // Price per square foot check
    const ppsf = report.value / sqft;
    if (ppsf < 50 || ppsf > 10000) {
      checks.push({
        type: 'warning',
        field: 'pricePerSqFt',
        message: 'Price per square foot seems unusual',
        value: ppsf
      });
    }

    // Year built check
    const currentYear = new Date().getFullYear();
    if (report.details.yearBuilt > currentYear) {
      checks.push({
        type: 'error',
        field: 'yearBuilt',
        message: 'Year built cannot be in the future',
        value: report.details.yearBuilt
      });
    }

    // Last sale checks
    if (report.details.lastSale) {
      const saleDate = new Date(report.details.lastSale.date);
      if (saleDate > new Date()) {
        checks.push({
          type: 'error',
          field: 'lastSale.date',
          message: 'Sale date cannot be in the future',
          value: report.details.lastSale.date
        });
      }

      if (report.details.lastSale.price > report.value * 2) {
        checks.push({
          type: 'warning',
          field: 'lastSale.price',
          message: 'Last sale price is significantly higher than current value',
          value: report.details.lastSale.price
        });
      }
    }

    return checks;
  }

  validateDataset(reports: ValidatedPropertyReport[]) {
    const stats = {
      total: reports.length,
      warnings: 0,
      errors: 0,
      fields: new Map<string, number>()
    };

    const checks = reports.flatMap(report => {
      const reportChecks = this.checkReport(report);
      reportChecks.forEach(check => {
        if (check.type === 'warning') stats.warnings++;
        if (check.type === 'error') stats.errors++;
        
        const fieldCount = stats.fields.get(check.field) || 0;
        stats.fields.set(check.field, fieldCount + 1);
      });
      return reportChecks;
    });

    return {
      stats,
      checks,
      integrityScore: this.calculateIntegrityScore(stats)
    };
  }

  private calculateIntegrityScore(stats: any): number {
    const errorWeight = 1;
    const warningWeight = 0.3;
    
    const errorScore = (stats.errors / stats.total) * errorWeight;
    const warningScore = (stats.warnings / stats.total) * warningWeight;
    
    return Math.max(0, 1 - (errorScore + warningScore));
  }
}