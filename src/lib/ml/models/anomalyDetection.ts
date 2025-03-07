import * as tf from '@tensorflow/tfjs';
import { Property } from '../../types';

export class AnomalyDetectionModel {
  private model: tf.LayersModel | null = null;
  private readonly latentDim = 8;
  private readonly threshold = 0.1;

  async initialize() {
    // Build autoencoder for anomaly detection
    const encoder = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [this.getInputDim()] }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: this.latentDim, activation: 'relu' })
      ]
    });

    const decoder = tf.sequential({
      layers: [
        tf.layers.dense({ units: 16, activation: 'relu', inputShape: [this.latentDim] }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: this.getInputDim(), activation: 'sigmoid' })
      ]
    });

    this.model = tf.sequential({
      layers: [...encoder.layers, ...decoder.layers]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
  }

  async train(properties: Property[]) {
    if (!this.model) await this.initialize();

    const data = this.preprocessProperties(properties);
    await this.model!.fit(data, data, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2
    });
  }

  async detectAnomalies(properties: Property[]) {
    if (!this.model) throw new Error('Model not initialized');

    const data = this.preprocessProperties(properties);
    const reconstructed = this.model!.predict(data) as tf.Tensor2D;
    
    const losses = tf.losses.meanSquaredError(data, reconstructed);
    const anomalyScores = Array.from(losses.dataSync());

    return properties.map((property, i) => ({
      property,
      anomalyScore: anomalyScores[i],
      isAnomaly: anomalyScores[i] > this.threshold,
      factors: this.analyzeAnomalyFactors(property, data.slice([i, 0], [1, -1]), 
        reconstructed.slice([i, 0], [1, -1]))
    }));
  }

  private getInputDim() {
    return 10; // Number of property features
  }

  private preprocessProperties(properties: Property[]): tf.Tensor2D {
    return tf.tensor2d(properties.map(p => [
      p.value / 1000000,
      p.details.squareFootage / 5000,
      p.details.bedrooms / 10,
      p.details.bathrooms / 10,
      (p.details.yearBuilt - 1900) / 150,
      p.details.lotSize / 10000,
      (p.latitude + 90) / 180,
      (p.longitude + 180) / 360,
      p.details.schoolRating / 10,
      p.details.condition === 'Excellent' ? 1 : 0.5
    ]));
  }

  private analyzeAnomalyFactors(
    property: Property,
    original: tf.Tensor2D,
    reconstructed: tf.Tensor2D
  ) {
    const features = [
      'value', 'squareFootage', 'bedrooms', 'bathrooms', 'yearBuilt',
      'lotSize', 'latitude', 'longitude', 'schoolRating', 'condition'
    ];

    const originalData = original.dataSync();
    const reconstructedData = reconstructed.dataSync();

    return features.map((feature, i) => ({
      feature,
      deviation: Math.abs(originalData[i] - reconstructedData[i]),
      contribution: this.calculateContribution(originalData[i], reconstructedData[i])
    })).sort((a, b) => b.deviation - a.deviation);
  }

  private calculateContribution(original: number, reconstructed: number): number {
    const diff = Math.abs(original - reconstructed);
    return diff / (1 + diff); // Normalized contribution score
  }
}