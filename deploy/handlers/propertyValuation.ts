import { APIGatewayProxyHandler } from 'aws-lambda';
import { PropertyValuationModel } from '../../src/lib/ml/models/propertyValuation';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const model = new PropertyValuationModel();
    await model.initialize();

    const property = JSON.parse(event.body || '{}');
    const prediction = await model.predict(property);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(prediction),
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