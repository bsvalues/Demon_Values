import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Clock, Server } from 'lucide-react';
import { performanceMonitor } from '../lib/monitoring/performanceMetrics';

export default function PerformanceOverlay() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    apiLatency: 0,
    renderTime: 0
  });

  useEffect(() => {
    const subscription = performanceMonitor.getMetrics().subscribe(setMetrics);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg p-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm">{metrics.fps} FPS</span>
        </div>
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{metrics.memoryUsage} MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">{metrics.apiLatency}ms API</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-purple-500" />
          <span className="text-sm">{metrics.renderTime}ms Render</span>
        </div>
      </div>
    </div>
  );
}