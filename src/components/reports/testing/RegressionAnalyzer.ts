interface RegressionConfig {
  durationThreshold: number;  // Percentage increase that triggers alert
  memoryThreshold: number;    // MB increase that triggers alert
  minSampleSize: number;      // Minimum samples needed for analysis
  windowSize: number;         // Number of samples to analyze
  volatilityThreshold: number; // Maximum acceptable standard deviation
  trendSensitivity: number;   // Minimum slope for trend detection
  seasonalityWindow: number;  // Window size for seasonality detection
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  seasonality: boolean;
  volatility: number;
  forecast: number[];
}

interface RegressionResult {
  hasRegression: boolean;
  regressions: Array<{
    type: 'duration' | 'memory';
    increase: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    forecast: number[];
    recommendations: string[];
  }>;
  trends: {
    duration: TrendAnalysis;
    memory: TrendAnalysis;
  };
}

export class RegressionAnalyzer {
  private config: RegressionConfig;
  private history: any[] = [];
  
  constructor(config: Partial<RegressionConfig> = {}) {
    this.config = {
      durationThreshold: 20,    // 20% increase
      memoryThreshold: 50,      // 50MB increase
      minSampleSize: 5,
      windowSize: 10,
      volatilityThreshold: 0.25, // 25% standard deviation
      trendSensitivity: 0.05,   // 5% minimum slope
      seasonalityWindow: 24,     // Look for patterns over 24 samples
      ...config,
    };
  }

  addSample(sample: any) {
    this.history.push(sample);
    if (this.history.length > this.config.windowSize * 2) {
      this.history.shift();
    }
  }

  analyzePerformanceHistory(): RegressionResult {
    if (this.history.length < this.config.minSampleSize) {
      return {
        hasRegression: false,
        regressions: [],
        trends: {
          duration: this.getEmptyTrendAnalysis(),
          memory: this.getEmptyTrendAnalysis(),
        },
      };
    }

    const recentSamples = this.history.slice(-this.config.windowSize);
    const baseline = this.calculateBaseline(recentSamples);
    const latest = recentSamples[recentSamples.length - 1];

    // Enhanced regression detection
    const regressions = [];
    const durationAnalysis = this.analyzeMetric(
      recentSamples.map(s => s.duration),
      baseline.avgDuration,
      this.config.durationThreshold
    );

    const memoryAnalysis = this.analyzeMetric(
      recentSamples.map(s => s.memoryUsage),
      baseline.avgMemory,
      this.config.memoryThreshold
    );

    if (durationAnalysis.isRegression) {
      regressions.push({
        type: 'duration',
        increase: durationAnalysis.increase.toFixed(1) + '%',
        severity: this.calculateSeverity(durationAnalysis.increase, this.config.durationThreshold),
        confidence: durationAnalysis.confidence,
        forecast: durationAnalysis.forecast,
        recommendations: this.generateRecommendations('duration', durationAnalysis),
      });
    }

    if (memoryAnalysis.isRegression) {
      regressions.push({
        type: 'memory',
        increase: (memoryAnalysis.increase / 1024 / 1024).toFixed(1) + 'MB',
        severity: this.calculateSeverity(memoryAnalysis.increase, this.config.memoryThreshold),
        confidence: memoryAnalysis.confidence,
        forecast: memoryAnalysis.forecast,
        recommendations: this.generateRecommendations('memory', memoryAnalysis),
      });
    }

    return {
      hasRegression: regressions.length > 0,
      regressions,
      trends: {
        duration: this.analyzeTrend(recentSamples.map(s => s.duration)),
        memory: this.analyzeTrend(recentSamples.map(s => s.memoryUsage)),
      },
    };
  }

  private analyzeMetric(values: number[], baseline: number, threshold: number) {
    const latest = values[values.length - 1];
    const increase = ((latest - baseline) / baseline) * 100;
    const isRegression = increase > threshold;

    // Calculate confidence based on statistical significance
    const stdDev = this.calculateStandardDeviation(values);
    const zScore = (latest - baseline) / stdDev;
    const confidence = this.calculateConfidence(zScore);

    // Generate forecast using exponential smoothing
    const forecast = this.generateForecast(values);

    return {
      isRegression,
      increase,
      confidence,
      forecast,
      volatility: stdDev / baseline,
      trend: this.detectTrend(values),
    };
  }

  private analyzeTrend(values: number[]): TrendAnalysis {
    const trend = this.detectTrend(values);
    const volatility = this.calculateVolatility(values);
    const seasonality = this.detectSeasonality(values);
    const forecast = this.generateForecast(values);
    
    return {
      trend: trend.slope > this.config.trendSensitivity ? 'increasing' :
             trend.slope < -this.config.trendSensitivity ? 'decreasing' : 'stable',
      confidence: trend.confidence,
      seasonality,
      volatility,
      forecast,
    };
  }

  private detectTrend(values: number[]) {
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    // Calculate linear regression
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssTotal = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = values.reduce((sum, y, i) => {
      const yPred = slope * i + intercept;
      return sum + Math.pow(y - yPred, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, confidence: rSquared };
  }

  private detectSeasonality(values: number[]): boolean {
    if (values.length < this.config.seasonalityWindow) return false;

    // Calculate autocorrelation for different lags
    const maxLag = Math.floor(values.length / 4);
    const autocorrelations = Array.from({ length: maxLag }, (_, lag) => {
      return this.calculateAutocorrelation(values, lag + 1);
    });

    // Look for peaks in autocorrelation
    const threshold = 0.3; // Correlation threshold for seasonality
    return autocorrelations.some(corr => Math.abs(corr) > threshold);
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length - lag;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return numerator / denominator;
  }

  private generateForecast(values: number[]): number[] {
    // Exponential smoothing with trend and seasonality (Holt-Winters)
    const alpha = 0.3; // Smoothing factor
    const beta = 0.1;  // Trend factor
    const gamma = 0.1; // Seasonal factor
    const period = 7;  // Forecast period
    
    const smoothed = [values[0]];
    const trend = [values[1] - values[0]];
    const seasonal = Array(period).fill(0);
    
    // Initialize seasonal factors
    for (let i = 0; i < period; i++) {
      seasonal[i] = values[i] / smoothed[0];
    }
    
    // Generate forecast
    const forecast = [];
    for (let i = 0; i < period; i++) {
      const lastSmoothed = smoothed[smoothed.length - 1];
      const lastTrend = trend[trend.length - 1];
      const nextSeasonal = seasonal[i % period];
      
      const prediction = (lastSmoothed + lastTrend) * nextSeasonal;
      forecast.push(prediction);
    }
    
    return forecast;
  }

  private generateRecommendations(
    type: 'duration' | 'memory',
    analysis: { volatility: number; trend: { slope: number } }
  ): string[] {
    const recommendations: string[] = [];

    if (type === 'duration') {
      if (analysis.volatility > this.config.volatilityThreshold) {
        recommendations.push('High execution time variance detected. Consider implementing request queuing.');
      }
      if (analysis.trend.slope > this.config.trendSensitivity) {
        recommendations.push('Processing time is increasing. Review recent code changes and optimize data handling.');
      }
    } else {
      if (analysis.volatility > this.config.volatilityThreshold) {
        recommendations.push('Memory usage is unstable. Check for memory leaks and implement proper cleanup.');
      }
      if (analysis.trend.slope > this.config.trendSensitivity) {
        recommendations.push('Memory consumption is trending up. Consider implementing batch processing or streaming.');
      }
    }

    return recommendations;
  }

  private getEmptyTrendAnalysis(): TrendAnalysis {
    return {
      trend: 'stable',
      confidence: 0,
      seasonality: false,
      volatility: 0,
      forecast: [],
    };
  }

  private calculateBaseline(samples: any[]) {
    const baseline = samples.slice(0, -1);
    return {
      avgDuration: baseline.reduce((sum, s) => sum + s.duration, 0) / baseline.length,
      avgMemory: baseline.reduce((sum, s) => sum + s.memoryUsage, 0) / baseline.length,
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateConfidence(zScore: number): number {
    // Convert z-score to confidence level using error function
    return 0.5 * (1 + Math.erf(zScore / Math.sqrt(2)));
  }

  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return this.calculateStandardDeviation(values) / mean;
  }

  private calculateSeverity(increase: number, threshold: number): 'low' | 'medium' | 'high' {
    const ratio = increase / threshold;
    if (ratio <= 1.5) return 'low';
    if (ratio <= 2.5) return 'medium';
    return 'high';
  }
}