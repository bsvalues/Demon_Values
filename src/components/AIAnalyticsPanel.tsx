import React, { useState } from 'react';
import { Brain, ArrowUpRight, ArrowDownRight, Gauge, Target, Activity, Lightbulb, Zap } from 'lucide-react';
import { Property } from '../types';
import { predictPropertyValue } from '../lib/ml';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AIAnalyticsPanelProps {
  property: Property;
}

function AIAnalyticsPanel({ property }: AIAnalyticsPanelProps) {
  const { filters } = useApp();
  const [activeTab, setActiveTab] = useState<'prediction' | 'drivers' | 'scenarios' | 'forecast'>('prediction');
  const prediction = predictPropertyValue(property, filters.weights);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  const formatPercentage = (value: number) =>
    new Intl.NumberFormat('en-US', { 
      style: 'percent', 
      maximumFractionDigits: 1 
    }).format(Math.abs(value));

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-demon-red" />
          <h3 className="text-lg font-semibold">AI Value Analysis</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('prediction')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeTab === 'prediction' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Prediction</span>
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeTab === 'drivers' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Drivers</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeTab === 'scenarios' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Scenarios</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeTab === 'forecast' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Forecast</span>
          </button>
        </div>
      </div>

      {/* Prediction View */}
      {activeTab === 'prediction' && (
        <div className="space-y-6">
          {/* Main Prediction Card */}
          <div className="p-6 bg-black/40 rounded-lg border border-demon-red/30">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Predicted Value</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(prediction.predictedValue)}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {prediction.predictedValue > property.value ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={prediction.predictedValue > property.value ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(Math.abs(prediction.predictedValue - property.value) / property.value)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Confidence</div>
                <div className="text-2xl font-semibold">
                  {formatPercentage(prediction.confidence)}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Gauge className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">High Confidence</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Value Range</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(prediction.predictedValue * (1 - prediction.confidence))} - 
                  {formatCurrency(prediction.predictedValue * (1 + prediction.confidence))}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Visualization */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { x: -2, y: 0 },
                { x: -1, y: 0.5 },
                { x: 0, y: 1 },
                { x: 1, y: 0.5 },
                { x: 2, y: 0 }
              ]}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="x"
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => 
                    formatCurrency(prediction.predictedValue * (1 + value * (1 - prediction.confidence)))
                  }
                />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#EF4444"
                  fill="url(#confidenceGradient)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Drivers View */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          {prediction.featureContributions.map(({ feature, contribution, impact }) => (
            <div 
              key={feature}
              className="p-4 bg-black/40 rounded-lg border border-demon-red/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{feature}</span>
                <div className="flex items-center space-x-2">
                  {contribution > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={contribution > 0 ? 'text-green-500' : 'text-red-500'}>
                    {contribution > 0 ? '+' : ''}{formatPercentage(contribution)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Impact: {formatCurrency(impact)}
              </div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min(Math.abs(contribution * 100), 100)}%`,
                    background: contribution > 0 
                      ? 'linear-gradient(to right, #34D399, #3B82F6)' 
                      : 'linear-gradient(to right, #F87171, #EF4444)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scenarios View */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          {[
            { name: 'Market Upturn', change: 0.15, probability: 0.3 },
            { name: 'Stable Market', change: 0.05, probability: 0.5 },
            { name: 'Market Downturn', change: -0.1, probability: 0.2 }
          ].map(scenario => (
            <div 
              key={scenario.name}
              className="p-4 bg-black/40 rounded-lg border border-demon-red/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{scenario.name}</span>
                <div className="flex items-center space-x-2">
                  {scenario.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={scenario.change > 0 ? 'text-green-500' : 'text-red-500'}>
                    {scenario.change > 0 ? '+' : ''}{formatPercentage(scenario.change)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Probability: {formatPercentage(scenario.probability)}
              </div>
              <div className="mt-2 text-lg">
                {formatCurrency(prediction.predictedValue * (1 + scenario.change))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast View */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
                value: prediction.predictedValue * (1 + (i * 0.02) + (Math.random() * 0.02 - 0.01)),
                confidence: prediction.confidence - (i * 0.05)
              }))}>
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '3 Month', value: 0.05 },
              { label: '6 Month', value: 0.08 },
              { label: '12 Month', value: 0.15 }
            ].map(forecast => (
              <div key={forecast.label} className="p-4 bg-black/40 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">{forecast.label}</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(prediction.predictedValue * (1 + forecast.value))}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">
                    +{formatPercentage(forecast.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAnalyticsPanel;