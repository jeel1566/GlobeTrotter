"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, IndianRupee, Globe, Lock, MapPin, ArrowUpRight } from "lucide-react";


interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (_newTrip: any) => void;
}

export default function CreateTripModal({ isOpen, onClose, onTripCreated }: CreateTripModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-10-12");
  const [endDate, setEndDate] = useState("2026-10-22");
  const [budget, setBudget] = useState("250000");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [coverImage] = useState(
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Japan Autumn Odyssey 2026",
          destination: destination || "Japan (Tokyo, Kyoto, Osaka)",
          startDate,
          endDate,
          budgetTotal: parseFloat(budget) || 250000,
          coverImage,
          visibility,
          status: "active",
        }),
      });

      const json = await res.json();
      if (json.data) {
        if (onTripCreated) onTripCreated(json.data);
        onClose();
        router.push(`/trips`);
      }
    } catch (err) {
      console.error("Failed to create trip:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-md animate-in fade-in">
      {/* Doppelrand Outer Shell */}
      <div className="p-2 rounded-[2.5rem] bg-black/[0.05] ring-1 ring-black/[0.06] w-full max-w-lg animate-in zoom-in-95 duration-200">
        {/* Doppelrand Inner Core */}
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-2xl">
          {/* Modal Header */}
          <div className="p-6 sm:p-8 pb-4 border-b border-black/[0.05] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/[0.03] border border-black/[0.06] text-obsidian-900/70 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                Curate Route
              </div>
              <h2 className="text-2xl font-bold text-obsidian-900 tracking-tight">Plan New Expedition</h2>
              <p className="text-xs text-obsidian-900/50 mt-0.5 font-light">Set itinerary destination, dates, and baseline cap</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.03] text-obsidian-900/60 hover:text-obsidian-900 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.3} />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-obsidian-900 mb-1">Expedition Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Japan Autumn Odyssey 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-obsidian-900 mb-1">Destination & Core Stops</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo, Kyoto, Osaka"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-obsidian-900 mb-1">Departure</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-obsidian-900 mb-1">Return</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-obsidian-900 mb-1">Total Budget Cap (INR)</label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-obsidian-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.3} />
                <input
                  type="number"
                  placeholder="250000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-obsidian-900 mb-1">Visibility & Collaboration</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    visibility === "private"
                      ? "border-obsidian-900 bg-obsidian-900 text-white shadow-hardware"
                      : "border-black/[0.08] bg-canvas-subtle/40 text-obsidian-900/70 hover:bg-black/[0.03]"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" strokeWidth={1.3} />
                  <span>Private Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    visibility === "public"
                      ? "border-obsidian-900 bg-obsidian-900 text-white shadow-hardware"
                      : "border-black/[0.08] bg-canvas-subtle/40 text-obsidian-900/70 hover:bg-black/[0.03]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.3} />
                  <span>Public Route</span>
                </button>
              </div>
            </div>

            {/* Submission buttons: Button-in-Button */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full border border-black/[0.08] text-obsidian-900/70 font-semibold text-xs hover:bg-black/[0.03] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group flex-1 py-2 px-4 rounded-full bg-obsidian-900 text-white font-semibold text-xs hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury flex items-center justify-center gap-2 shadow-hardware"
              >
                {loading ? (
                  <span>Synthesizing...</span>
                ) : (
                  <>
                    <span>Assemble Plan</span>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="w-3 h-3 text-brand-200" strokeWidth={1.4} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
