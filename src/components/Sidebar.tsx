import React from 'react';
import { Flame, Target, Maximize2 } from 'lucide-react';
import FilterPanel from './FilterPanel';
import { FilterEngine, FilterDimension } from '../lib/filters/filterEngine';

// Initialize filter dimensions
const initialDimensions: FilterDimension[] = [
  {
    id: 'value',
    name: 'Property Value',
    field: 'value',
    type: 'range',
    min: 0,
    max: 1000000,
    weight: 1,
    enabled: true
  },
  {
    id: 'location',
    name: 'Location Score',
    field: 'locationScore',
    type: 'range',
    min: 0,
    max: 100,
    weight: 1,
    enabled: true
  },
  {
    id: 'propertyType',
    name: 'Property Type',
    field: 'type',
    type: 'categorical',
    options: ['Residential', 'Commercial', 'Industrial'],
    weight: 1,
    enabled: true
  },
  {
    id: 'age',
    name: 'Property Age',
    field: 'yearBuilt',
    type: 'range',
    min: 1900,
    max: new Date().getFullYear(),
    weight: 1,
    enabled: true
  },
  {
    id: 'investment',
    name: 'Investment Property',
    field: 'isInvestment',
    type: 'boolean',
    weight: 1,
    enabled: false
  }
];

export default function Sidebar() {
  const [filterEngine] = React.useState(() => new FilterEngine(initialDimensions));
  const [dimensions, setDimensions] = React.useState(initialDimensions);
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const handleFilterChange = (id: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDimensionUpdate = (id: string, updates: Partial<FilterDimension>) => {
    setDimensions(prev => {
      const newDimensions = prev.map(dim =>
        dim.id === id ? { ...dim, ...updates } : dim
      );
      filterEngine.updateDimension(id, updates);
      return newDimensions;
    });
  };

  return (
    <div className="w-80 space-y-6 rounded-xl border border-red-900/30 bg-black/30 backdrop-blur-sm p-6">
      <FilterPanel
        dimensions={dimensions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onDimensionUpdate={handleDimensionUpdate}
      />
    </div>
  );
}