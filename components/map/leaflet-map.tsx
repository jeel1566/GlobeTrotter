'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import { Star, PlusCircle, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrendySpot, CityCenterInfo } from '@/app/api/places/trendy/route';

// Controller to smoothly animate the map when center or zoom changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  return null;
}

// Custom styled pin generator using L.divIcon
function createCustomPin(spot: TrendySpot, isSelected: boolean) {
  const categoryColors: Record<string, { bg: string; text: string; ring: string }> = {
    nature: { bg: '#059669', text: '#ffffff', ring: 'rgba(16, 185, 129, 0.35)' },
    food: { bg: '#D97706', text: '#ffffff', ring: 'rgba(245, 158, 11, 0.35)' },
    culture: { bg: '#2563EB', text: '#ffffff', ring: 'rgba(37, 99, 235, 0.35)' },
    adventure: { bg: '#EA580C', text: '#ffffff', ring: 'rgba(234, 88, 12, 0.35)' },
    nightlife: { bg: '#7C3AED', text: '#ffffff', ring: 'rgba(124, 58, 237, 0.35)' },
  };

  const colors = categoryColors[spot.category] || { bg: '#334155', text: '#ffffff', ring: 'rgba(51, 65, 85, 0.35)' };
  const shortName = spot.name.split(' ').slice(0, 2).join(' ');

  const html = `
    <div style="
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      background: ${isSelected ? '#0F172A' : '#FFFFFF'};
      color: ${isSelected ? '#FFFFFF' : '#0F172A'};
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      border: 2px solid ${colors.bg};
      cursor: pointer;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      transform: translate(-50%, -50%) scale(${isSelected ? 1.15 : 1});
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <span style="
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background: ${colors.bg};
        box-shadow: 0 0 0 3px ${colors.ring};
        display: inline-block;
      "></span>
      <span>${shortName}</span>
      ${spot.isTopPick ? '<span style="color: #F59E0B; font-size: 10px;">★</span>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-pin',
    iconSize: [120, 36],
    iconAnchor: [60, 18],
    popupAnchor: [0, -20],
  });
}

interface LeafletMapProps {
  center: CityCenterInfo;
  spots: TrendySpot[];
  selectedSpot: TrendySpot | null;
  onSelectSpot: (_spot: TrendySpot) => void;
  onAddToTrip: (_spot: TrendySpot) => void;
}

export default function LeafletMap({
  center,
  spots,
  selectedSpot,
  onSelectSpot,
  onAddToTrip,
}: LeafletMapProps) {
  const mapCenterCoordinates: [number, number] = useMemo(() => {
    if (selectedSpot) {
      return [selectedSpot.latitude, selectedSpot.longitude];
    }
    return [center.latitude, center.longitude];
  }, [center.latitude, center.longitude, selectedSpot]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-inner border border-black/[0.08] dark:border-white/10 z-0">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={center.zoom || 13}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[420px] z-0"
        attributionControl={false}
      >
        <MapViewController center={mapCenterCoordinates} zoom={center.zoom || 13} />

        {/* 100% Free OpenStreetMap raster tiles (Zero API keys or signups required) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          subdomains="abc"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {spots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const pinIcon = createCustomPin(spot, isSelected);

          return (
            <Marker
              key={spot.id}
              position={[spot.latitude, spot.longitude]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onSelectSpot(spot),
              }}
            >
              <Popup className="custom-leaflet-popup" minWidth={260} maxWidth={320}>
                <div className="flex flex-col gap-2.5 p-1 text-slate-900 font-sans">
                  {/* Photo thumbnail */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={spot.imageUrl}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    {spot.isTopPick && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-teal-800 flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>Top Pick</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Tag */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {spot.tag}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{spot.rating}</span>
                        <span className="text-slate-400 font-normal">({spot.reviewsCount})</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                      {spot.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  {/* Social Buzz Badge */}
                  {spot.socialBuzz && (
                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[10px] text-amber-900">
                      <div className="font-bold flex items-center gap-1">
                        <span>{spot.socialBuzz.badge}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 italic">
                        {spot.socialBuzz.quote}
                      </p>
                    </div>
                  )}

                  {/* Pricing & Add to Trip Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {spot.cost}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => onAddToTrip(spot)}
                      className="rounded-full h-7 px-3 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1 shadow-xs"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Add to Trip</span>
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map watermark / Attribution badge */}
      <div className="absolute bottom-2 right-3 z-10 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-[9px] text-slate-500 font-mono flex items-center gap-1.5 shadow-xs pointer-events-none">
        <MapPin className="w-2.5 h-2.5 text-blue-600" />
        <span>OpenStreetMap Live</span>
      </div>
    </div>
  );
}
