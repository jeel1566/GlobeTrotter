export type UserRole = 'user' | 'admin';
export type TripVisibility = 'private' | 'public';
export type TripStatus = 'draft' | 'active' | 'completed';
export type ActivityCategory = 'adventure' | 'food' | 'nature' | 'nightlife' | 'culture';
export type BudgetCategory = 'flights' | 'hotels' | 'food' | 'activities' | 'transport' | 'shopping';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  ai_generations_today: number;
  ai_generations_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  stop_id: string;
  title: string;
  category: ActivityCategory;
  cost: number;
  duration_minutes: number;
  notes?: string | null;
  order_index: number;
  created_at?: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city: string;
  country?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  order_index: number;
  created_at?: string;
  activities?: Activity[];
}

export interface BudgetItem {
  id: string;
  trip_id: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  created_at?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget_total: number;
  estimated_cost_usd?: number | null;
  cover_image_url?: string | null;
  visibility: TripVisibility;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  stops?: TripStop[];
  budget_items?: BudgetItem[];
  user?: Pick<User, 'name' | 'avatar_url'>;
  like_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface BudgetSummary {
  budget_total: number;
  planned_cost: number;
  remaining: number;
  by_category: Record<BudgetCategory, number>;
  items: BudgetItem[];
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  country: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  place_types: string[];
}

export interface GeneratedActivity {
  title: string;
  category: ActivityCategory;
  estimated_cost: number;
  duration_minutes: number;
  notes?: string;
}

export interface GeneratedDayPlan {
  day: number;
  title: string;
  city?: string;
  activities: GeneratedActivity[];
}

export interface AIItineraryResult {
  fallback: boolean;
  destination: string;
  days: GeneratedDayPlan[];
}
