import React from 'react';
import { Sliders, ToggleLeft, Tag, X, Plus } from 'lucide-react';
import { FilterDimension } from '../lib/filters/filterEngine';

interface FilterPanelProps {
  dimensions: FilterDimension[];
  filters: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
  onDimensionUpdate: (id: string, updates: Partial<FilterDimension>) => void;
}

export default function FilterPanel({
  dimensions,
  filters,
  onFilterChange,
  onDimensionUpdate,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="h-5 w-5 text-demon-red" />
          <h3 className="font-semibold">Advanced Filters</h3>
        </div>
      </div>

      <div className="space-y-4">
        {dimensions.map(dimension => (
          <div
            key={dimension.id}
            className={`p-4 rounded-lg transition-colors ${
              dimension.enabled
                ? 'bg-demon-red/10 border border-demon-red/30'
                : 'bg-black/40 border border-demon-red/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {dimension.type === 'range' ? (
                  <Sliders className="h-4 w-4 text-demon-red" />
                ) : dimension.type === 'categorical' ? (
                  <Tag className="h-4 w-4 text-demon-red" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-demon-red" />
                )}
                <span className="font-medium">{dimension.name}</span>
              </div>
              <button
                onClick={() => onDimensionUpdate(dimension.id, { enabled: !dimension.enabled })}
                className={`p-1 rounded transition-colors ${
                  dimension.enabled
                    ? 'hover:bg-demon-red/20'
                    : 'hover:bg-demon-red/10'
                }`}
              >
                {dimension.enabled ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            </div>

            {dimension.enabled && (
              <div className="space-y-2">
                {dimension.type === 'range' && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{filters[dimension.id]?.min || dimension.min}</span>
                      <span>{filters[dimension.id]?.max || dimension.max}</span>
                    </div>
                    <input
                      type="range"
                      min={dimension.min}
                      max={dimension.max}
                      value={filters[dimension.id]?.value || dimension.min}
                      onChange={(e) => onFilterChange(dimension.id, {
                        min: dimension.min,
                        max: dimension.max,
                        value: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                )}

                {dimension.type === 'categorical' && dimension.options && (
                  <div className="flex flex-wrap gap-2">
                    {dimension.options.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          const current = filters[dimension.id] || [];
                          const updated = current.includes(option)
                            ? current.filter((o: string) => o !== option)
                            : [...current, option];
                          onFilterChange(dimension.id, updated);
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters[dimension.id]?.includes(option)
                            ? 'bg-demon-red text-white'
                            : 'bg-black/40 hover:bg-demon-red/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {dimension.type === 'boolean' && (
                  <button
                    onClick={() => onFilterChange(
                      dimension.id,
                      !filters[dimension.id]
                    )}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filters[dimension.id]
                        ? 'bg-demon-red text-white'
                        : 'bg-black/40 hover:bg-demon-red/10'
                    }`}
                  >
                    {filters[dimension.id] ? 'Enabled' : 'Disabled'}
                  </button>
                )}

                <div className="mt-2">
                  <label className="block text-sm text-gray-400 mb-1">
                    Weight
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={dimension.weight}
                    onChange={(e) => onDimensionUpdate(
                      dimension.id,
                      { weight: Number(e.target.value) }
                    )}
                    className="w-full"
                  />
                  <div className="text-right text-sm text-gray-400">
                    {(dimension.weight * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}