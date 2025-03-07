import { Property } from '../../../types';

interface ReportData {
  properties: Property[];
  clusters: any[];
  options: string[];
}

export async function generateCSV(data: ReportData) {
  // Generate CSV content
  const headers = ['Address', 'Value', 'Cluster', 'Latitude', 'Longitude'];
  const rows = data.properties.map(property => [
    property.address,
    property.value,
    property.cluster,
    property.latitude,
    property.longitude
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'market-analysis.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}