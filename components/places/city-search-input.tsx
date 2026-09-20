'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { PlaceSearchResult } from '@/types/database';

interface CitySearchInputProps {
  value: string;
  onChange: (_city: string, _country?: string, _coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CitySearchInput({
  value,
  onChange,
  placeholder = 'e.g. Ahmedabad, Shibuya, Paris',
  disabled = false,
  required = false,
  className = '',
}: CitySearchInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Keep local query in sync if parent changes value externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Only search if the user has focused or interacted (avoid search when value was initialized)
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.data || []);
        }
      } catch (err) {
        console.error('Failed to autocomplete city:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (place: PlaceSearchResult) => {
    setQuery(place.name);
    setIsOpen(false);
    onChange(place.name, place.country, { lat: place.latitude, lng: place.longitude });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    onChange(val);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          className={`w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all ${className}`}
        />
        <div className="absolute left-3 pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/10 shadow-lg py-1.5 text-xs">
          {suggestions.map((place) => (
            <li
              key={place.place_id || `${place.name}-${place.latitude}`}
              onMouseDown={() => handleSelect(place)}
              className="px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center gap-2.5 transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {place.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {place.formatted_address || place.country}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
