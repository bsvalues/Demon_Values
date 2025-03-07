import * as tf from '@tensorflow/tfjs';

export async function initializeTensorFlow() {
  try {
    // Wait for TF.js to be ready
    await tf.ready();

    // Try to use WebGL backend first
    await tf.setBackend('webgl');
    console.log('TensorFlow.js initialized with WebGL backend');

    // Fall back to CPU if WebGL is not available
    if (!tf.getBackend()) {
      await tf.setBackend('cpu');
      console.log('TensorFlow.js initialized with CPU backend');
    }

    // Set up custom configurations
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', false);
    tf.env().set('WEBGL_VERSION', 2);
    tf.env().set('WEBGL_CPU_FORWARD', true);

    return true;
  } catch (error) {
    console.error('TensorFlow.js initialization failed:', error);
    return false;
  }
}