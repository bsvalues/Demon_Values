import { z } from 'zod';

// Property Report Schema
export const PropertyReportSchema = z.object({
  id: z.string().uuid(),
  address: z.string().min(5).max(255),
  value: z.number().positive(),
  reportDate: z.string().datetime(),
  details: z.object({
    squareFootage: z.number().positive(),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().min(0),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()),
    lotSize: z.number().positive(),
    propertyType: z.string(),
    zoning: z.string(),
    lastSale: z.object({
      date: z.string().datetime(),
      price: z.number().positive(),
    }).optional(),
    features: z.array(z.string()),
    condition: z.string(),
    parking: z.object({
      type: z.string(),
      spaces: z.number().int().min(0),
    }).optional(),
  }),
});

export type ValidatedPropertyReport = z.infer<typeof PropertyReportSchema>;

// Data Sanitization
export function sanitizePropertyReport(report: any): ValidatedPropertyReport {
  const validated = PropertyReportSchema.parse({
    ...report,
    value: Number(report.value),
    details: {
      ...report.details,
      squareFootage: Number(report.details.squareFootage),
      bedrooms: Number(report.details.bedrooms),
      bathrooms: Number(report.details.bathrooms),
      yearBuilt: Number(report.details.yearBuilt),
      lotSize: Number(report.details.lotSize),
      lastSale: report.details.lastSale ? {
        ...report.details.lastSale,
        price: Number(report.details.lastSale.price),
      } : undefined,
      parking: report.details.parking ? {
        ...report.details.parking,
        spaces: Number(report.details.parking.spaces),
      } : undefined,
    },
  });

  return validated;
}