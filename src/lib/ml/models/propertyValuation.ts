import * as tf from '@tensorflow/tfjs';
import { Property } from '../../../types';

export class PropertyValuationModel {
  private model: tf.LayersModel | null = null;
  private readonly inputFeatures = [
    'squareFootage', 'bedrooms', 'bathrooms', 'yearBuilt',
    'lotSize', 'latitude', 'longitude', 'schoolRating'
  ];

  async initialize() {
    // Enable WebGPU if available
    try {
      const webGPUAvailable = await tf.test_util.isWebGPUAvailable();
      if (webGPUAvailable) {
        await tf.setBackend('webgpu');
        console.log('Using WebGPU acceleration for AI computations');
      }
    } catch (error) {
      console.warn('WebGPU not available, falling back to WebGL');
      await tf.setBackend('webgl');
    }

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 64, 
          activation: 'relu', 
          inputShape: [this.getInputDimension()]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 1 })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });
  }

  private getInputDimension(): number {
    return this.inputFeatures.length * 2; // Original features + polynomial features
  }

  private validateProperty(property: Property): void {
    if (property.value <= 0) {
      throw new Error('Property value must be positive');
    }
    if (Math.abs(property.latitude) > 90) {
      throw new Error('Invalid latitude value');
    }
    if (Math.abs(property.longitude) > 180) {
      throw new Error('Invalid longitude value');
    }
  }

  private addPolynomialFeatures(X: tf.Tensor2D): tf.Tensor2D {
    const polyFeatures = X.pow(tf.scalar(2));
    return tf.concat([X, polyFeatures], 1);
  }

  private normalizeFeatures(features: number[]): number[] {
    return features.map((value, index) => {
      const feature = this.inputFeatures[index];
      switch (feature) {
        case 'yearBuilt':
          return (value - 1900) / 150;
        case 'latitude':
          return value / 90;
        case 'longitude':
          return value / 180;
        case 'schoolRating':
          return value / 10;
        default:
          return value / 10000; // General normalization for other numeric features
      }
    });
  }

  async predict(property: Property) {
    if (!this.model) {
      await this.initialize();
    }

    this.validateProperty(property);

    const input = this.preprocessProperty(property);
    const prediction = this.model!.predict(input) as tf.Tensor;
    const value = prediction.dataSync()[0];

    // Calculate feature importance
    const featureImportance = await this.calculateFeatureImportance(property);

    return {
      predictedValue: value,
      confidence: this.calculateConfidence(value, property.value),
      features: featureImportance
    };
  }

  private preprocessProperty(property: Property): tf.Tensor2D {
    const features = this.inputFeatures.map(feature => 
      property[feature as keyof Property] as number
    );
    
    const normalizedFeatures = this.normalizeFeatures(features);
    const tensor = tf.tensor2d([normalizedFeatures]);
    return this.addPolynomialFeatures(tensor);
  }

  private calculateConfidence(predicted: number, actual: number): number {
    const percentDiff = Math.abs(predicted - actual) / actual;
    return Math.max(0, 1 - percentDiff);
  }

  private async calculateFeatureImportance(property: Property) {
    const baseline = tf.zeros([1, this.getInputDimension()]);
    const input = this.preprocessProperty(property);
    const steps = 50;

    const importances = await Promise.all(this.inputFeatures.map(async (feature, i) => {
      let totalGradient = 0;

      for (let step = 0; step < steps; step++) {
        const alpha = step / (steps - 1);
        const interpolated = tf.add(
          tf.mul(baseline, 1 - alpha),
          tf.mul(input, alpha)
        );

        const tape = tf.GradientTape();
        const prediction = this.model!.predict(interpolated) as tf.Tensor;
        const gradients = tape.gradient(prediction, interpolated);
        totalGradient += gradients.gather([i]).dataSync()[0];
      }

      return {
        name: feature,
        importance: Math.abs(totalGradient / steps)
      };
    }));

    return importances.sort((a, b) => b.importance - a.importance);
  }
}