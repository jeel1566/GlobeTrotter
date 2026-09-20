'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Plus,
  Share2,
  Download,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Info,
  GripVertical,
  Wallet,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Receipt,
  TrendingUp,
  Globe,
  Lock,
  ExternalLink,
  Check,
  Compass,
  Star,
  Flame,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';
import { CitySearchInput } from '@/components/places/city-search-input';
import { MapWrapper } from '@/components/map/map-wrapper';
import { TrendySpot, CityCenterInfo } from '@/app/api/places/trendy/route';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  ActivityCategory,
  BudgetCategory,
  BudgetItem,
  BudgetSummary,
  Trip,
  TripStop,
} from '@/types/database';

const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'nightlife', label: 'Nightlife' },
];

const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: 'flights', label: 'Flights' },
  { value: 'hotels', label: 'Hotels & Accommodation' },
  { value: 'transport', label: 'Transit & Car' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'activities', label: 'Activities & Attractions' },
  { value: 'shopping', label: 'Shopping & Gear' },
];

function getActivityBadgeClass(category: ActivityCategory): string {
  switch (category) {
    case 'culture':
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'food':
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'nature':
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'adventure':
      return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    case 'nightlife':
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

function getBudgetCategoryBadgeClass(category: BudgetCategory): string {
  switch (category) {
    case 'flights':
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'hotels':
      return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    case 'transport':
      return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'food':
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'activities':
      return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    case 'shopping':
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export default function ItineraryBuilderPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  // View state: timeline, budget breakdown, or interactive map & trendy spots
  const [viewMode, setViewMode] = useState<'timeline' | 'budget' | 'map'>('timeline');

  // Interactive Map & Trendy Spots state
  const [mapCenter, setMapCenter] = useState<CityCenterInfo>({
    name: 'Ahmedabad',
    country: 'India',
    latitude: 23.0304,
    longitude: 72.5450,
    zoom: 13,
  });
  const [mapSpots, setMapSpots] = useState<TrendySpot[]>([]);
  const [selectedMapSpot, setSelectedMapSpot] = useState<TrendySpot | null>(null);
  const [isLoadingMapSpots, setIsLoadingMapSpots] = useState(false);
  const [mapSearchInput, setMapSearchInput] = useState('');
  const [isAddingSpotToItinerary, setIsAddingSpotToItinerary] = useState(false);
  const [mapToast, setMapToast] = useState<{ spot: string; stop: string } | null>(null);

  // Trip and itinerary data
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Visibility & Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);

  // Budget data state
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [, setIsLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Stop CRUD states
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [addStopError, setAddStopError] = useState<string | null>(null);
  const [stopCity, setStopCity] = useState('');
  const [stopCountry, setStopCountry] = useState('');
  const [stopArrivalDate, setStopArrivalDate] = useState('');
  const [stopDepartureDate, setStopDepartureDate] = useState('');

  const [isEditStopOpen, setIsEditStopOpen] = useState(false);
  const [isEditingStop, setIsEditingStop] = useState(false);
  const [editStopError, setEditStopError] = useState<string | null>(null);
  const [stopToEdit, setStopToEdit] = useState<TripStop | null>(null);
  const [editStopCity, setEditStopCity] = useState('');
  const [editStopCountry, setEditStopCountry] = useState('');
  const [editStopArrivalDate, setEditStopArrivalDate] = useState('');
  const [editStopDepartureDate, setEditStopDepartureDate] = useState('');

  const [isDeleteStopOpen, setIsDeleteStopOpen] = useState(false);
  const [isDeletingStop, setIsDeletingStop] = useState(false);
  const [deleteStopError, setDeleteStopError] = useState<string | null>(null);
  const [stopToDelete, setStopToDelete] = useState<TripStop | null>(null);

  const [isReorderingStops, setIsReorderingStops] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  // Activity Dialog states
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [addActivityError, setAddActivityError] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState('');
  const [addCategory, setAddCategory] = useState<ActivityCategory>('culture');
  const [addCost, setAddCost] = useState('0');
  const [addDuration, setAddDuration] = useState('60');
  const [addNotes, setAddNotes] = useState('');

  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editActivityError, setEditActivityError] = useState<string | null>(null);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ActivityCategory>('culture');
  const [editCost, setEditCost] = useState('0');
  const [editDuration, setEditDuration] = useState('60');
  const [editNotes, setEditNotes] = useState('');

  const [isDeleteActivityOpen, setIsDeleteActivityOpen] = useState(false);
  const [isDeletingActivity, setIsDeletingActivity] = useState(false);
  const [deleteActivityError, setDeleteActivityError] = useState<string | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  // Manual Budget Item Dialog states
  const [isAddBudgetItemOpen, setIsAddBudgetItemOpen] = useState(false);
  const [isAddingBudgetItem, setIsAddingBudgetItem] = useState(false);
  const [addBudgetItemError, setAddBudgetItemError] = useState<string | null>(null);
  const [newExpenseCategory, setNewExpenseCategory] = useState<BudgetCategory>('flights');
  const [newExpenseLabel, setNewExpenseLabel] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('0');

  const [isDeleteBudgetItemOpen, setIsDeleteBudgetItemOpen] = useState(false);
  const [isDeletingBudgetItem, setIsDeletingBudgetItem] = useState(false);
  const [deleteBudgetItemError, setDeleteBudgetItemError] = useState<string | null>(null);
  const [budgetItemToDelete, setBudgetItemToDelete] = useState<BudgetItem | null>(null);

  // Review Order dialog state
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);

  // 1. Fetch Trip details (stops and activities)
  const loadTrip = useCallback(async () => {
    if (!tripId) return;
    setTripError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Failed to load trip (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setTrip(json.data);
      } else {
        throw new Error('Trip data missing in response');
      }
    } catch (err: any) {
      console.error('Failed to load trip', err);
      setTripError(err.message || 'Failed to load trip');
    } finally {
      setIsLoadingTrip(false);
    }
  }, [tripId]);

  // Update trip visibility (publish / make private)
  const handleToggleVisibility = async (newVisibility: 'public' | 'private') => {
    if (!tripId || isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Failed to update visibility (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setTrip((prev) => (prev ? { ...prev, visibility: newVisibility } : null));
      }
    } catch (err: any) {
      console.error('Failed to update visibility:', err);
      setPublishError(err.message || 'Failed to update visibility');
    } finally {
      setIsPublishing(false);
    }
  };

  // Copy public URL to clipboard
  const handleCopyPublicUrl = () => {
    if (typeof window !== 'undefined' && trip?.visibility === 'public') {
      const publicUrl = `${window.location.origin}/trips/${tripId}/view`;
      navigator.clipboard.writeText(publicUrl);
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2500);
    }
  };

  // 2. Fetch Budget Summary (rollups + manual items)
  const loadBudget = useCallback(async () => {
    if (!tripId) return;
    setIsLoadingBudget(true);
    setBudgetError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/budget`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch budget (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setBudgetSummary(json.data);
      }
    } catch (err: any) {
      console.error('Failed to load budget:', err);
      setBudgetError(err.message || 'Unable to load budget summary');
    } finally {
      setIsLoadingBudget(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
    loadBudget();
  }, [loadTrip, loadBudget]);

  const stops: TripStop[] = useMemo(
    () => [...(trip?.stops || [])].sort((first, second) => first.order_index - second.order_index),
    [trip?.stops]
  );

  // Resilient selected stop selection
  const selectedStop = useMemo(() => {
    if (stops.length === 0) return null;
    if (selectedStopId) {
      const found = stops.find((s) => s.id === selectedStopId);
      if (found) return found;
    }
    return stops[0] || null;
  }, [stops, selectedStopId]);

  const selectedDay = useMemo(() => {
    if (!selectedStop) return 1;
    const idx = stops.findIndex((s) => s.id === selectedStop.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [stops, selectedStop]);

  useEffect(() => {
    if (stops.length > 0 && !selectedStopId) {
      setSelectedStopId(stops[0].id);
    }
  }, [stops, selectedStopId]);

  // Fetch trendy spots for active stop/city on the map
  const loadTrendySpotsForMap = useCallback(async (areaName: string) => {
    if (!areaName || !areaName.trim()) return;
    setIsLoadingMapSpots(true);
    try {
      const res = await fetch(`/api/places/trendy?city=${encodeURIComponent(areaName.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (json.city) {
          setMapCenter(json.city);
        }
        const spotsList: TrendySpot[] = json.spots || [];
        setMapSpots(spotsList);
        if (spotsList.length > 0) {
          setSelectedMapSpot(spotsList[0]);
        } else {
          setSelectedMapSpot(null);
        }
      }
    } catch (err) {
      console.error('Failed to load map spots:', err);
    } finally {
      setIsLoadingMapSpots(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'map') {
      const targetArea = selectedStop?.city || trip?.destination || 'Ahmedabad';
      loadTrendySpotsForMap(targetArea);
    }
  }, [viewMode, selectedStop?.city, trip?.destination, loadTrendySpotsForMap]);

  const handleAddSpotDirectly = async (spot: TrendySpot) => {
    if (!selectedStop) {
      alert('Please select or create a stop first to add this activity.');
      return;
    }
    setIsAddingSpotToItinerary(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${selectedStop.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: spot.name,
          category: spot.category,
          cost: spot.costEstimateNumber,
          duration_minutes: spot.durationMinutes,
          notes: spot.socialBuzz ? `${spot.socialBuzz.badge}: ${spot.socialBuzz.quote}` : spot.description,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to add activity');
      }
      await loadTrip();
      await loadBudget();
      setMapToast({ spot: spot.name, stop: selectedStop.city });
      setTimeout(() => setMapToast(null), 4500);
    } catch (err: any) {
      console.error('Failed to add spot to stop:', err);
    } finally {
      setIsAddingSpotToItinerary(false);
    }
  };

  const currentActivities: Activity[] = useMemo(() => {
    if (!selectedStop?.activities) return [];
    return [...selectedStop.activities].sort((first, second) => first.order_index - second.order_index);
  }, [selectedStop?.activities]);

  useEffect(() => {
    if (currentActivities.length > 0) {
      const exists = currentActivities.some((a) => a.id === selectedActivityId);
      if (!exists) {
        setSelectedActivityId(currentActivities[0].id);
      }
    } else {
      setSelectedActivityId(null);
    }
  }, [currentActivities, selectedActivityId]);

  const selectedActivity = useMemo(() => {
    if (!currentActivities.length) return null;
    if (selectedActivityId) {
      const found = currentActivities.find((a) => a.id === selectedActivityId);
      if (found) return found;
    }
    return currentActivities[0] || null;
  }, [currentActivities, selectedActivityId]);

  // Derived cost sums
  const totalActivitiesCost = useMemo(() => {
    return stops.reduce((sum, stop) => {
      const stopCost = (stop.activities || []).reduce((acc, act) => acc + Number(act.cost || 0), 0);
      return sum + stopCost;
    }, 0);
  }, [stops]);

  const totalManualItemsCost = useMemo(() => {
    return (budgetSummary?.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [budgetSummary?.items]);

  const totalBudget = Number(budgetSummary?.budget_total ?? trip?.budget_total ?? 0);
  const totalPlannedCost = budgetSummary?.planned_cost ?? (totalActivitiesCost + totalManualItemsCost);
  const remainingBudget = totalBudget > 0 ? totalBudget - totalPlannedCost : 0;

  const selectedStopTotal = useMemo(() => {
    if (!selectedStop?.activities) return 0;
    return selectedStop.activities.reduce((sum, act) => sum + Number(act.cost || 0), 0);
  }, [selectedStop?.activities]);

  const itineraryDays = useMemo(
    () =>
      stops.map((stop, index) => ({
        id: stop.id,
        dayNumber: index + 1,
        title: stop.city,
        country: stop.country,
        date: stop.arrival_date || stop.departure_date || 'Date not set',
        activitiesCount: stop.activities?.length || 0,
        cost: (stop.activities || []).reduce((total, activity) => total + Number(activity.cost || 0), 0),
      })),
    [stops]
  );

  // Stop CRUD Handlers
  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopCity.trim()) {
      setAddStopError('City name is required');
      return;
    }

    setIsAddingStop(true);
    setAddStopError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: stopCity.trim(),
          country: stopCountry.trim() || undefined,
          arrival_date: stopArrivalDate || undefined,
          departure_date: stopDepartureDate || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to create stop');
      }

      const json = await res.json();
      if (json.data?.id) {
        setSelectedStopId(json.data.id);
      }

      await loadTrip();
      await loadBudget();
      setIsAddStopOpen(false);
      setStopCity('');
      setStopCountry('');
      setStopArrivalDate('');
      setStopDepartureDate('');
    } catch (err: any) {
      console.error('Failed to add stop:', err);
      setAddStopError(err.message || 'Failed to add stop');
    } finally {
      setIsAddingStop(false);
    }
  };

  const openEditStopModal = (stop: TripStop) => {
    setStopToEdit(stop);
    setEditStopCity(stop.city);
    setEditStopCountry(stop.country || '');
    setEditStopArrivalDate(stop.arrival_date || '');
    setEditStopDepartureDate(stop.departure_date || '');
    setEditStopError(null);
    setIsEditStopOpen(true);
  };

  const handleEditStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopToEdit) return;
    if (!editStopCity.trim()) {
      setEditStopError('City name is required');
      return;
    }

    setIsEditingStop(true);
    setEditStopError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${stopToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: editStopCity.trim(),
          country: editStopCountry.trim() || null,
          arrival_date: editStopArrivalDate || null,
          departure_date: editStopDepartureDate || null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update stop');
      }

      await loadTrip();
      await loadBudget();
      setIsEditStopOpen(false);
      setStopToEdit(null);
    } catch (err: any) {
      console.error('Failed to update stop:', err);
      setEditStopError(err.message || 'Failed to update stop');
    } finally {
      setIsEditingStop(false);
    }
  };

  const openDeleteStopModal = (stop: TripStop) => {
    setStopToDelete(stop);
    setDeleteStopError(null);
    setIsDeleteStopOpen(true);
  };

  const handleDeleteStop = async () => {
    if (!stopToDelete) return;

    setIsDeletingStop(true);
    setDeleteStopError(null);

    const deletedIndex = stops.findIndex((s) => s.id === stopToDelete.id);

    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${stopToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to delete stop');
      }

      const remainingStops = stops.filter((s) => s.id !== stopToDelete.id);
      if (remainingStops.length === 0) {
        setSelectedStopId(null);
      } else {
        const nextIndex = Math.min(Math.max(0, deletedIndex), remainingStops.length - 1);
        setSelectedStopId(remainingStops[nextIndex].id);
      }

      await loadTrip();
      await loadBudget();
      setIsDeleteStopOpen(false);
      setStopToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete stop:', err);
      setDeleteStopError(err.message || 'Failed to delete stop');
    } finally {
      setIsDeletingStop(false);
    }
  };

  const handleMoveStop = async (stopId: string, direction: 'up' | 'down') => {
    const currentIndex = stops.findIndex((s) => s.id === stopId);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    setIsReorderingStops(true);
    setReorderError(null);

    const newStops = [...stops];
    const [moved] = newStops.splice(currentIndex, 1);
    newStops.splice(targetIndex, 0, moved);

    const orderPayload = newStops.map((stop, idx) => ({
      id: stop.id,
      order_index: idx,
    }));

    try {
      const res = await fetch(`/api/trips/${tripId}/stops/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderPayload }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to reorder stops');
      }

      setSelectedStopId(stopId);
      await loadTrip();
      await loadBudget();
    } catch (err: any) {
      console.error('Failed to reorder stops:', err);
      setReorderError(err.message || 'Failed to reorder stops');
    } finally {
      setIsReorderingStops(false);
    }
  };

  // Handlers for Activity CRUD
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStop) return;
    if (!addTitle.trim()) {
      setAddActivityError('Activity title is required');
      return;
    }

    setIsAddingActivity(true);
    setAddActivityError(null);

    const cost = Number(addCost.replace(/[^0-9.]/g, '')) || 0;
    const duration = Number(addDuration.replace(/[^0-9]/g, '')) || 60;

    try {
      const response = await fetch(`/api/trips/${tripId}/stops/${selectedStop.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addTitle.trim(),
          category: addCategory,
          cost,
          duration_minutes: duration,
          notes: addNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Unable to save activity');
      }

      const resJson = await response.json();
      if (resJson.data?.id) {
        setSelectedActivityId(resJson.data.id);
      }

      await loadTrip();
      await loadBudget();
      setIsAddActivityOpen(false);
      setAddTitle('');
      setAddCost('0');
      setAddDuration('60');
      setAddNotes('');
      setAddCategory('culture');
    } catch (err: any) {
      console.error('Failed to add activity', err);
      setAddActivityError(err.message || 'Failed to add activity');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const openEditModal = (activity: Activity) => {
    setEditActivityId(activity.id);
    setEditTitle(activity.title);
    setEditCategory(activity.category);
    setEditCost(String(activity.cost));
    setEditDuration(String(activity.duration_minutes));
    setEditNotes(activity.notes || '');
    setEditActivityError(null);
    setIsEditActivityOpen(true);
  };

  const handleEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editActivityId) return;
    if (!editTitle.trim()) {
      setEditActivityError('Activity title is required');
      return;
    }

    setIsEditingActivity(true);
    setEditActivityError(null);

    const cost = Number(String(editCost).replace(/[^0-9.]/g, '')) || 0;
    const duration = Number(String(editDuration).replace(/[^0-9]/g, '')) || 60;

    try {
      const response = await fetch(`/api/trips/${tripId}/activities/${editActivityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          cost,
          duration_minutes: duration,
          notes: editNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Unable to update activity');
      }

      await loadTrip();
      await loadBudget();
      setIsEditActivityOpen(false);
    } catch (err: any) {
      console.error('Failed to update activity', err);
      setEditActivityError(err.message || 'Failed to update activity');
    } finally {
      setIsEditingActivity(false);
    }
  };

  const openDeleteModal = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteActivityError(null);
    setIsDeleteActivityOpen(true);
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;

    setIsDeletingActivity(true);
    setDeleteActivityError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}/activities/${activityToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Unable to delete activity');
      }

      if (selectedActivityId === activityToDelete.id) {
        setSelectedActivityId(null);
      }

      await loadTrip();
      await loadBudget();
      setIsDeleteActivityOpen(false);
      setActivityToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete activity', err);
      setDeleteActivityError(err.message || 'Failed to delete activity');
    } finally {
      setIsDeletingActivity(false);
    }
  };

  // Handlers for Manual Budget Items CRUD
  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseLabel.trim()) {
      setAddBudgetItemError('Expense label is required');
      return;
    }

    const amount = Number(newExpenseAmount.replace(/[^0-9.]/g, '')) || 0;
    if (amount < 0) {
      setAddBudgetItemError('Amount must be non-negative');
      return;
    }

    setIsAddingBudgetItem(true);
    setAddBudgetItemError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/budget/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newExpenseCategory,
          label: newExpenseLabel.trim(),
          amount,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to create budget item');
      }

      await loadBudget();
      setIsAddBudgetItemOpen(false);
      setNewExpenseLabel('');
      setNewExpenseAmount('0');
      setNewExpenseCategory('flights');
    } catch (err: any) {
      console.error('Failed to add budget item:', err);
      setAddBudgetItemError(err.message || 'Failed to add budget item');
    } finally {
      setIsAddingBudgetItem(false);
    }
  };

  const openDeleteBudgetItemModal = (item: BudgetItem) => {
    setBudgetItemToDelete(item);
    setDeleteBudgetItemError(null);
    setIsDeleteBudgetItemOpen(true);
  };

  const handleDeleteBudgetItem = async () => {
    if (!budgetItemToDelete) return;

    setIsDeletingBudgetItem(true);
    setDeleteBudgetItemError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/budget/items/${budgetItemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to delete expense item');
      }

      await loadBudget();
      setIsDeleteBudgetItemOpen(false);
      setBudgetItemToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete budget item:', err);
      setDeleteBudgetItemError(err.message || 'Failed to delete expense item');
    } finally {
      setIsDeletingBudgetItem(false);
    }
  };

  if (isLoadingTrip && !trip) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading trip itinerary...</p>
        </div>
      </AppShell>
    );
  }

  if (tripError && !trip) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Failed to load trip</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tripError}</p>
          <div className="flex items-center gap-3 mt-2">
            <Button onClick={loadTrip} size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Retry
            </Button>
            <Link href="/trips">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Back to trips
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">

        {/* TOP COMMAND BAR & META HEADER */}
        <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 px-6 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sticky top-0 z-30">
          <div className="max-w-[1720px] mx-auto flex flex-col gap-3">

            {/* Breadcrumb & Real Owner Cluster */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Link href="/trips" className="hover:text-blue-600 transition-colors">Trips</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">
                  {trip?.title || 'Trip Itinerary'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span className="text-blue-600 font-semibold">
                  {viewMode === 'budget' ? 'Budget Breakdown' : 'Itinerary Builder'}
                </span>

                <div className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                  <span>{trip?.visibility === 'public' ? 'Public trip' : 'Private trip'}</span>
                </div>
              </div>

              {/* Action Cluster */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-slate-900">
                    <AvatarImage src={trip?.user?.avatar_url || undefined} alt={trip?.user?.name || 'Trip Owner'} />
                    <AvatarFallback className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {(trip?.user?.name || 'Owner').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {trip?.user?.name || 'Owner'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOptimizeOpen(true)}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 border-black/[0.08] dark:border-white/10 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                  <span>Review Order</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 border-black/[0.08] dark:border-white/10 text-slate-700 dark:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                  <span>PDF</span>
                </Button>

                {/* Visibility & Publishing Controls */}
                {trip?.visibility === 'public' ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>

                    <Button
                      size="sm"
                      onClick={handleCopyPublicUrl}
                      className="rounded-full h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      title="Copy publicly shareable link"
                    >
                      {copiedPublicUrl ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedPublicUrl ? 'Link Copied!' : 'Copy Public Link'}</span>
                    </Button>

                    <Link href={`/trips/${tripId}/view`} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-8 px-2.5 text-xs gap-1 border-black/[0.08] dark:border-white/10 text-slate-700 dark:text-slate-200"
                        title="Open public view in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPublishing}
                      onClick={() => handleToggleVisibility('private')}
                      className="rounded-full h-8 px-2.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Make this trip private"
                    >
                      {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Make Private'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3 h-3" />
                      <span>Private Draft</span>
                    </span>

                    <Button
                      size="sm"
                      disabled={isPublishing}
                      onClick={() => handleToggleVisibility('public')}
                      className="rounded-full h-8 px-3.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      title="Publish this trip to generate a shareable link"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      <span>{isPublishing ? 'Publishing...' : 'Publish Trip'}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {publishError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{publishError}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleVisibility(trip?.visibility === 'public' ? 'private' : 'public')}
                  className="h-7 text-xs px-2.5 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Title & View Switcher */}
            <div className="flex items-end justify-between gap-4 flex-wrap pb-1">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {trip?.title || 'Trip Itinerary'}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap font-medium">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>{trip?.start_date || 'Start date not set'} to {trip?.end_date || 'end date not set'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>{stops.length} stops, {stops.reduce((total, stop) => total + (stop.activities?.length || 0), 0)} activities</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Budget ₹{totalBudget.toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
              </div>

              {/* View mode switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-black/[0.04] dark:border-white/5 flex-wrap gap-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" strokeWidth={1.5} />
                  <span>Interactive Map &amp; Trendy</span>
                </button>
                <button
                  onClick={() => setViewMode('budget')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'budget'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                  <span>Budget</span>
                </button>
                <Link
                  href={`/calendar?tripId=${tripId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Calendar</span>
                </Link>
                <Link
                  href="/explore"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                  <span>Explore Hub</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 3-COLUMN WORKSPACE CANVAS */}
        <div className="max-w-[1720px] mx-auto w-full flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-130px)]">

          {/* LEFT COLUMN: Stop Outline & Stop Management */}
          <aside className="w-full lg:w-80 bg-white/60 dark:bg-slate-900/60 border-r border-black/[0.05] dark:border-white/10 p-4 flex flex-col justify-between shrink-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Itinerary Outline
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
                  </span>
                  <button
                    onClick={() => setIsAddStopOpen(true)}
                    title="Add new stop"
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {reorderError && (
                <div className="p-2 mb-1 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-[11px] text-red-700 dark:text-red-300 flex items-center justify-between">
                  <span>{reorderError}</span>
                  <button onClick={() => setReorderError(null)} className="text-red-500">✕</button>
                </div>
              )}

              {/* Stop Selector Buttons with Inline Actions */}
              <div className="flex flex-col gap-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                {itineraryDays.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center gap-2">
                    <MapPin className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    <span>No stops in this trip yet.</span>
                    <Button
                      size="sm"
                      onClick={() => setIsAddStopOpen(true)}
                      className="rounded-full text-xs h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add first stop</span>
                    </Button>
                  </div>
                ) : (
                  itineraryDays.map((day, index) => {
                    const isActive = selectedStop?.id === day.id && (viewMode === 'timeline' || viewMode === 'map');
                    const actualStop = stops[index];

                    return (
                      <div
                        key={day.id}
                        className={`group relative w-full text-left p-3 rounded-2xl transition-all duration-300 flex flex-col gap-1 border ${
                          isActive
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500/30 shadow-[0_4px_16px_rgba(37,99,235,0.06)]'
                            : 'bg-white/50 dark:bg-slate-900/40 border-black/[0.04] dark:border-white/5 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
                        )}

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedStopId(day.id);
                              if (viewMode === 'budget') {
                                setViewMode('timeline');
                              }
                              if (actualStop?.city) {
                                loadTrendySpotsForMap(actualStop.city);
                              }
                            }}
                            className="flex items-center gap-1.5 text-left"
                          >
                            <span className={`text-xs font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              Stop {day.dayNumber}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{day.date}</span>
                          </button>

                          {/* Reorder & Edit/Delete stop controls */}
                          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              disabled={index === 0 || isReorderingStops}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStop(day.id, 'up');
                              }}
                              title="Move Stop Up"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === stops.length - 1 || isReorderingStops}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStop(day.id, 'down');
                              }}
                              title="Move Stop Down"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actualStop) openEditStopModal(actualStop);
                              }}
                              title="Edit Stop"
                              className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actualStop) openDeleteStopModal(actualStop);
                              }}
                              title="Delete Stop"
                              className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedStopId(day.id);
                            setViewMode('timeline');
                          }}
                          className="text-left w-full"
                        >
                          <span className={`text-xs truncate block ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {day.title}{day.country ? `, ${day.country}` : ''}
                          </span>

                          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                            <span className="text-slate-400">{day.activitiesCount} activities</span>
                            <span className={`font-semibold ${isActive ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              ₹{day.cost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stop Actions & Budget Summary */}
            <div className="pt-4 flex flex-col gap-2.5">
              <Button
                variant="outline"
                onClick={() => setIsAddStopOpen(true)}
                className="w-full rounded-xl py-2 text-xs font-semibold gap-1.5 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Stop</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddActivityOpen(true)}
                  disabled={!selectedStop}
                  className="rounded-xl py-2 text-xs font-semibold gap-1.5 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  <span>Activity</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddBudgetItemOpen(true)}
                  className="rounded-xl py-2 text-xs font-semibold gap-1.5 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                  <span>Expense</span>
                </Button>
              </div>

              {/* Budget Footnote Card */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Total Planned
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹{totalPlannedCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {totalBudget > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      remainingBudget >= 0
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 text-teal-700 dark:text-teal-300'
                        : 'bg-red-50 dark:bg-red-950/60 border-red-200 text-red-700 dark:text-red-300'
                    }`}>
                      {Math.round((totalPlannedCost / totalBudget) * 100)}% Budget
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-medium">
                      No budget set
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Acts: ₹{totalActivitiesCost.toLocaleString('en-IN')}</span>
                  <span>Manual: ₹{totalManualItemsCost.toLocaleString('en-IN')}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'budget' ? 'timeline' : 'budget')}
                  className="w-full text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-0 font-semibold"
                >
                  {viewMode === 'budget' ? '← Back to Timeline' : 'View Budget Breakdown →'}
                </Button>
              </div>
            </div>
          </aside>

          {/* CENTER MAIN COLUMN */}
          {viewMode === 'timeline' ? (
            /* TIMELINE VIEW */
            <main className="flex-1 bg-transparent p-4 md:p-8 flex flex-col overflow-y-auto">

              {/* Stop Header & Quick Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.04] dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[11px] font-bold tracking-wider">
                      STOP {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {selectedStop?.city || 'No stop selected'}
                    </h2>
                    {selectedStop && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => openEditStopModal(selectedStop)}
                          title="Edit Stop Details"
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteStopModal(selectedStop)}
                          title="Delete Stop"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedStop?.arrival_date && selectedStop?.departure_date
                      ? `${selectedStop.arrival_date} – ${selectedStop.departure_date}`
                      : selectedStop?.arrival_date || selectedStop?.departure_date || 'Set stop dates to plan this part of your trip.'}
                  </p>
                </div>

                {/* Quick Command Bar */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs self-start md:self-auto flex-wrap">
                  <button
                    onClick={() => setIsAddStopOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                    <span>Add Stop</span>
                  </button>
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    disabled={!selectedStop}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                    <span>Add Activity</span>
                  </button>
                  <button
                    onClick={() => setIsAddBudgetItemOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
                    <span>Add Expense</span>
                  </button>
                  <button
                    onClick={() => setIsOptimizeOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Review order</span>
                  </button>
                </div>
              </div>

              {/* Timeline Flow Container */}
              <div className="relative flex flex-col gap-6 pt-6">

                {!selectedStop ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <MapPin className="w-8 h-8 text-slate-400 mb-2" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No stops added yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">Create your first stop to begin building and organizing your itinerary activities.</p>
                    <Button
                      size="sm"
                      onClick={() => setIsAddStopOpen(true)}
                      className="rounded-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add first stop</span>
                    </Button>
                  </div>
                ) : currentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 my-4">
                    <Clock className="w-8 h-8 text-slate-400 mb-2" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No activities scheduled yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                      Schedule your first activity, sightseeing visit, or dining reservation for {selectedStop.city}.
                    </p>
                    <Button
                      onClick={() => setIsAddActivityOpen(true)}
                      size="sm"
                      className="rounded-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add first activity</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Continuous vertical timeline ruler */}
                    <div className="absolute left-[38px] top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none" />

                    {/* Render timeline items */}
                    {currentActivities.map((activity, idx) => {
                      const isSelected = selectedActivity?.id === activity.id;

                      return (
                        <motion.div
                          key={activity.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          className="relative group flex items-start gap-4"
                        >
                          {/* Step Marker + Dot */}
                          <div className="flex flex-col items-center w-[76px] shrink-0 pt-2 z-10">
                            <span className={`font-mono text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'}`}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 uppercase">
                              STEP
                            </span>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mt-2 ring-2 ${
                              isSelected ? 'ring-blue-500 scale-110' : 'ring-slate-300 dark:ring-slate-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`} />
                            </div>
                          </div>

                          {/* Card Content with DoubleBezel */}
                          <div
                            onClick={() => setSelectedActivityId(activity.id)}
                            className={`flex-1 cursor-pointer transition-all duration-300 ${
                              isSelected ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                            }`}
                          >
                            <DoubleBezel
                              glow={isSelected}
                              innerClassName={`p-5 ${
                                isSelected
                                  ? 'border-l-4 border-l-blue-600 bg-white dark:bg-slate-900 ring-1 ring-blue-500/20'
                                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <GripVertical className="w-4 h-4 text-slate-300 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    {activity.title}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getActivityBadgeClass(activity.category)}`}>
                                    {ACTIVITY_CATEGORIES.find((c) => c.value === activity.category)?.label || activity.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                    ₹{Number(activity.cost || 0).toLocaleString('en-IN')}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(activity);
                                      }}
                                      title="Edit activity"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(activity);
                                      }}
                                      title="Delete activity"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2.5 ml-6">
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {activity.notes || 'No description or notes provided.'}
                                </p>
                                <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px] font-mono text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                                    <span>{[selectedStop.city, selectedStop.country].filter(Boolean).join(', ')}</span>
                                  </span>
                                  <span className="flex items-center gap-1 text-teal-600 font-semibold">
                                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    <span>{activity.duration_minutes} min</span>
                                  </span>
                                </div>
                              </div>
                            </DoubleBezel>
                          </div>
                        </motion.div>
                      );
                    })}

                    <button
                      onClick={() => setIsAddActivityOpen(true)}
                      className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:text-blue-600 transition-all ml-[76px]"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-xs font-semibold">
                        Add activity to {selectedStop.city}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </main>
          ) : viewMode === 'budget' ? (
            /* BUDGET BREAKDOWN VIEW */
            <main className="flex-1 bg-transparent p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">

              {/* Budget View Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/[0.04] dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white font-mono text-[11px] font-bold tracking-wider">
                      FINANCIAL BREAKDOWN
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Trip Budget &amp; Expenses
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Combined accounting of scheduled itinerary activity costs and manual expense line items.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsAddBudgetItemOpen(true)}
                    className="rounded-full text-xs h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Expense</span>
                  </Button>
                </div>
              </div>

              {/* Top 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Total Trip Budget</span>
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    ₹{totalBudget.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {totalBudget > 0 ? 'Allocated ceiling' : 'No budget set in trip'}
                  </span>
                </DoubleBezel>

                <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>Total Planned Costs</span>
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    ₹{totalPlannedCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-mono text-teal-600 font-semibold">
                    ₹{totalActivitiesCost.toLocaleString('en-IN')} acts + ₹{totalManualItemsCost.toLocaleString('en-IN')} manual
                  </span>
                </DoubleBezel>

                <DoubleBezel innerClassName="p-5 bg-white dark:bg-slate-900 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Remaining Balance</span>
                  </span>
                  <span className={`text-xl font-bold mt-1 ${
                    totalBudget > 0
                      ? remainingBudget >= 0
                        ? 'text-teal-600'
                        : 'text-red-600'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {totalBudget > 0
                      ? `₹${remainingBudget.toLocaleString('en-IN')}`
                      : 'N/A'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {totalBudget > 0
                      ? remainingBudget >= 0
                        ? `${Math.round((totalPlannedCost / totalBudget) * 100)}% budget consumed`
                        : `Over budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}`
                      : 'Requires trip budget limit'}
                  </span>
                </DoubleBezel>
              </div>

              {/* Source Distinction Card (Avoid Double Counting) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Expense Source Roll-up &amp; Distinction
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Zero double-counting guaranteed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">1. Scheduled Itinerary Activities</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{totalActivitiesCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Summed across all {stops.length} stops in itinerary
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">2. Manual Budget Items</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{totalManualItemsCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Flights, hotel stays, transit passes, gear
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col gap-1">
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">= Total Planned Expense</span>
                    <span className="text-base font-bold text-blue-700 dark:text-blue-300 font-mono">
                      ₹{totalPlannedCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-blue-600/80 dark:text-blue-400">
                      Combined total reflecting real trip cost
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Split: Manual Items List (Left) + Category Rollup (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Manual Expenses List (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Manual Expense Items
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {budgetSummary?.items.length || 0} items recorded
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddBudgetItemOpen(true)}
                      className="rounded-full text-xs h-8 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Expense</span>
                    </Button>
                  </div>

                  {budgetError ? (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
                      <span>{budgetError}</span>
                      <Button size="sm" onClick={loadBudget} className="rounded-full text-xs h-7">Retry</Button>
                    </div>
                  ) : (budgetSummary?.items || []).length === 0 ? (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-2 bg-white/40 dark:bg-slate-900/40">
                      <Receipt className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No manual expenses recorded</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        Add non-activity costs like airfare, accommodation, or travel insurance to complete your budget.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsAddBudgetItemOpen(true)}
                        className="rounded-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white mt-1 gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add first expense</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(budgetSummary?.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBudgetCategoryBadgeClass(item.category)}`}>
                              {BUDGET_CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => openDeleteBudgetItemModal(item)}
                              title="Delete expense"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Rollup Breakdown (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="pb-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Expenses by Category
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Aggregated totals from activities and manual line items
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.05] dark:border-white/10 shadow-xs flex flex-col gap-3">
                    {BUDGET_CATEGORIES.map((cat) => {
                      const amount = Number(budgetSummary?.by_category[cat.value] || 0);
                      const percentage = totalPlannedCost > 0 ? Math.round((amount / totalPlannedCost) * 100) : 0;

                      return (
                        <div key={cat.value} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                cat.value === 'flights' ? 'bg-blue-500' :
                                cat.value === 'hotels' ? 'bg-teal-500' :
                                cat.value === 'transport' ? 'bg-indigo-500' :
                                cat.value === 'food' ? 'bg-amber-500' :
                                cat.value === 'activities' ? 'bg-cyan-500' : 'bg-purple-500'
                              }`} />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {cat.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="text-slate-400">{percentage}%</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                ₹{amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300 bg-slate-800 dark:bg-slate-200"
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </main>
          ) : (
            /* INTERACTIVE MAP & TRENDY SPOTS VIEW */
            <main className="flex-1 bg-transparent p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">

              {/* Map Header & Stop Navigator */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/[0.04] dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[11px] font-bold tracking-wider">
                      LIVE REAL-WORLD MAP
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {mapCenter.name} &bull; Interactive Discovery
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Free OpenStreetMap tiles. Click pins to see authentic Reddit &amp; Instagram signals, and add any spot directly to this stop.
                  </p>
                </div>

                {/* Quick Stop Switcher Pills */}
                {stops.length > 0 && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      Active Stop:
                    </span>
                    {stops.map((stop, sIdx) => {
                      const isStopActive = selectedStop?.id === stop.id;
                      return (
                        <button
                          key={stop.id}
                          onClick={() => {
                            setSelectedStopId(stop.id);
                            loadTrendySpotsForMap(stop.city);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            isStopActive
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Stop {sIdx + 1}: {stop.city}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Area Quick Search & Discovery Presets Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!mapSearchInput.trim()) return;
                    loadTrendySpotsForMap(mapSearchInput.trim());
                  }}
                  className="flex items-center gap-2 flex-1 max-w-md"
                >
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search area (e.g. Ahmedabad, Shibuya, Kyoto)..."
                      value={mapSearchInput}
                      onChange={(e) => setMapSearchInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoadingMapSpots}
                    className="rounded-xl h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1"
                  >
                    {isLoadingMapSpots && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Locate</span>
                  </Button>
                </form>

                {/* Signature presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 shrink-0">Try:</span>
                  {[
                    { label: 'Ahmedabad Riverfront', query: 'Ahmedabad' },
                    { label: 'Shibuya, Tokyo', query: 'Shibuya' },
                    { label: 'Kyoto Temples', query: 'Kyoto' },
                    { label: 'Paris, France', query: 'Paris' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setMapSearchInput(preset.query);
                        loadTrendySpotsForMap(preset.query);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 transition-colors shrink-0"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Added to Stop Toast banner */}
              {mapToast && (
                <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-100 shrink-0" />
                    <span className="text-xs font-semibold">
                      Added &ldquo;{mapToast.spot}&rdquo; to {mapToast.stop}!
                    </span>
                  </div>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className="text-xs font-bold underline text-emerald-100 hover:text-white"
                  >
                    View in Timeline &rarr;
                  </button>
                </div>
              )}

              {/* Map Canvas */}
              <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-sm border border-black/[0.08] dark:border-white/10">
                <MapWrapper
                  center={mapCenter}
                  spots={mapSpots}
                  selectedSpot={selectedMapSpot}
                  onSelectSpot={setSelectedMapSpot}
                  onAddToTrip={handleAddSpotDirectly}
                />
              </div>

              {/* Trending Highlights Cards Carousel */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Trending Neighborhood Spots in {mapCenter.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Curated from Reddit, Instagram reels, and authentic local explorer guides.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {mapSpots.length} verified spots
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {mapSpots.map((spot) => {
                    const isSelected = selectedMapSpot?.id === spot.id;
                    return (
                      <div
                        key={spot.id}
                        onClick={() => setSelectedMapSpot(spot)}
                        className={`group p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 border ${
                          isSelected
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400/50 shadow-md ring-1 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-900 border-black/[0.05] dark:border-white/10 hover:border-black/[0.12] dark:hover:border-white/20 shadow-xs'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <Image
                              src={spot.imageUrl}
                              alt={spot.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                              {spot.category}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono font-bold text-amber-600 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {spot.rating}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {spot.cost}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                              {spot.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {spot.description}
                            </p>
                          </div>
                        </div>

                        {/* Social buzz quote */}
                        {spot.socialBuzz && (
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                            <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <span>{spot.socialBuzz.badge}</span>
                            </div>
                            <p className="line-clamp-1 italic mt-0.5">
                              &ldquo;{spot.socialBuzz.quote}&rdquo;
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-mono">
                            ~{spot.durationMinutes} mins
                          </span>
                          <Button
                            size="sm"
                            disabled={isAddingSpotToItinerary}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSpotDirectly(spot);
                            }}
                            className="h-7 px-3 text-[11px] rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Stop</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </main>
          )}

          {/* RIGHT COLUMN: Inspector */}
          <aside className="w-full lg:w-96 bg-white/60 dark:bg-slate-900/60 border-l border-black/[0.05] dark:border-white/10 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto">

            {viewMode === 'budget' ? (
              /* BUDGET SIDEBAR INSPECTOR */
              <>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Budget Summary
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-teal-600">
                    REALTIME TOTALS
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Itinerary
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {trip?.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {stops.length} stops • {totalActivitiesCost > 0 ? `₹${totalActivitiesCost.toLocaleString('en-IN')} activities` : 'No activity expenses'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Budget Status
                  </span>
                  <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Trip Budget:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{totalBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Planned Total:</span>
                      <span className="font-semibold text-teal-600">
                        ₹{totalPlannedCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Balance:</span>
                      <span className={`font-semibold ${remainingBudget >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                        {totalBudget > 0 ? `₹${remainingBudget.toLocaleString('en-IN')}` : 'No ceiling'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    onClick={() => setIsAddBudgetItemOpen(true)}
                    className="w-full rounded-xl text-xs gap-1.5 font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Expense</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('timeline')}
                    className="w-full rounded-xl text-xs gap-1.5 font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Return to Timeline</span>
                  </Button>
                </div>
              </>
            ) : viewMode === 'map' ? (
              /* MAP SPOT & RADAR INSPECTOR */
              <>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Spot Radar Inspector
                  </span>
                  <span className={`text-[11px] font-mono font-semibold ${selectedMapSpot ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {selectedMapSpot ? 'SELECTED SPOT' : 'CLICK A PIN'}
                  </span>
                </div>

                {selectedMapSpot ? (
                  <div className="flex flex-col gap-4">
                    {/* Hero image */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-black/[0.05] dark:border-white/10">
                      <Image
                        src={selectedMapSpot.imageUrl}
                        alt={selectedMapSpot.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          {selectedMapSpot.category}
                        </span>
                        <h3 className="text-base font-bold mt-1 text-white leading-tight">
                          {selectedMapSpot.name}
                        </h3>
                      </div>
                    </div>

                    {/* Quick stats bar */}
                    <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                        <span className="text-xs font-mono font-bold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {selectedMapSpot.rating}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cost</span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                          {selectedMapSpot.cost}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Time</span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                          ~{selectedMapSpot.durationMinutes}m
                        </span>
                      </div>
                    </div>

                    {/* Social radar citation */}
                    {selectedMapSpot.socialBuzz && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>{selectedMapSpot.socialBuzz.badge}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                          &ldquo;{selectedMapSpot.socialBuzz.quote}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Overview
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedMapSpot.description}
                      </p>
                    </div>

                    {/* Add to current stop CTA */}
                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        disabled={isAddingSpotToItinerary || !selectedStop}
                        onClick={() => handleAddSpotDirectly(selectedMapSpot)}
                        className="w-full rounded-xl text-xs gap-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      >
                        {isAddingSpotToItinerary ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Add to Stop {selectedDay}: {selectedStop?.city}</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setViewMode('timeline')}
                        className="w-full rounded-xl text-xs gap-1.5 font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Switch to Timeline View</span>
                      </Button>
                    </div>

                    {/* Already planned activities in this stop */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Already in {selectedStop?.city}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {currentActivities.length} planned
                        </span>
                      </div>

                      {currentActivities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No activities planned yet in this stop.</p>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                          {currentActivities.map((act) => (
                            <div
                              key={act.id}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {act.title}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                ₹{act.cost}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs">
                    <Compass className="w-8 h-8 text-indigo-500 mb-2" strokeWidth={1.5} />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Select a map pin</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Click any pin on the interactive map or select a trending spot from the cards below to view social signals and add it to your trip.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* TIMELINE ACTIVITY INSPECTOR */
              <>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Activity Inspector
                  </span>
                  <span className={`text-[11px] font-mono font-semibold ${selectedActivity ? 'text-blue-600' : 'text-slate-400'}`}>
                    {selectedActivity ? 'SELECTED' : 'IDLE'}
                  </span>
                </div>

                {!selectedActivity ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs">
                    <Info className="w-8 h-8 text-slate-400 mb-2" strokeWidth={1.5} />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No activity selected</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Select an activity from the timeline to view its details, budget impact, and notes, or create a new one.
                    </p>
                    <Button
                      onClick={() => setIsAddActivityOpen(true)}
                      disabled={!selectedStop}
                      size="sm"
                      className="rounded-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add activity</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        ACTIVITY #{selectedActivity.order_index + 1} • STOP {selectedDay}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                        {selectedActivity.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {[selectedStop?.city, selectedStop?.country].filter(Boolean).join(', ')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 shadow-xs flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Activity Overview
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${getActivityBadgeClass(selectedActivity.category)}`}>
                          {ACTIVITY_CATEGORIES.find((c) => c.value === selectedActivity.category)?.label || selectedActivity.category}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                        <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400">Stop Destination:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStop?.city}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400">Timeline Order:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Item #{selectedActivity.order_index + 1} of {currentActivities.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Stop Dates:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {selectedStop?.arrival_date || selectedStop?.departure_date || 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Duration
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedActivity.duration_minutes} min
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Scheduled time</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.04] dark:border-white/5 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Planned Cost
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <Wallet className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{Number(selectedActivity.cost || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-teal-600 font-medium">Estimated</span>
                      </div>
                    </div>

                    {/* Expense & Budget Impact */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Budget Impact
                      </span>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 flex flex-col gap-2 text-xs font-mono text-slate-500">
                        <div className="flex justify-between">
                          <span>Activity Cost</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            ₹{Number(selectedActivity.cost || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stop Total ({selectedStop?.city})</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            ₹{selectedStopTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trip Total Budget</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            ₹{totalBudget.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {totalBudget > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-slate-400">Share of Total Budget</span>
                              <span className="text-blue-600">
                                {((Number(selectedActivity.cost || 0) / totalBudget) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, Math.max(2, (Number(selectedActivity.cost || 0) / totalBudget) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="flex flex-col text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        <strong className="font-semibold text-amber-900 dark:text-amber-200">Logistics &amp; Notes:</strong>
                        <span>
                          {selectedActivity.notes || 'No specific notes recorded for this activity. Use Edit to add reservations, booking codes, or travel tips.'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                      <Button
                        onClick={() => openEditModal(selectedActivity)}
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs gap-1.5 font-semibold text-slate-700 dark:text-slate-200 border-black/[0.08] dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit Activity</span>
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(selectedActivity)}
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs gap-1.5 font-semibold text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Activity</span>
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

          </aside>
        </div>

        {/* DIALOG: ADD NEW STOP */}
        <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mb-2">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Add Trip Stop
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Add a destination city or waypoint to your trip itinerary.
              </DialogDescription>
            </DialogHeader>

            {addStopError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{addStopError}</span>
              </div>
            )}

            <form onSubmit={handleAddStop} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    City Name *
                  </label>
                  <CitySearchInput
                    required
                    disabled={isAddingStop}
                    placeholder="e.g. Ahmedabad, Shibuya, Kyoto"
                    value={stopCity}
                    onChange={(cityName, countryName) => {
                      setStopCity(cityName);
                      if (countryName) {
                        setStopCountry(countryName);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={isAddingStop}
                    placeholder="e.g. Japan"
                    value={stopCountry}
                    onChange={(e) => setStopCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    disabled={isAddingStop}
                    value={stopArrivalDate}
                    onChange={(e) => setStopArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    disabled={isAddingStop}
                    value={stopDepartureDate}
                    onChange={(e) => setStopDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAddingStop}
                  onClick={() => setIsAddStopOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingStop}
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isAddingStop ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Stop</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: EDIT STOP */}
        <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Edit Stop Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update city, country, and scheduled dates for this stop.
              </DialogDescription>
            </DialogHeader>

            {editStopError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{editStopError}</span>
              </div>
            )}

            <form onSubmit={handleEditStop} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    City Name *
                  </label>
                  <CitySearchInput
                    required
                    disabled={isEditingStop}
                    placeholder="e.g. Ahmedabad, Shibuya, Kyoto"
                    value={editStopCity}
                    onChange={(cityName, countryName) => {
                      setEditStopCity(cityName);
                      if (countryName) {
                        setEditStopCountry(countryName);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={isEditingStop}
                    value={editStopCountry}
                    onChange={(e) => setEditStopCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    disabled={isEditingStop}
                    value={editStopArrivalDate}
                    onChange={(e) => setEditStopArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    disabled={isEditingStop}
                    value={editStopDepartureDate}
                    onChange={(e) => setEditStopDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isEditingStop}
                  onClick={() => setIsEditStopOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingStop}
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isEditingStop ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: DELETE STOP CONFIRMATION */}
        <Dialog open={isDeleteStopOpen} onOpenChange={setIsDeleteStopOpen}>
          <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 mb-2">
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Delete Stop
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Are you sure you want to delete &ldquo;{stopToDelete?.city}&rdquo;? All {stopToDelete?.activities?.length || 0} scheduled activities in this stop will also be removed.
              </DialogDescription>
            </DialogHeader>

            {deleteStopError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{deleteStopError}</span>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletingStop}
                onClick={() => setIsDeleteStopOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingStop}
                onClick={handleDeleteStop}
                className="rounded-full text-xs bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isDeletingStop ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Stop</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: ADD NEW ACTIVITY */}
        <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Add Activity
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Add a new activity to Stop {selectedDay} ({selectedStop?.city || 'Selected stop'}).
              </DialogDescription>
            </DialogHeader>

            {addActivityError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{addActivityError}</span>
              </div>
            )}

            <form onSubmit={handleAddActivity} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isAddingActivity}
                  placeholder="e.g. Traditional Tea Ceremony at Uji"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={addCategory}
                    disabled={isAddingActivity}
                    onChange={(e) => setAddCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Est. Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isAddingActivity}
                    value={addCost}
                    onChange={(e) => setAddCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    disabled={isAddingActivity}
                    value={addDuration}
                    onChange={(e) => setAddDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Logistics Notes
                </label>
                <textarea
                  rows={3}
                  disabled={isAddingActivity}
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Ticket details, booking references, or tips..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAddingActivity}
                  onClick={() => setIsAddActivityOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingActivity}
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isAddingActivity ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Activity</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: EDIT ACTIVITY */}
        <Dialog open={isEditActivityOpen} onOpenChange={setIsEditActivityOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Edit Activity
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update details for this activity. Changes are persisted immediately.
              </DialogDescription>
            </DialogHeader>

            {editActivityError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{editActivityError}</span>
              </div>
            )}

            <form onSubmit={handleEditActivity} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditingActivity}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    disabled={isEditingActivity}
                    onChange={(e) => setEditCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Est. Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isEditingActivity}
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    disabled={isEditingActivity}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Logistics Notes
                </label>
                <textarea
                  rows={3}
                  disabled={isEditingActivity}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ticket details, booking references, or tips..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isEditingActivity}
                  onClick={() => setIsEditActivityOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingActivity}
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isEditingActivity ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Activity</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: DELETE ACTIVITY CONFIRMATION */}
        <Dialog open={isDeleteActivityOpen} onOpenChange={setIsDeleteActivityOpen}>
          <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 mb-2">
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Delete Activity
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Are you sure you want to remove &ldquo;{activityToDelete?.title}&rdquo; from Stop {selectedDay}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {deleteActivityError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{deleteActivityError}</span>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletingActivity}
                onClick={() => setIsDeleteActivityOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingActivity}
                onClick={handleDeleteActivity}
                className="rounded-full text-xs bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isDeletingActivity ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Activity</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: ADD MANUAL BUDGET ITEM */}
        <Dialog open={isAddBudgetItemOpen} onOpenChange={setIsAddBudgetItemOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 mb-2">
                <Receipt className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Add Manual Expense
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Record flights, hotel bookings, transit passes, or other fixed expenses not tied to a single itinerary stop activity.
              </DialogDescription>
            </DialogHeader>

            {addBudgetItemError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{addBudgetItemError}</span>
              </div>
            )}

            <form onSubmit={handleAddBudgetItem} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expense Label *
                </label>
                <input
                  type="text"
                  required
                  disabled={isAddingBudgetItem}
                  placeholder="e.g. Roundtrip Airfare SFO-NRT"
                  value={newExpenseLabel}
                  onChange={(e) => setNewExpenseLabel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newExpenseCategory}
                    disabled={isAddingBudgetItem}
                    onChange={(e) => setNewExpenseCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    disabled={isAddingBudgetItem}
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAddingBudgetItem}
                  onClick={() => setIsAddBudgetItemOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingBudgetItem}
                  className="rounded-full text-xs bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {isAddingBudgetItem ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Expense</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: DELETE MANUAL BUDGET ITEM CONFIRMATION */}
        <Dialog open={isDeleteBudgetItemOpen} onOpenChange={setIsDeleteBudgetItemOpen}>
          <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 mb-2">
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Delete Expense Item
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Are you sure you want to remove &ldquo;{budgetItemToDelete?.label}&rdquo; (₹{Number(budgetItemToDelete?.amount || 0).toLocaleString('en-IN')})? This will update your trip budget totals immediately.
              </DialogDescription>
            </DialogHeader>

            {deleteBudgetItemError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{deleteBudgetItemError}</span>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletingBudgetItem}
                onClick={() => setIsDeleteBudgetItemOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingBudgetItem}
                onClick={handleDeleteBudgetItem}
                className="rounded-full text-xs bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isDeletingBudgetItem ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Expense</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: REVIEW / REORDER STOPS */}
        <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 flex items-center justify-center text-teal-600 mb-2">
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Trip Stops &amp; Sequence
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Stops are displayed in chronological sequence. Use the up and down arrows to adjust stop order.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 my-3 max-h-[300px] overflow-y-auto pr-1">
              {stops.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No stops created for this trip yet.</p>
              ) : (
                stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                          {stop.city}{stop.country ? `, ${stop.country}` : ''}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {stop.arrival_date || stop.departure_date || 'Dates not set'} • {stop.activities?.length || 0} activities
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0 || isReorderingStops}
                        onClick={() => handleMoveStop(stop.id, 'up')}
                        title="Move Up"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === stops.length - 1 || isReorderingStops}
                        onClick={() => handleMoveStop(stop.id, 'down')}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOptimizeOpen(false);
                  setIsAddStopOpen(true);
                }}
                className="rounded-full text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Stop</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOptimizeOpen(false)}
                className="rounded-full text-xs"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}
