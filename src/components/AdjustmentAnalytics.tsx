import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calculator, Percent, DollarSign } from 'lucide-react';
import { Property } from '../types';

interface AdjustmentAnalyticsProps {
  property: Property;
  scenarios: Array<{
    step: number;
    adjustment: string;
    attribute: string;
    value: number;
    percentageChange: number;
    flatChange: number;
    previousValue: number;
  }>;
}

function AdjustmentAnalytics({ property, scenarios }: AdjustmentAnalyticsProps) {
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [activeMethod, setActiveMethod] = useState<'flat' | 'percentage'>('percentage');
  const [cumulativeData, setCumulativeData] = useState<any[]>([]);

  useEffect(() => {
    // Calculate step-by-step and cumulative impacts
    let runningFlatTotal = property.value;
    let runningPercentageTotal = property.value;

    const stepData = scenarios.map((scenario, index) => {
      const flatValue = runningFlatTotal + scenario.flatChange;
      const percentageValue = runningPercentageTotal * (1 + scenario.percentageChange / 100);
      
      runningFlatTotal = flatValue;
      runningPercentageTotal = percentageValue;
      
      return {
        name: scenario.adjustment,
        flatValue,
        percentageValue,
        difference: percentageValue - flatValue,
        percentageDiff: ((percentageValue - flatValue) / flatValue) * 100,
        step: index + 1,
      };
    });

    setComparisonData(stepData);

    // Calculate cumulative impact
    const cumulativeSteps = stepData.map((data, index) => ({
      step: index + 1,
      flatCumulative: data.flatValue - property.value,
      percentageCumulative: data.percentageValue - property.value,
      name: `Step ${index + 1}`,
    }));

    setCumulativeData(cumulativeSteps);
  }, [scenarios, property]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(value);

  const formatPercentage = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
      .format(Math.abs(value / 100));

  const totalImpact = comparisonData.reduce((sum, data) => sum + data.difference, 0);
  const averageImpact = totalImpact / Math.max(comparisonData.length, 1);

  return (
    <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-red-500" />
          <span>Adjustment Analysis</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMethod('flat')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors ${
              activeMethod === 'flat' 
                ? 'bg-red-500/20 text-red-500' 
                : 'bg-black/40 hover:bg-red-500/10'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Flat</span>
          </button>
          <button
            onClick={() => setActiveMethod('percentage')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors ${
              activeMethod === 'percentage' 
                ? 'bg-blue-500/20 text-blue-500' 
                : 'bg-black/40 hover:bg-blue-500/10'
            }`}
          >
            <Percent className="h-4 w-4" />
            <span>Percentage</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cumulative Impact Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cumulativeData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar 
                dataKey="flatCumulative" 
                name="Flat Impact" 
                fill="rgba(239, 68, 68, 0.6)"
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth={1}
              />
              <Bar 
                dataKey="percentageCumulative" 
                name="Percentage Impact" 
                fill="rgba(59, 130, 246, 0.6)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey={activeMethod === 'flat' ? 'flatCumulative' : 'percentageCumulative'}
                stroke={activeMethod === 'flat' ? '#EF4444' : '#3B82F6'}
                strokeWidth={2}
                dot={{ fill: activeMethod === 'flat' ? '#EF4444' : '#3B82F6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 rounded-lg space-y-2">
            <div className="text-gray-400 text-sm">Total Value Impact</div>
            <div className={`text-xl font-semibold ${
              totalImpact > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totalImpact)}
              <span className="text-sm ml-1">
                ({formatPercentage(totalImpact / property.value)})
              </span>
            </div>
          </div>
          <div className="p-4 bg-black/40 rounded-lg space-y-2">
            <div className="text-gray-400 text-sm">Average Step Impact</div>
            <div className={`text-xl font-semibold ${
              averageImpact > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(averageImpact)}
              <span className="text-sm ml-1">
                ({formatPercentage(averageImpact / property.value)})
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="space-y-2">
          {comparisonData.map((data, index) => (
            <div 
              key={data.name}
              className={`p-4 bg-black/40 rounded-lg space-y-3 transition-all duration-300 ${
                data.difference > 0 ? 'hover:border-green-500/30' : 'hover:border-red-500/30'
              } border border-transparent value-change`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Step {data.step}</span>
                  <span className="font-semibold">{data.name}</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  data.difference > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {data.difference > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{formatCurrency(Math.abs(data.difference))}</span>
                  <span className="text-sm">
                    ({data.percentageDiff > 0 ? '+' : ''}{data.percentageDiff.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Flat Result</div>
                  <div>{formatCurrency(data.flatValue)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Percentage Result</div>
                  <div>{formatCurrency(data.percentageValue)}</div>
                </div>
              </div>

              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min(Math.abs(data.percentageDiff), 100)}%`,
                    background: data.difference > 0 
                      ? 'linear-gradient(to right, #34D399, #3B82F6)' 
                      : 'linear-gradient(to right, #F87171, #EF4444)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdjustmentAnalytics;