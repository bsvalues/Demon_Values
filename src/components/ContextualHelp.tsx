import React from 'react';
import { HelpCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ContextualHelpProps {
  type: 'cluster' | 'adjustment' | 'outlier';
  data: any;
}

export default function ContextualHelp({ type, data }: ContextualHelpProps) {
  const getHelpContent = () => {
    switch (type) {
      case 'cluster':
        return {
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
          title: 'Cluster Insight',
          content: `This cluster shows strong ${data.dominantFeature} influence. 
                   Properties here are typically valued ${data.percentageImpact}% 
                   higher due to this factor.`
        };
      case 'adjustment':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          title: 'Adjustment Recommendation',
          content: `Consider using ${
            data.recommendedMethod
          } adjustments here. The market shows a ${
            data.confidence
          }% preference for this method.`
        };
      case 'outlier':
        return {
          icon: <HelpCircle className="h-5 w-5 text-purple-500" />,
          title: 'Market Anomaly',
          content: `This property deviates ${
            data.deviationPercentage
          }% from cluster norms. Key factor: ${data.reason}`
        };
      default:
        return {
          icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
          title: 'Help',
          content: 'No specific guidance available for this element.'
        };
    }
  };

  const { icon, title, content } = getHelpContent();

  return (
    <div className="p-4 bg-black/60 backdrop-blur-sm border border-red-900/30 rounded-lg space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-gray-300">{content}</p>
    </div>
  );
}