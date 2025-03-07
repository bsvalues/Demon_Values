import React, { useState } from 'react';
import { Flame, ArrowLeft, ArrowRight, TrendingUp } from 'lucide-react';
import { Property } from '../../types';

interface PredictionTrainingProps {
  onComplete: () => void;
  onBack: () => void;
  selectedProperty?: Property;
}

function PredictionTraining({ onComplete, onBack, selectedProperty }: PredictionTrainingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Market Prediction Fundamentals',
      content: (
        <div className="space-y-4">
          <p>
            Predicting market behavior requires understanding both historical patterns
            and emerging trends.
          </p>
          <div className="p-4 bg-red-500/10 rounded-lg">
            <h4 className="font-semibold mb-2">Key Concept</h4>
            <p className="text-sm">
              Market predictions combine data analysis with understanding of
              local market dynamics and economic factors.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Driver Impact Simulation',
      content: (
        <div className="space-y-4">
          <p>
            Learn to simulate how changes in market drivers affect property values
            and market trends.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Primary Drivers</h4>
              <p className="text-sm">
                Location, size, and condition have immediate, measurable impacts.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Secondary Drivers</h4>
              <p className="text-sm">
                Market sentiment and economic conditions create longer-term effects.
              </p>
            </div>
          </div>
          {selectedProperty && (
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <h4 className="font-semibold">Live Simulation</h4>
              </div>
              <p className="text-sm">
                Simulating value changes for {selectedProperty.address} based on
                market driver adjustments...
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Market Trend Analysis',
      content: (
        <div className="space-y-4">
          <p>
            Identifying and interpreting market trends is crucial for accurate
            value predictions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Short-term Trends</h4>
              <p className="text-sm">
                Immediate market reactions and seasonal patterns.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Long-term Trends</h4>
              <p className="text-sm">
                Demographic shifts and development patterns.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative max-w-4xl w-full mx-4 bg-black/80 border border-red-900/30 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <Flame className="h-8 w-8 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold">Market Prediction</h2>
              <p className="text-sm text-gray-400">
                Step {step + 1} of {steps.length}
              </p>
            </div>
          </div>
          <div className="w-8" />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">{steps[step].title}</h3>
          {steps[step].content}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-red-900/30">
          <div className="space-x-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === step
                    ? 'bg-yellow-500'
                    : 'bg-gray-600 hover:bg-yellow-500/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                onComplete();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors"
          >
            <span>{step === steps.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}