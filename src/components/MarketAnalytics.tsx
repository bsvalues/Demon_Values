import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, 
  ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area
} from 'recharts';
import { 
  Brain, TrendingUp, Building2, Target, ArrowUpRight, 
  ArrowDownRight, Activity, DollarSign, Calendar,
  BarChart2, PieChart as PieIcon, Activity as ActivityIcon,
  Map as MapIcon
} from 'lucide-react';
import { Property } from '../types';

interface MarketAnalyticsProps {
  properties: Property[];
}

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4'];

export default function MarketAnalytics({ properties }: MarketAnalyticsProps) {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'distribution' | 'spatial'>('overview');

  const marketMetrics = calculateMarketMetrics(properties);
  const priceDistribution = calculatePriceDistribution(properties);
  const marketTrends = calculateMarketTrends(properties);
  const spatialAnalysis = calculateSpatialAnalysis(properties);

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="h-5 w-5 text-demon-red" />
          <span>Market Analytics</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={\`px-3 py-1 rounded-lg flex items-center space-x-1 \${
              activeView === 'overview' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }\`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveView('trends')}
            className={\`px-3 py-1 rounded-lg flex items-center space-x-1 \${
              activeView === 'trends' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }\`}
          >
            <ActivityIcon className="h-4 w-4" />
            <span>Trends</span>
          </button>
          <button
            onClick={() => setActiveView('distribution')}
            className={\`px-3 py-1 rounded-lg flex items-center space-x-1 \${
              activeView === 'distribution' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }\`}
          >
            <PieIcon className="h-4 w-4" />
            <span>Distribution</span>
          </button>
          <button
            onClick={() => setActiveView('spatial')}
            className={\`px-3 py-1 rounded-lg flex items-center space-x-1 \${
              activeView === 'spatial' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }\`}
          >
            <MapIcon className="h-4 w-4" />
            <span>Spatial</span>
          </button>
        </div>
      </div>

      {/* Market Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-demon-red" />
                <span className="text-sm text-gray-400">Average Value</span>
              </div>
              <div className="text-xl font-semibold">
                ${marketMetrics.averageValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {marketMetrics.valueChange > 0 ? '+' : ''}
                {marketMetrics.valueChange}% YoY
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-demon-red" />
                <span className="text-sm text-gray-400">Total Properties</span>
              </div>
              <div className="text-xl font-semibold">
                {marketMetrics.totalProperties.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {marketMetrics.propertyChange > 0 ? '+' : ''}
                {marketMetrics.propertyChange}% MoM
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-demon-red" />
                <span className="text-sm text-gray-400">Avg. Days Listed</span>
              </div>
              <div className="text-xl font-semibold">
                {marketMetrics.avgDaysListed} days
              </div>
              <div className="text-sm text-gray-400">
                {marketMetrics.daysListedChange > 0 ? '+' : ''}
                {marketMetrics.daysListedChange}% MoM
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-demon-red" />
                <span className="text-sm text-gray-400">Market Score</span>
              </div>
              <div className="text-xl font-semibold">
                {marketMetrics.marketScore}/100
              </div>
              <div className="text-sm text-gray-400">
                {marketMetrics.scoreChange > 0 ? '+' : ''}
                {marketMetrics.scoreChange} points
              </div>
            </div>
          </div>

          {/* Price Range Distribution */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDistribution}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="rgba(239, 68, 68, 0.6)"
                  stroke="rgba(239, 68, 68, 0.8)"
                  strokeWidth={1}
                >
                  {priceDistribution.map((_, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Market Trends */}
      {activeView === 'trends' && (
        <div className="space-y-6">
          {/* Price Trends */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketTrends.priceTrends}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => \`$\${(value/1000).toFixed(0)}k\`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Market Indicators */}
          <div className="grid grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={marketTrends.indicators}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="name" />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis 
                    type="number" 
                    dataKey="price" 
                    name="Price"
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => \`$\${(value/1000).toFixed(0)}k\`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="daysListed" 
                    name="Days Listed"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="size" 
                    range={[50, 400]} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Scatter 
                    data={marketTrends.propertyScatter} 
                    fill="#EF4444"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Analysis */}
      {activeView === 'distribution' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priceDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ name, percent }) => 
                    \`\${name} (\${(percent * 100).toFixed(0)}%)\`
                  }
                >
                  {priceDistribution.map((_, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-lg">
              <h4 className="font-medium mb-2">Distribution Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Median</span>
                  <span>${marketMetrics.medianValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard Deviation</span>
                  <span>${marketMetrics.stdDev.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skewness</span>
                  <span>{marketMetrics.skewness.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kurtosis</span>
                  <span>{marketMetrics.kurtosis.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg">
              <h4 className="font-medium mb-2">Value Ranges</h4>
              <div className="space-y-2">
                {priceDistribution.map((range, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-400">{range.range}</span>
                    <span className="text-sm ml-auto">
                      {((range.count / properties.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spatial Analysis */}
      {activeView === 'spatial' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-lg">
              <h4 className="font-medium mb-2">Geographic Distribution</h4>
              <div className="space-y-2">
                {spatialAnalysis.clusters.map((cluster, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{cluster.name}</span>
                    <span>${cluster.averageValue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-lg">
              <h4 className="font-medium mb-2">Spatial Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Spatial Correlation</span>
                  <span>{spatialAnalysis.correlation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cluster Strength</span>
                  <span>{spatialAnalysis.clusterStrength.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dispersion Index</span>
                  <span>{spatialAnalysis.dispersion.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis 
                  type="number" 
                  dataKey="longitude" 
                  name="Longitude"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="latitude" 
                  name="Latitude"
                  tick={{ fill: '#9CA3AF' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="value" 
                  range={[50, 400]} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Scatter 
                  data={spatialAnalysis.points} 
                  fill="#EF4444"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for calculations
function calculateMarketMetrics(properties: Property[]) {
  return {
    averageValue: 500000,
    valueChange: 5.2,
    totalProperties: properties.length,
    propertyChange: 2.1,
    avgDaysListed: 45,
    daysListedChange: -3.5,
    marketScore: 85,
    scoreChange: 2,
    medianValue: 450000,
    stdDev: 150000,
    skewness: 0.75,
    kurtosis: 2.4
  };
}

function calculatePriceDistribution(properties: Property[]) {
  return [
    { range: '$0-250k', count: 25 },
    { range: '$250k-500k', count: 45 },
    { range: '$500k-750k', count: 20 },
    { range: '$750k-1M', count: 8 },
    { range: '$1M+', count: 2 }
  ];
}

function calculateMarketTrends(properties: Property[]) {
  return {
    priceTrends: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      value: 400000 + Math.random() * 200000
    })),
    indicators: [
      { name: 'Demand', value: 0.8 },
      { name: 'Supply', value: 0.6 },
      { name: 'Growth', value: 0.7 },
      { name: 'Stability', value: 0.85 },
      { name: 'Liquidity', value: 0.75 }
    ],
    propertyScatter: properties.map(p => ({
      price: p.value,
      daysListed: Math.floor(Math.random() * 90),
      size: p.details?.squareFootage || 2000
    }))
  };
}

function calculateSpatialAnalysis(properties: Property[]) {
  return {
    clusters: [
      { name: 'North', averageValue: 550000 },
      { name: 'South', averageValue: 480000 },
      { name: 'East', averageValue: 520000 },
      { name: 'West', averageValue: 495000 }
    ],
    correlation: 0.65,
    clusterStrength: 0.78,
    dispersion: 0.45,
    points: properties.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      value: p.value
    }))
  };
}