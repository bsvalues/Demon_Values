import { Property } from '../../../types';

interface ReportData {
  properties: Property[];
  clusters: any[];
  options: string[];
}

export async function generateJSON(data: ReportData) {
  const reportData = {
    generatedAt: new Date().toISOString(),
    properties: data.properties,
    clusters: data.clusters,
    summary: {
      totalProperties: data.properties.length,
      totalClusters: data.clusters.length,
      averageValue: data.properties.reduce((sum, p) => sum + p.value, 0) / data.properties.length
    }
  };

  const jsonContent = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'market-analysis.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}