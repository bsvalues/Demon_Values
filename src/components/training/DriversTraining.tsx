import React, { useState } from 'react';
import { Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import { Property } from '../../types';

interface DriversTrainingProps {
  onComplete: () => void;
  onBack: () => void;
  selectedProperty?: Property;
}

function DriversTraining({ onComplete, onBack, selectedProperty }: DriversTrainingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Understanding Market Drivers',
      content: (
        <div className="space-y-4">
          <p>
            Market value is driven by multiple forces, each with its own weight and impact.
            Let's learn to identify and measure these drivers.
          </p>
          <div className="p-4 bg-red-500/10 rounded-lg">
            <h4 className="font-semibold mb-2">Key Concept</h4>
            <p className="text-sm">
              Different markets prioritize different drivers. What matters in one area
              might be less important in another.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Location Analysis',
      content: (
        <div className="space-y-4">
          <p>
            Location is often the strongest driver, but its impact varies by market.
            Let's analyze how location affects value in different contexts.
          </p>
          {selectedProperty && (
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Live Example</h4>
              <p className="text-sm">
                This property at {selectedProperty.address} shows strong location influence
                due to its proximity to key amenities.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Physical Characteristics',
      content: (
        <div className="space-y-4">
          <p>
            Size, condition, and features contribute to value, but their impact
            scales differently across price ranges.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Size Impact</h4>
              <p className="text-sm">
                Square footage impact often diminishes at higher price points.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-semibold mb-2">Quality Impact</h4>
              <p className="text-sm">
                Quality and condition impact typically increases with price.
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
            <Brain className="h-8 w-8 text-red-500" />
            <div>
              <h2 className="text-xl font-bold">Drivers of Value</h2>
              <p className="text-sm text-gray-400">
                Step {step + 1} of {steps.length}
              </p>
            </div>
          </div>
          <div className="w-8" /> {/* Spacer for alignment */}
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
                    ? 'bg-red-500'
                    : 'bg-gray-600 hover:bg-red-500/50'
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
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span>{step === steps.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}