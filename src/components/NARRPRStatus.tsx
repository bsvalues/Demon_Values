import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { narrprBridge } from '../lib/narrpr/bridge';

export default function NARRPRStatus() {
  const status = narrprBridge.getStatus();

  return (
    <div className="p-4 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold">NARRPR Sync Status</h3>
        </div>
        {status.inProgress && (
          <div className="text-sm text-blue-400">Sync in progress...</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-sm text-gray-400">Last Sync</div>
          <div className="font-medium">
            {status.lastSync 
              ? status.lastSync.toLocaleString()
              : 'Never'}
          </div>
        </div>

        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-sm text-gray-400">Properties</div>
          <div className="font-medium">
            {status.data?.length ?? 0}
          </div>
        </div>
      </div>

      {status.error && (
        <div className="p-3 bg-red-500/10 rounded-lg">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <div className="mt-1 text-sm text-gray-400">
            {status.error}
          </div>
        </div>
      )}
    </div>
  );
}