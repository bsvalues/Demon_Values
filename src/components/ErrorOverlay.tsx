import React, { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, Clock, BarChart2 } from 'lucide-react';
import { errorTracker } from '../lib/monitoring/errorTracking';

export default function ErrorOverlay() {
  const [metrics, setMetrics] = useState({
    total: 0,
    categories: {},
    recentErrors: [],
    trends: { hourly: 0, daily: 0 }
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const subscription = errorTracker.getMetrics().subscribe(setMetrics);
    return () => subscription.unsubscribe();
  }, []);

  if (metrics.total === 0) return null;

  return (
    <div className={`fixed top-4 right-4 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg text-white transition-all duration-300 ${
      isExpanded ? 'w-96' : 'w-auto'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">Error Monitor</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <span className="text-sm text-red-500">{metrics.total}</span>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Error Trends */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Last Hour</span>
                </div>
                <div className="mt-1 text-lg">{metrics.trends.hourly}</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <BarChart2 className="h-4 w-4" />
                  <span>24 Hours</span>
                </div>
                <div className="mt-1 text-lg">{metrics.trends.daily}</div>
              </div>
            </div>

            {/* Recent Errors */}
            <div className="space-y-2">
              <h4 className="text-sm text-gray-400">Recent Errors</h4>
              <div className="space-y-2">
                {metrics.recentErrors.map(error => (
                  <div
                    key={error.id}
                    className="p-3 bg-red-500/10 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{error.type}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{error.message}</p>
                    {error.componentName && (
                      <p className="text-xs text-gray-500">
                        Component: {error.componentName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Categories */}
            <div className="space-y-2">
              <h4 className="text-sm text-gray-400">Error Types</h4>
              <div className="space-y-2">
                {Object.entries(metrics.categories).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{type}</span>
                    <span className="text-red-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}