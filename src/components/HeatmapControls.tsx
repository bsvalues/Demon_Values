import React from 'react';
import { Layers, Eye, EyeOff, Sliders } from 'lucide-react';

export interface HeatmapChannel {
  id: string;
  name: string;
  field: string;
  min: number;
  max: number;
  weight: number;
  color: string;
  enabled: boolean;
}

interface HeatmapControlsProps {
  channels: HeatmapChannel[];
  onChannelToggle: (channelId: string) => void;
  onWeightChange: (channelId: string, weight: number) => void;
}

export default function HeatmapControls({ channels, onChannelToggle, onWeightChange }: HeatmapControlsProps) {
  return (
    <div className="absolute top-4 left-4 w-64 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Layers className="h-5 w-5 text-red-500" />
        <h3 className="font-semibold">Heatmap Layers</h3>
      </div>

      <div className="space-y-4">
        {channels.map(channel => (
          <div key={channel.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onChannelToggle(channel.id)}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  {channel.enabled ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                <span className={channel.enabled ? 'text-white' : 'text-gray-500'}>
                  {channel.name}
                </span>
              </div>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: channel.color }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={channel.weight}
                onChange={(e) => onWeightChange(channel.id, parseFloat(e.target.value))}
                className="flex-1"
                disabled={!channel.enabled}
              />
              <span className="text-sm text-gray-400 w-8">
                {(channel.weight * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}