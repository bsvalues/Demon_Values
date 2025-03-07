import React, { useState } from 'react';
import { Target, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { Property } from '../../types';

interface OutliersTrainingProps {
  onComplete: () => void;
  onBack: () => void;
  selectedProperty?: Property;
}

function OutliersTraining({ onComplete, onBack, selectedProperty }: OutliersTrainingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Identifying Market Anomalies',
      content: (
        <div className="space-y-4">
          <p>
            Market outliers represent opportunities and risks. Learning to spot them
            is crucial for accurate valuation.
          </p>
          <div className="p-4 bg-red-500/10 rounded-lg">
            <h4 className="font-semibold mb-2">Key Concept</h4>
            <p className="text-sm">
              Not all outliers are errors. Some represent emerging market trends
              or unique property characteristics.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Types of Outliers',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Value Outliers</h4>
              <p className="text-sm">
                Properties priced significantly above or below market norms.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Feature Outliers</h4>
              <p className="text-sm">
                Properties with unique characteristics that affect their market position.
              </p>
            </div>
          </div>
          {selectedProperty && (
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h4 className="font-semibold">Live Example</h4>
              </div>
              <p className="text-sm">
                Analyzing {selectedProperty.address} for potential outlier characteristics...
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Market Impact Analysis',
      content: (
        <div className="space-y-4">
          <p>
            Understanding how outliers affect market trends and valuations is
            critical for accurate assessments.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Positive Impact</h4>
              <p className="text-sm">
                Outliers can indicate emerging market strength or development potential.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Negative Impact</h4>
              <p className="text-sm">
                Some outliers may suggest market instability or overvaluation.
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
            <Target className="h-8 w-8 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold">Market Anomalies</h2>
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
                    ? 'bg-orange-500'
                    : 'bg-gray-600 hover:bg-orange-500/50'
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
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            <span>{step === steps.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}