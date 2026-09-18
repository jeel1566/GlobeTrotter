import { NextRequest, NextResponse } from "next/server";

interface GenerationRequest {
  destination: string;
  duration_days?: number;
  budget?: number;
  interests?: string[];
  style?: string;
  prompt?: string;
}

const DESTINATION_TEMPLATES: Record<string, any[]> = {
  kyoto: [
    {
      dayNumber: 1,
      title: "Ancient Shrines & Culinary Heart",
      items: [
        { time: "08:30 AM", title: "Fushimi Inari 10,000 Torii Gates", category: "Nature", cost: 0, duration: "2.5 hrs", notes: "Climb early before tour groups arrive." },
        { time: "12:00 PM", title: "Nishiki Market Seafood Tasting & Dashi", category: "Food", cost: 1800, duration: "1.5 hrs", notes: "Fresh octopus skewers, tamagoyaki, and matcha dango." },
        { time: "02:30 PM", title: "Kiyomizu-dera Cliffside Wooden Stage", category: "Culture", cost: 400, duration: "2 hrs", notes: "Drink from the Otowa Waterfall streams for health and wisdom." },
        { time: "05:30 PM", title: "Gion Historic Geisha District Lantern Walk", category: "Culture", cost: 0, duration: "1.5 hrs", notes: "Preserved 17th-century machiya wooden merchant houses." },
        { time: "07:30 PM", title: "Pontocho Alley Riverfront Dining", category: "Food", cost: 4500, duration: "2 hrs", notes: "Seasonal duck hotpot or multi-course kaiseki." },
      ],
    },
    {
      dayNumber: 2,
      title: "Zen Gardens & Arashiyama Grove",
      items: [
        { time: "09:00 AM", title: "Arashiyama Bamboo Grove & Tenryu-ji", category: "Nature", cost: 500, duration: "2 hrs", notes: "UNESCO World Heritage dry-landscape Zen garden." },
        { time: "12:30 PM", title: "Togetsukyo Bridge Handmade Soba Lunch", category: "Food", cost: 1600, duration: "1 hr", notes: "Buckwheat cold soba with riverside mountain views." },
        { time: "02:30 PM", title: "Kinkaku-ji (The Golden Pavilion)", category: "Culture", cost: 500, duration: "1.5 hrs", notes: "Reflecting in the Kyoko-chi mirror pond." },
        { time: "05:00 PM", title: "Ryoan-ji Rock Garden Contemplation", category: "Culture", cost: 600, duration: "1 hr", notes: "15 mysterious moss-accented stones." },
        { time: "07:30 PM", title: "Gion Traditional Tea Ceremony", category: "Culture", cost: 3200, duration: "1.5 hrs", notes: "Formal tea whisking and seasonal wagashi confections." },
      ],
    },
  ],
  tokyo: [
    {
      dayNumber: 1,
      title: "Modern Metropolis & Sensory Immersion",
      items: [
        { time: "09:30 AM", title: "Sensō-ji Temple & Asakusa Nakamise-dori", category: "Culture", cost: 0, duration: "2 hrs", notes: "Tokyo's oldest Buddhist temple founded in 645 AD." },
        { time: "12:30 PM", title: "Tsukiji Outer Market Fresh Nigiri Sushi", category: "Food", cost: 3500, duration: "1.5 hrs", notes: "Tuna belly sashimi and rolled omelets." },
        { time: "03:00 PM", title: "teamLab Planets Digital Art Immersion", category: "Adventure", cost: 3800, duration: "2.5 hrs", notes: "Walk barefoot through crystal water rooms." },
        { time: "06:30 PM", title: "Shibuya Sky Observation Deck at Sunset", category: "Adventure", cost: 2200, duration: "1.5 hrs", notes: "360-degree glass rooftop over Shibuya Scramble." },
        { time: "08:30 PM", title: "Omoide Yokocho Yakitori Alleys (Shinjuku)", category: "Food", cost: 2800, duration: "2 hrs", notes: "Smoky charcoal skewers and highballs." },
      ],
    },
    {
      dayNumber: 2,
      title: "Pop Culture, Shrines & Architectural Design",
      items: [
        { time: "09:30 AM", title: "Meiji Jingu Forest Shrine", category: "Nature", cost: 0, duration: "2 hrs", notes: "170-acre sacred evergreen forest in the city center." },
        { time: "12:00 PM", title: "Harajuku Takeshita Street Crepes & Fashion", category: "Food", cost: 1200, duration: "1.5 hrs", notes: "Arty backstreets of Ura-Harajuku." },
        { time: "02:30 PM", title: "Omotesando Architectural Promenade", category: "Culture", cost: 0, duration: "2 hrs", notes: "Flagships by Tadao Ando, Herzog & de Meuron." },
        { time: "05:30 PM", title: "Roppongi Hills Mori Art Museum", category: "Culture", cost: 2000, duration: "2 hrs", notes: "Contemporary international exhibitions." },
        { time: "08:00 PM", title: "Ginza Michelin Ramen & Craft Cocktail Bar", category: "Food", cost: 3200, duration: "2 hrs", notes: "Tori paitan chicken broth and Japanese whisky." },
      ],
    },
  ],
  goa: [
    {
      dayNumber: 1,
      title: "Portuguese Heritage & Coastal Breezes",
      items: [
        { time: "09:00 AM", title: "Fontainhas Latin Quarter Heritage Walk", category: "Culture", cost: 0, duration: "2 hrs", notes: "Colorful Portuguese colonial villas and art cafes." },
        { time: "12:30 PM", title: "Authentic Goan Thali Lunch (Viva Panjim)", category: "Food", cost: 850, duration: "1.5 hrs", notes: "Fish curry rice, kingfish rava fry, and sol kadhi." },
        { time: "03:30 PM", title: "Reis Magos Fort Panoramic Estuary Overlook", category: "Culture", cost: 100, duration: "1.5 hrs", notes: "16th-century fortress restored overlooking the Mandovi." },
        { time: "05:30 PM", title: "Vagator Hilltop Sunset & Cliffs", category: "Nature", cost: 0, duration: "2 hrs", notes: "Dramatic red laterite sea cliffs and evening music." },
        { time: "08:00 PM", title: "Beach Shack Dinner Under the Stars", category: "Food", cost: 1800, duration: "2.5 hrs", notes: "Grilled tiger prawns and local kokum cocktails." },
      ],
    },
    {
      dayNumber: 2,
      title: "Spice Plantations & South Goa Seclusion",
      items: [
        { time: "09:30 AM", title: "Sahakari Spice Plantation Guided Trail", category: "Nature", cost: 600, duration: "2.5 hrs", notes: "Cardamom, cinnamon trees, vanilla, and traditional buffet." },
        { time: "02:00 PM", title: "Basilica of Bom Jesus (Old Goa UNESCO)", category: "Culture", cost: 0, duration: "1.5 hrs", notes: "St. Francis Xavier baroque architecture." },
        { time: "04:30 PM", title: "Palolem Beach Kayaking to Butterfly Island", category: "Adventure", cost: 1200, duration: "2 hrs", notes: "Crescent golden sand cove and calm waters." },
        { time: "07:30 PM", title: "Sunset Seafood BBQ at Agonda", category: "Food", cost: 1500, duration: "2 hrs", notes: "Fresh catch of the day by candlelight." },
      ],
    },
  ],
};

function generateGenericDays(destination: string, daysCount: number = 2) {
  return Array.from({ length: daysCount }, (_, i) => ({
    dayNumber: i + 1,
    title: `Day ${i + 1} – Exploring ${destination}`,
    items: [
      {
        time: "09:00 AM",
        title: `${destination} Landmark & Heritage Walk`,
        category: "Culture",
        cost: 600,
        duration: "2 hrs",
        notes: `Historic quarter and architectural highlights of ${destination}.`,
      },
      {
        time: "12:30 PM",
        title: `Local Artisan Lunch & Markets in ${destination}`,
        category: "Food",
        cost: 1400,
        duration: "1.5 hrs",
        notes: "Authentic regional specialties and street dining.",
      },
      {
        time: "03:00 PM",
        title: `${destination} Scenic Vista & Nature Trail`,
        category: "Nature",
        cost: 300,
        duration: "2 hrs",
        notes: "Panoramic viewpoints and photography vantage points.",
      },
      {
        time: "07:00 PM",
        title: `Evening Culinary Experience & Night Exploration`,
        category: "Food",
        cost: 2400,
        duration: "2.5 hrs",
        notes: "Chef-driven seasonal tasting and evening ambience.",
      },
    ],
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const destination = (body.destination || body.prompt || "Kyoto").toLowerCase();
    const duration = Math.min(7, Math.max(1, body.duration_days || 2));

    // Check if we match a known curated template
    let matchedKey = Object.keys(DESTINATION_TEMPLATES).find((k) => destination.includes(k));
    let days: any[];

    if (matchedKey) {
      days = DESTINATION_TEMPLATES[matchedKey].slice(0, duration);
    } else {
      const cleanDestination = body.destination || body.prompt?.slice(0, 30) || "Curated Expedition";
      days = generateGenericDays(cleanDestination, duration);
    }

    const totalEstimatedBudget = days.reduce(
      (sum, d) => sum + d.items.reduce((iSum: number, item: any) => iSum + (item.cost || 0), 0),
      0
    );

    return NextResponse.json({
      data: {
        destination: body.destination || matchedKey || "Curated Destination",
        duration_days: days.length,
        estimated_budget: totalEstimatedBudget,
        currency: "INR",
        pacing: "Balanced (High-End Cultural & Culinary)",
        days,
      },
    });
  } catch (error) {
    console.error("POST /api/ai/generate-itinerary error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary", code: "AI_GENERATION_FAILED" },
      { status: 500 }
    );
  }
}
