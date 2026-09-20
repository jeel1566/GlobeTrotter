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
  bali: [
    {
      day: 1,
      title: 'Arrival in Seminyak & Sunset Beach Vibes',
      city: 'Bali',
      activities: [
        { title: 'Seminyak Beach & Double Six Sunset', category: 'nature', estimated_cost: 0, duration_minutes: 120, notes: 'Famous beanbag cafes and beach sunset' },
        { title: 'Dinner at a Traditional Indonesian Warung', category: 'food', estimated_cost: 500, duration_minutes: 90, notes: 'Nasi goreng and sate lilit skewers' },
        { title: 'Seminyak Square & Boutiques Walk', category: 'culture', estimated_cost: 0, duration_minutes: 60, notes: 'Local bohemian clothing and craft shops' },
      ],
    },
    {
      day: 2,
      title: 'Cultural Ubud & Emerald Rice Terraces',
      city: 'Bali',
      activities: [
        { title: 'Tegalalang Rice Terraces & Jungle Swing', category: 'adventure', estimated_cost: 800, duration_minutes: 150, notes: 'Iconic tiered green paddy views' },
        { title: 'Sacred Monkey Forest Sanctuary', category: 'nature', estimated_cost: 600, duration_minutes: 120, notes: 'Lush mossy temple trails with macaques' },
        { title: 'Bebek Bengil Crispy Duck Dinner in Ubud', category: 'food', estimated_cost: 1100, duration_minutes: 90, notes: 'Famous Balinese spiced roasted duck' },
      ],
    },
    {
      day: 3,
      title: 'Waterfalls & Holy Water Purifications',
      city: 'Bali',
      activities: [
        { title: 'Tirta Empul Holy Water Temple', category: 'culture', estimated_cost: 300, duration_minutes: 120, notes: 'Centuries-old stone cleansing springs' },
        { title: 'Tegenungan Waterfall Canyon Dip', category: 'adventure', estimated_cost: 250, duration_minutes: 120, notes: 'Cascading jungle waterfall and pool' },
        { title: 'Ubud Traditional Dance at Puri Saren Palace', category: 'culture', estimated_cost: 600, duration_minutes: 90, notes: 'Hypnotic Legong and gamelan orchestra' },
      ],
    },
    {
      day: 4,
      title: 'Cliffside Temples & Jimbaran Bay Seafood',
      city: 'Bali',
      activities: [
        { title: 'Padang Padang & Uluwatu Surfer Beach', category: 'nature', estimated_cost: 150, duration_minutes: 180, notes: 'Cove beach framed by sea caves' },
        { title: 'Uluwatu Cliff Temple & Sunset Kecak Fire Dance', category: 'culture', estimated_cost: 900, duration_minutes: 120, notes: 'Spectacular chanting show 70m above ocean' },
        { title: 'Candlelit Seafood BBQ on Jimbaran Beach', category: 'food', estimated_cost: 1800, duration_minutes: 120, notes: 'Fresh grilled snapper, prawns, and sambal' },
      ],
    },
    {
      day: 5,
      title: 'Mount Batur Sunrise & Hot Springs',
      city: 'Bali',
      activities: [
        { title: 'Mount Batur Volcanic Caldera Sunrise Trek', category: 'adventure', estimated_cost: 2500, duration_minutes: 300, notes: 'Summit views over Lake Batur and Mount Rinjani' },
        { title: 'Toya Devasya Natural Geothermal Hot Springs', category: 'nature', estimated_cost: 1200, duration_minutes: 120, notes: 'Soak in warm volcanic mineral pools' },
        { title: 'Kintamani Highland Coffee Plantation Tasting', category: 'food', estimated_cost: 400, duration_minutes: 90, notes: 'Sample ginger coffee and local cocoa' },
      ],
    },
    {
      day: 6,
      title: 'Nusa Penida Coastal Marvels',
      city: 'Bali',
      activities: [
        { title: 'Speedboat to Nusa Penida & Kelingking T-Rex Cliff', category: 'adventure', estimated_cost: 2200, duration_minutes: 240, notes: 'World-famous turquoise bay and T-Rex cliff' },
        { title: 'Broken Beach & Angel’s Billabong Natural Infinity Pool', category: 'nature', estimated_cost: 300, duration_minutes: 120, notes: 'Dramatic limestone arch and tide pool' },
        { title: 'Crystal Bay Snorkeling with Manta Rays', category: 'adventure', estimated_cost: 1500, duration_minutes: 150, notes: 'Clear waters and coral reef marine life' },
      ],
    },
    {
      day: 7,
      title: 'Canggu Beach Clubs & Farewell Souvenirs',
      city: 'Bali',
      activities: [
        { title: 'Canggu Echo Beach Surfing & Brunch', category: 'nature', estimated_cost: 900, duration_minutes: 150, notes: 'Acai bowls and black sand beach breaks' },
        { title: 'Love Anchor Market Handicrafts Shopping', category: 'culture', estimated_cost: 1000, duration_minutes: 120, notes: 'Woven rattan bags, silver jewelry, and ceramics' },
        { title: 'Farewell Sunset at Finns or La Brisa Beach Club', category: 'nightlife', estimated_cost: 2000, duration_minutes: 180, notes: 'Oceanfront loungers and tropical mocktails' },
      ],
    },
  ],
  diu: [
    {
      day: 1,
      title: 'Portuguese Forts & Nagoa Beach',
      city: 'Diu',
      activities: [
        { title: 'Diu Fort & Lighthouse Panoramic Tour', category: 'culture', estimated_cost: 100, duration_minutes: 150, notes: '16th-century Portuguese fortress overlooking Arabian Sea' },
        { title: 'St. Paul’s Church & Naida Caves Exploration', category: 'culture', estimated_cost: 0, duration_minutes: 120, notes: 'Baroque architecture and natural photogenic cave labyrinths' },
        { title: 'Nagoa Beach Sunset & Water Sports', category: 'adventure', estimated_cost: 800, duration_minutes: 180, notes: 'Horseshoe shaped beach with unique hoka palm trees' },
      ],
    },
    {
      day: 2,
      title: 'Secluded Beaches & Fresh Seafood Feast',
      city: 'Diu',
      activities: [
        { title: 'Ghoghla Beach Golden Sands Walk', category: 'nature', estimated_cost: 0, duration_minutes: 120, notes: 'Pristine Blue Flag certified tranquil beach' },
        { title: 'Sea Shell Museum & Fudam Bird Sanctuary', category: 'nature', estimated_cost: 150, duration_minutes: 90, notes: 'Vast shell collection and flamingo haven' },
        { title: 'Fresh Coastal Seafood Dinner at O’Coqueiro', category: 'food', estimated_cost: 1100, duration_minutes: 120, notes: 'Portuguese-influenced fish curry and prawn masala' },
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

const DAY_THEMES = [
  {
    title: 'Arrival & Historic Old Quarter',
    acts: [
      { name: 'Heritage Center & Old Town Walking Tour', cat: 'culture', cost: 400, dur: 120, notes: 'Explore local architecture, cobblestone alleys, and civic monuments' },
      { name: 'Traditional Welcome Lunch at Local Eatery', cat: 'food', cost: 650, dur: 75, notes: 'Authentic regional staples and house specialties' },
      { name: 'Historic Square Sunset Stroll', cat: 'nature', cost: 0, dur: 90, notes: 'Golden hour views and vibrant street performers' },
    ],
  },
  {
    title: 'Sacred Temples & Cultural Immersion',
    acts: [
      { name: 'Ancient Temple & Sanctuary Exploration', cat: 'culture', cost: 350, dur: 120, notes: 'Intricate spiritual architecture and scenic courtyards' },
      { name: 'Artisan Workshop & Handicraft Demonstration', cat: 'culture', cost: 500, dur: 90, notes: 'Meet local craftsmen practicing traditional techniques' },
      { name: 'Riverside or Garden Evening Dining', cat: 'food', cost: 900, dur: 90, notes: 'Farm-to-table seasonal delicacies' },
    ],
  },
  {
    title: 'Scenic Vistas & Nature Escapes',
    acts: [
      { name: 'Panoramic Hilltop or Coastal Viewpoint Hike', cat: 'adventure', cost: 200, dur: 150, notes: 'Sweeping scenic views across the natural landscape' },
      { name: 'Botanical Gardens & Forest Canopy Walk', cat: 'nature', cost: 300, dur: 120, notes: 'Lush tropical greenery and serene walking trails' },
      { name: 'Sunset Cafe & Chilled Refreshments', cat: 'food', cost: 450, dur: 60, notes: 'Locally roasted coffee or fresh tropical juices' },
    ],
  },
  {
    title: 'Culinary Crawl & Street Food Markets',
    acts: [
      { name: 'Morning Produce Market & Spice Tasting', cat: 'food', cost: 400, dur: 90, notes: 'Vibrant local produce, exotic fruits, and fresh morning snacks' },
      { name: 'Cooking Masterclass & Tasting Session', cat: 'adventure', cost: 1200, dur: 150, notes: 'Hands-on preparation of regional signature dishes' },
      { name: 'Night Market Bazaar & Souvenir Hunting', cat: 'nightlife', cost: 800, dur: 120, notes: 'Lantern-lit stalls with handmade trinkets and desserts' },
    ],
  },
  {
    title: 'Waterfalls, Lakes & Outdoor Wonder',
    acts: [
      { name: 'Hidden Waterfall or Lagoon Excursion', cat: 'adventure', cost: 600, dur: 180, notes: 'Pristine natural swimming hole and secluded canyon' },
      { name: 'Picnic by the Shore or Mountain Valley', cat: 'nature', cost: 500, dur: 90, notes: 'Relaxed outdoor lunch surrounded by native birds' },
      { name: 'Stargazing or Scenic Overlook Dinner', cat: 'food', cost: 1100, dur: 105, notes: 'Evening meal with ambient lighting and regional wine' },
    ],
  },
  {
    title: 'Arts, Museums & Vintage Neighborhoods',
    acts: [
      { name: 'Fine Arts & Historical Archive Museum', cat: 'culture', cost: 450, dur: 120, notes: 'Curated galleries detailing the heritage of the region' },
      { name: 'Bohemian Cafe & Bookstore Exploration', cat: 'food', cost: 550, dur: 75, notes: 'Artisan tea, specialty pastries, and quiet reading corners' },
      { name: 'Live Acoustic or Folk Music Performance', cat: 'nightlife', cost: 750, dur: 120, notes: 'Intimate venue celebrating local musicians' },
    ],
  },
  {
    title: 'Farewell Vistas & Keepsake Collection',
    acts: [
      { name: 'Final Scenic Overlook & Photography Walk', cat: 'nature', cost: 0, dur: 90, notes: 'Capture memorable panoramic photos of your journey' },
      { name: 'Boutique Shopping for Local Specialties', cat: 'culture', cost: 1200, dur: 90, notes: 'Artisan textiles, ceramics, and regional delicacies' },
      { name: 'Celebratory Farewell Dinner Feast', cat: 'food', cost: 1600, dur: 120, notes: 'Unforgettable celebratory multi-course meal' },
    ],
  },
];

function generateProceduralFallback(
  destination: string,
  daysCount: number,
  _interests?: string[]
): GeneratedDayPlan[] {
  const plans: GeneratedDayPlan[] = [];

  for (let d = 1; d <= daysCount; d++) {
    const themeIdx = (d - 1) % DAY_THEMES.length;
    const theme = DAY_THEMES[themeIdx];

    plans.push({
      day: d,
      title: `Day ${d}: ${theme.title}`,
      city: destination,
      activities: theme.acts.map((act) => ({
        title: `${destination} ${act.name}`,
        category: act.cat as any,
        estimated_cost: act.cost,
        duration_minutes: act.dur,
        notes: act.notes,
      })),
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

  // 1. Check if Gemini or Groq API keys are configured for live AI
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
          "category": "adventure" | "food" | "nature" | "nightlife" | "culture",
          "estimated_cost": 500,
          "duration_minutes": 120,
          "notes": "Short tip"
        }
      ]
    }
  ]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 },
            },
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
      console.warn('Live Gemini generation timed out or failed, checking Groq/curated fallback:', err);
    }
  }

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
