import React, { useState } from 'react';
import { GraduationCap, Brain, Target, ArrowRight, X, Flame } from 'lucide-react';
import DriversTraining from './DriversTraining';
import OutliersTraining from './OutliersTraining';
import PredictionTraining from './PredictionTraining';
import { Property } from '../../types';

interface TrainingModuleProps {
  onClose: () => void;
  selectedProperty?: Property;
}

function TrainingModule({ onClose, selectedProperty }: TrainingModuleProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const modules = [
    {
      id: 'drivers',
      title: 'Drivers of Value',
      description: 'Master the true forces that drive market value.',
      icon: <Brain className="h-6 w-6 text-red-500" />,
      component: DriversTraining
    },
    {
      id: 'outliers',
      title: 'Market Anomalies',
      description: 'Learn to spot and understand market outliers.',
      icon: <Target className="h-6 w-6 text-orange-500" />,
      component: OutliersTraining
    },
    {
      id: 'prediction',
      title: 'Market Prediction',
      description: 'Simulate and predict market behavior.',
      icon: <Flame className="h-6 w-6 text-yellow-500" />,
      component: PredictionTraining
    }
  ];

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
    setActiveModule(null);
  };

  if (activeModule) {
    const module = modules.find(m => m.id === activeModule);
    if (!module) return null;

    const ModuleComponent = module.component;
    return (
      <ModuleComponent
        onComplete={() => handleModuleComplete(module.id)}
        onBack={() => setActiveModule(null)}
        selectedProperty={selectedProperty}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative max-w-4xl w-full mx-4 bg-black/80 border border-red-900/30 rounded-lg p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-xl font-bold">Demon's Training Academy</h2>
            <p className="text-sm text-gray-400">
              Master the art of market valuation through our advanced training modules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`p-6 rounded-lg border transition-all duration-300 text-left space-y-4 ${
                completedModules.has(module.id)
                  ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
                  : 'bg-black/40 border-red-900/30 hover:bg-red-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                {module.icon}
                {completedModules.has(module.id) && (
                  <div className="text-xs text-red-500 font-semibold">COMPLETED</div>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{module.title}</h3>
                <p className="text-sm text-gray-400">{module.description}</p>
              </div>
              <div className="flex items-center text-sm text-red-500">
                <span>Begin Training</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </button>
          ))}
        </div>

        {completedModules.size > 0 && (
          <div className="pt-4 border-t border-red-900/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Training Progress: {completedModules.size} of {modules.length} modules completed
              </div>
              <div className="h-2 flex-1 mx-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${(completedModules.size / modules.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}