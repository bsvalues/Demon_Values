import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';
import { 
  Plus, 
  Save, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  Brain,
  Calculator,
  Loader
} from 'lucide-react';

interface CompsGridProps {
  subjectProperty: Property;
}

interface CompProperty extends Property {
  adjustments: Array<{
    category: string;
    type: 'flat' | 'percentage';
    amount: number;
    description?: string;
  }>;
  netAdjustment: number;
  adjustedValue: number;
}

export default function CompsGrid({ subjectProperty }: CompsGridProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comps, setComps] = useState<CompProperty[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadComps();
  }, [subjectProperty.id]);

  const loadComps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load existing grid or create new one
      const { data: grid, error: gridError } = await supabase
        .from('comp_grids')
        .select('*')
        .eq('subject_property_id', subjectProperty.id)
        .single();

      if (gridError && gridError.code !== 'PGRST116') {
        throw gridError;
      }

      let gridId = grid?.id;

      if (!gridId) {
        // Create new grid
        const { data: newGrid, error: createError } = await supabase
          .from('comp_grids')
          .insert({
            organization_id: user?.organization?.id,
            name: `Grid for ${subjectProperty.address}`,
            subject_property_id: subjectProperty.id,
            created_by: user?.id
          })
          .select()
          .single();

        if (createError) throw createError;
        gridId = newGrid.id;
      }

      // Load comp properties
      const { data: properties, error: propsError } = await supabase
        .from('comp_properties')
        .select(`
          *,
          adjustments:comp_adjustments(*)
        `)
        .eq('grid_id', gridId)
        .order('order_index');

      if (propsError) throw propsError;

      // Transform and calculate adjustments
      const processedComps = properties.map(prop => ({
        ...prop,
        adjustments: prop.adjustments || [],
        netAdjustment: calculateNetAdjustment(prop.adjustments || []),
        adjustedValue: calculateAdjustedValue(
          prop.value,
          prop.adjustments || []
        )
      }));

      setComps(processedComps);
    } catch (err) {
      console.error('Failed to load comps:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comps');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetAdjustment = (adjustments: any[]) => {
    return adjustments.reduce((total, adj) => {
      if (adj.type === 'flat') {
        return total + adj.amount;
      } else {
        return total + (adj.amount / 100);
      }
    }, 0);
  };

  const calculateAdjustedValue = (baseValue: number, adjustments: any[]) => {
    return adjustments.reduce((value, adj) => {
      if (adj.type === 'flat') {
        return value + adj.amount;
      } else {
        return value * (1 + adj.amount / 100);
      }
    }, baseValue);
  };

  const handleAIAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      // Implement AI analysis here
      // This would call your backend API that interfaces with an LLM

    } catch (err) {
      console.error('AI analysis failed:', err);
      setError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 text-demon-red animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* Add comp */}}
            className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Comp</span>
          </button>

          <button
            onClick={handleAIAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-black/40 hover:bg-demon-red/10 rounded-lg flex items-center space-x-2"
          >
            <Brain className="h-5 w-5" />
            <span>{analyzing ? 'Analyzing...' : 'AI Analysis'}</span>
          </button>
        </div>

        <button
          onClick={() => {/* Save grid */}}
          className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Grid</span>
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-demon-red/30">
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Subject</th>
              {comps.map((comp, i) => (
                <th key={comp.id} className="p-4 text-left">
                  <div className="flex items-center justify-between">
                    <span>Comp {i + 1}</span>
                    <button
                      onClick={() => {/* Remove comp */}}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-demon-red/30">
            {/* Address */}
            <tr>
              <td className="p-4 bg-black/20">Address</td>
              <td className="p-4">{subjectProperty.address}</td>
              {comps.map(comp => (
                <td key={comp.id} className="p-4">{comp.address}</td>
              ))}
            </tr>

            {/* Sale Price */}
            <tr>
              <td className="p-4 bg-black/20">Sale Price</td>
              <td className="p-4">${subjectProperty.value.toLocaleString()}</td>
              {comps.map(comp => (
                <td key={comp.id} className="p-4">
                  ${comp.value.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Net Adjustment */}
            <tr>
              <td className="p-4 bg-black/20">Net Adjustment</td>
              <td className="p-4">-</td>
              {comps.map(comp => (
                <td key={comp.id} className="p-4">
                  <div className="flex items-center space-x-2">
                    {comp.netAdjustment > 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={comp.netAdjustment > 0 ? 'text-green-500' : 'text-red-500'}>
                      {comp.netAdjustment > 0 ? '+' : ''}
                      {(comp.netAdjustment * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Adjusted Value */}
            <tr>
              <td className="p-4 bg-black/20">Adjusted Value</td>
              <td className="p-4">-</td>
              {comps.map(comp => (
                <td key={comp.id} className="p-4">
                  ${comp.adjustedValue.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Add more rows for other fields */}
          </tbody>
        </table>
      </div>

      {/* Adjustment Calculator */}
      <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="h-5 w-5 text-demon-red" />
          <h3 className="font-semibold">Adjustment Calculator</h3>
        </div>

        {/* Add adjustment calculator UI here */}
      </div>
    </div>
  );
}