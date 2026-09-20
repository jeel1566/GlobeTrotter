'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';
import { TrendySpot, CityCenterInfo } from '@/app/api/places/trendy/route';

interface MapWrapperProps {
  center: CityCenterInfo;
  spots: TrendySpot[];
  selectedSpot: TrendySpot | null;
  onSelectSpot: (_spot: TrendySpot) => void;
  onAddToTrip: (_spot: TrendySpot) => void;
}

// Dynamically import LeafletMap with SSR disabled to prevent 'window is not defined'
const DynamicLeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-black/[0.08] dark:border-white/10 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="relative">
        <MapPin className="w-8 h-8 text-blue-500 animate-bounce" />
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Initializing OpenStreetMap tiles...
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Loading live coordinates and neighborhood pins
        </p>
      </div>
    </div>
  ),
});

export function MapWrapper(props: MapWrapperProps) {
  return <DynamicLeafletMap {...props} />;
}
