"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AskAIAssistant from "@/components/AskAIAssistant";
import {
  Wallet,
  TrendingUp,
  Clock,
  BarChart2,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Users,
  ArrowUpRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Trip } from "@/lib/types";

interface BudgetItem {
  id: string;
  category: "Adventure" | "Food" | "Nature" | "Nightlife" | "Culture" | "Transport" | "Hotels";
  label: string;
  amount: number;
  date: string;
  paidBy: string;
  status: "Paid" | "Planned";
}

function TripBudgetInner() {
  const searchParams = useSearchParams();
  const initialTripId = searchParams.get("tripId") || "japan-2026";

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(initialTripId);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<BudgetItem["category"]>("Food");
  const [newAmount, setNewAmount] = useState("");
  const [newPaidBy, setNewPaidBy] = useState("Jeel Patel");
  const [newStatus, setNewStatus] = useState<"Paid" | "Planned">("Paid");

  // Budget Data State
  const [totalBudget, setTotalBudget] = useState(85000);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [tripTitle, setTripTitle] = useState("Japan Autumn Odyssey 2026");

  // Fetch available trips
  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/trips");
        const json = await res.json();
        if (json.data) {
          setTrips(json.data);
          const found = json.data.find((t: Trip) => t.id === selectedTripId);
          if (found) {
            setTripTitle(found.title);
            setTotalBudget(found.budget_total || 85000);
          }
        }
      } catch (err) {
        console.error("Failed to load trips", err);
      }
    }
    loadTrips();
  }, [selectedTripId]);

  // Fetch budget items for selected trip
  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/budget`);
      const json = await res.json();
      if (json.data) {
        setTotalBudget(json.data.budget_total || 85000);
        setItems(json.data.items || []);
      }
    } catch (err) {
      console.error("Failed to load budget", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    const current = trips.find((t) => t.id === selectedTripId);
    if (current) {
      setTripTitle(current.title);
      setTotalBudget(current.budget_total || 85000);
    }
  }, [selectedTripId]);

  // Calculated metrics
  const plannedCost = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.amount), 0);
  }, [items]);

  const remaining = totalBudget - plannedCost;
  const percentUsed = Math.min(100, Math.round((plannedCost / (totalBudget || 1)) * 100));

  const categoryTotals = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);
  }, [items]);

  const categoryColors: Record<string, { bg: string; dot: string; text: string }> = {
    Culture: { bg: "bg-black/[0.03]", dot: "bg-obsidian-900", text: "text-obsidian-900" },
    Food: { bg: "bg-brand-50", dot: "bg-brand-600", text: "text-brand-800" },
    Nature: { bg: "bg-emerald-50", dot: "bg-emerald-600", text: "text-emerald-800" },
    Adventure: { bg: "bg-amber-50", dot: "bg-amber-600", text: "text-amber-800" },
    Nightlife: { bg: "bg-indigo-50", dot: "bg-indigo-600", text: "text-indigo-800" },
    Transport: { bg: "bg-black/[0.04]", dot: "bg-obsidian-800", text: "text-obsidian-900" },
    Hotels: { bg: "bg-amber-50", dot: "bg-amber-700", text: "text-amber-900" },
  };

  // Dynamic Collaborator Splits Calculation
  const collaborators = useMemo(() => {
    const names = ["Jeel Patel", "Sarah", "Alex"];
    const avatars: Record<string, string> = {
      "Jeel Patel": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      Sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      Alex: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    };

    const equalShare = Math.round(plannedCost / (names.length || 1));

    return names.map((name) => {
      const paid = items
        .filter((item) => item.paidBy === name)
        .reduce((sum, it) => sum + Number(it.amount), 0);
      const balance = paid - equalShare;
      return {
        name,
        paid,
        share: equalShare,
        balance,
        avatar: avatars[name] || avatars["Jeel Patel"],
      };
    });
  }, [items, plannedCost]);

  // Add Item Handler
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newAmount) return;

    const amountNum = parseFloat(newAmount);
    const tempId = `b-${Date.now()}`;
    const newItem: BudgetItem = {
      id: tempId,
      label: newLabel.trim(),
      category: newCategory,
      amount: amountNum,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      paidBy: newPaidBy,
      status: newStatus,
    };

    // Optimistic UI update
    setItems((prev) => [newItem, ...prev]);
    setNewLabel("");
    setNewAmount("");
    setShowAddModal(false);

    try {
      const res = await fetch(`/api/trips/${selectedTripId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.data) {
        setItems((prev) => prev.map((it) => (it.id === tempId ? data.data : it)));
      }
    } catch (err) {
      console.error("Failed to save budget item", err);
    }
  };

  // Delete Item Handler
  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await fetch(`/api/trips/${selectedTripId}/budget/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete budget item", err);
    }
  };

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (!entries.length) return { name: "None", percent: 0 };
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    return {
      name: top[0],
      percent: plannedCost ? Math.round((top[1] / plannedCost) * 100) : 0,
    };
  }, [categoryTotals, plannedCost]);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row antialiased bg-canvas text-obsidian-900">
      {/* Sidebar */}
      <Sidebar onOpenAI={() => setIsAiOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Architectural Header */}
        <header className="h-16 bg-canvas/80 backdrop-blur-md border-b border-black/[0.04] flex items-center justify-between px-6 md:px-12 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-obsidian-900 hover:bg-black/[0.06] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.3} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-obsidian-900 leading-tight">{tripTitle}</h1>
                {/* Trip selector dropdown */}
                {trips.length > 1 && (
                  <div className="relative inline-block">
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="text-[10px] font-semibold bg-black/[0.04] border border-black/[0.06] rounded-full px-2 py-0.5 pr-4 text-obsidian-900 appearance-none cursor-pointer focus:outline-none"
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-2.5 h-2.5 text-obsidian-900/50 absolute right-1 top-1.5 pointer-events-none" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-obsidian-900/40">
                Total Cap ₹{totalBudget.toLocaleString()} • 3 Collaborators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBudget}
              title="Refresh budget"
              className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-obsidian-900 hover:bg-black/[0.06] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} strokeWidth={1.3} />
            </button>

            {/* Button-in-Button Copilot */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="group hidden sm:inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] text-xs font-medium hover:bg-black/[0.06] transition-colors"
            >
              <span className="text-[11px]">AI Optimizer</span>
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-brand-700" strokeWidth={1.4} />
              </span>
            </button>

            {/* Primary Action Button-in-Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="group relative inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full bg-obsidian-900 text-white text-xs font-medium shadow-hardware hover:bg-obsidian-850 active:scale-[0.98] transition-all duration-500 ease-luxury"
            >
              <span className="text-[11px] text-[#faf9f6]">Add Entry</span>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-luxury group-hover:scale-110">
                <Plus className="w-3 h-3 text-brand-200" strokeWidth={1.4} />
              </span>
            </button>
          </div>
        </header>

        {/* Main Body with Macro Whitespace */}
        <main className="p-6 md:p-12 space-y-10 max-w-7xl">
          {/* Top Banner (Doppelrand) */}
          <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
            <div className="relative rounded-[calc(2rem-0.375rem)] overflow-hidden bg-white p-6 sm:p-8 shadow-hardware flex flex-col md:flex-row md:items-center justify-between min-h-[140px] group">
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                  Fiscal Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-obsidian-900 tracking-tight">
                  Expense Ledger & Shared Balance
                </h2>
                <p className="text-xs text-obsidian-900/50 font-light leading-relaxed max-w-xl">
                  Synchronized with itinerary activities and real-time deposits. Equal 3-way split ledger.
                </p>
              </div>

              <div className="relative z-10 hidden lg:block rotate-[-3deg] text-right">
                <p className="font-serif italic text-2xl text-obsidian-900/80 leading-snug">
                  Precision in every penny.
                </p>
              </div>
            </div>
          </div>

          {/* Metric KPI Cards Row: Doppelrand Architecture */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Budget */}
            <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold block">Total Cap</span>
                  <div className="text-lg font-bold text-obsidian-900 tracking-tight mt-0.5 font-mono">
                    ₹{totalBudget.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-obsidian-900/40">Allocated budget</span>
                </div>
              </div>
            </div>

            {/* Planned Cost */}
            <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-4 h-4 text-brand-700" strokeWidth={1.3} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold block">Planned Cost</span>
                  <div className="text-lg font-bold text-obsidian-900 tracking-tight mt-0.5 font-mono">
                    ₹{plannedCost.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-brand-700 font-semibold">{percentUsed}% utilized</span>
                </div>
              </div>
            </div>

            {/* Remaining */}
            <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-700" strokeWidth={1.3} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold block">Buffer Left</span>
                  <div className={`text-lg font-bold tracking-tight mt-0.5 font-mono ${remaining >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    ₹{remaining.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-obsidian-900/40">
                    {Math.max(0, 100 - percentUsed)}% remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Average */}
            <div className="p-1.5 rounded-[1.75rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
              <div className="p-4 rounded-[calc(1.75rem-0.375rem)] bg-white shadow-hardware flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-obsidian-900 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian-900/40 font-semibold block">Daily Burn</span>
                  <div className="text-lg font-bold text-obsidian-900 tracking-tight mt-0.5 font-mono">
                    ₹{Math.round(plannedCost / 10).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-obsidian-900/40">Across 10 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Expense Table Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left 8 Cols: Category Breakdown & Table (Doppelrand) */}
            <div className="xl:col-span-8 space-y-8">
              {/* Category Breakdown Card */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-white shadow-hardware space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                        Categorization
                      </span>
                      <h3 className="font-bold text-sm text-obsidian-900 mt-0.5">Spend Distribution</h3>
                    </div>
                    <span className="text-[10px] font-mono text-obsidian-900 bg-black/[0.03] px-2.5 py-1 rounded-full border border-black/[0.05]">
                      {Object.keys(categoryTotals).length} categories
                    </span>
                  </div>

                  {/* Visual Bar Distribution */}
                  <div className="h-3 w-full bg-black/[0.04] rounded-full overflow-hidden flex shadow-inner">
                    {Object.entries(categoryTotals).map(([cat, amount]) => {
                      const widthPercent = plannedCost ? (amount / plannedCost) * 100 : 0;
                      const color = categoryColors[cat]?.dot || "bg-obsidian-600";
                      return (
                        <div
                          key={cat}
                          style={{ width: `${widthPercent}%` }}
                          className={`h-full ${color} transition-all duration-700 ease-luxury`}
                          title={`${cat}: ₹${amount.toLocaleString()} (${Math.round(widthPercent)}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Category Grid Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    {Object.entries(categoryTotals).map(([cat, amount]) => {
                      const widthPercent = plannedCost ? Math.round((amount / plannedCost) * 100) : 0;
                      const colorInfo = categoryColors[cat] || { dot: "bg-obsidian-600", text: "text-obsidian-900" };
                      return (
                        <div key={cat} className="p-3 rounded-2xl bg-canvas-subtle/50 border border-black/[0.04]">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${colorInfo.dot}`} />
                            <span className="font-medium text-obsidian-900 text-xs">{cat}</span>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-bold text-obsidian-900 text-xs font-mono">
                              ₹{amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-obsidian-900/40 font-mono">{widthPercent}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Expense Table Card */}
              <div className="p-2 rounded-[2.5rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2.5rem-0.5rem)] bg-white shadow-hardware overflow-hidden">
                  <div className="p-6 border-b border-black/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                        Record
                      </span>
                      <h3 className="font-bold text-sm text-obsidian-900 mt-0.5">
                        Tracked Line Items ({items.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.03] text-obsidian-900 border border-black/[0.06] text-xs font-semibold hover:bg-black/[0.06] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.4} />
                      <span>Add Entry</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-canvas-subtle/30 border-b border-black/[0.04] text-[10px] font-bold text-obsidian-900/40 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-6">Expense Item</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Paid By</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.03]">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-obsidian-900/40">
                              No expenses logged yet. Click &ldquo;Add Entry&rdquo; to track your first item.
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => {
                            const colorInfo = categoryColors[item.category] || {
                              bg: "bg-black/[0.03]",
                              text: "text-obsidian-900",
                            };
                            return (
                              <tr key={item.id} className="hover:bg-canvas-subtle/40 transition-colors">
                                <td className="py-3.5 px-6 font-semibold text-obsidian-900 text-xs">{item.label}</td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border border-black/[0.05] ${colorInfo.bg} ${colorInfo.text}`}
                                  >
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-obsidian-900/50 font-mono text-[11px]">
                                  {item.date}
                                </td>
                                <td className="py-3.5 px-4 font-medium text-obsidian-900/80">{item.paidBy}</td>
                                <td className="py-3.5 px-4 font-bold text-obsidian-900 font-mono text-xs">
                                  ₹{item.amount.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                                      item.status === "Paid"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200/50"
                                        : "bg-amber-50 text-amber-800 border-amber-200/50"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-obsidian-900/30 hover:text-rose-600 transition-colors p-1"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.3} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Collaborator Split & AI Tips (Doppelrand) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Collaborator Splits Card */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="p-6 rounded-[calc(2rem-0.375rem)] bg-white shadow-hardware space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-obsidian-900/40 uppercase tracking-[0.2em] block">
                        Settlement
                      </span>
                      <h4 className="font-bold text-sm text-obsidian-900 mt-0.5">Co-Traveler Split</h4>
                      <p className="text-[10px] text-obsidian-900/40">
                        Equal split (₹{Math.round(plannedCost / 3).toLocaleString()} / person)
                      </p>
                    </div>
                    <Users className="w-4 h-4 text-obsidian-800" strokeWidth={1.3} />
                  </div>

                  <div className="space-y-3">
                    {collaborators.map((person, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-canvas-subtle/50 border border-black/[0.04] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-black/[0.08]"
                          />
                          <div>
                            <p className="font-semibold text-obsidian-900 text-xs">{person.name}</p>
                            <p className="text-[10px] text-obsidian-900/40 font-mono">
                              Paid: ₹{person.paid.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold block ${
                              person.balance >= 0 ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {person.balance >= 0
                              ? `+₹${person.balance.toLocaleString()}`
                              : `-₹${Math.abs(person.balance).toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Cost Optimizer Box (Doppelrand) */}
              <div className="p-1.5 rounded-[2rem] bg-black/[0.025] ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-obsidian-950 p-6 text-white shadow-hardware space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-brand-200">
                      <Sparkles className="w-4 h-4" strokeWidth={1.4} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#faf9f6]">Smart Fiscal Insight</h4>
                      <p className="text-[10px] text-white/50">Predictive spending model</p>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    {topCategory.name} constitutes {topCategory.percent}% of aggregate expense. You maintain a ₹
                    {Math.max(0, remaining).toLocaleString()} reserve buffer before reaching your departure cap.
                  </p>

                  <button
                    onClick={() => setIsAiOpen(true)}
                    className="group w-full py-2.5 px-4 rounded-full bg-white text-obsidian-900 font-semibold text-xs hover:bg-canvas transition-all flex items-center justify-center gap-2 shadow-hardware"
                  >
                    <span>Consult AI Financial Advice</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-obsidian-900 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.4}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Expense Item Modal (Doppelrand) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-md animate-in fade-in">
          <div className="p-2 rounded-[2.5rem] bg-black/[0.05] ring-1 ring-black/[0.06] w-full max-w-md animate-in zoom-in-95">
            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5">
                <div>
                  <h3 className="font-bold text-base text-obsidian-900">Add Budget Line Item</h3>
                  <p className="text-[10px] text-obsidian-900/40">Record an activity, transit pass, or meal</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-obsidian-900/40 hover:text-obsidian-900 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-obsidian-900 mb-1">Expense Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyoto Ryokan Deposit"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none"
                    >
                      <option value="Food">Food</option>
                      <option value="Culture">Culture</option>
                      <option value="Nature">Nature</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Transport">Transport</option>
                      <option value="Hotels">Hotels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="3500"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none focus:border-obsidian-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Paid By</label>
                    <select
                      value={newPaidBy}
                      onChange={(e) => setNewPaidBy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none"
                    >
                      <option value="Jeel Patel">Jeel Patel</option>
                      <option value="Sarah">Sarah</option>
                      <option value="Alex">Alex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-obsidian-900 mb-1">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-canvas-subtle/50 border border-black/[0.08] rounded-xl text-xs text-obsidian-900 outline-none"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-full text-obsidian-900/60 font-semibold hover:bg-black/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-obsidian-900 text-white font-semibold hover:bg-obsidian-850 shadow-hardware"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Ask AI Assistant Panel */}
      <AskAIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

export default function TripBudgetExpenseTracker() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center text-xs">Loading Budget...</div>}>
      <TripBudgetInner />
    </Suspense>
  );
}
