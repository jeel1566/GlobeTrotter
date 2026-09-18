export type TripVisibility = 'private' | 'public';
export type TripStatus = 'draft' | 'active' | 'completed' | 'planning';
export type ActivityCategory = 'adventure' | 'food' | 'nature' | 'nightlife' | 'culture';
export type BudgetCategory = 'flights' | 'hotels' | 'food' | 'activities' | 'transport' | 'shopping' | 'Culture' | 'Food' | 'Nature' | 'Adventure' | 'Nightlife' | 'Transport' | 'Hotels';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin';
  ai_generations_today: number;
  created_at: string;
}

export interface Activity {
  id: string;
  stop_id: string;
  title: string;
  category: ActivityCategory;
  cost: number;
  duration_minutes?: number;
  duration?: string;
  time?: string;
  notes?: string;
  order_index: number;
  created_at?: string;
  badgeBg?: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city: string;
  country: string;
  arrival_date?: string;
  departure_date?: string;
  dates?: string;
  nights?: number;
  order_index: number;
  created_at?: string;
  activities: Activity[];
}

export interface BudgetItem {
  id: string;
  trip_id: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  date?: string;
  paidBy?: string;
  status?: 'Paid' | 'Planned';
  created_at?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  dates?: string;
  duration?: string;
  budget_total: number;
  budget_planned?: number;
  cover_image_url: string;
  visibility: TripVisibility;
  status: TripStatus;
  likes_count?: number;
  collaborators?: Array<{ name: string; avatar: string }>;
  stops?: TripStop[];
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    has_more?: boolean;
    total?: number;
  };
}
