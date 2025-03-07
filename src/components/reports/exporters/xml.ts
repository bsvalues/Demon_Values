import { Property } from '../../../types';

interface ReportData {
  properties: Property[];
  clusters: any[];
  options: string[];
}

export async function generateXML(data: ReportData) {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<MarketAnalysis>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
  <Properties>
    ${data.properties.map(property => `
    <Property>
      <Address>${property.address}</Address>
      <Value>${property.value}</Value>
      <Cluster>${property.cluster}</Cluster>
      <Location>
        <Latitude>${property.latitude}</Latitude>
        <Longitude>${property.longitude}</Longitude>
      </Location>
    </Property>
    `).join('')}
  </Properties>
  <Clusters>
    ${data.clusters.map(cluster => `
    <Cluster>
      <Name>${cluster.name}</Name>
      <AverageValue>${cluster.averageValue}</AverageValue>
      <PropertyCount>${cluster.count}</PropertyCount>
    </Cluster>
    `).join('')}
  </Clusters>
  <Summary>
    <TotalProperties>${data.properties.length}</TotalProperties>
    <TotalClusters>${data.clusters.length}</TotalClusters>
    <AverageValue>${data.properties.reduce((sum, p) => sum + p.value, 0) / data.properties.length}</AverageValue>
  </Summary>
</MarketAnalysis>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'market-analysis.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}