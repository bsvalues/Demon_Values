import { Property } from '../../types';
import * as tf from '@tensorflow/tfjs';

export interface Prediction {
  value: number;
  confidence: number;
  range: [number, number];
  features: Array<{
    name: string;
    importance: number;
  }>;
}

export class PredictiveAnalytics {
  private model: tf.LayersModel | null = null;
  private featureScaler: tf.Tensor | null = null;
  private targetScaler: tf.Tensor | null = null;

  async initialize() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [8] }),
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

  async train(properties: Property[]) {
    if (!this.model) await this.initialize();

    const { features, targets } = this.prepareData(properties);
    
    // Scale features and targets
    this.featureScaler = this.calculateScaler(features);
    this.targetScaler = this.calculateScaler(targets);
    
    const scaledFeatures = this.scaleData(features, this.featureScaler);
    const scaledTargets = this.scaleData(targets, this.targetScaler);

    await this.model!.fit(scaledFeatures, scaledTargets, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });
  }

  async predict(property: Property): Promise<Prediction> {
    if (!this.model || !this.featureScaler || !this.targetScaler) {
      throw new Error('Model not trained');
    }

    const features = this.extractFeatures([property]);
    const scaledFeatures = this.scaleData(features, this.featureScaler);
    
    // Make prediction
    const scaledPrediction = this.model.predict(scaledFeatures) as tf.Tensor;
    const prediction = this.unscaleData(scaledPrediction, this.targetScaler);
    
    // Calculate confidence interval
    const predictionValue = prediction.dataSync()[0];
    const confidence = this.calculateConfidence(property, predictionValue);
    const range = this.calculatePredictionRange(predictionValue, confidence);
    
    // Calculate feature importance
    const featureImportance = await this.calculateFeatureImportance(property);

    return {
      value: predictionValue,
      confidence,
      range,
      features: featureImportance
    };
  }

  private prepareData(properties: Property[]) {
    const features = this.extractFeatures(properties);
    const targets = tf.tensor2d(properties.map(p => [p.value]));
    return { features, targets };
  }

  private extractFeatures(properties: Property[]) {
    return tf.tensor2d(properties.map(p => [
      p.latitude,
      p.longitude,
      p.details?.squareFootage || 0,
      p.details?.bedrooms || 0,
      p.details?.bathrooms || 0,
      p.details?.yearBuilt || 0,
      p.details?.lotSize || 0,
      p.details?.garageSpaces || 0
    ]));
  }

  private calculateScaler(tensor: tf.Tensor) {
    const min = tensor.min();
    const max = tensor.max();
    return { min, max };
  }

  private scaleData(data: tf.Tensor, scaler: tf.Tensor) {
    return data.sub(scaler.min).div(scaler.max.sub(scaler.min));
  }

  private unscaleData(data: tf.Tensor, scaler: tf.Tensor) {
    return data.mul(scaler.max.sub(scaler.min)).add(scaler.min);
  }

  private calculateConfidence(property: Property, prediction: number): number {
    // Calculate confidence based on:
    // 1. Model uncertainty
    // 2. Data quality
    // 3. Property similarity to training data
    const modelUncertainty = 0.9; // Placeholder
    const dataQuality = this.assessDataQuality(property);
    const similarity = this.calculateSimilarity(property);
    
    return (modelUncertainty + dataQuality + similarity) / 3;
  }

  private assessDataQuality(property: Property): number {
    // Check completeness and validity of property data
    const requiredFields = [
      'latitude',
      'longitude',
      'details.squareFootage',
      'details.bedrooms',
      'details.bathrooms',
      'details.yearBuilt'
    ];
    
    const completeness = requiredFields.filter(field => {
      const value = field.split('.').reduce((obj: any, key) => obj?.[key], property);
      return value !== undefined && value !== null && value !== 0;
    }).length / requiredFields.length;
    
    return completeness;
  }

  private calculateSimilarity(property: Property): number {
    // Calculate similarity to known properties
    // Placeholder implementation
    return 0.85;
  }

  private calculatePredictionRange(
    prediction: number,
    confidence: number
  ): [number, number] {
    const range = prediction * (1 - confidence);
    return [prediction - range, prediction + range];
  }

  private async calculateFeatureImportance(
    property: Property
  ): Promise<Array<{ name: string; importance: number }>> {
    const features = [
      'location',
      'size',
      'bedrooms',
      'bathrooms',
      'age',
      'lotSize',
      'garage',
      'condition'
    ];
    
    const importances = await Promise.all(features.map(async feature => {
      const importance = await this.calculateFeatureContribution(property, feature);
      return { name: feature, importance };
    }));
    
    return importances.sort((a, b) => b.importance - a.importance);
  }

  private async calculateFeatureContribution(
    property: Property,
    feature: string
  ): Promise<number> {
    // Calculate feature contribution using SHAP-like approach
    // Placeholder implementation
    return Math.random();
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();