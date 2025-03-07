import * as tf from '@tensorflow/tfjs';
import { Property } from '../../types';

export class MarketSentiment {
  private model: tf.LayersModel | null = null;

  async initialize() {
    // Wait for TF.js to be ready
    await tf.ready();
    
    // Create a simpler model for browser environment
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu',
          inputShape: [4]
        }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu' 
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'tanh'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
  }

  async analyzeSentiment(properties: Property[]) {
    if (!this.model) {
      await this.initialize();
    }

    // Simple sentiment analysis based on price trends
    const values = properties.map(p => p.value);
    const trend = this.calculateTrend(values);

    return {
      sentiment: trend.slope > 0 ? 'positive' : 'negative',
      confidence: Math.min(0.9, Math.abs(trend.slope)),
      trend: trend.slope
    };
  }

  private calculateTrend(values: number[]) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b);
    const sumY = values.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return { slope };
  }
}

export const marketSentiment = new MarketSentiment();