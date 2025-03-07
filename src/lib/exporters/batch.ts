import { Property } from '../../types';
import { generateCSV } from './csv';
import { generateJSON } from './json';
import { generatePDF } from './pdf';

interface BatchExportOptions {
  properties: Property[];
  formats: Array<'csv' | 'json' | 'pdf'>;
  batchSize?: number;
  onProgress?: (progress: number) => void;
}

export async function batchExport({
  properties,
  formats,
  batchSize = 1000,
  onProgress
}: BatchExportOptions) {
  const totalBatches = Math.ceil(properties.length / batchSize);
  let processedBatches = 0;

  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    
    await Promise.all(formats.map(format => {
      switch (format) {
        case 'csv':
          return generateCSV({ properties: batch, options: ['all'] });
        case 'json':
          return generateJSON({ properties: batch, options: ['all'] });
        case 'pdf':
          return generatePDF({ properties: batch, options: ['all'] });
      }
    }));

    processedBatches++;
    if (onProgress) {
      onProgress((processedBatches / totalBatches) * 100);
    }
  }
}