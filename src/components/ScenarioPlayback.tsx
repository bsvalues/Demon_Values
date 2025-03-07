import React, { useState } from 'react';
import { Play, Rewind, FastForward, RotateCcw, Settings2, History } from 'lucide-react';
import { Property } from '../types';
import PropertyImprovements from './PropertyImprovements';
import AdjustmentAnalytics from './AdjustmentAnalytics';

interface ScenarioPlaybackProps {
  property: Property;
}

interface Scenario {
  step: number;
  adjustment: string;
  attribute: string;
  value: number;
  percentageChange: number;
  flatChange: number;
  previousValue: number;
}

function ScenarioPlayback({ property }: ScenarioPlaybackProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const addScenario = (
    adjustment: string,
    attribute: string,
    percentageChange: number,
    flatChange: number
  ) => {
    const previousValue = scenarios.length > 0 
      ? scenarios[scenarios.length - 1].value 
      : property.value;

    const newScenario: Scenario = {
      step: scenarios.length + 1,
      adjustment,
      attribute,
      value: previousValue + flatChange,
      percentageChange,
      flatChange,
      previousValue,
    };

    setScenarios([...scenarios, newScenario]);
    setCurrentStep(newScenario.step);
  };

  const resetScenarios = () => {
    setScenarios([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const playScenario = () => {
    if (currentStep >= scenarios.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseScenario = () => {
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentStep < scenarios.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < scenarios.length) {
      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
        if (currentStep + 1 >= scenarios.length) {
          setIsPlaying(false);
        }
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, scenarios.length]);

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="space-y-6 p-6 bg-black/80 backdrop-blur-sm border border-red-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <History className="h-5 w-5 text-red-500" />
            <span>Scenario Playback</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetScenarios}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Previous Step"
            >
              <Rewind className="h-4 w-4" />
            </button>
            <button
              onClick={isPlaying ? pauseScenario : playScenario}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              <Play className={`h-4 w-4 ${isPlaying ? 'text-red-500' : ''}`} />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep >= scenarios.length}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Next Step"
            >
              <FastForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        {scenarios.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Timeline Progress</span>
              <span>Step {currentStep} of {scenarios.length}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                style={{
                  width: `${(currentStep / scenarios.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.step}
                  onClick={() => setCurrentStep(index + 1)}
                  className={`w-full p-3 rounded-lg transition-all duration-300 text-left ${
                    index + 1 === currentStep
                      ? 'bg-red-500/20 border border-red-500/50'
                      : 'bg-black/40 hover:bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Step {scenario.step}: {scenario.adjustment}</span>
                    <span className={`text-sm ${
                      scenario.value > scenario.previousValue 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {scenario.value > scenario.previousValue ? '+' : ''}
                      ${(scenario.value - scenario.previousValue).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Property Improvements */}
        <PropertyImprovements 
          property={property}
          onAddScenario={addScenario}
        />
      </div>

      {/* Analytics Panel */}
      {scenarios.length > 0 && (
        <AdjustmentAnalytics 
          property={property}
          scenarios={scenarios}
        />
      )}
    </div>
  );
}

export default ScenarioPlayback;