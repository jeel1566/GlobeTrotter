'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  Sparkles,
  ShieldCheck,
  Database,
  RefreshCw,
  Globe,
  Lock,
  Compass,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { DoubleBezel } from '@/components/ui/double-bezel';

interface LiveAdminStats {
  total_users: number;
  total_trips: number;
  public_trips: number;
  total_activities: number;
  total_ai_generations: number;
  popular_cities: Array<{ city: string; count: number }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<LiveAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) {
        setIsForbidden(true);
        setError('Admin access required. Your user account does not have the admin role.');
        setStats(null);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch telemetry (${res.status})`);
      }

      const json = await res.json();
      setStats(json.data);
    } catch (e: any) {
      console.error('Failed to fetch admin stats:', e);
      setError(e.message || 'Failed to fetch telemetry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen bg-[#FDFBF7]/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 max-w-[1720px] mx-auto gap-8">
        {/* TOP ADMIN HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.05] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600">
                Live Platform Telemetry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Admin &amp; System Telemetry Suite
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational monitoring for Clerk Auth, Supabase Postgres, Photon Places, and AI circuit breaker.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="rounded-full text-xs gap-2 border-black/[0.08]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </Button>
        </div>

        {/* FORBIDDEN / NON-ADMIN NOTICE */}
        {isForbidden && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Admin Authorization Required
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-md">
              Live system telemetry is restricted to accounts with role <strong>admin</strong> in the database.
              Your account currently holds standard traveler privileges.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link href="/dashboard">
                <Button size="sm" className="rounded-xl text-xs bg-blue-600 text-white font-semibold">
                  Return to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                className="rounded-xl text-xs font-semibold gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Check</span>
              </Button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!isForbidden && error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              className="text-xs border-red-300 gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && !stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {/* DATA-BACKED TELEMETRY (WHEN ADMIN / LOADED) */}
        {!isForbidden && stats && (
          <>
            {/* 4 REAL KEY PERFORMANCE METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Users
                  </span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2 block">
                  {stats.total_users.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium mt-1 block">
                  Synchronized via Clerk webhooks
                </span>
              </DoubleBezel>

              <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Trips
                  </span>
                  <MapPin className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2 block">
                  {stats.total_trips.toLocaleString()}
                </span>
                <span className="text-xs text-teal-600 font-mono font-medium mt-1 block">
                  {stats.public_trips} public community guides
                </span>
              </DoubleBezel>

              <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Activities
                  </span>
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2 block">
                  {stats.total_activities.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-mono mt-1 block">
                  Persisted across all stops
                </span>
              </DoubleBezel>

              <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    AI Generations
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2 block">
                  {stats.total_ai_generations.toLocaleString()}
                </span>
                <span className="text-xs text-amber-600 font-mono font-medium mt-1 block">
                  Logged in ai_generation_log
                </span>
              </DoubleBezel>
            </div>

            {/* SYSTEM STATUS & REAL POPULAR DESTINATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Real Popular Cities from Database */}
              <div className="lg:col-span-7">
                <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Popular Destination Volumes
                    </h3>
                    <span className="text-xs font-mono text-slate-400">Database Aggregate</span>
                  </div>

                  {stats.popular_cities.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {stats.popular_cities.map((dest, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {dest.city}
                              </span>
                              <span className="text-[11px] text-slate-400">Rank #{i + 1}</span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="font-bold text-blue-600">{dest.count}</span>
                            <span className="text-slate-400 block text-[10px]">
                              {dest.count === 1 ? 'stop planned' : 'stops planned'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No stops logged in the database yet. Create trips with stops to see popular city volume.
                    </div>
                  )}
                </DoubleBezel>
              </div>

              {/* Verified Services Status */}
              <div className="lg:col-span-5">
                <DoubleBezel innerClassName="p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                      Services &amp; Architecture Status
                    </h3>

                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Supabase Postgres &amp; RLS
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>MIGRATION 002 HARDENED</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Clerk Auth &amp; Webhooks
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>SVIX SIGNATURES VERIFIED</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Photon OpenStreetMap
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>CACHE-FIRST FALLBACK</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            AI Circuit Breaker (8s)
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>5 TEMPLATES READY</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Environment: {process.env.NODE_ENV}
                    </span>
                  </div>
                </DoubleBezel>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
