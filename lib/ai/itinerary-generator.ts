import { AIItineraryResult, GeneratedDayPlan } from '@/types/database';

// 5 Hand-curated rich templates for demo resilience
const CURATED_TEMPLATES: Record<string, GeneratedDayPlan[]> = {
  goa: [
    {
      day: 1,
      title: 'North Goa Coastal Arrival & Sunset',
      city: 'Goa',
      activities: [
        { title: 'Check-in & Anjuna Beach Stroll', category: 'nature', estimated_cost: 0, duration_minutes: 120, notes: 'Unwind and take in the sea breeze' },
        { title: 'Sunset at Curlies / Cafe Lilliput', category: 'food', estimated_cost: 1200, duration_minutes: 150, notes: 'Seafood, cold drinks, and sunset views' },
      ],
    },
    {
      day: 2,
      title: 'Heritage, Forts & Watersports',
      city: 'Goa',
      activities: [
        { title: 'Aguada Fort Exploration & Lighthouse', category: 'culture', estimated_cost: 300, duration_minutes: 90, notes: '17th-century Portuguese fort overlooking the Arabian Sea' },
        { title: 'Jet Skiing & Parasailing at Calangute', category: 'adventure', estimated_cost: 2500, duration_minutes: 180, notes: 'Pre-book at beach shack' },
        { title: 'Night Market & Live Music in Vagator', category: 'nightlife', estimated_cost: 1500, duration_minutes: 180, notes: 'Artisan stalls and indie music' },
      ],
    },
    {
      day: 3,
      title: 'Old Goa Churches & Spice Plantation',
      city: 'Goa',
      activities: [
        { title: 'Basilica of Bom Jesus & Se Cathedral', category: 'culture', estimated_cost: 100, duration_minutes: 120, notes: 'UNESCO World Heritage site' },
        { title: 'Traditional Goan Lunch at Sahakari Spice Farm', category: 'food', estimated_cost: 800, duration_minutes: 150, notes: 'Buffet with peri-peri chicken and feni sampling' },
        { title: 'Palolem Beach Relaxation (South Goa)', category: 'nature', estimated_cost: 500, duration_minutes: 180, notes: 'Crescent bay with calm swimming waters' },
      ],
    },
  ],
  manali: [
    {
      day: 1,
      title: 'Old Manali Vibes & Cafe Culture',
      city: 'Manali',
      activities: [
        { title: 'Hadimba Devi Temple Walk', category: 'culture', estimated_cost: 50, duration_minutes: 90, notes: 'Ancient wooden temple in cedar forest' },
        { title: 'Old Manali Riverside Cafe Lunch', category: 'food', estimated_cost: 900, duration_minutes: 120, notes: 'Trout fish and wood-fired pizza' },
        { title: 'Jogini Waterfall Hike', category: 'adventure', estimated_cost: 200, duration_minutes: 180, notes: 'Scenic trail through apple orchards' },
      ],
    },
    {
      day: 2,
      title: 'Solang Valley & High Altitude Thrills',
      city: 'Manali',
      activities: [
        { title: 'Solang Valley Paragliding & Zorbing', category: 'adventure', estimated_cost: 3200, duration_minutes: 240, notes: 'Tandem paragliding with Himalayan view' },
        { title: 'Atal Tunnel Drive to Sissu (Lahaul)', category: 'nature', estimated_cost: 1200, duration_minutes: 180, notes: 'Cross into the dramatic arid valley' },
      ],
    },
    {
      day: 3,
      title: 'Vashisht Hot Springs & Mall Road',
      city: 'Manali',
      activities: [
        { title: 'Vashisht Natural Sulphur Baths', category: 'nature', estimated_cost: 0, duration_minutes: 90, notes: 'Traditional healing thermal springs' },
        { title: 'Souvenir & Shawl Shopping on Mall Road', category: 'culture', estimated_cost: 1500, duration_minutes: 120, notes: 'Local woolens and handmade goods' },
      ],
    },
  ],
  jaipur: [
    {
      day: 1,
      title: 'The Royal Forts of Amer',
      city: 'Jaipur',
      activities: [
        { title: 'Amer Fort & Sheesh Mahal Tour', category: 'culture', estimated_cost: 600, duration_minutes: 180, notes: 'Mirror palace and elephant path' },
        { title: 'Panna Meena ka Kund Stepwell Photos', category: 'culture', estimated_cost: 0, duration_minutes: 45, notes: 'Famous geometric stepwell' },
        { title: 'Sunset at Nahargarh Fort with City Views', category: 'nature', estimated_cost: 200, duration_minutes: 120, notes: 'Best panoramic view of Pink City' },
      ],
    },
    {
      day: 2,
      title: 'Palaces & Traditional Rajasthani Thali',
      city: 'Jaipur',
      activities: [
        { title: 'Hawa Mahal & City Palace Walk', category: 'culture', estimated_cost: 700, duration_minutes: 150, notes: 'Intricate pink sandstone facade' },
        { title: 'Royal Rajasthani Thali at LMB / Laxmi Misthan', category: 'food', estimated_cost: 950, duration_minutes: 90, notes: 'Dal baati churma and gatte ki sabzi' },
        { title: 'Bapu Bazaar Handicraft Shopping', category: 'culture', estimated_cost: 1200, duration_minutes: 120, notes: 'Mojaris, block-printed textiles, and blue pottery' },
      ],
    },
  ],
  tokyo: [
    {
      day: 1,
      title: 'Old & New: Asakusa to Akihabara',
      city: 'Tokyo',
      activities: [
        { title: 'Senso-ji Temple & Nakamise Dori', category: 'culture', estimated_cost: 500, duration_minutes: 120, notes: 'Tokyo’s oldest Buddhist temple' },
        { title: 'Ramen Tasting in Ueno', category: 'food', estimated_cost: 1000, duration_minutes: 60, notes: 'Authentic tonkotsu broth' },
        { title: 'Akihabara Electric Town & Arcade Gaming', category: 'nightlife', estimated_cost: 1500, duration_minutes: 150, notes: 'Anime culture and retro gaming' },
      ],
    },
    {
      day: 2,
      title: 'Shibuya Crossing & Shinjuku Neon Night',
      city: 'Tokyo',
      activities: [
        { title: 'Shibuya Scramble & Hachiko Statue', category: 'nature', estimated_cost: 0, duration_minutes: 60, notes: 'World’s busiest pedestrian crossing' },
        { title: 'Meiji Jingu Shrine Cedar Forest Walk', category: 'culture', estimated_cost: 0, duration_minutes: 90, notes: 'Peaceful oasis in the heart of Harajuku' },
        { title: 'Shinjuku Omoide Yokocho Yakitori Dinner', category: 'food', estimated_cost: 2500, duration_minutes: 120, notes: 'Historic lantern-lit alleyway dining' },
      ],
    },
  ],
  paris: [
    {
      day: 1,
      title: 'Iconic Landmarks & Seine River Cruise',
      city: 'Paris',
      activities: [
        { title: 'Eiffel Tower & Champ de Mars Picnic', category: 'nature', estimated_cost: 2200, duration_minutes: 150, notes: 'Baguettes, cheese, and summit views' },
        { title: 'Louvre Museum Masterpieces', category: 'culture', estimated_cost: 1800, duration_minutes: 180, notes: 'Mona Lisa and Venus de Milo' },
        { title: 'Seine River Sunset Boat Cruise', category: 'culture', estimated_cost: 1600, duration_minutes: 90, notes: 'See illuminated bridges and monuments' },
      ],
    },
    {
      day: 2,
      title: 'Montmartre Artists & Le Marais Bakeries',
      city: 'Paris',
      activities: [
        { title: 'Sacré-Cœur Basilica & Artists Square', category: 'culture', estimated_cost: 0, duration_minutes: 120, notes: 'Breathtaking city hilltop views' },
        { title: 'Croissant & Macaron Crawl in Le Marais', category: 'food', estimated_cost: 1400, duration_minutes: 120, notes: 'Taste Parisian patisseries' },
        { title: 'Latin Quarter Bistrot Evening Dinner', category: 'food', estimated_cost: 3000, duration_minutes: 120, notes: 'Classic French duck confit and wine' },
      ],
    },
  ],
};

function generateProceduralFallback(
  destination: string,
  daysCount: number,
  interests: string[]
): GeneratedDayPlan[] {
  const categories = interests.length > 0 ? interests : ['nature', 'culture', 'food', 'adventure'];
  const plans: GeneratedDayPlan[] = [];

  for (let d = 1; d <= daysCount; d++) {
    const cat1 = (categories[(d * 2 - 2) % categories.length] || 'nature') as any;
    const cat2 = (categories[(d * 2 - 1) % categories.length] || 'food') as any;

    plans.push({
      day: d,
      title: `Day ${d}: Discovering ${destination}`,
      city: destination,
      activities: [
        {
          title: `${destination} City Center & Historic Highlights`,
          category: cat1,
          estimated_cost: 500,
          duration_minutes: 120,
          notes: `Explore key scenic and cultural landmarks in ${destination}`,
        },
        {
          title: `Local Culinary Experience & Market Tour`,
          category: cat2,
          estimated_cost: 800,
          duration_minutes: 90,
          notes: `Taste regional specialties and popular neighborhood food`,
        },
      ],
    });
  }

  return plans;
}

export async function generateItinerary(params: {
  destination: string;
  days: number;
  budget?: number;
  interests?: string[];
}): Promise<AIItineraryResult> {
  const { destination, days = 3, budget = 20000, interests = [] } = params;
  const normalizedDest = destination.toLowerCase().trim();

  // 1. Check if Groq or Gemini API keys are configured for live AI
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second circuit breaker

      const prompt = `Create a realistic ${days}-day travel itinerary for ${destination} with a total budget of ₹${budget}.
Interests: ${interests.join(', ') || 'general'}.
Return ONLY a valid JSON object matching this schema:
{
  "days": [
    {
      "day": 1,
      "title": "Short day theme",
      "city": "${destination}",
      "activities": [
        {
          "title": "Activity name",
          "category": "adventure" | "food" | "nature" | "nightlife" | "culture",
          "estimated_cost": 500,
          "duration_minutes": 120,
          "notes": "Short tip"
        }
      ]
    }
  ]
}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        if (parsed?.days && Array.isArray(parsed.days)) {
          return {
            fallback: false,
            destination,
            days: parsed.days,
          };
        }
      }
    } catch (err) {
      console.warn('Live Groq AI generation failed or timed out, triggering curated fallback:', err);
    }
  } else if (geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const prompt = `Create a realistic ${days}-day travel itinerary for ${destination} with a total budget of ₹${budget}.
Interests: ${interests.join(', ') || 'general'}.
Respond in strict JSON format:
{
  "days": [
    {
      "day": 1,
      "title": "Short day theme",
      "city": "${destination}",
      "activities": [
        {
          "title": "Activity name",
          "category": "adventure",
          "estimated_cost": 500,
          "duration_minutes": 120,
          "notes": "Short tip"
        }
      ]
    }
  ]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed?.days && Array.isArray(parsed.days)) {
            return {
              fallback: false,
              destination,
              days: parsed.days,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Live Gemini generation timed out or failed, using curated fallback:', err);
    }
  }

  // 2. Curated fallback template matching
  for (const [key, templateDays] of Object.entries(CURATED_TEMPLATES)) {
    if (normalizedDest.includes(key) || key.includes(normalizedDest)) {
      return {
        fallback: true,
        destination,
        days: templateDays.slice(0, Math.max(1, days)),
      };
    }
  }

  // 3. Procedural high-quality template
  return {
    fallback: true,
    destination,
    days: generateProceduralFallback(destination, Math.min(days, 7), interests),
  };
}
