import { PerformanceMetrics } from './TestRunner';

interface PerformanceHistory {
  timestamp: number;
  metrics: {
    pdf: PerformanceMetrics;
    csv: PerformanceMetrics;
    json: PerformanceMetrics;
    xml: PerformanceMetrics;
  };
  dataSize: number;
}

interface RegressionAlert {
  format: string;
  metric: 'duration' | 'memoryUsage';
  previousValue: number;
  currentValue: number;
  percentageChange: number;
}

class PerformanceMonitor {
  private history: PerformanceHistory[] = [];
  private readonly maxHistoryLength = 100;
  private readonly regressionThreshold = 0.2; // 20% degradation threshold

  addMetrics(metrics: PerformanceHistory) {
    this.history.push(metrics);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  detectRegressions(): RegressionAlert[] {
    if (this.history.length < 2) return [];

    const current = this.history[this.history.length - 1];
    const previous = this.history[this.history.length - 2];
    const alerts: RegressionAlert[] = [];

    // Check each format
    Object.entries(current.metrics).forEach(([format, metrics]) => {
      const prevMetrics = previous.metrics[format as keyof typeof previous.metrics];

      // Check duration regression
      const durationChange = (metrics.duration - prevMetrics.duration) / prevMetrics.duration;
      if (durationChange > this.regressionThreshold) {
        alerts.push({
          format,
          metric: 'duration',
          previousValue: prevMetrics.duration,
          currentValue: metrics.duration,
          percentageChange: durationChange * 100,
        });
      }

      // Check memory regression
      const memoryChange = (metrics.memoryUsage - prevMetrics.memoryUsage) / prevMetrics.memoryUsage;
      if (memoryChange > this.regressionThreshold) {
        alerts.push({
          format,
          metric: 'memoryUsage',
          previousValue: prevMetrics.memoryUsage,
          currentValue: metrics.memoryUsage,
          percentageChange: memoryChange * 100,
        });
      }
    });

    return alerts;
  }

  getPerformanceTrends() {
    if (this.history.length < 2) return null;

    const trends = {
      pdf: this.calculateTrend('pdf'),
      csv: this.calculateTrend('csv'),
      json: this.calculateTrend('json'),
      xml: this.calculateTrend('xml'),
    };

    return trends;
  }

  private calculateTrend(format: string) {
    const recentHistory = this.history.slice(-10); // Last 10 entries
    
    const durationTrend = this.calculateLinearRegression(
      recentHistory.map((h, i) => [i, h.metrics[format as keyof typeof h.metrics].duration])
    );

    const memoryTrend = this.calculateLinearRegression(
      recentHistory.map((h, i) => [i, h.metrics[format as keyof typeof h.metrics].memoryUsage])
    );

    return {
      duration: durationTrend,
      memory: memoryTrend,
    };
  }

  private calculateLinearRegression(points: [number, number][]) {
    const n = points.length;
    if (n < 2) return 0;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    points.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }
}

export const performanceMonitor = new PerformanceMonitor();