import { Property } from '../../types';
import { supabase } from '../supabase';
import { calculateAdjustments } from './adjustments';

interface AnalysisResult {
  findings: {
    bestComps: string[];
    adjustmentSummary: {
      category: string;
      averageAdjustment: number;
      significance: number;
    }[];
    valueConclusion: {
      estimatedValue: number;
      confidence: number;
      range: [number, number];
    };
    recommendations: string[];
  };
  confidence: number;
}

export async function analyzeComps(
  subject: Property,
  comps: Property[]
): Promise<AnalysisResult> {
  // Calculate adjustments for each comp
  const adjustedComps = comps.map(comp => ({
    ...comp,
    adjustments: calculateAdjustments(subject, comp)
  }));

  // Calculate net adjustments
  const netAdjustments = adjustedComps.map(comp => ({
    id: comp.id,
    netAdjustment: comp.adjustments.reduce((total, adj) => {
      if (adj.type === 'flat') {
        return total + (adj.amount / comp.value);
      }
      return total + (adj.amount / 100);
    }, 0)
  }));

  // Find best comps (lowest net adjustment)
  const bestComps = netAdjustments
    .sort((a, b) => Math.abs(a.netAdjustment) - Math.abs(b.netAdjustment))
    .slice(0, 3)
    .map(adj => adj.id);

  // Analyze adjustment patterns
  const adjustmentCategories = new Map<string, number[]>();
  adjustedComps.forEach(comp => {
    comp.adjustments.forEach(adj => {
      const adjustments = adjustmentCategories.get(adj.category) || [];
      adjustments.push(adj.type === 'flat' ? (adj.amount / comp.value) : (adj.amount / 100));
      adjustmentCategories.set(adj.category, adjustments);
    });
  });

  // Calculate average adjustments and significance
  const adjustmentSummary = Array.from(adjustmentCategories.entries())
    .map(([category, adjustments]) => ({
      category,
      averageAdjustment: adjustments.reduce((a, b) => a + b, 0) / adjustments.length,
      significance: calculateSignificance(adjustments)
    }))
    .sort((a, b) => Math.abs(b.significance) - Math.abs(a.significance));

  // Estimate value range
  const adjustedValues = adjustedComps.map(comp => 
    comp.value * (1 + netAdjustments.find(adj => adj.id === comp.id)?.netAdjustment || 0)
  );

  const estimatedValue = calculateWeightedAverage(adjustedValues);
  const standardDev = calculateStandardDeviation(adjustedValues);
  const confidence = calculateConfidence(netAdjustments.map(adj => adj.netAdjustment));

  // Generate recommendations
  const recommendations = generateRecommendations(
    subject,
    adjustedComps,
    adjustmentSummary
  );

  // Store analysis results
  try {
    const { error } = await supabase
      .from('comp_analysis')
      .insert({
        grid_id: subject.id, // Assuming grid_id matches subject property id
        analysis_type: 'comprehensive',
        findings: {
          bestComps,
          adjustmentSummary,
          valueConclusion: {
            estimatedValue,
            confidence,
            range: [estimatedValue - standardDev, estimatedValue + standardDev]
          },
          recommendations
        },
        confidence
      });

    if (error) throw error;
  } catch (err) {
    console.error('Failed to store analysis:', err);
  }

  return {
    findings: {
      bestComps,
      adjustmentSummary,
      valueConclusion: {
        estimatedValue,
        confidence,
        range: [estimatedValue - standardDev, estimatedValue + standardDev]
      },
      recommendations
    },
    confidence
  };
}

function calculateSignificance(adjustments: number[]): number {
  const mean = adjustments.reduce((a, b) => a + b, 0) / adjustments.length;
  const variance = adjustments.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) 
    / adjustments.length;
  return Math.sqrt(variance) * (adjustments.length / (adjustments.length - 1));
}

function calculateWeightedAverage(values: number[]): number {
  const weights = values.map((_, i) => 1 / (i + 1)); // More weight to lower indices
  const sum = values.reduce((a, b, i) => a + b * weights[i], 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return sum / weightSum;
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) 
    / values.length;
  return Math.sqrt(variance);
}

function calculateConfidence(netAdjustments: number[]): number {
  const maxAdjustment = Math.max(...netAdjustments.map(Math.abs));
  const avgAdjustment = netAdjustments.reduce((a, b) => a + Math.abs(b), 0) 
    / netAdjustments.length;
  
  // Confidence decreases with larger adjustments
  return Math.max(0.5, 1 - (maxAdjustment * 0.5 + avgAdjustment * 0.5));
}

function generateRecommendations(
  subject: Property,
  adjustedComps: any[],
  adjustmentSummary: any[]
): string[] {
  const recommendations: string[] = [];

  // Check for large adjustments
  const largeAdjustments = adjustmentSummary
    .filter(adj => Math.abs(adj.averageAdjustment) > 0.1);
  
  if (largeAdjustments.length > 0) {
    recommendations.push(
      `Consider finding comps with more similar ${
        largeAdjustments.map(adj => adj.category).join(', ')
      }`
    );
  }

  // Check adjustment consistency
  const inconsistentCategories = adjustmentSummary
    .filter(adj => adj.significance > 0.1);
  
  if (inconsistentCategories.length > 0) {
    recommendations.push(
      `Review ${
        inconsistentCategories.map(adj => adj.category).join(', ')
      } adjustments for consistency`
    );
  }

  // Check comp count
  if (adjustedComps.length < 3) {
    recommendations.push('Add more comparable properties for better analysis');
  } else if (adjustedComps.length > 6) {
    recommendations.push('Consider focusing on the most similar comparables');
  }

  return recommendations;
}