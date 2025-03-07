import React, { useState, useEffect } from 'react';
import { GraduationCap, Brain, Target, ArrowRight, X } from 'lucide-react';
import { Property } from '../types';

interface TeachingOverlayProps {
  onClose: () => void;
  selectedProperty?: Property;
}

export default function TeachingOverlay({ onClose, selectedProperty }: TeachingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const teachingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to the Demon Valuation Agent',
      description: 'This powerful tool will teach you to see property values like never before. Let\'s begin your journey into true market understanding.',
    },
    {
      id: 'heatmap',
      title: 'Dynamic Heatmap Analysis',
      description: 'The heatmap reveals market patterns through color intensity. Red areas indicate high values, while darker areas show lower values.',
      highlight: '.heatmap-layer'
    },
    {
      id: 'channels',
      title: 'Cross-Channel Intelligence',
      description: 'Toggle between different data channels to uncover hidden relationships. Combine channels to reveal deeper market patterns.',
      highlight: '.heatmap-controls'
    },
    {
      id: 'clustering',
      title: 'Market Force Clusters',
      description: 'Properties cluster based on shared characteristics, not just location. These clusters reveal the true drivers of value.',
      highlight: '.cluster-analysis'
    },
    {
      id: 'adjustments',
      title: 'Percentage vs. Flat Adjustments',
      description: 'Learn when to use percentage-based adjustments instead of flat-dollar changes. The market itself will guide you.',
      highlight: '.adjustment-analytics'
    }
  ];

  const handleNext = () => {
    if (currentStep < teachingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    const highlightElement = teachingSteps[currentStep].highlight;
    if (highlightElement) {
      const element = document.querySelector(highlightElement);
      if (element) {
        element.classList.add('teaching-highlight');
      }

      return () => {
        if (element) {
          element.classList.remove('teaching-highlight');
        }
      };
    }
  }, [currentStep]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative max-w-2xl w-full mx-4 bg-black/80 border border-red-900/30 rounded-lg p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-xl font-bold">{teachingSteps[currentStep].title}</h2>
            <p className="text-sm text-gray-400">
              Step {currentStep + 1} of {teachingSteps.length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">{teachingSteps[currentStep].description}</p>

          {selectedProperty && currentStep === 3 && (
            <div className="p-4 bg-red-500/10 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Live Example</h3>
              </div>
              <p className="text-sm">
                This property at {selectedProperty.address} is part of a 
                {selectedProperty.cluster} cluster, indicating strong market presence.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="p-4 bg-red-500/10 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Market Insight</h3>
              </div>
              <p className="text-sm">
                High-value properties often respond better to percentage-based adjustments,
                while entry-level properties may benefit from flat-dollar changes.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="space-x-1">
            {Array.from({ length: teachingSteps.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-red-500'
                    : 'bg-gray-600 hover:bg-red-500/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span>{currentStep === teachingSteps.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}