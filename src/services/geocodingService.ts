/**
 * LocationIQ geocoding service for address autocomplete.
 * @see https://locationiq.com/docs-html/index.html#autocomplete
 */
const LOCATIONIQ_API_KEY = 'pk.f8e9af45381cb7f22c834b18e4501b47';
const LOCATIONIQ_URL = 'https://us1.locationiq.com/v1/autocomplete';

export interface LocationIQResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    name?: string;
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeocodedAddress {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    name: string;
    street: string;
    housenumber: string;
    city: string;
    postcode: string;
    country: string;
    suburb: string;
    locality: string;
    place_id: string;
  };
}

export async function searchAddresses(query: string, city: string): Promise<GeocodedAddress[]> {
  if (!query || !city) return [];
  const url = `${LOCATIONIQ_URL}?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query + ' ' + city)}&countrycodes=be&limit=5&dedupe=1&normalizeaddress=1&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('LocationIQ error: ' + res.statusText);
  const data: LocationIQResult[] = await res.json();
  // Map LocationIQ results to Photon-like format for compatibility
  return data.map(result => {
    // Fallback: try to extract house number from display_name if not present
    let housenumber = result.address.house_number || '';
    if (!housenumber) {
      const match = result.display_name.match(/\b(\d+[a-zA-Z]?)\b/);
      if (match) housenumber = match[1];
    }
    return {
      geometry: {
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
      },
      properties: {
        name: result.display_name,
        street: result.address.road || '',
        housenumber,
        city: result.address.city || result.address.town || result.address.village || '',
        postcode: result.address.postcode || '',
        country: result.address.country || '',
        suburb: result.address.suburb || '',
        locality: result.address.suburb || '',
        place_id: result.place_id,
      }
    };
  });
}

// Forward geocoding for precise address lookup
export async function getAddressDetails(street: string, housenumber: string, city: string): Promise<GeocodedAddress | null> {
  if (!street || !city || !housenumber) return null;
  const query = `${street} ${housenumber}, ${city}, Belgium`;
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&countrycodes=be&format=json&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data[0]) return null;
  // Debug log for diagnosis
  // console.log('[LocationIQ getAddressDetails] data[0]:', data[0]);
  const address = data[0].address || {};
  return {
    geometry: {
      coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
    },
    properties: {
      name: data[0].display_name,
      street: address.road || street,
      housenumber: address.house_number || housenumber,
      city: address.city || address.town || address.village || city,
      postcode: address.postcode || '',
      country: address.country || '',
      suburb: address.suburb || '',
      locality: address.suburb || '',
      place_id: data[0].place_id,
    }
  };
} 