import React, { useState } from 'react';
import { 
  Brain, TrendingUp, Building2, Target, ArrowUpRight, 
  ArrowDownRight, Activity, DollarSign, Calendar,
  BarChart2, PieChart as PieIcon, Activity as ActivityIcon,
  Map as MapIcon
} from 'lucide-react';
import { Property, RegionalAnalysis } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

interface ClusterAnalyticsProps {
  cluster: Property[];
  analysis: RegionalAnalysis;
}

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4'];

function ClusterAnalytics({ cluster, analysis }: ClusterAnalyticsProps) {
  const [activeView, setActiveView] = useState<'overview' | 'composition' | 'drivers' | 'spatial'>('overview');

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
      {/* Header with View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-demon-red" />
          <h3 className="text-lg font-semibold">Cluster Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeView === 'overview' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveView('composition')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeView === 'composition' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <PieIcon className="h-4 w-4" />
            <span>Composition</span>
          </button>
          <button
            onClick={() => setActiveView('drivers')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeView === 'drivers' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <ActivityIcon className="h-4 w-4" />
            <span>Drivers</span>
          </button>
          <button
            onClick={() => setActiveView('spatial')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              activeView === 'spatial' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/20'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            <span>Spatial</span>
          </button>
        </div>
      </div>

      {/* Overview View */}
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
                {formatCurrency(analysis.averageValue)}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+5.2% YoY</span>
              </div>
            </div>
            {/* Add other metrics here */}
          </div>

          {/* Value Distribution */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cluster.reduce((acc: any[], property) => {
                const range = Math.floor(property.value / 100000) * 100000;
                const existing = acc.find(a => a.range === range);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ range, count: 1 });
                }
                return acc.sort((a, b) => a.range - b.range);
              }, [])}>
                <XAxis 
                  dataKey="range" 
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'count' ? 'Properties' : name
                  ]}
                  labelFormatter={(label) => `Value Range: ${formatCurrency(label)}`}
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
                  {cluster.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add other views (composition, drivers, spatial) here */}
    </div>
  );
}

export default ClusterAnalytics;