import React from 'react';
import { TrendingUp, Calculator, Clock3, DollarSign, PlusCircle } from 'lucide-react';
import { Property } from '../types';
import { calculateROI } from '../lib/ml';

interface PropertyImprovementsProps {
  property: Property;
  onAddScenario: (adjustment: string, attribute: string, percentageChange: number, flatChange: number) => void;
}

const COMMON_IMPROVEMENTS = [
  {
    name: 'Add Pool',
    type: 'pool',
    cost: 50000,
    value: 65000,
    percentageImpact: 8,
    icon: '🏊‍♂️',
  },
  {
    name: 'Kitchen Remodel',
    type: 'kitchen',
    cost: 40000,
    value: 55000,
    percentageImpact: 6,
    icon: '🍳',
  },
  {
    name: 'Bathroom Upgrade',
    type: 'bathroom',
    cost: 25000,
    value: 35000,
    percentageImpact: 4,
    icon: '🚿',
  },
  {
    name: 'Add Garage',
    type: 'garage',
    cost: 30000,
    value: 45000,
    percentageImpact: 5,
    icon: '🚗',
  },
];

function PropertyImprovements({ property, onAddScenario }: PropertyImprovementsProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(value);

  const formatPercentage = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
      .format(value);

  const handleImprovement = (improvement: typeof COMMON_IMPROVEMENTS[0]) => {
    const roi = calculateROI(property, improvement);
    
    onAddScenario(
      improvement.name,
      improvement.type,
      improvement.percentageImpact,
      improvement.value
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-red-500">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-semibold">Common Improvements</h3>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
          <PlusCircle className="h-4 w-4" />
          <span>Custom</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {COMMON_IMPROVEMENTS.map((improvement) => {
          const roi = calculateROI(property, improvement);
          const isRecommended = roi.roi > 0.2;
          
          return (
            <button
              key={improvement.type}
              onClick={() => handleImprovement(improvement)}
              className="group p-4 bg-black/40 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-left space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full transform rotate-45 transition-transform group-hover:scale-150" />
              
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{improvement.icon}</span>
                <div>
                  <div className="font-semibold">{improvement.name}</div>
                  <div className="text-sm text-gray-400">
                    {isRecommended ? 'Recommended' : 'Optional'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-gray-400">Cost:</span>
                  </div>
                  <span>{formatCurrency(improvement.cost)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <Calculator className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-400">ROI:</span>
                  </div>
                  <span className={roi.roi > 0.2 ? 'text-green-500' : 'text-yellow-500'}>
                    {formatPercentage(roi.roi)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-400">Value:</span>
                  </div>
                  <span>{formatCurrency(improvement.value)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <Clock3 className="h-4 w-4 text-orange-400" />
                    <span className="text-gray-400">Payback:</span>
                  </div>
                  <span>{roi.paybackPeriod.toFixed(1)} years</span>
                </div>
              </div>

              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${Math.min(roi.roi * 100, 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PropertyImprovements;