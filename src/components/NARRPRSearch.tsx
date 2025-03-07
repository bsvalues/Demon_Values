import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, School, Building2, Download, ChevronDown, Calendar, Ruler } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateCSV } from '../lib/exporters/csv';
import { generateJSON } from '../lib/exporters/json';
import { generatePDF } from '../lib/exporters/pdf';

interface SearchFilters {
  minValue?: number;
  maxValue?: number;
  minBeds?: number;
  minBaths?: number;
  propertyType?: string;
  yearBuilt?: number;
  radius?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  lotSizeMin?: number;
  lotSizeMax?: number;
  daysOnMarket?: number;
  schoolRating?: number;
  propertyCondition?: string;
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export default function NARRPRSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'value', direction: 'desc' });
  const [visualizationType, setVisualizationType] = useState<'grid' | 'map' | 'analytics'>('grid');

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*, market_trends(*), school_data(*), demographics(*)')
        .textSearch('address', searchTerm);

      // Apply basic filters
      if (filters.minValue) query = query.gte('value', filters.minValue);
      if (filters.maxValue) query = query.lte('value', filters.maxValue);
      if (filters.minBeds) query = query.gte('details->bedrooms', filters.minBeds);
      if (filters.minBaths) query = query.gte('details->bathrooms', filters.minBaths);
      if (filters.propertyType) query = query.eq('details->propertyType', filters.propertyType);
      if (filters.yearBuilt) query = query.gte('details->yearBuilt', filters.yearBuilt);

      // Apply advanced filters
      if (filters.squareFootageMin) query = query.gte('details->squareFootage', filters.squareFootageMin);
      if (filters.squareFootageMax) query = query.lte('details->squareFootage', filters.squareFootageMax);
      if (filters.lotSizeMin) query = query.gte('details->lotSize', filters.lotSizeMin);
      if (filters.lotSizeMax) query = query.lte('details->lotSize', filters.lotSizeMax);
      if (filters.daysOnMarket) query = query.gte('details->daysOnMarket', filters.daysOnMarket);
      if (filters.schoolRating) query = query.gte('school_data->rating', filters.schoolRating);
      if (filters.propertyCondition) query = query.eq('details->condition', filters.propertyCondition);

      // Apply sorting
      query = query.order(sortOption.field, { ascending: sortOption.direction === 'asc' });

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    switch (format) {
      case 'csv':
        await generateCSV({ properties: results, options: ['all'] });
        break;
      case 'json':
        await generateJSON({ properties: results, options: ['all'] });
        break;
      case 'pdf':
        await generatePDF({ properties: results, options: ['all'] });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by address, area, or property type..."
            className="w-full bg-black/40 border border-red-900/30 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? 'Searching...' : 'Search'}</span>
        </button>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-3 gap-4">
        {/* Previous filter sections remain the same */}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span>Advanced Filters</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-black/40 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-gray-400">
              <Ruler className="h-4 w-4" />
              <span>Square Footage</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min sqft"
                value={filters.squareFootageMin || ''}
                onChange={(e) => setFilters({ ...filters, squareFootageMin: Number(e.target.value) })}
                className="bg-black/40 border border-red-900/30 rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Max sqft"
                value={filters.squareFootageMax || ''}
                onChange={(e) => setFilters({ ...filters, squareFootageMax: Number(e.target.value) })}
                className="bg-black/40 border border-red-900/30 rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="p-4 bg-black/40 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Market Time</span>
            </div>
            <input
              type="number"
              placeholder="Max days on market"
              value={filters.daysOnMarket || ''}
              onChange={(e) => setFilters({ ...filters, daysOnMarket: Number(e.target.value) })}
              className="w-full bg-black/40 border border-red-900/30 rounded px-2 py-1"
            />
          </div>

          <div className="p-4 bg-black/40 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-gray-400">
              <School className="h-4 w-4" />
              <span>School Rating</span>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Minimum rating (1-10)"
              value={filters.schoolRating || ''}
              onChange={(e) => setFilters({ ...filters, schoolRating: Number(e.target.value) })}
              className="w-full bg-black/40 border border-red-900/30 rounded px-2 py-1"
            />
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Results ({results.length})</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={`${sortOption.field}-${sortOption.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortOption({ field, direction: direction as 'asc' | 'desc' });
              }}
              className="bg-black/40 border border-red-900/30 rounded px-2 py-1 text-sm"
            >
              <option value="value-desc">Price (High to Low)</option>
              <option value="value-asc">Price (Low to High)</option>
              <option value="details->squareFootage-desc">Size (Largest)</option>
              <option value="details->yearBuilt-desc">Newest</option>
              <option value="details->daysOnMarket-asc">Recently Listed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVisualizationType('grid')}
              className={`p-2 rounded-lg transition-colors ${
                visualizationType === 'grid' ? 'bg-red-500' : 'bg-black/40 hover:bg-red-500/20'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVisualizationType('map')}
              className={`p-2 rounded-lg transition-colors ${
                visualizationType === 'map' ? 'bg-red-500' : 'bg-black/40 hover:bg-red-500/20'
              }`}
            >
              <MapPin className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVisualizationType('analytics')}
              className={`p-2 rounded-lg transition-colors ${
                visualizationType === 'analytics' ? 'bg-red-500' : 'bg-black/40 hover:bg-red-500/20'
              }`}
            >
              <BarChart className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded-lg bg-black/40 hover:bg-red-500/20 transition-colors"
              title="Export as CSV"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="p-2 rounded-lg bg-black/40 hover:bg-red-500/20 transition-colors"
              title="Export as PDF"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleExport('json')}
              className="p-2 rounded-lg bg-black/40 hover:bg-red-500/20 transition-colors"
              title="Export as JSON"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Visualization */}
      {visualizationType === 'grid' && (
        <div className="grid grid-cols-2 gap-4">
          {results.map((property) => (
            <div
              key={property.id}
              className="p-4 bg-black/40 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors value-change"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{property.address}</h4>
                  <p className="text-gray-400">${property.value.toLocaleString()}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {property.details.bedrooms} beds • {property.details.bathrooms} baths
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {property.details.squareFootage.toLocaleString()} sqft • Built {property.details.yearBuilt}
              </div>
              {property.school_data && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center space-x-1 text-blue-400">
                    <School className="h-3 w-3" />
                    <span>School Rating: {property.school_data.rating}/10</span>
                  </div>
                </div>
              )}
              {property.market_trends && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center space-x-1 text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Value Trend: +{property.market_trends.yearlyGrowth}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {visualizationType === 'map' && (
        <div className="h-[600px] bg-black/40 rounded-lg border border-red-900/30">
          <MapView properties={results} />
        </div>
      )}

      {visualizationType === 'analytics' && (
        <div className="space-y-4">
          <MarketAnalytics properties={results} />
        </div>
      )}
    </div>
  );
}