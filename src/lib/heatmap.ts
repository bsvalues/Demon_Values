import { Property } from '../types';

export interface HeatmapChannel {
  id: string;
  name: string;
  field: string;
  min: number;
  max: number;
  weight: number;
  color: string;
  enabled: boolean;
}

export function calculateHeatmapIntensity(
  property: Property,
  channels: HeatmapChannel[]
): number {
  let totalIntensity = 0;
  let totalWeight = 0;

  channels.forEach(channel => {
    if (!channel.enabled) return;

    let value = 0;
    switch (channel.field) {
      case 'value':
        value = property.value;
        break;
      case 'cluster':
        value = getClusterValue(property.cluster);
        break;
      // Add more field mappings as needed
    }

    const normalizedValue = normalizeValue(value, channel.min, channel.max);
    totalIntensity += normalizedValue * channel.weight;
    totalWeight += channel.weight;
  });

  return totalWeight > 0 ? totalIntensity / totalWeight : 0;
}

export function getHeatmapColor(
  intensity: number,
  channels: HeatmapChannel[]
): string {
  const activeChannels = channels.filter(c => c.enabled);
  if (activeChannels.length === 0) return 'rgba(0, 0, 0, 0)';

  if (activeChannels.length === 1) {
    const channel = activeChannels[0];
    return interpolateColor(channel.color, intensity);
  }

  // Blend multiple channel colors
  const colors = activeChannels.map(channel => ({
    color: channel.color,
    weight: channel.weight
  }));

  return blendColors(colors, intensity);
}

function normalizeValue(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getClusterValue(cluster: string): number {
  switch (cluster) {
    case 'high-value':
      return 1;
    case 'mid-value':
      return 0.5;
    case 'low-value':
      return 0;
    default:
      return 0.5;
  }
}

function interpolateColor(baseColor: string, intensity: number): string {
  const match = baseColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return baseColor;

  const [, r, g, b] = match.map(Number);
  return `rgba(${r}, ${g}, ${b}, ${intensity})`;
}

function blendColors(
  colors: Array<{ color: string; weight: number }>,
  intensity: number
): string {
  let r = 0, g = 0, b = 0;
  let totalWeight = 0;

  colors.forEach(({ color, weight }) => {
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return;

    const [, rStr, gStr, bStr] = match;
    r += parseInt(rStr) * weight;
    g += parseInt(gStr) * weight;
    b += parseInt(bStr) * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return 'rgba(0, 0, 0, 0)';

  r = Math.round(r / totalWeight);
  g = Math.round(g / totalWeight);
  b = Math.round(b / totalWeight);

  return `rgba(${r}, ${g}, ${b}, ${intensity})`;
}