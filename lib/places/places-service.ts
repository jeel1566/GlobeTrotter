import { supabaseServer } from '@/lib/supabase/server';
import { PlaceSearchResult } from '@/types/database';

const DEFAULT_CITY_PHOTOS: Record<string, string> = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80',
  bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
};

function getCityPhoto(cityName: string): string {
  const normalized = cityName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, url] of Object.entries(DEFAULT_CITY_PHOTOS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80`;
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  // 1. Check places_cache in Supabase
  try {
    const { data: cached, error } = await supabaseServer
      .from('places_cache')
      .select('*')
      .ilike('name', `%${trimmed}%`)
      .gt('expires_at', new Date().toISOString())
      .limit(8);

    if (!error && cached && cached.length > 0) {
      return cached.map((p) => ({
        place_id: p.place_id,
        name: p.name,
        formatted_address: p.formatted_address || p.name,
        country: p.country || '',
        latitude: Number(p.latitude) || 0,
        longitude: Number(p.longitude) || 0,
        photo_url: p.photo_url || getCityPhoto(p.name),
        place_types: p.place_types || ['locality'],
      }));
    }
  } catch (err) {
    console.warn('places_cache lookup skipped:', err);
  }

  // 2. Free OpenStreetMap (Photon) Geocoding API
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`,
      {
        headers: {
          'User-Agent': 'GlobeTrotterApp/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const features = data.features || [];

      const results: PlaceSearchResult[] = features.map((f: any) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const name = props.name || trimmed;
        const country = props.country || props.state || '';
        const address = [props.name, props.city, props.state, props.country]
          .filter(Boolean)
          .join(', ');
        const place_id = `osm_${props.osm_id || Math.random().toString(36).substring(2, 9)}`;

        return {
          place_id,
          name,
          formatted_address: address,
          country,
          latitude: coords[1] || 0,
          longitude: coords[0] || 0,
          photo_url: getCityPhoto(name),
          place_types: [props.type || 'city', 'tourist_attraction'],
        };
      });

      // 3. Cache results asynchronously in Supabase
      if (results.length > 0) {
        Promise.resolve().then(async () => {
          try {
            const rows = results.map((r) => ({
              place_id: r.place_id,
              name: r.name,
              formatted_address: r.formatted_address,
              country: r.country,
              latitude: r.latitude,
              longitude: r.longitude,
              photo_url: r.photo_url,
              place_types: r.place_types,
            }));
            await supabaseServer.from('places_cache').upsert(rows, { onConflict: 'place_id' });
          } catch (e) {
            // Non-critical cache write error
          }
        });
      }

      return results;
    }
  } catch (err) {
    console.error('Photon place search failed:', err);
  }

  // 4. Fallback default matching
  return [
    {
      place_id: `fallback_${trimmed.toLowerCase()}`,
      name: trimmed,
      formatted_address: `${trimmed}, Destination`,
      country: '',
      latitude: 0,
      longitude: 0,
      photo_url: getCityPhoto(trimmed),
      place_types: ['locality'],
    },
  ];
}
