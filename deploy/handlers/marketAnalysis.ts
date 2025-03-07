import { APIGatewayProxyHandler } from 'aws-lambda';
import { MarketTrendModel } from '../../src/lib/ml/models/marketTrends';
import { ClusterAnalysisModel } from '../../src/lib/ml/models/clusterAnalysis';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { properties, historicalData } = JSON.parse(event.body || '{}');

    // Initialize models
    const trendModel = new MarketTrendModel();
    const clusterModel = new ClusterAnalysisModel();
    await Promise.all([
      trendModel.initialize(),
      clusterModel.initialize(),
    ]);

    // Run analysis in parallel
    const [trends, clusters] = await Promise.all([
      trendModel.forecast(historicalData),
      clusterModel.analyzeMarketSegments(properties),
    ]);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ trends, clusters }),
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