'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendySpot } from '@/app/api/places/trendy/route';
import { Trip, TripStop } from '@/types/database';
import { Loader2, PlusCircle, CheckCircle2, AlertCircle, ArrowRight, MapPin } from 'lucide-react';

interface AddSpotModalProps {
  spot: TrendySpot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (_spotName: string, _tripTitle: string) => void;
}

export function AddSpotModal({ spot, isOpen, onClose, onSuccess }: AddSpotModalProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string>('');

  const [customCost, setCustomCost] = useState<string>('0');
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTrip, setSuccessTrip] = useState<{ id: string; title: string } | null>(null);

  // Load user trips when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSuccessTrip(null);
      setErrorMessage(null);
      return;
    }

    async function loadTrips() {
      setLoadingTrips(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const json = await res.json();
          const userTrips: Trip[] = json.data || [];
          setTrips(userTrips);
          if (userTrips.length > 0) {
            setSelectedTripId(userTrips[0].id);
          }
        }
      } catch (e: any) {
        setErrorMessage('Failed to load your trips. Please try again.');
      } finally {
        setLoadingTrips(false);
      }
    }

    loadTrips();
  }, [isOpen]);

  // Pre-fill cost and duration from spot
  useEffect(() => {
    if (spot) {
      setCustomCost(spot.costEstimateNumber.toString());
      setCustomDuration(spot.durationMinutes || 60);
    }
  }, [spot]);

  // Fetch stops for the selected trip
  useEffect(() => {
    if (!selectedTripId) {
      setTripStops([]);
      setSelectedStopId('');
      return;
    }

    async function loadStops() {
      setLoadingStops(true);
      try {
        const res = await fetch(`/api/trips/${selectedTripId}`);
        if (res.ok) {
          const json = await res.json();
          const stops: TripStop[] = json.data?.trip_stops || json.data?.stops || [];
          setTripStops(stops);
          if (stops.length > 0) {
            // Pick a matching city stop if available, or default to first
            const matchingStop = stops.find((s) => spot && s.city.toLowerCase().includes(spot.city.toLowerCase()));
            setSelectedStopId(matchingStop ? matchingStop.id : stops[0].id);
          } else {
            setSelectedStopId('');
          }
        }
      } catch (e) {
        console.error('Failed to load trip stops:', e);
      } finally {
        setLoadingStops(false);
      }
    }

    loadStops();
  }, [selectedTripId, spot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spot || !selectedTripId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let targetStopId = selectedStopId;

      // If trip has no stops, auto-create a stop for this spot's city first!
      if (!targetStopId) {
        const createStopRes = await fetch(`/api/trips/${selectedTripId}/stops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: spot.city,
            country: spot.country,
          }),
        });

        if (!createStopRes.ok) {
          const err = await createStopRes.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to initialize stop for this city');
        }

        const stopJson = await createStopRes.json();
        targetStopId = stopJson.data?.id;
      }

      // Add activity to the stop
      const activityRes = await fetch(`/api/trips/${selectedTripId}/stops/${targetStopId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: spot.name,
          category: spot.category,
          cost: Number(customCost) || 0,
          duration_minutes: Number(customDuration) || 60,
          notes: spot.socialBuzz?.badge
            ? `${spot.socialBuzz.badge}: ${spot.socialBuzz.quote}`
            : spot.description,
        }),
      });

      if (!activityRes.ok) {
        const err = await activityRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add activity to trip');
      }

      const activeTrip = trips.find((t) => t.id === selectedTripId);
      setSuccessTrip({ id: selectedTripId, title: activeTrip?.title || 'Trip' });
      onSuccess(spot.name, activeTrip?.title || 'your trip');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong saving to your itinerary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/10 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
              Itinerary Builder Quick-Add
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Add to Itinerary
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Schedule &ldquo;{spot?.name}&rdquo; into your personal travel plan.
          </DialogDescription>
        </DialogHeader>

        {successTrip ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Activity Scheduled!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                &ldquo;{spot?.name}&rdquo; has been added to <strong>{successTrip.title}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-full text-xs"
              >
                Close
              </Button>
              <Link href={`/trips/${successTrip.id}`}>
                <Button
                  size="sm"
                  className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <span>Open Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Target Trip Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Trip *
              </label>
              {loadingTrips ? (
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading trips...</span>
                </div>
              ) : trips.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                  <p>You don&apos;t have any active trips yet.</p>
                  <Link href="/trips/create" className="underline font-bold mt-1 inline-block">
                    Create your first trip now →
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.start_date || 'Dates TBD'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Stop Day Selector */}
            {selectedTripId && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Itinerary Stop / Day
                </label>
                {loadingStops ? (
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading stops...</span>
                  </div>
                ) : tripStops.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>A new stop for <strong>{spot?.city}</strong> will be auto-created for this trip.</span>
                  </div>
                ) : (
                  <select
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tripStops.map((stop, idx) => (
                      <option key={stop.id} value={stop.id}>
                        Stop {idx + 1}: {stop.city} {stop.arrival_date ? `(${stop.arrival_date})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Cost & Duration Customization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Est. Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || trips.length === 0}
                className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Itinerary...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Add</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
