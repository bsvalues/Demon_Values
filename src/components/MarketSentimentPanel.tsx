import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react';
import { Property } from '../types';
import { marketSentimentV2 } from '../lib/ml/models/marketSentimentV2';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MarketSentimentPanelProps {
  properties: Property[];
}

export default function MarketSentimentPanel({ properties }: MarketSentimentPanelProps) {
  const [sentiment, setSentiment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (properties.length === 0) {
      setError('No properties available for analysis');
      setLoading(false);
      return;
    }
    analyzeSentiment();
  }, [properties]);

  const analyzeSentiment = async () => {
    try {
      setLoading(true);
      setError(null);
      const analysis = await marketSentimentV2.analyzeSentiment(properties);
      setSentiment(analysis);
    } catch (error) {
      console.error('Failed to analyze market sentiment:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze market sentiment');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSentimentColor = (value: number) => {
    if (value > 0.05) return 'text-green-500';
    if (value < -0.05) return 'text-red-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <Activity className="h-5 w-5 text-red-500 animate-spin" />
          <span>Analyzing market sentiment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!sentiment) {
    return (
      <div className="p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          <span>No sentiment data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span>Market Sentiment Analysis</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-gray-400" />
            <div className="text-sm text-gray-400">
              Confidence: {(sentiment.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Overall Sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/40 rounded-lg col-span-2">
            <div className="text-sm text-gray-400 mb-2">Overall Market Sentiment</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold">
                {sentiment.overall > 0.05 ? 'Bullish' : 
                 sentiment.overall < -0.05 ? 'Bearish' : 'Neutral'}
              </div>
              <div className={`text-lg font-medium ${getSentimentColor(sentiment.overall)}`}>
                {(sentiment.overall * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/40 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Analysis Based On</div>
            <div className="text-2xl font-semibold">
              {properties.length.toLocaleString()} Properties
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sentiment.indicators.map((indicator: any) => (
          <div key={indicator.type} className="p-4 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTrendIcon(indicator.trend)}
                <span className="font-medium capitalize">{indicator.type}</span>
              </div>
              <div className={`text-sm ${getSentimentColor(indicator.value)}`}>
                {(indicator.value * 100).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              {indicator.signals.map((signal: any) => (
                <div key={signal.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{signal.name}</span>
                  <span className={`text-sm ${
                    signal.impact === 'positive' ? 'text-green-500' :
                    signal.impact === 'negative' ? 'text-red-500' :
                    'text-gray-400'
                  }`}>
                    {(signal.strength * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Forecast */}
      <div className="p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <h4 className="text-sm text-gray-400 mb-4">7-Day Sentiment Forecast</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentiment.forecast}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fill: '#9CA3AF' }}
                domain={[-1, 1]}
              />
              <Tooltip
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '0.5rem'
                }}
              />
              <ReferenceLine y={0} stroke="rgba(156, 163, 175, 0.2)" />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
                activeDot={{ r: 6, fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-400 flex items-center space-x-1">
          <Info className="h-4 w-4" />
          <span>Forecast confidence decreases over time</span>
        </div>
      </div>
    </div>
  );
}