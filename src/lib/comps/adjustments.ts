import { Property } from '../../types';

interface Adjustment {
  category: string;
  type: 'flat' | 'percentage';
  amount: number;
  description?: string;
}

export function calculateAdjustments(
  subject: Property,
  comparable: Property
): Adjustment[] {
  const adjustments: Adjustment[] = [];

  // Location adjustment
  const locationDiff = calculateLocationDifference(subject, comparable);
  if (Math.abs(locationDiff) > 0.05) {
    adjustments.push({
      category: 'location',
      type: 'percentage',
      amount: locationDiff * 100,
      description: 'Location quality difference'
    });
  }

  // Size adjustment
  if (subject.details?.squareFootage && comparable.details?.squareFootage) {
    const sizeDiff = (subject.details.squareFootage - comparable.details.squareFootage) 
      / comparable.details.squareFootage;
    
    if (Math.abs(sizeDiff) > 0.1) {
      adjustments.push({
        category: 'size',
        type: 'percentage',
        amount: sizeDiff * 80, // 80% of size difference
        description: 'Square footage adjustment'
      });
    }
  }

  // Age adjustment
  if (subject.details?.yearBuilt && comparable.details?.yearBuilt) {
    const ageDiff = subject.details.yearBuilt - comparable.details.yearBuilt;
    if (Math.abs(ageDiff) > 5) {
      adjustments.push({
        category: 'age',
        type: 'flat',
        amount: ageDiff * 1000, // $1,000 per year
        description: 'Age/condition adjustment'
      });
    }
  }

  // Quality adjustment based on condition
  if (subject.details?.condition && comparable.details?.condition) {
    const qualityDiff = calculateQualityDifference(
      subject.details.condition,
      comparable.details.condition
    );
    
    if (Math.abs(qualityDiff) > 0) {
      adjustments.push({
        category: 'quality',
        type: 'percentage',
        amount: qualityDiff * 100,
        description: 'Quality/condition adjustment'
      });
    }
  }

  return adjustments;
}

function calculateLocationDifference(subject: Property, comparable: Property): number {
  // Calculate distance
  const distance = calculateDistance(
    subject.latitude,
    subject.longitude,
    comparable.latitude,
    comparable.longitude
  );

  // Simple linear adjustment based on distance
  // You might want to make this more sophisticated based on actual market data
  return -Math.min(distance / 10, 0.15); // Max 15% negative adjustment
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

function calculateQualityDifference(
  subjectCondition: string,
  compCondition: string
): number {
  const conditions = ['Poor', 'Fair', 'Average', 'Good', 'Excellent'];
  const subjectIndex = conditions.indexOf(subjectCondition);
  const compIndex = conditions.indexOf(compCondition);
  
  if (subjectIndex === -1 || compIndex === -1) return 0;
  
  // Each condition level difference = 5% adjustment
  return (subjectIndex - compIndex) * 0.05;
}

export function calculateNetAdjustment(adjustments: Adjustment[]): number {
  return adjustments.reduce((total, adj) => {
    if (adj.type === 'flat') {
      return total + (adj.amount / adj.amount); // Convert to percentage
    }
    return total + (adj.amount / 100);
  }, 0);
}

export function calculateAdjustedValue(
  baseValue: number,
  adjustments: Adjustment[]
): number {
  return adjustments.reduce((value, adj) => {
    if (adj.type === 'flat') {
      return value + adj.amount;
    }
    return value * (1 + adj.amount / 100);
  }, baseValue);
}