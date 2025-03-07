import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart2, Activity } from 'lucide-react';
import { Property } from '../types';

interface StatisticsVisualizerProps {
  properties: Property[];
}

export default function StatisticsVisualizer({ properties }: StatisticsVisualizerProps) {
  const data = React.useMemo(() => {
    const values = properties.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const bucketSize = range / 10;

    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `$${((min + i * bucketSize) / 1000).toFixed(0)}k - $${((min + (i + 1) * bucketSize) / 1000).toFixed(0)}k`,
      count: 0
    }));

    values.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), 9);
      buckets[bucketIndex].count++;
    });

    return buckets;
  }, [properties]);

  if (properties.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-demon-red" />
          <h3 className="font-semibold">Value Distribution</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity className="h-4 w-4" />
          <span>{properties.length} properties</span>
        </div>
      </div>

      <div className="h-[400px] bg-black/20 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="range" 
              tick={{ fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.5rem'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="rgba(239,68,68,0.6)"
              stroke="rgba(239,68,68,0.8)"
              strokeWidth={1}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}