import * as tf from '@tensorflow/tfjs';
import { Property } from '../../types';

export class MarketTrendModel {
  private model: tf.LayersModel | null = null;
  private readonly sequenceLength = 12; // 12 months of history
  private readonly forecastHorizon = 6; // 6 months forecast

  async initialize() {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          inputShape: [this.sequenceLength, 1]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 32 }),
        tf.layers.dense({ units: this.forecastHorizon })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
  }

  async trainOnMarketData(historicalData: Array<{
    date: string;
    value: number;
  }>) {
    if (!this.model) await this.initialize();

    const sequences = this.prepareSequences(historicalData);
    const { inputs, targets } = this.createTrainingData(sequences);

    await this.model!.fit(inputs, targets, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2
    });
  }

  async forecast(recentData: Array<{ date: string; value: number }>) {
    if (!this.model) throw new Error('Model not initialized');

    const sequence = this.prepareSequences(recentData.slice(-this.sequenceLength));
    const prediction = await this.model.predict(sequence) as tf.Tensor;
    const forecastValues = prediction.dataSync();

    return Array.from({ length: this.forecastHorizon }, (_, i) => ({
      date: this.getFutureDate(i + 1),
      value: forecastValues[i],
      confidence: this.calculateForecastConfidence(i)
    }));
  }

  private prepareSequences(data: Array<{ value: number }>) {
    return tf.tensor3d(
      [data.map(d => [d.value])],
      [1, data.length, 1]
    );
  }

  private createTrainingData(sequences: tf.Tensor3D) {
    const inputs = sequences.slice([0, 0, 0], [-1, this.sequenceLength, 1]);
    const targets = sequences.slice(
      [0, this.sequenceLength, 0],
      [-1, this.forecastHorizon, 1]
    );

    return { inputs, targets };
  }

  private getFutureDate(monthsAhead: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    return date.toISOString().split('T')[0];
  }

  private calculateForecastConfidence(monthsAhead: number): number {
    // Confidence decreases with forecast horizon
    return Math.max(0.5, 1 - (monthsAhead * 0.1));
  }
}