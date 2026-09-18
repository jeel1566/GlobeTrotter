import { Trip, TripStop, Activity, BudgetItem } from './types';

// In-memory persistent state across Route Handlers in server runtime
declare global {
  // eslint-disable-next-line no-var
  var __globetrotter_db: {
    trips: Trip[];
    budgetItems: BudgetItem[];
  } | undefined;
}

const initialTrips: Trip[] = [
  {
    id: "japan-2026",
    user_id: "user-jeel",
    title: "Japan Autumn Odyssey 2026",
    description: "Curated multi-city expedition through historic shrines, neon districts, and scenic bullet rail.",
    destination: "Tokyo, Kyoto, Osaka",
    start_date: "2026-10-12",
    end_date: "2026-10-22",
    dates: "Oct 12 – Oct 22, 2026",
    duration: "10 Days",
    budget_total: 250000,
    budget_planned: 198400,
    cover_image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    visibility: "private",
    status: "active",
    likes_count: 124,
    collaborators: [
      { name: "Jeel Patel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
    ],
    stops: [
      {
        id: "stop-tokyo",
        trip_id: "japan-2026",
        city: "Tokyo",
        country: "Japan",
        dates: "Mar 12 – Mar 15, 2026",
        nights: 3,
        order_index: 0,
        activities: [
          {
            id: "act-1",
            stop_id: "stop-tokyo",
            title: "Sensō-ji Temple & Asakusa District",
            time: "09:30 AM",
            category: "culture",
            cost: 0,
            duration: "2.5 hrs",
            notes: "Oldest Buddhist temple in Tokyo. Try fresh melonpan on Nakamise Street.",
            order_index: 0,
          },
          {
            id: "act-2",
            stop_id: "stop-tokyo",
            title: "Shibuya Crossing & Hachiko Statue",
            time: "02:00 PM",
            category: "adventure",
            cost: 0,
            duration: "1.5 hrs",
            notes: "Busiest pedestrian intersection in the world. View from Starbucks Tsutaya.",
            order_index: 1,
          },
          {
            id: "act-3",
            stop_id: "stop-tokyo",
            title: "Tsukiji Outer Market Gourmet Tasting",
            time: "05:30 PM",
            category: "food",
            cost: 2500,
            duration: "2 hrs",
            notes: "Fresh uni, grilled scallops, and wagyu skewers.",
            order_index: 2,
          },
          {
            id: "act-4",
            stop_id: "stop-tokyo",
            title: "teamLab Planets Immersive Digital Art",
            time: "08:00 PM",
            category: "culture",
            cost: 3200,
            duration: "2 hrs",
            notes: "Tickets booked online. Barefoot water exhibit.",
            order_index: 3,
          },
        ],
      },
      {
        id: "stop-kyoto",
        trip_id: "japan-2026",
        city: "Kyoto",
        country: "Japan",
        dates: "Mar 16 – Mar 18, 2026",
        nights: 3,
        order_index: 1,
        activities: [
          {
            id: "act-5",
            stop_id: "stop-kyoto",
            title: "Fushimi Inari Shrine 10,000 Torii Gates",
            time: "08:00 AM",
            category: "nature",
            cost: 0,
            duration: "3 hrs",
            notes: "Early morning hike before crowds arrive. Sacred fox statues.",
            order_index: 0,
          },
          {
            id: "act-6",
            stop_id: "stop-kyoto",
            title: "Traditional Gion Machiya Tea Ceremony",
            time: "01:30 PM",
            category: "culture",
            cost: 4000,
            duration: "1.5 hrs",
            notes: "Matcha preparation with Japanese wagashi sweets.",
            order_index: 1,
          },
          {
            id: "act-7",
            stop_id: "stop-kyoto",
            title: "Kiyomizu-dera Wooden Stage Sunset",
            time: "05:00 PM",
            category: "culture",
            cost: 400,
            duration: "2 hrs",
            notes: "Panoramic sunset view over Kyoto valley from the main hall.",
            order_index: 2,
          },
        ],
      },
      {
        id: "stop-osaka",
        trip_id: "japan-2026",
        city: "Osaka",
        country: "Japan",
        dates: "Mar 19 – Mar 20, 2026",
        nights: 2,
        order_index: 2,
        activities: [
          {
            id: "act-8",
            stop_id: "stop-osaka",
            title: "Osaka Castle & Plum Grove Gardens",
            time: "10:00 AM",
            category: "culture",
            cost: 600,
            duration: "2.5 hrs",
            notes: "Historical museum inside tower with 360-degree observation deck.",
            order_index: 0,
          },
          {
            id: "act-9",
            stop_id: "stop-osaka",
            title: "Dotonbori Neon Food Crawl (Takoyaki & Kushikatsu)",
            time: "06:30 PM",
            category: "food",
            cost: 3500,
            duration: "3 hrs",
            notes: "Glico Running Man sign, canal bridge, and famous street stalls.",
            order_index: 1,
          },
        ],
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "goa-2026",
    user_id: "user-jeel",
    title: "Goa Beach & Culture Retreat",
    description: "Secluded coastlines, Portuguese heritage villas, and spice plantation sunset trails.",
    destination: "Panaji • Vagator • Palolem",
    dates: "Dec 05 – Dec 10, 2026",
    duration: "5 Days",
    budget_total: 38000,
    budget_planned: 28400,
    cover_image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    visibility: "public",
    status: "planning",
    likes_count: 42,
    stops: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "rajasthan-2026",
    user_id: "user-jeel",
    title: "Royal Rajasthan Circuit",
    description: "Amer Fort light ceremonies, Thar desert camel safari, and lake palace dinners.",
    destination: "Jaipur • Jodhpur • Udaipur",
    dates: "Jan 14 – Jan 21, 2027",
    duration: "7 Days",
    budget_total: 65000,
    budget_planned: 52000,
    cover_image_url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    visibility: "public",
    status: "draft",
    likes_count: 89,
    stops: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "swiss-2027",
    user_id: "user-jeel",
    title: "Swiss Alps Scenic Rail & Trail",
    description: "Interlaken paragliding, Jungfraujoch ice palace, and Matterhorn vistas.",
    destination: "Zurich • Interlaken • Zermatt",
    dates: "May 02 – May 09, 2027",
    duration: "8 Days",
    budget_total: 210000,
    budget_planned: 175000,
    cover_image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80",
    visibility: "private",
    status: "planning",
    likes_count: 124,
    stops: [],
    created_at: new Date().toISOString(),
  },
];

const initialBudgetItems: BudgetItem[] = [
  { id: "b1", trip_id: "japan-2026", category: "Culture", label: "teamLab Planets Tickets (x3)", amount: 9600, date: "Mar 12", paidBy: "Jeel Patel", status: "Paid" },
  { id: "b2", trip_id: "japan-2026", category: "Food", label: "Tsukiji Fish Market Seafood Breakfast", amount: 4800, date: "Mar 13", paidBy: "Sarah", status: "Paid" },
  { id: "b3", trip_id: "japan-2026", category: "Transport", label: "Tokaido Shinkansen Bullet Train", amount: 14200, date: "Mar 14", paidBy: "Jeel Patel", status: "Paid" },
  { id: "b4", trip_id: "japan-2026", category: "Culture", label: "Traditional Gion Tea Ceremony", amount: 4000, date: "Mar 15", paidBy: "Alex", status: "Paid" },
  { id: "b5", trip_id: "japan-2026", category: "Adventure", label: "Shibuya Sky Observation Deck", amount: 4500, date: "Mar 16", paidBy: "Sarah", status: "Paid" },
  { id: "b6", trip_id: "japan-2026", category: "Food", label: "Kaiseki Multi-Course Dinner Kyoto", amount: 12500, date: "Mar 17", paidBy: "Jeel Patel", status: "Planned" },
  { id: "b7", trip_id: "japan-2026", category: "Food", label: "Dotonbori Street Food Tour Osaka", amount: 5200, date: "Mar 18", paidBy: "Alex", status: "Planned" },
  { id: "b8", trip_id: "japan-2026", category: "Culture", label: "Osaka Castle & Museum Pass", amount: 1800, date: "Mar 19", paidBy: "Jeel Patel", status: "Planned" },
  { id: "b9", trip_id: "japan-2026", category: "Nature", label: "Arashiyama Bamboo Grove Rickshaw", amount: 5700, date: "Mar 20", paidBy: "Sarah", status: "Planned" },
];

if (!global.__globetrotter_db) {
  global.__globetrotter_db = {
    trips: initialTrips,
    budgetItems: initialBudgetItems,
  };
}

const db = global.__globetrotter_db;

export const dataStore = {
  // Trips
  async getTrips(filter?: { status?: string }): Promise<Trip[]> {
    let result = db.trips;
    if (filter?.status) {
      result = result.filter((t) => t.status === filter.status);
    }
    return result;
  },

  async getTripById(id: string): Promise<Trip | null> {
    const trip = db.trips.find((t) => t.id === id);
    return trip || null;
  },

  async createTrip(data: Partial<Trip>): Promise<Trip> {
    const newTrip: Trip = {
      id: data.id || `trip-${Date.now()}`,
      user_id: data.user_id || "user-jeel",
      title: data.title || "Untitled Trip",
      description: data.description || "",
      destination: data.destination || "",
      start_date: data.start_date || new Date().toISOString().split("T")[0],
      end_date: data.end_date || new Date().toISOString().split("T")[0],
      budget_total: Number(data.budget_total) || 50000,
      budget_planned: 0,
      cover_image_url: data.cover_image_url || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      visibility: data.visibility || "private",
      status: data.status || "draft",
      likes_count: 0,
      stops: [],
      created_at: new Date().toISOString(),
    };

    db.trips.unshift(newTrip);
    return newTrip;
  },

  async updateTrip(id: string, partial: Partial<Trip>): Promise<Trip | null> {
    const index = db.trips.findIndex((t) => t.id === id);
    if (index === -1) return null;

    db.trips[index] = {
      ...db.trips[index],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    return db.trips[index];
  },

  async deleteTrip(id: string): Promise<boolean> {
    const prevLen = db.trips.length;
    db.trips = db.trips.filter((t) => t.id !== id);
    db.budgetItems = db.budgetItems.filter((b) => b.trip_id !== id);
    return db.trips.length < prevLen;
  },

  // Stops
  async addStop(tripId: string, stop: Partial<TripStop>): Promise<TripStop | null> {
    const trip = await this.getTripById(tripId);
    if (!trip) return null;

    if (!trip.stops) trip.stops = [];
    const newStop: TripStop = {
      id: `stop-${Date.now()}`,
      trip_id: tripId,
      city: stop.city || "New City",
      country: stop.country || "Country",
      dates: stop.dates || "Upcoming",
      nights: stop.nights || 2,
      order_index: trip.stops.length,
      activities: [],
      created_at: new Date().toISOString(),
    };

    trip.stops.push(newStop);
    return newStop;
  },

  async reorderStops(tripId: string, order: Array<{ id: string; order_index: number }>): Promise<boolean> {
    const trip = await this.getTripById(tripId);
    if (!trip || !trip.stops) return false;

    const orderMap = new Map(order.map((o) => [o.id, o.order_index]));
    trip.stops.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : a.order_index;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : b.order_index;
      return idxA - idxB;
    });

    trip.stops.forEach((s, i) => (s.order_index = i));
    return true;
  },

  async deleteStop(tripId: string, stopId: string): Promise<boolean> {
    const trip = await this.getTripById(tripId);
    if (!trip || !trip.stops) return false;
    trip.stops = trip.stops.filter((s) => s.id !== stopId);
    return true;
  },

  // Activities
  async addActivity(tripId: string, stopId: string, act: Partial<Activity>): Promise<Activity | null> {
    const trip = await this.getTripById(tripId);
    if (!trip || !trip.stops) return null;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return null;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      stop_id: stopId,
      title: act.title || "New Activity",
      category: act.category || "culture",
      cost: Number(act.cost) || 0,
      duration: act.duration || "1.5 hrs",
      time: act.time || "10:00 AM",
      notes: act.notes || "",
      order_index: stop.activities.length,
      created_at: new Date().toISOString(),
    };

    stop.activities.push(newActivity);
    return newActivity;
  },

  async deleteActivity(tripId: string, stopId: string, activityId: string): Promise<boolean> {
    const trip = await this.getTripById(tripId);
    if (!trip || !trip.stops) return false;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return false;

    stop.activities = stop.activities.filter((a) => a.id !== activityId);
    return true;
  },

  // Budget
  async getBudget(tripId: string) {
    const trip = await this.getTripById(tripId);
    const items = db.budgetItems.filter((b) => b.trip_id === tripId);
    const plannedCost = items.reduce((sum, item) => sum + item.amount, 0);
    const totalBudget = trip?.budget_total || 85000;

    const byCategory: Record<string, number> = {};
    for (const item of items) {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    }

    return {
      budget_total: totalBudget,
      planned_cost: plannedCost,
      remaining: totalBudget - plannedCost,
      by_category: byCategory,
      items,
    };
  },

  async addBudgetItem(tripId: string, item: Partial<BudgetItem>): Promise<BudgetItem> {
    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      trip_id: tripId,
      category: item.category || "Food",
      label: item.label || "Expense item",
      amount: Number(item.amount) || 0,
      date: item.date || "Mar 16",
      paidBy: item.paidBy || "Jeel Patel",
      status: item.status || "Paid",
      created_at: new Date().toISOString(),
    };

    db.budgetItems.unshift(newItem);
    
    // Sync trip planned cost
    const trip = db.trips.find((t) => t.id === tripId);
    if (trip) {
      trip.budget_planned = db.budgetItems
        .filter((b) => b.trip_id === tripId)
        .reduce((sum, b) => sum + b.amount, 0);
    }

    return newItem;
  },

  async deleteBudgetItem(itemId: string): Promise<boolean> {
    const item = db.budgetItems.find((b) => b.id === itemId);
    const tripId = item?.trip_id;
    const prev = db.budgetItems.length;
    db.budgetItems = db.budgetItems.filter((b) => b.id !== itemId);

    if (tripId) {
      const trip = db.trips.find((t) => t.id === tripId);
      if (trip) {
        trip.budget_planned = db.budgetItems
          .filter((b) => b.trip_id === tripId)
          .reduce((sum, b) => sum + b.amount, 0);
      }
    }

    return db.budgetItems.length < prev;
  },
};
