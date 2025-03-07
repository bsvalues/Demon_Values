import React from 'react';
import { Brain, TrendingUp, Building2 } from 'lucide-react';
import { Property } from '../types';

interface RegionAnalysisProps {
  region: {
    properties: Property[];
    stats: {
      averageValue: number;
      medianValue: number;
      valueRange: [number, number];
      dominantFeatures: Array<{
        feature: string;
        impact: number;
      }>;
      marketTrends: Array<{
        trend: string;
        value: number;
      }>;
    };
  };
}

function RegionAnalysisPanel({ region }: RegionAnalysisProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(value);

  const formatPercentage = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
      .format(Math.abs(value));

  return (
    <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg text-white">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Region Analysis</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm text-gray-400 mb-2 flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Property Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Average Value</div>
              <div className="text-lg font-semibold">
                {formatCurrency(region.stats.averageValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Median Value</div>
              <div className="text-lg font-semibold">
                {formatCurrency(region.stats.medianValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Value Range</div>
              <div className="text-sm">
                {formatCurrency(region.stats.valueRange[0])} - {formatCurrency(region.stats.valueRange[1])}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Properties</div>
              <div className="text-lg font-semibold">{region.properties.length}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-gray-400 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Trends
          </h4>
          <div className="space-y-2">
            {region.stats.marketTrends.map(({ trend, value }) => (
              <div key={trend} className="flex justify-between items-center">
                <span className="text-sm">{trend}</span>
                <span className={`text-sm ${value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {value > 0 ? '+' : ''}{formatPercentage(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm text-gray-400 mb-2">Value Drivers</h4>
          <div className="space-y-2">
            {region.stats.dominantFeatures.map(({ feature, impact }) => (
              <div key={feature} className="flex justify-between items-center">
                <span className="text-sm capitalize">{feature}</span>
                <span className="text-sm text-blue-400">
                  {formatPercentage(impact)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegionAnalysisPanel;