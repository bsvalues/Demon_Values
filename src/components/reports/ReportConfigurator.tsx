import React from 'react';
import { FileText, Table, BarChart3, Map } from 'lucide-react';

export interface ReportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ReportConfiguratorProps {
  options: ReportOption[];
  onToggleOption: (id: string) => void;
}

function ReportConfigurator({ options, onToggleOption }: ReportConfiguratorProps) {
  return (
    <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Customize Your Report</h3>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onToggleOption(option.id)}
            className={`w-full p-4 rounded-lg border transition-all duration-300 text-left space-y-2 ${
              option.enabled
                ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
                : 'bg-black/40 border-red-900/30 hover:bg-red-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {option.icon}
                <span className="font-semibold">{option.label}</span>
              </div>
              <div className={`text-xs ${option.enabled ? 'text-red-500' : 'text-gray-500'}`}>
                {option.enabled ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
            <p className="text-sm text-gray-400">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export const defaultReportOptions: ReportOption[] = [
  {
    id: 'heatmap',
    label: 'Heatmap Highlights',
    description: 'Include driver-specific heatmaps showing market patterns and hotspots.',
    icon: <Map className="h-5 w-5 text-blue-500" />,
    enabled: true,
  },
  {
    id: 'clusters',
    label: 'Cluster Summaries',
    description: 'Show cluster averages, dominant drivers, and key statistics.',
    icon: <Table className="h-5 w-5 text-green-500" />,
    enabled: true,
  },
  {
    id: 'outliers',
    label: 'Outlier Analysis',
    description: 'Highlight and analyze properties that deviate from market norms.',
    icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    enabled: true,
  },
  {
    id: 'predictions',
    label: 'Market Predictions',
    description: 'Include simulations and forecasts based on market drivers.',
    icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
    enabled: true,
  },
];

export default ReportConfigurator;