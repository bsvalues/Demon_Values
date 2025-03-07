interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    const response = await fetch(
      \`https://api.mapbox.com/geocoding/v5/mapbox.places/\${encodeURIComponent(address)}.json?access_token=\${process.env.MAPBOX_TOKEN}\`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const [longitude, latitude] = data.features[0].center;

    return { latitude, longitude };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}