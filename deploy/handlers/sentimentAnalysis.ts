import { APIGatewayProxyHandler } from 'aws-lambda';
import { MarketSentimentModel } from '../../src/lib/ml/models/marketSentiment';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const marketData = JSON.parse(event.body || '{}');

    const model = new MarketSentimentModel();
    await model.initialize();
    const sentiment = await model.analyzeSentiment(marketData);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(sentiment),
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