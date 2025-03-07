import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Property } from '../../../types';

interface ReportData {
  properties: Property[];
  clusters: any[];
  options: string[];
}

export async function generatePDF(data: ReportData) {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Market Analysis Report', 20, 20);
  pdf.setFontSize(12);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);

  let yOffset = 40;

  // Properties Table
  if (data.properties.length > 0) {
    pdf.text('Property Analysis', 20, yOffset);
    yOffset += 10;

    pdf.autoTable({
      startY: yOffset,
      head: [['Address', 'Value', 'Cluster']],
      body: data.properties.map(property => [
        property.address,
        `$${property.value.toLocaleString()}`,
        property.cluster
      ]),
    });

    yOffset = (pdf as any).lastAutoTable.finalY + 20;
  }

  // Cluster Analysis
  if (data.clusters.length > 0) {
    pdf.text('Cluster Analysis', 20, yOffset);
    yOffset += 10;

    pdf.autoTable({
      startY: yOffset,
      head: [['Cluster', 'Average Value', 'Properties']],
      body: data.clusters.map(cluster => [
        cluster.name,
        `$${cluster.averageValue.toLocaleString()}`,
        cluster.count
      ]),
    });
  }

  pdf.save('market-analysis-report.pdf');
}