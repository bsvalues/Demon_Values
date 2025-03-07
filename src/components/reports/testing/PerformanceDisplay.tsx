import React from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { RegressionAlert } from './PerformanceMonitor';

interface PerformanceDisplayProps {
  metrics: any;
  alerts: RegressionAlert[];
  trends: any;
}

export function PerformanceDisplay({ metrics, alerts, trends }: PerformanceDisplayProps) {
  const formatDuration = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatMemory = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-blue-400">
        <Activity className="h-5 w-5" />
        <h3 className="font-semibold">Performance Metrics</h3>
      </div>

      {/* Current Metrics */}
      {metrics?.lastExport && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-black/40 rounded-lg">
            <div className="text-sm text-gray-400">Last Export</div>
            <div className="font-semibold">
              {metrics.lastExport.format.toUpperCase()}
            </div>
            <div className="text-sm">
              Duration: {formatDuration(metrics.lastExport.duration)}
            </div>
          </div>
          <div className="p-3 bg-black/40 rounded-lg">
            <div className="text-sm text-gray-400">Dataset Size</div>
            <div className="font-semibold">
              {metrics.lastExport.dataSize.toLocaleString()} properties
            </div>
          </div>
        </div>
      )}

      {/* Regression Alerts */}
      {alerts.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Performance Regressions Detected</span>
          </div>
          {alerts.map((alert, index) => (
            <div key={index} className="text-sm text-gray-400">
              {alert.format.toUpperCase()} {alert.metric}:{' '}
              <span className="text-red-500">
                {alert.percentageChange.toFixed(1)}% increase
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Performance Trends */}
      {trends && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(trends).map(([format, trend]: [string, any]) => (
            <div key={format} className="p-3 bg-black/40 rounded-lg">
              <div className="text-sm text-gray-400">{format.toUpperCase()}</div>
              <div className="flex items-center space-x-2">
                {trend.duration > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">
                  {Math.abs(trend.duration).toFixed(2)}ms/test
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}