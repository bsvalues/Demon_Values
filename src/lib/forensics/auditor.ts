import * as tf from '@tensorflow/tfjs';
import { BehaviorSubject } from 'rxjs';

interface AuditResult {
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  stackTrace?: string;
  metrics?: {
    severity: number;
    confidence: number;
    impact: number;
  };
  context?: Record<string, any>;
}

interface AnomalyDetectionResult {
  isAnomaly: boolean;
  confidence: number;
  severity: number;
  details: string;
}

export class ForensicAuditor {
  private auditLog$ = new BehaviorSubject<AuditResult[]>([]);
  private model: tf.LayersModel | null = null;
  private readonly anomalyThreshold = 0.95;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [10] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  async detectAnomalies(metrics: Record<string, number>): Promise<AnomalyDetectionResult> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const input = this.preprocessMetrics(metrics);
    const prediction = this.model.predict(input) as tf.Tensor;
    const score = prediction.dataSync()[0];

    return {
      isAnomaly: score > this.anomalyThreshold,
      confidence: score,
      severity: this.calculateSeverity(metrics),
      details: this.generateAnomalyReport(metrics, score)
    };
  }

  private preprocessMetrics(metrics: Record<string, number>): tf.Tensor {
    const values = Object.values(metrics);
    return tf.tensor2d([values], [1, values.length]);
  }

  private calculateSeverity(metrics: Record<string, number>): number {
    const values = Object.values(metrics);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );
    return Math.min(1, std / mean);
  }

  private generateAnomalyReport(
    metrics: Record<string, number>,
    anomalyScore: number
  ): string {
    const significantMetrics = Object.entries(metrics)
      .filter(([_, value]) => Math.abs(value) > 2)
      .map(([key, value]) => `${key}: ${value.toFixed(2)}`)
      .join(', ');

    return `Anomaly score: ${(anomalyScore * 100).toFixed(2)}%. 
            Significant metrics: ${significantMetrics}`;
  }

  logAudit(result: Omit<AuditResult, 'timestamp'>) {
    const auditResult: AuditResult = {
      ...result,
      timestamp: Date.now()
    };

    const currentLog = this.auditLog$.value;
    this.auditLog$.next([...currentLog, auditResult]);

    // Analyze for patterns
    this.analyzePatterns(currentLog);
  }

  private analyzePatterns(log: AuditResult[]) {
    // Group by component
    const componentGroups = new Map<string, AuditResult[]>();
    log.forEach(result => {
      const group = componentGroups.get(result.component) || [];
      group.push(result);
      componentGroups.set(result.component, group);
    });

    // Analyze each component
    componentGroups.forEach((results, component) => {
      const errorRate = results.filter(r => r.type === 'error').length / results.length;
      const timeWindow = results[results.length - 1].timestamp - results[0].timestamp;
      
      if (errorRate > 0.2) {
        this.logAudit({
          type: 'warning',
          component: 'ForensicAuditor',
          message: `High error rate detected in ${component}: ${(errorRate * 100).toFixed(1)}%`,
          metrics: {
            severity: errorRate,
            confidence: 0.9,
            impact: this.calculateImpact(results)
          }
        });
      }
    });
  }

  private calculateImpact(results: AuditResult[]): number {
    const severity = results.reduce((sum, r) => sum + (r.metrics?.severity || 0), 0);
    const frequency = results.length;
    const timeSpan = results[results.length - 1].timestamp - results[0].timestamp;
    
    return (severity * frequency) / (timeSpan / (24 * 60 * 60 * 1000));
  }

  getAuditLog() {
    return this.auditLog$.asObservable();
  }

  async trainModel(trainingData: Array<{
    metrics: Record<string, number>;
    isAnomaly: boolean;
  }>) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const inputs = tf.stack(
      trainingData.map(d => this.preprocessMetrics(d.metrics))
    );
    const labels = tf.tensor2d(
      trainingData.map(d => [d.isAnomaly ? 1 : 0]),
      [trainingData.length, 1]
    );

    await this.model.fit(inputs, labels, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Training epoch ${epoch + 1}: loss = ${logs?.loss}`);
        }
      }
    });
  }
}

export const forensicAuditor = new ForensicAuditor();