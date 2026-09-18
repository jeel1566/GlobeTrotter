"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Bot,
  Landmark,
  UtensilsCrossed,
  MapPin,
  Footprints,
  Utensils,
  Trees,
  Coffee,
  Sun,
  Plus,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";


interface AskAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToItinerary?: (_activities: any[]) => void;
  tripTitle?: string;
}

export default function AskAIAssistant({
  isOpen,
  onClose,
  onAddToItinerary,
  tripTitle = "Japan Autumn Odyssey 2026",
}: AskAIAssistantProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "modify" | "suggestions">("generate");
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [added, setAdded] = useState(false);
  const [generationStage, setGenerationStage] = useState("");

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; data?: any }>>([
    {
      role: "user",
      text: "Plan a 2 day itinerary for Kyoto with a mix of culture, food and scenic spots. Keep it under ₹15,000.",
    },
    {
      role: "assistant",
      text: "Here is an elevated 2-day architectural itinerary for Kyoto, balancing historic shrines with morning market tastings and tea ceremonies.",
      data: {
        days: [
          {
            dayNumber: 1,
            title: "Day 1 – Kyoto Classics",
            items: [
              { time: "09:00 AM", title: "Fushimi Inari Shrine", category: "Culture", icon: Landmark, badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]" },
              { time: "12:00 PM", title: "Lunch at Nishiki Market", category: "Food", icon: UtensilsCrossed, badgeBg: "bg-brand-50 text-brand-800 border border-brand-200/50" },
              { time: "02:00 PM", title: "Kiyomizu-dera Temple", category: "Culture", icon: MapPin, badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]" },
              { time: "05:00 PM", title: "Gion Historic Lantern Walk", category: "Culture", icon: Footprints, badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]" },
              { time: "07:00 PM", title: "Dinner – Kaiseki Experience", category: "Food", icon: Utensils, badgeBg: "bg-brand-50 text-brand-800 border border-brand-200/50" },
            ],
          },
          {
            dayNumber: 2,
            title: "Day 2 – Bamboo Groves & Local Tea",
            items: [
              { time: "09:00 AM", title: "Arashiyama Bamboo Grove", category: "Nature", icon: Trees, badgeBg: "bg-emerald-50 text-emerald-800 border border-emerald-200/50" },
              { time: "12:00 PM", title: "Lunch at Riverside Soba", category: "Food", icon: Coffee, badgeBg: "bg-brand-50 text-brand-800 border border-brand-200/50" },
              { time: "02:00 PM", title: "Tenryu-ji Zen Garden", category: "Culture", icon: Landmark, badgeBg: "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]" },
              { time: "05:00 PM", title: "Togetsukyo Bridge (Sunset)", category: "Nature", icon: Sun, badgeBg: "bg-emerald-50 text-emerald-800 border border-emerald-200/50" },
            ],
          },
        ],
      },
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setInputValue("");
    setIsGenerating(true);
    setAdded(false);

    setGenerationStage("Analyzing destination telemetry...");
    setTimeout(() => setGenerationStage("Querying localized place nodes & caching..."), 300);
    setTimeout(() => setGenerationStage("Synthesizing balanced pacing & estimated budget..."), 600);

    try {
      const res = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, destination: prompt, duration_days: 2 }),
      });
      const json = await res.json();
      setIsGenerating(false);

      if (json.data && json.data.days) {
        const enrichedDays = json.data.days.map((d: any) => ({
          ...d,
          items: d.items.map((it: any) => {
            let icon = MapPin;
            let badgeBg = "bg-black/[0.03] text-obsidian-900 border border-black/[0.05]";
            const cat = (it.category || "culture").toLowerCase();
            if (cat === "food") {
              icon = UtensilsCrossed;
              badgeBg = "bg-brand-50 text-brand-800 border border-brand-200/50";
            } else if (cat === "nature") {
              icon = Trees;
              badgeBg = "bg-emerald-50 text-emerald-800 border border-emerald-200/50";
            } else if (cat === "adventure") {
              icon = Sun;
              badgeBg = "bg-amber-50 text-amber-800 border border-amber-200/50";
            } else if (cat === "culture") {
              icon = Landmark;
            }
            return { ...it, icon, badgeBg };
          }),
        }));

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `Here is a curated itinerary formulated for "${prompt}" (Est. ₹${json.data.estimated_budget.toLocaleString()}):`,
            data: { days: enrichedDays },
          },
        ]);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Here are curated architectural recommendations for "${prompt}":`,
        },
      ]);
    }
  };

  const handleAdd = (daysData: any) => {
    if (onAddToItinerary) {
      onAddToItinerary(daysData);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-canvas/95 backdrop-blur-2xl border-l border-black/[0.06] shadow-hardware-elevated flex flex-col z-50 animate-in slide-in-from-right duration-500 ease-luxury"
      data-purpose="ask-ai-drawer"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-black/[0.05] flex items-center justify-between bg-canvas/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-black/[0.03] ring-1 ring-black/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-obsidian-900 text-white flex items-center justify-center shadow-hardware">
              <Sparkles className="w-4 h-4 text-brand-200" strokeWidth={1.4} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-obsidian-900 leading-tight font-sans">AI Copilot</h3>
              <span className="bg-brand-50 text-brand-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-brand-200/60">
                GPT-4o Engine
              </span>
            </div>
            <p className="text-[10px] text-obsidian-900/40 mt-0.5">Active Context: {tripTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-black/[0.03] text-obsidian-900/60 hover:text-obsidian-900 hover:bg-black/[0.06] flex items-center justify-center transition-colors duration-300"
          aria-label="Close Assistant"
        >
          <X className="w-4 h-4" strokeWidth={1.3} />
        </button>
      </div>

      {/* Mode Selector Pill Switcher */}
      <div className="px-5 py-3 border-b border-black/[0.04] bg-canvas-subtle/30 shrink-0">
        <div className="p-1 rounded-full bg-black/[0.03] ring-1 ring-black/[0.04] flex text-xs font-medium">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 text-xs font-semibold ${
              activeTab === "generate" ? "bg-white text-obsidian-900 shadow-hardware ring-1 ring-black/[0.04]" : "text-obsidian-900/60 hover:text-obsidian-900"
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab("modify")}
            className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 text-xs font-semibold ${
              activeTab === "modify" ? "bg-white text-obsidian-900 shadow-hardware ring-1 ring-black/[0.04]" : "text-obsidian-900/60 hover:text-obsidian-900"
            }`}
          >
            Modify
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 text-xs font-semibold ${
              activeTab === "suggestions" ? "bg-white text-obsidian-900 shadow-hardware ring-1 ring-black/[0.04]" : "text-obsidian-900/60 hover:text-obsidian-900"
            }`}
          >
            Suggestions
          </button>
        </div>
      </div>

      {/* Drawer Chat Stream Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {messages.map((msg, index) => (
          <div key={index} className="space-y-3">
            {msg.role === "user" ? (
              <div className="p-1 rounded-[1.5rem] bg-black/[0.03] ring-1 ring-black/[0.04] max-w-[85%] ml-auto">
                <div className="p-3.5 rounded-[calc(1.5rem-0.25rem)] bg-white text-obsidian-900 font-medium leading-relaxed shadow-hardware text-xs">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-obsidian-900">
                  <div className="w-7 h-7 rounded-xl bg-obsidian-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-hardware">
                    <Bot className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.4} />
                  </div>
                  <p className="pt-1 font-medium leading-relaxed text-obsidian-900/80">{msg.text}</p>
                </div>

                {msg.data?.days && (
                  <div className="space-y-4 pl-2">
                    {msg.data.days.map((day: any, dIdx: number) => (
                      <div key={dIdx} className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-hardware space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-obsidian-900 text-xs tracking-tight">
                              {day.title}
                            </h5>
                            <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold">
                              {day.items.length} spots
                            </span>
                          </div>

                          <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-black/[0.06]">
                            {day.items.map((item: any, iIdx: number) => {
                              const ItemIcon = item.icon || MapPin;
                              return (
                                <div key={iIdx} className="relative flex items-center justify-between gap-2">
                                  <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full border border-obsidian-900 bg-white" />
                                  <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <span className="font-mono text-[10px] text-obsidian-900/40 shrink-0">
                                      {item.time}
                                    </span>
                                    <ItemIcon className="w-3.5 h-3.5 text-obsidian-800 shrink-0" strokeWidth={1.3} />
                                    <span className="text-obsidian-900 font-medium truncate">{item.title}</span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${
                                      item.badgeBg || "bg-black/[0.03] text-obsidian-900"
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Recommendation Action Buttons: Button-in-Button */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        onClick={() => handleAdd(msg.data.days)}
                        className={`group flex-1 py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-hardware active:scale-[0.98] transition-all duration-500 ease-luxury ${
                          added
                            ? "bg-emerald-700 text-white"
                            : "bg-obsidian-900 text-white hover:bg-obsidian-850"
                        }`}
                      >
                        {added ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.4} />
                            <span>Added to Itinerary!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-brand-200" strokeWidth={1.4} />
                            <span>Add to Itinerary</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSend("Give me alternative suggestions with hidden alley cafes")}
                        className="py-2.5 px-3 rounded-full border border-black/[0.08] bg-white text-obsidian-900 text-xs font-semibold hover:bg-canvas-subtle flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-obsidian-900/60" strokeWidth={1.3} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Multi-stage Generating Animation */}
        {isGenerating && (
          <div className="p-1.5 rounded-2xl bg-black/[0.025] ring-1 ring-black/[0.04]">
            <div className="p-4 rounded-xl bg-white shadow-hardware space-y-2">
              <div className="flex items-center gap-2 text-obsidian-900 font-semibold text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-brand-700" strokeWidth={1.4} />
                <span>{generationStage}</span>
              </div>
              <div className="h-1 w-full bg-black/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-brand-700 rounded-full w-3/4 animate-pulse" />
              </div>
              <p className="text-[10px] text-obsidian-900/40 font-mono">Real-time Places caching active</p>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer & Chat Input Bar */}
      <div className="p-4 border-t border-black/[0.05] space-y-3 bg-canvas/90 shrink-0">
        {/* Quick Suggestion Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => handleSend("Suggest hidden ramen spots in Kyoto")}
            className="px-3 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] hover:bg-black/[0.06] text-[10px] font-medium text-obsidian-900 whitespace-nowrap transition-colors"
          >
            🍜 Hidden ramen
          </button>
          <button
            onClick={() => handleSend("Find tranquil zen temple gardens")}
            className="px-3 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] hover:bg-black/[0.06] text-[10px] font-medium text-obsidian-900 whitespace-nowrap transition-colors"
          >
            ⛩️ Tranquil Zen gardens
          </button>
          <button
            onClick={() => handleSend("Keep daily budget under ₹3,000")}
            className="px-3 py-1 rounded-full bg-black/[0.03] border border-black/[0.05] hover:bg-black/[0.06] text-[10px] font-medium text-obsidian-900 whitespace-nowrap transition-colors"
          >
            💰 Budget filter
          </button>
        </div>

        {/* Input Box: Doppelrand Pill with Trailing Action Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-white border border-black/[0.08] rounded-full pl-4 pr-12 py-3 text-xs text-obsidian-900 placeholder-obsidian-900/40 focus:outline-none focus:border-obsidian-900 shadow-hardware"
            placeholder="Ask AI Copilot for recommendations, timings, or budget..."
            type="text"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            className="absolute right-1.5 w-8 h-8 rounded-full bg-obsidian-900 text-white flex items-center justify-center hover:bg-obsidian-850 transition-all duration-300 disabled:opacity-40 shadow-2xs active:scale-95"
            aria-label="Send query"
          >
            <ArrowUpRight className="w-4 h-4 text-brand-200" strokeWidth={1.4} />
          </button>
        </form>

        {/* AI Quota & Safety */}
        <div className="flex items-center justify-between text-[10px] text-obsidian-900/40 px-1">
          <span>Enterprise Token Quota: 3/10 used</span>
          <span>Verified Local Data ✦</span>
        </div>
      </div>
    </aside>
  );
}
