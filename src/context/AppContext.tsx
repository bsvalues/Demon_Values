import React, { createContext, useContext, useState } from 'react';
import { FilterState } from '../types';

interface Property {
  id: string;
  address: string;
  value: number;
  latitude: number;
  longitude: number;
  cluster: string;
}

interface AppContextType {
  selectedProperties: Property[];
  setSelectedProperties: (properties: Property[]) => void;
  mapFocus: { longitude: number; latitude: number; zoom: number } | null;
  setMapFocus: (focus: { longitude: number; latitude: number; zoom: number } | null) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [mapFocus, setMapFocus] = useState<{ longitude: number; latitude: number; zoom: number } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    minValue: 0,
    maxValue: 1000000,
    cluster: 'all',
    weights: {
      location: 1,
      size: 1,
      age: 1,
    },
  });

  return (
    <AppContext.Provider
      value={{
        selectedProperties,
        setSelectedProperties,
        mapFocus,
        setMapFocus,
        filters,
        setFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}