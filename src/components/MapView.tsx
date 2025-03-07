import React, { useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { AlertTriangle, Database, Loader } from 'lucide-react';
import { FilterState, Property } from '../types';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  filters: FilterState;
}

function PropertyMap({ filters }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { selectedProperties, setSelectedProperties } = useApp();
  const [viewport, setViewport] = React.useState({
    latitude: 46.2087,
    longitude: -119.1372,
    zoom: 12,
    bearing: 0,
    pitch: 0
  });

  useEffect(() => {
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      setError('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your environment variables.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Database not connected');
      setLoading(false);
      return;
    }

    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .gte('value', filters.minValue)
        .lte('value', filters.maxValue);

      if (filters.cluster !== 'all') {
        query = query.eq('cluster', filters.cluster);
      }

      const { data, error } = await query;

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to database. Please check your Supabase connection.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        setError('No properties found matching the current filters.');
        return;
      }

      setSelectedProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="h-full flex items-center justify-center bg-black/40 rounded-lg border border-red-900/30">
        <div className="text-center p-6 space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="text-lg font-semibold">Mapbox Token Not Configured</div>
          <div className="text-gray-400 max-w-md">
            Please add VITE_MAPBOX_TOKEN to your environment variables.
          </div>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="h-full flex items-center justify-center bg-black/40 rounded-lg border border-red-900/30">
        <div className="text-center p-6 space-y-4">
          <Database className="h-12 w-12 text-red-500 mx-auto" />
          <div className="text-lg font-semibold">Database Not Connected</div>
          <div className="text-gray-400 max-w-md">
            Please click "Connect to Supabase" in the top right to set up your database connection.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex items-center space-x-2 text-demon-red">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Loading properties...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      <Map
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={true}
        reuseMaps
        initialViewState={viewport}
      >
        <NavigationControl position="top-right" />
        
        {selectedProperties.map(property => (
          <Marker
            key={property.id}
            latitude={property.latitude}
            longitude={property.longitude}
            anchor="bottom"
          >
            <div className="w-4 h-4 bg-demon-red rounded-full border-2 border-white cursor-pointer transform hover:scale-110 transition-transform" />
          </Marker>
        ))}
      </Map>
    </div>
  );
}

export default PropertyMap;