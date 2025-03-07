import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Bar, Scatter,
  ReferenceLine, ReferenceArea
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Sigma, Clock,
  DollarSign, Percent, BarChart2, Waves
} from 'lucide-react';
import { Property } from '../types';
import { statisticsManager } from '../lib/arcgis/statistics';

interface TrendAnalyzerProps {
  properties: Property[];
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface TrendPoint {
  timestamp: number;
  value: number;
  trend: number;
  volatility: number;
  confidence: number;
}

interface TrendAnalysis {
  points: TrendPoint[];
  overallTrend: number;
  seasonality: number;
  breakpoints: number[];
  forecast: TrendPoint[];
  confidence: number;
}

interface AdvancedMetrics {
  momentum: number;
  acceleration: number;
  meanReversion: number;
  trendStrength: number;
  cyclicality: number;
  autocorrelation: number;
  rSquared: number;
}

interface EnhancedTrendAnalysis extends TrendAnalysis {
  advancedMetrics: AdvancedMetrics;
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
}

export default function TrendAnalyzer({ properties, timeframe = 'monthly' }: TrendAnalyzerProps) {
  const [analysis, setAnalysis] = useState<EnhancedTrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    'value' | 'trend' | 'volatility' | 'momentum' | 'decomposition'
  >('value');

  useEffect(() => {
    analyzeTrends();
  }, [properties, timeframe]);

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      const timeGroups = groupByTime(properties, timeframe);
      const points = calculateTrendPoints(timeGroups);
      const seasonality = detectSeasonality(points);
      const breakpoints = detectBreakpoints(points);
      const forecast = generateForecast(points, seasonality);
      const overallTrend = calculateOverallTrend(points);
      const confidence = calculateConfidence(points);

      // Calculate advanced metrics
      const advancedMetrics = calculateAdvancedMetrics(points);
      const decomposition = decomposeTimeSeries(points);

      setAnalysis({
        points,
        overallTrend,
        seasonality,
        breakpoints,
        forecast,
        confidence,
        advancedMetrics,
        decomposition
      });
    } catch (error) {
      console.error('Failed to analyze trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  const formatDate = (timestamp: number) => 
    new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });

  const formatPercentage = (value: number) =>
    `${(value * 100).toFixed(1)}%`;

  const renderTrendChart = () => {
    if (!analysis) return null;

    if (selectedMetric === 'decomposition') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={analysis.points}>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatDate}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.5rem'
              }}
            />
            <Area
              name="Trend"
              dataKey="trend"
              stroke="#EF4444"
              fill="url(#trendGradient)"
              strokeWidth={2}
            />
            <Line
              name="Seasonal"
              dataKey="seasonal"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              name="Residual"
              dataKey="residual"
              stroke="#10B981"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    const allPoints = [...analysis.points, ...analysis.forecast];
    const dataKey = selectedMetric;
    const isForecasted = (point: TrendPoint) => 
      analysis.points.length <= analysis.points.findIndex(p => p.timestamp === point.timestamp);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={allPoints}>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            tickFormatter={
              selectedMetric === 'value' 
                ? formatCurrency 
                : formatPercentage
            }
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            formatter={(value: number) => 
              selectedMetric === 'value' 
                ? formatCurrency(value)
                : formatPercentage(value)
            }
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem'
            }}
          />

          {/* Historical Data */}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#EF4444"
            fill="url(#trendGradient)"
            strokeWidth={2}
            dot={{ fill: '#EF4444' }}
            activeDot={{ r: 6, fill: '#EF4444' }}
          />

          {/* Forecast */}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#F97316"
            fill="url(#forecastGradient)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#F97316' }}
            data={analysis.forecast}
          />

          {/* Trend Breakpoints */}
          {analysis.breakpoints.map((timestamp, i) => (
            <ReferenceLine
              key={i}
              x={timestamp}
              stroke="#991B1B"
              strokeDasharray="3 3"
              label={{
                value: 'Trend Break',
                position: 'top',
                fill: '#991B1B'
              }}
            />
          ))}

          {/* Confidence Interval */}
          <ReferenceArea
            y1={analysis.points[0]?.[dataKey] * (1 - analysis.confidence)}
            y2={analysis.points[0]?.[dataKey] * (1 + analysis.confidence)}
            fill="#EF4444"
            fillOpacity={0.1}
          />

          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Advanced Trend Analysis</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedMetric('value')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              selectedMetric === 'value'
                ? 'bg-red-500 text-white'
                : 'bg-black/40 hover:bg-red-500/20'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Value</span>
          </button>
          <button
            onClick={() => setSelectedMetric('trend')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              selectedMetric === 'trend'
                ? 'bg-red-500 text-white'
                : 'bg-black/40 hover:bg-red-500/20'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trend</span>
          </button>
          <button
            onClick={() => setSelectedMetric('volatility')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              selectedMetric === 'volatility'
                ? 'bg-red-500 text-white'
                : 'bg-black/40 hover:bg-red-500/20'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Volatility</span>
          </button>
          <button
            onClick={() => setSelectedMetric('momentum')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              selectedMetric === 'momentum'
                ? 'bg-red-500 text-white'
                : 'bg-black/40 hover:bg-red-500/20'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Momentum</span>
          </button>
          <button
            onClick={() => setSelectedMetric('decomposition')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              selectedMetric === 'decomposition'
                ? 'bg-red-500 text-white'
                : 'bg-black/40 hover:bg-red-500/20'
            }`}
          >
            <Waves className="h-4 w-4" />
            <span>Decomposition</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-red-500 animate-pulse">Analyzing trends...</div>
        </div>
      ) : analysis ? (
        <>
          {renderTrendChart()}

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="text-sm text-gray-400">Overall Trend</div>
              <div className="flex items-center space-x-2 text-xl font-semibold">
                {analysis.overallTrend > 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
                <span className={analysis.overallTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(Math.abs(analysis.overallTrend))}
                </span>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg">
              <div className="text-sm text-gray-400">Seasonality</div>
              <div className="flex items-center space-x-2 text-xl font-semibold">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>{formatPercentage(analysis.seasonality)}</span>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg">
              <div className="text-sm text-gray-400">Trend Breaks</div>
              <div className="flex items-center space-x-2 text-xl font-semibold">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>{analysis.breakpoints.length}</span>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg">
              <div className="text-sm text-gray-400">Confidence</div>
              <div className="flex items-center space-x-2 text-xl font-semibold">
                <Sigma className="h-5 w-5 text-purple-500" />
                <span>{formatPercentage(analysis.confidence)}</span>
              </div>
            </div>
          </div>

          {/* Advanced Metrics Details */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-black/40 rounded-lg space-y-2">
              <h4 className="font-semibold">Momentum Analysis</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Momentum</span>
                  <span>{formatPercentage(analysis.advancedMetrics.momentum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Acceleration</span>
                  <span>{formatPercentage(analysis.advancedMetrics.acceleration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mean Reversion</span>
                  <span>{formatPercentage(analysis.advancedMetrics.meanReversion)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg space-y-2">
              <h4 className="font-semibold">Statistical Measures</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trend Strength</span>
                  <span>{formatPercentage(analysis.advancedMetrics.trendStrength)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Autocorrelation</span>
                  <span>{formatPercentage(analysis.advancedMetrics.autocorrelation)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">R-Squared</span>
                  <span>{formatPercentage(analysis.advancedMetrics.rSquared)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-gray-400">No trend data available</div>
        </div>
      )}
    </div>
  );
}

// Helper functions for trend analysis
function groupByTime(properties: Property[], timeframe: string): Map<number, Property[]> {
  const groups = new Map<number, Property[]>();
  
  properties.forEach(property => {
    const timestamp = getTimeframeTimestamp(property.timestamp, timeframe);
    const group = groups.get(timestamp) || [];
    group.push(property);
    groups.set(timestamp, group);
  });
  
  return groups;
}

function getTimeframeTimestamp(timestamp: number, timeframe: string): number {
  const date = new Date(timestamp);
  
  switch (timeframe) {
    case 'daily':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    case 'weekly':
      const dayOfWeek = date.getDay();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek).getTime();
    case 'monthly':
      return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    case 'yearly':
      return new Date(date.getFullYear(), 0, 1).getTime();
    default:
      return timestamp;
  }
}

function calculateTrendPoints(timeGroups: Map<number, Property[]>): TrendPoint[] {
  return Array.from(timeGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, properties], index, array) => {
      const value = properties.reduce((sum, p) => sum + p.value, 0) / properties.length;
      const prevValue = index > 0 ? array[index - 1][1].reduce((sum, p) => sum + p.value, 0) / array[index - 1][1].length : value;
      const trend = (value - prevValue) / prevValue;
      
      const values = properties.map(p => p.value);
      const mean = value;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const volatility = Math.sqrt(variance) / mean;
      
      const confidence = 1 - (volatility / Math.max(...array.map(([, props]) => {
        const vals = props.map(p => p.value);
        const m = vals.reduce((sum, v) => sum + v, 0) / vals.length;
        const var_ = vals.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / vals.length;
        return Math.sqrt(var_) / m;
      })));

      return {
        timestamp,
        value,
        trend,
        volatility,
        confidence
      };
    });
}

function detectSeasonality(points: TrendPoint[]): number {
  if (points.length < 12) return 0;
  
  const values = points.map(p => p.value);
  const correlations = [];
  
  for (let lag = 1; lag <= Math.min(12, Math.floor(points.length / 2)); lag++) {
    let correlation = 0;
    for (let i = 0; i < values.length - lag; i++) {
      correlation += (values[i] - values[i + lag]) ** 2;
    }
    correlations.push(correlation / (values.length - lag));
  }
  
  const minCorrelation = Math.min(...correlations);
  const seasonalityIndex = correlations.indexOf(minCorrelation);
  
  return 1 - (minCorrelation / Math.max(...correlations));
}

function detectBreakpoints(points: TrendPoint[]): number[] {
  if (points.length < 3) return [];
  
  const breakpoints = [];
  const threshold = 2 * Math.sqrt(points.reduce((sum, p) => sum + p.volatility ** 2, 0) / points.length);
  
  for (let i = 1; i < points.length - 1; i++) {
    const prevTrend = points[i].value - points[i - 1].value;
    const nextTrend = points[i + 1].value - points[i].value;
    
    if (Math.abs(nextTrend - prevTrend) > threshold) {
      breakpoints.push(points[i].timestamp);
    }
  }
  
  return breakpoints;
}

function generateForecast(points: TrendPoint[], seasonality: number): TrendPoint[] {
  const numForecasts = 6;
  const forecast: TrendPoint[] = [];
  
  const lastPoint = points[points.length - 1];
  const avgTrend = points.reduce((sum, p) => sum + p.trend, 0) / points.length;
  const timeInterval = points[1].timestamp - points[0].timestamp;
  
  for (let i = 1; i <= numForecasts; i++) {
    const timestamp = lastPoint.timestamp + (timeInterval * i);
    const seasonalFactor = seasonality * Math.sin((2 * Math.PI * i) / 12);
    const trend = avgTrend * (1 + seasonalFactor);
    const value = lastPoint.value * (1 + trend);
    
    forecast.push({
      timestamp,
      value,
      trend,
      volatility: lastPoint.volatility * (1 + (i * 0.1)),
      confidence: Math.max(0.5, lastPoint.confidence * (1 - (i * 0.1)))
    });
  }
  
  return forecast;
}

function calculateOverallTrend(points: TrendPoint[]): number {
  if (points.length < 2) return 0;
  return (points[points.length - 1].value - points[0].value) / points[0].value;
}

function calculateConfidence(points: TrendPoint[]): number {
  return points.reduce((sum, p) => sum + p.confidence, 0) / points.length;
}

function calculateAdvancedMetrics(points: TrendPoint[]): AdvancedMetrics {
  const values = points.map(p => p.value);
  
  // Calculate momentum (rate of change)
  const momentum = points.length > 1 
    ? (points[points.length - 1].value - points[points.length - 2].value) / points[points.length - 2].value
    : 0;

  // Calculate acceleration (change in momentum)
  const acceleration = points.length > 2
    ? momentum - ((points[points.length - 2].value - points[points.length - 3].value) / points[points.length - 3].value)
    : 0;

  // Calculate mean reversion
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const meanReversion = points.length > 1
    ? (mean - points[points.length - 1].value) / points[points.length - 1].value
    : 0;

  // Calculate trend strength using linear regression
  const trendStrength = calculateTrendStrength(points);

  // Calculate cyclicality using Fourier analysis
  const cyclicality = calculateCyclicality(values);

  // Calculate autocorrelation
  const autocorrelation = calculateAutocorrelation(values);

  // Calculate R-squared
  const rSquared = calculateRSquared(points);

  return {
    momentum,
    acceleration,
    meanReversion,
    trendStrength,
    cyclicality,
    autocorrelation,
    rSquared
  };
}

function calculateTrendStrength(points: TrendPoint[]): number {
  const x = Array.from({ length: points.length }, (_, i) => i);
  const y = points.map(p => p.value);
  
  const n = points.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const yMean = sumY / n;
  const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const regressionSS = y.reduce((sum, yi, i) => {
    const yPred = slope * x[i] + intercept;
    return sum + Math.pow(yPred - yMean, 2);
  }, 0);
  
  return regressionSS / totalSS;
}

function calculateCyclicality(values: number[]): number {
  const n = values.length;
  if (n < 4) return 0;

  // Simple implementation using autocorrelation at different lags
  const maxLag = Math.floor(n / 2);
  const autocorrelations = Array.from({ length: maxLag }, (_, lag) => {
    return calculateAutocorrelation(values, lag + 1);
  });

  // Find the strongest cyclic pattern
  const maxAutocorrelation = Math.max(...autocorrelations.map(Math.abs));
  return maxAutocorrelation;
}

function calculateAutocorrelation(values: number[], lag: number = 1): number {
  const n = values.length - lag;
  if (n < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (values[i] - mean) * (values[i + lag] - mean);
    denominator += Math.pow(values[i] - mean, 2);
  }

  return numerator / denominator;
}

function calculateRSquared(points: TrendPoint[]): number {
  const values = points.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const totalSS = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
  const residualSS = values.slice(1).reduce((sum, v, i) => {
    return sum + Math.pow(v - values[i], 2);
  }, 0);
  
  return 1 - (residualSS / totalSS);
}

function decomposeTimeSeries(points: TrendPoint[]) {
  const values = points.map(p => p.value);
  const n = values.length;
  if (n < 4) return { trend: values, seasonal: new Array(n).fill(0), residual: new Array(n).fill(0) };

  // Calculate trend using moving average
  const windowSize = Math.min(7, Math.floor(n / 2));
  const trend = calculateMovingAverage(values, windowSize);

  // Calculate seasonal component
  const detrended = values.map((v, i) => v - trend[i]);
  const seasonal = calculateSeasonalComponent(detrended, Math.min(12, Math.floor(n / 2)));

  // Calculate residual
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

function calculateMovingAverage(values: number[], window: number): number[] {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(values.length, i + Math.floor(window / 2) + 1);
    const windowValues = values.slice(start, end);
    result.push(windowValues.reduce((a, b) => a + b, 0) / windowValues.length);
  }
  return result;
}

function calculateSeasonalComponent(values: number[], period: number): number[] {
  const n = values.length;
  const seasonal = new Array(n).fill(0);
  
  // Calculate average seasonal pattern
  const seasonalPattern = Array.from({ length: period }, (_, i) => {
    const seasonValues = values.filter((_, index) => index % period === i);
    return seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length;
  });
  
  // Normalize seasonal pattern
  const patternMean = seasonalPattern.reduce((a, b) => a + b, 0) / period;
  const normalizedPattern = seasonalPattern.map(v => v - patternMean);
  
  // Apply pattern to the full series
  for (let i = 0; i < n; i++) {
    seasonal[i] = normalizedPattern[i % period];
  }
  
  return seasonal;
}