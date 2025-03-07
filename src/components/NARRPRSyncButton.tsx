import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { narrprBridge } from '../lib/narrpr/bridge';

export default function NARRPRSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      await narrprBridge.triggerSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          syncing
            ? 'bg-red-500/20 cursor-not-allowed'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
        <span>{syncing ? 'Syncing...' : 'Sync NARRPR Data'}</span>
      </button>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}