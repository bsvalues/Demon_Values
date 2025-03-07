import { Property } from '../../../types';

export class MarketSentimentV2 {
  async analyzeSentiment(properties: Property[]) {
    // Calculate basic market sentiment using statistical analysis
    const values = properties.map(p => p.value);
    const trend = this.calculateTrend(values);
    const volatility = this.calculateVolatility(values);
    
    return {
      overall: trend.slope,
      confidence: 0.8,
      indicators: [
        {
          type: 'price',
          value: trend.slope,
          trend: this.classifyTrend(trend.slope),
          confidence: 0.8,
          signals: [
            {
              name: 'Price Trend',
              strength: Math.abs(trend.slope),
              impact: trend.slope > 0 ? 'positive' : 'negative'
            },
            {
              name: 'Market Volatility',
              strength: volatility,
              impact: volatility > 0.1 ? 'negative' : 'positive'
            }
          ]
        }
      ],
      forecast: this.generateForecast(trend.slope, volatility)
    };
  }

  private calculateTrend(values: number[]) {
    const n = values.length;
    if (n < 2) return { slope: 0 };
    
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b);
    const sumY = values.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return { slope };
  }

  private calculateVolatility(values: number[]) {
    const n = values.length;
    if (n < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b) / n;
    const variance = values.reduce((sum, val) => {
      return sum + Math.pow(val - mean, 2);
    }, 0) / (n - 1);
    
    return Math.sqrt(variance) / mean;
  }

  private classifyTrend(slope: number) {
    if (slope > 0.05) return 'increasing';
    if (slope < -0.05) return 'decreasing';
    return 'stable';
  }

  private generateForecast(trend: number, volatility: number) {
    return Array.from({ length: 7 }, (_, i) => {
      const baseChange = trend * (i + 1);
      const noise = (Math.random() - 0.5) * volatility;
      const sentiment = baseChange + noise;
      
      return {
        timestamp: Date.now() + i * 24 * 60 * 60 * 1000,
        sentiment: Math.max(-1, Math.min(1, sentiment)),
        confidence: Math.max(0.5, 1 - (i * 0.1))
      };
    });
  }
}

export const marketSentimentV2 = new MarketSentimentV2();