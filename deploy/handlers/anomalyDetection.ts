import { APIGatewayProxyHandler } from 'aws-lambda';
import { AnomalyDetectionModel } from '../../src/lib/ml/models/anomalyDetection';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { properties } = JSON.parse(event.body || '{}');

    const model = new AnomalyDetectionModel();
    await model.initialize();
    await model.train(properties);
    const anomalies = await model.detectAnomalies(properties);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(anomalies),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};