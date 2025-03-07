// This file is now only used for static map images and geocoding
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function validateMapboxToken(): boolean {
  if (!MAPBOX_TOKEN) {
    console.error('Missing Mapbox token. Please add VITE_MAPBOX_TOKEN to your environment variables.');
    return false;
  }

  // Basic token format validation
  if (!MAPBOX_TOKEN.startsWith('pk.') && !MAPBOX_TOKEN.startsWith('sk.')) {
    console.error('Invalid Mapbox token format. Token should start with "pk." or "sk."');
    return false;
  }

  return true;
}

export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your environment variables.');
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    if (!data.features?.[0]?.center) {
      throw new Error('No results found for address');
    }

    const [longitude, latitude] = data.features[0].center;
    return { latitude, longitude };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(
      error instanceof Error 
        ? `Geocoding failed: ${error.message}`
        : 'Failed to geocode address'
    );
  }
}

export function generateStaticMapUrl(
  latitude: number,
  longitude: number,
  zoom: number = 15,
  width: number = 600,
  height: number = 400
): string {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your environment variables.');
  }

  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${longitude},${latitude},${zoom},0/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
}