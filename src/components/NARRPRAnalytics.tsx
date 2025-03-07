import React from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { SyncAnalytics } from '../lib/narrpr/analytics';

interface NARRPRAnalyticsProps {
  analytics: ReturnType<SyncAnalytics['getAnalytics']>;
}

export default function NARRPRAnalytics({ analytics }: NARRPRAnalyticsProps) {
  const formatDuration = (ms: number) => \`\${(ms / 1000).toFixed(1)}s\`;
  const formatMemory = (bytes: number) => \`\${(bytes / 1024 / 1024).toFixed(1)}MB\`;
  const formatTime = (timestamp: number) => new Date(timestamp).toLocaleString();

  return (
    <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <Activity className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Sync Analytics</h3>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/40 rounded-lg space-y-2">
          <div className="text-sm text-gray-400">Last 24 Hours</div>
          <div className="text-2xl font-semibold">{analytics.syncStats.last24Hours}</div>
          <div className="text-sm text-gray-400">Total: {analytics.syncStats.total}</div>
        </div>

        <div className="p-4 bg-black/40 rounded-lg space-y-2">
          <div className="text-sm text-gray-400">Average Duration</div>
          <div className="text-2xl font-semibold">
            {formatDuration(analytics.syncStats.averages.duration)}
          </div>
          <div className="text-sm text-gray-400">
            {analytics.syncStats.averages.propertiesPerSync.toFixed(0)} properties/sync
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {analytics.errorStats.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <h4 className="font-semibold">Recent Errors</h4>
          </div>
          <div className="space-y-2">
            {analytics.errorStats.map(error => (
              <div key={error.type} className="p-3 bg-red-500/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{error.type}</span>
                  <span className="text-sm text-gray-400">
                    {error.count} occurrences
                  </span>
                </div>
                {error.recentExamples.map((example, i) => (
                  <div key={i} className="mt-1 text-sm text-gray-400">
                    {example.message}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {analytics.trends && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <h4 className="font-semibold">Performance Trends</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {analytics.trends.map(trend => trend && (
              <div key={trend.period} className="p-3 bg-black/40 rounded-lg">
                <div className="text-sm text-gray-400">{trend.period}</div>
                <div className="space-y-1">
                  {Object.entries(trend.metrics).map(([metric, data]) => (
                    <div key={metric} className="flex items-center justify-between text-sm">
                      <span>{metric}</span>
                      <div className="flex items-center space-x-1">
                        {data.trend === 'increasing' ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        )}
                        <span>{data.percentChange.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}