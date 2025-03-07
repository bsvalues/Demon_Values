import * as tf from '@tensorflow/tfjs';
import { PropertyValuationModel } from '../models/propertyValuation';

describe('TensorFlow.js Model Validation', () => {
  let model: PropertyValuationModel;

  beforeEach(() => {
    model = new PropertyValuationModel();
  });

  test('input and output tensors must align', () => {
    const X = tf.tensor2d([[2500, 5, 10], [1500, 3, 5]]); // Shape [2, 3]
    const y = tf.tensor2d([[100000], [75000]]); // Shape [2, 1]

    expect(X.shape[0]).toBe(y.shape[0]); // Samples must match
    expect(X.shape[1]).toBe(3); // Features must match model input shape
  });

  test('model should reject empty data', async () => {
    const X = tf.tensor2d([], [0, 3]); // Empty tensor
    const y = tf.tensor2d([], [0, 1]); // Empty tensor

    await expect(async () => {
      await model.train({ properties: [] });
    }).rejects.toThrow();
  });

  test('model handles malformed data gracefully', async () => {
    const invalidProperty = {
      id: '1',
      address: '123 Test St',
      value: -1000, // Invalid negative value
      latitude: 200, // Invalid latitude
      longitude: 400, // Invalid longitude
      cluster: 'test'
    };

    await expect(async () => {
      await model.predict(invalidProperty);
    }).rejects.toThrow();
  });
});