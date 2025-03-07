import { SyncMetrics, ErrorMetrics } from '../types';

export class SyncAnalytics {
  private metrics: SyncMetrics[] = [];
  private errors: Map<string, ErrorMetrics> = new Map();
  private readonly maxMetricsHistory = 100;
  private readonly maxErrorExamples = 5;

  addMetrics(metrics: Omit<SyncMetrics, 'timestamp'>) {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now(),
    });

    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  trackError(error: Error) {
    const errorType = error.constructor.name;
    const existing = this.errors.get(errorType) || {
      type: errorType,
      count: 0,
      lastOccurrence: 0,
      examples: [],
    };

    existing.count++;
    existing.lastOccurrence = Date.now();
    
    if (existing.examples.length < this.maxErrorExamples) {
      existing.examples.push({
        message: error.message,
        timestamp: Date.now(),
      });
    }

    this.errors.set(errorType, existing);
  }

  getAnalytics() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);

    const averages = recentMetrics.reduce((acc, m) => ({
      duration: acc.duration + m.duration,
      propertiesProcessed: acc.propertiesProcessed + m.propertiesProcessed,
      errors: acc.errors + m.errors,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      requestCount: acc.requestCount + m.requestCount,
    }), {
      duration: 0,
      propertiesProcessed: 0,
      errors: 0,
      memoryUsage: 0,
      requestCount: 0,
    });

    const count = recentMetrics.length || 1;

    return {
      syncStats: {
        total: this.metrics.length,
        last24Hours: recentMetrics.length,
        averages: {
          duration: averages.duration / count,
          propertiesPerSync: averages.propertiesProcessed / count,
          errorsPerSync: averages.errors / count,
          memoryUsage: averages.memoryUsage / count,
          requestsPerSync: averages.requestCount / count,
        },
      },
      errorStats: Array.from(this.errors.values())
        .sort((a, b) => b.count - a.count)
        .map(error => ({
          type: error.type,
          count: error.count,
          lastOccurrence: error.lastOccurrence,
          recentExamples: error.examples
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3),
        })),
      trends: this.calculateTrends(),
    };
  }

  private calculateTrends() {
    if (this.metrics.length < 2) return null;

    const periods = [
      { name: '1h', ms: 60 * 60 * 1000 },
      { name: '24h', ms: 24 * 60 * 60 * 1000 },
      { name: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
    ];

    return periods.map(period => {
      const cutoff = Date.now() - period.ms;
      const periodMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

      if (periodMetrics.length < 2) return null;

      const first = periodMetrics[0];
      const last = periodMetrics[periodMetrics.length - 1];

      return {
        period: period.name,
        metrics: {
          duration: this.calculateTrend(first.duration, last.duration),
          propertiesProcessed: this.calculateTrend(
            first.propertiesProcessed,
            last.propertiesProcessed
          ),
          errors: this.calculateTrend(first.errors, last.errors),
          memoryUsage: this.calculateTrend(first.memoryUsage, last.memoryUsage),
        },
      };
    }).filter(Boolean);
  }

  private calculateTrend(start: number, end: number) {
    const change = end - start;
    const percentChange = (change / start) * 100;
    return {
      change,
      percentChange,
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
    };
  }
}