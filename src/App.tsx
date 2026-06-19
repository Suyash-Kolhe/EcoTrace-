/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Car, Zap, Leaf, ShoppingBag, Globe, RefreshCw, Calculator, Sparkles, TrendingDown, Heart, ShieldCheck, Home, Sun, Moon, FileDown, Award } from 'lucide-react';
import { FootprintInputs, FootprintBreakdown } from './types';
import { calculateFullFootprint, DEFAULT_INPUTS } from './utils/carbonCalculator';
import { MetricCard } from './components/MetricCard';
import { CalculatorTab } from './components/CalculatorTab';
import { ActionTracker } from './components/ActionTracker';
import { HistoryChart } from './components/HistoryChart';
import { InsightsPanel } from './components/InsightsPanel';
import { REDUCTION_ACTIONS } from './data/actions';
import { DailyLogReminder } from './components/DailyLogReminder';
import { ProjectedPledgeImpactChart } from './components/ProjectedPledgeImpactChart';
import { MilestonesSection } from './components/MilestonesSection';
import { WeeklyComparisonChart } from './components/WeeklyComparisonChart';
import { GreenMarketplace } from './components/GreenMarketplace';
import { TrustFAQModal } from './components/TrustFAQModal';
import { generateCarbonPDFReport } from './utils/generatePdfReport';
import { OffsetHub } from './components/OffsetHub';
import { GlossaryTooltip, GlossaryPanel } from './components/GlossaryTooltip';

export default function App() {
  // Main local inputs state
  const [inputs, setInputs ] = useState<FootprintInputs>(() => {
    try {
      const saved = localStorage.getItem('carbon_platform_inputs');
      return saved ? JSON.parse(saved) : DEFAULT_INPUTS;
    } catch {
      return DEFAULT_INPUTS;
    }
  });

  // Controls if TrustFAQModal is showing
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  // Active reduction commitment IDs
  const [committedActionIds, setCommittedActionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('carbon_platform_committed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active page view: 'dashboard' | 'calculator' | 'pledges' | 'analytics' | 'marketplace' | 'offsets'
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'calculator' | 'pledges' | 'analytics' | 'marketplace' | 'offsets'>('dashboard');

  // Input sub-category tab: 'transport' | 'energy' | 'food' | 'shopping' (tied to Metric card clicks)
  const [activeCategory, setActiveCategory] = useState<'transport' | 'energy' | 'food' | 'shopping'>('transport');

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem('carbon_platform_inputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem('carbon_platform_committed', JSON.stringify(committedActionIds));
  }, [committedActionIds]);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('carbon_platform_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  });

  // Technical Climate Terms Glossary visible state
  const [showGlossaryPanel, setShowGlossaryPanel] = useState<boolean>(false);

  // States for Calculator page "Calculate" button functionality
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationComplete, setCalculationComplete] = useState<boolean>(false);
  const [calculatingStage, setCalculatingStage] = useState<string>('');

  const handleTriggerCalculate = () => {
    setIsCalculating(true);
    setCalculationComplete(false);
    setCalculatingStage('Auditing automobile & aviation distances...');

    setTimeout(() => {
      setCalculatingStage('Summing home power & gas thermal variables...');
    }, 450);

    setTimeout(() => {
      setCalculatingStage('Analyzing active food diet procurement patterns...');
    }, 900);

    setTimeout(() => {
      setCalculatingStage('Weighing consumer shopping recycling offsets...');
    }, 1350);

    setTimeout(() => {
      setIsCalculating(false);
      setCalculationComplete(true);
    }, 1800);
  };

  // Sync theme with document class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('carbon_platform_theme', theme);
  }, [theme]);

  // Real-time calculated footprints
  const currentBreakdown = useMemo(() => calculateFullFootprint(inputs), [inputs]);

  // Compute values dynamically
  const totalCommittedSavings = useMemo(() => {
    return REDUCTION_ACTIONS
      .filter(item => committedActionIds.includes(item.id))
      .reduce((acc, curr) => acc + curr.co2SavingKg, 0);
  }, [committedActionIds]);

  const activeEmissionsWithSavings = useMemo(() => {
    return Math.max(0, currentBreakdown.total - totalCommittedSavings);
  }, [currentBreakdown.total, totalCommittedSavings]);

  const categoryPercentages = useMemo(() => {
    const total = currentBreakdown.total || 1;
    return {
      transport: Math.round((currentBreakdown.transport / total) * 100),
      energy: Math.round((currentBreakdown.energy / total) * 100),
      food: Math.round((currentBreakdown.food / total) * 100),
      shopping: Math.round((currentBreakdown.shopping / total) * 100),
    };
  }, [currentBreakdown]);

  const primaryHighSectorAlert = useMemo(() => {
    const list = [
      { name: 'transport', val: currentBreakdown.transport },
      { name: 'energy', val: currentBreakdown.energy },
      { name: 'food', val: currentBreakdown.food },
      { name: 'shopping', val: currentBreakdown.shopping }
    ];
    list.sort((a, b) => b.val - a.val);
    return list[0] || { name: 'transport', val: 0 };
  }, [currentBreakdown]);

  // Generate and download formal PDF Report
  const handleDownloadPDF = () => {
    generateCarbonPDFReport({
      inputs,
      breakdown: currentBreakdown,
      committedActionIds,
      totalSavings: totalCommittedSavings,
      userEmail: 'suyashkolhe15@gmail.com',
    });
  };

  // Handle Action Item Toggles
  const handleToggleAction = (actionId: string) => {
    setCommittedActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  // Reset to Defaults
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset your inputs and actions back to national averages?")) {
      setInputs(DEFAULT_INPUTS);
      setCommittedActionIds([]);
      localStorage.removeItem('carbon_insights_cache');
    }
  };

  // Human descriptive ecological rating
  const ecologicalRating = useMemo(() => {
    const tons = activeEmissionsWithSavings / 1000;
    if (tons < 2.0) return { title: "Paris Goal Aligned", desc: "Outstanding! Your footprint meets global 1.5°C stabilization thresholds.", bg: "bg-emerald-50 text-emerald-800 border-emerald-250", badge: "🌍 Best Practice" };
    if (tons < 4.5) return { title: "Sustainable Horizon", desc: "Solid progress. You are comfortably below traditional EU/North American averages.", bg: "bg-teal-50 text-teal-800 border-teal-200", badge: "🌱 Sustainable Choice" };
    if (tons < 8.0) return { title: "Moderate Ecological Impact", desc: "Average consumption. Leverage insulation, public transit, or dietary shifts to drop.", bg: "bg-amber-50 text-amber-800 border-amber-200", badge: "⚠️ Moderate Impact" };
    return { title: "Heavy Carbon Intrastructure", desc: "Considerable emissions. We highly encourage activating a custom AI Audit below.", bg: "bg-rose-50/50 text-rose-800 border-rose-200", badge: "🏭 High Emission Sourcing" };
  }, [activeEmissionsWithSavings]);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#1A2E1A] selection:bg-emerald-200 flex flex-col font-sans pb-24 md:pb-8" id="app-root">
      {/* Header Bar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-xs" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0">
              <Leaf size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base sm:text-lg tracking-tight transition-colors duration-350 ${
                  theme === 'light' ? 'text-zinc-900' : 'text-emerald-400'
                }`}>EcoTrace</span>
                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 whitespace-nowrap">Awareness</span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500 hidden sm:block">
                Action-Led Decarbonization Guide
              </p>
            </div>
          </div>

          {/* Desktop Top-Level Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200 shadow-2xs text-[11px]">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Globe size={12} className="text-emerald-600" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('calculator')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'calculator'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Calculator size={12} className="text-emerald-600" />
              Calculator
            </button>
            <button
              onClick={() => setCurrentPage('pledges')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'pledges'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <TrendingDown size={12} className="text-emerald-600" />
              Habit Pledges
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'analytics'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Sparkles size={12} className="text-emerald-600" />
              AI Projections
            </button>
            <button
              onClick={() => setCurrentPage('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'marketplace'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <ShoppingBag size={12} className="text-emerald-600" />
              Eco Swaps
            </button>
            <button
              onClick={() => setCurrentPage('offsets')}
              className={`px-3 py-1.5 rounded-lg transition font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'offsets'
                  ? 'bg-white text-[#111827] border border-zinc-200 shadow-3xs text-emerald-800'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              id="offsets-desktop-nav-link"
            >
              <Award size={12} className="text-emerald-650" />
              Carbon Offsets
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-lg transition-all cursor-pointer bg-white"
              title="Reset state attributes to average"
            >
              <RefreshCw size={11} />
              <span className="hidden sm:inline">Reset Averages</span>
              <span className="sm:hidden">Reset</span>
            </button>

            {/* Elegant Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-zinc-200 transition-all cursor-pointer bg-white text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme-toggle-button"
            >
              {theme === 'light' ? (
                <Moon size={15} className="text-emerald-600 transition-transform hover:rotate-12" />
              ) : (
                <Sun size={15} className="text-amber-500 transition-transform hover:rotate-45" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Floating Navigation Bar at Bottom */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-md border border-zinc-200 shadow-lg rounded-2xl p-1 flex items-center overflow-x-auto scrollbar-none justify-between gap-1">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'dashboard' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Globe size={14} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setCurrentPage('calculator')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'calculator' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Calculator size={14} />
          <span>Measure</span>
        </button>
        <button
          onClick={() => setCurrentPage('pledges')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'pledges' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <TrendingDown size={14} />
          <span>Pledges</span>
        </button>
        <button
          onClick={() => setCurrentPage('analytics')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'analytics' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Sparkles size={14} />
          <span>AI Coach</span>
        </button>
        <button
          onClick={() => setCurrentPage('marketplace')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'marketplace' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Swaps</span>
        </button>
        <button
          onClick={() => setCurrentPage('offsets')}
          className={`shrink-0 flex-1 min-w-[56px] py-1.5 font-bold text-[9px] uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer transition ${
            currentPage === 'offsets' ? 'text-emerald-700' : 'text-zinc-400 hover:text-zinc-700'
          }`}
          id="offsets-mobile-nav-link"
        >
          <Award size={14} />
          <span>Offsets</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="main-dashboard">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="focus:outline-none space-y-8"
        >
          {/* ==================== PAGE 1: DASHBOARD ==================== */}
          {currentPage === 'dashboard' && (
            <div className="space-y-8" id="page-dashboard">
              {/* Introduction & Greetings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Home size={20} className="text-emerald-600" />
                    EcoTrace Overview
                  </h1>
                  <p className="text-xs text-zinc-500 max-w-xl">
                    Analyze your current carbon commitment trajectory, configure metrics, and view active eco pledge habits below.
                  </p>
                </div>
                <div className="flex flex-row items-center gap-2.5 shrink-0 self-start sm:self-center flex-wrap">
                  <button
                    onClick={() => setIsFAQOpen(true)}
                    className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-250 text-zinc-700 hover:text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition shadow-3xs cursor-pointer inline-flex items-center gap-2 focus:outline-none"
                  >
                    <ShieldCheck size={14} className="text-emerald-600 stroke-[2.5]" />
                    <span>Calculation Trust & FAQs</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-805 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-zinc-850 hover:border-zinc-900 transition shadow-3xs cursor-pointer inline-flex items-center gap-2 focus:outline-none"
                    id="download-pdf-report-btn"
                    title="Generate and download a formatted PDF Summary Carbon Audit Report matching IPCC standards."
                  >
                    <FileDown size={14} className="text-emerald-400 stroke-[2.5]" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              </div>

              {/* Daily Habit Log Notification reminder */}
              <DailyLogReminder
                committedActionIds={committedActionIds}
                onNavigateToPledges={() => setCurrentPage('pledges')}
              />

              {/* Core Quick Stats Row */}
              <section className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden" id="summary-section">
                {/* Subtle decoration background pattern */}
                <div className="absolute right-0 top-0 select-none opacity-[0.02] text-zinc-900 pointer-events-none transform translate-x-10 -translate-y-10">
                  <Globe size={280} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                  {/* Main Pledge Report */}
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest bg-emerald-50 border border-emerald-250 text-emerald-800 px-3 py-1 rounded-full">
                      Active Carbon Pledge
                    </span>
                    <div className="pt-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter">
                        {(activeEmissionsWithSavings / 1000).toFixed(2)}{' '}
                        <span className="text-xs sm:text-sm font-bold text-zinc-400 uppercase font-sans tracking-wide">
                          tonnes <GlossaryTooltip term="CO2e">CO₂e</GlossaryTooltip>
                        </span>
                      </span>
                      <span className="block text-[11px] font-semibold text-zinc-400 mt-1 leading-relaxed">
                        Your net emissions per year (reflecting active lifestyle pledges)
                      </span>
                    </div>

                    {committedActionIds.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1.5 text-xs text-[#059669] font-bold">
                        <TrendingDown size={14} className="stroke-[2.5]" />
                        <span>
                          Offsetting -{totalCommittedSavings.toLocaleString()} kg CO₂/yr from <GlossaryTooltip term="Baseline">baseline</GlossaryTooltip>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Benchmark Gauge rating */}
                  <div className="md:col-span-5 p-5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-start gap-3.5">
                    <div className="p-2 bg-white rounded-lg border border-zinc-150 text-emerald-600 shadow-xs shrink-0 mt-0.5">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-wider">{ecologicalRating.title}</span>
                        <span className="text-[9px] font-bold uppercase font-mono bg-[#f0f9f3] text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-150">
                          {ecologicalRating.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1.5">{ecologicalRating.desc}</p>
                    </div>
                  </div>

                  {/* Quick action buttons to launch features */}
                  <div className="md:col-span-3 flex flex-col justify-between h-full min-h-[160px] bg-zinc-900 text-[#e8f5e9] p-5 rounded-xl border border-zinc-850 shadow-xs">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">Carbon Stewardship</p>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="font-mono text-2xl font-black text-white">{committedActionIds.length}</span>
                        <span className="text-[11px] text-zinc-400 font-semibold font-sans">active habit pledges</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <button
                        onClick={() => setCurrentPage('pledges')}
                        className="w-full text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition cursor-pointer shadow-3xs focus:outline-none"
                      >
                        Pledge New Habits
                      </button>
                      <button
                        onClick={() => setCurrentPage('offsets')}
                        className="w-full text-center py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 focus:outline-none animate-pulse hover:animate-none"
                      >
                        <Award size={11} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                        <span>Offset Remaining</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4 Category Cards (Transport, Energy, Food, Shopping) - CLICK sets category in calculator */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-zinc-400 block">
                  Category Carbon Vectors (Click to Configure in Calculator)
                </span>
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="category-cards-grid">
                  <MetricCard
                    id="metric-transport"
                    title="Transportation"
                    value={currentBreakdown.transport}
                    percentage={categoryPercentages.transport}
                    icon={Car}
                    colorClass="text-emerald-600"
                    bgColorClass="bg-emerald-50"
                    borderColorClass="border-emerald-500"
                    description="Cars, flights, public transit"
                    isActive={activeCategory === 'transport'}
                    onClick={() => {
                      setActiveCategory('transport');
                      setCurrentPage('calculator');
                    }}
                  />

                  <MetricCard
                    id="metric-energy"
                    title="Home Energy"
                    value={currentBreakdown.energy}
                    percentage={categoryPercentages.energy}
                    icon={Zap}
                    colorClass="text-amber-500"
                    bgColorClass="bg-amber-50"
                    borderColorClass="border-amber-500"
                    description="Power, natural heating gas, oil"
                    isActive={activeCategory === 'energy'}
                    onClick={() => {
                      setActiveCategory('energy');
                      setCurrentPage('calculator');
                    }}
                  />

                  <MetricCard
                    id="metric-food"
                    title="Diet & Food"
                    value={currentBreakdown.food}
                    percentage={categoryPercentages.food}
                    icon={Leaf}
                    colorClass="text-emerald-700"
                    bgColorClass="bg-emerald-50/80"
                    borderColorClass="border-emerald-700"
                    description="Meats, organic foods, waste"
                    isActive={activeCategory === 'food'}
                    onClick={() => {
                      setActiveCategory('food');
                      setCurrentPage('calculator');
                    }}
                  />

                  <MetricCard
                    id="metric-shopping"
                    title="Sourcing & Shopping"
                    value={currentBreakdown.shopping}
                    percentage={categoryPercentages.shopping}
                    icon={ShoppingBag}
                    colorClass="text-purple-600"
                    bgColorClass="bg-purple-50"
                    borderColorClass="border-purple-500"
                    description="Garments, appliances, recycling"
                    isActive={activeCategory === 'shopping'}
                    onClick={() => {
                      setActiveCategory('shopping');
                      setCurrentPage('calculator');
                    }}
                  />
                </section>
              </div>

              {/* Weekly Line Chart Profile Comparisons */}
              <WeeklyComparisonChart
                currentBreakdown={currentBreakdown}
                activeEmissionsWithSavings={activeEmissionsWithSavings}
                committedSavings={totalCommittedSavings}
              />

              {/* Committed Pledges Checklist List */}
              <section className="space-y-4" id="dashboard-details">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-zinc-400">
                    Your Active Pledges ({committedActionIds.length})
                  </span>
                  {committedActionIds.length > 0 && (
                    <button
                      onClick={() => setCurrentPage('pledges')}
                      className="text-emerald-700 hover:text-emerald-800 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Modify Commitments →
                    </button>
                  )}
                </div>

                {committedActionIds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id)).map(action => (
                      <div key={action.id} className="bg-white border border-zinc-200/80 hover:border-emerald-300 p-4 rounded-xl flex items-start gap-3 shadow-2xs relative group transition-all duration-250">
                        <span className="p-1 rounded bg-zinc-50 border border-zinc-150 text-emerald-700 text-sm mt-0.5 shrink-0 select-none">
                          {action.category === 'transport' && '🚗'}
                          {action.category === 'energy' && '🔌'}
                          {action.category === 'food' && '🌱'}
                          {action.category === 'shopping' && '🛍️'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-zinc-900 text-xs truncate uppercase tracking-tight">{action.title}</p>
                          <p className="text-zinc-500 text-[11px] mt-0.5 truncate leading-relaxed">{action.description}</p>
                          <span className="inline-block font-mono text-[10px] font-black text-emerald-700 bg-[#f0f9f3] px-2 py-0.5 mt-2 rounded border border-emerald-100/50">
                            -{action.co2SavingKg} kg CO₂/yr
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleAction(action.id)}
                          className="absolute right-2 top-2 text-zinc-300 hover:text-rose-600 transition cursor-pointer p-1"
                          title="Remove from commitments"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-white/60 space-y-3">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wide">No habit pledges active yet</p>
                    <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed font-normal">
                      Pledge custom habit commitments to immediately deduct real-time carbon values from your profile baseline!
                    </p>
                    <button
                      onClick={() => setCurrentPage('pledges')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Browse Habit Checklist
                    </button>
                  </div>
                )}
              </section>

              {/* Contextual Sustainable Swap highlight on Dashboard */}
              <section className="space-y-4" id="dashboard-eco-swaps-teaser">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[#6d8473]">
                    Contextual sustainable swap recommendation
                  </span>
                  <button
                    onClick={() => setCurrentPage('marketplace')}
                    className="text-emerald-700 hover:text-emerald-800 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                  >
                    View All Partner Swaps →
                  </button>
                </div>

                <div 
                  className="bg-white border border-zinc-200 dark:border-[#1e3322] rounded-xl p-5 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between cursor-pointer hover:border-emerald-300 transition-all"
                  onClick={() => setCurrentPage('marketplace')}
                >
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-emerald-50 dark:bg-[#162419] text-2xl rounded-xl border border-emerald-150 shrink-0 select-none shadow-3xs">
                      {primaryHighSectorAlert.name === 'transport' && '🚲'}
                      {primaryHighSectorAlert.name === 'energy' && '⚡'}
                      {primaryHighSectorAlert.name === 'food' && '🌱'}
                      {primaryHighSectorAlert.name === 'shopping' && '🛍️'}
                    </span>
                    <div className="space-y-1 text-left">
                      <span className="inline-flex items-center gap-1 font-mono text-[8px] font-black bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded uppercase">
                        Spotlight Clean Opportunity
                      </span>
                      <h4 className="text-zinc-900 font-extrabold text-sm uppercase tracking-tight">
                        Optimize your high {primaryHighSectorAlert.name} consumption
                      </h4>
                      <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl font-medium">
                        Since your {primaryHighSectorAlert.name} footprint is {Math.round(primaryHighSectorAlert.val).toLocaleString()} kg CO₂/yr, switching to clean alternatives can save significant carbon per year. Grab exclusive promo codes from partners!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage('marketplace');
                    }}
                    className="px-4 py-2 bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shrink-0 shadow-2xs transition-all cursor-pointer"
                  >
                    Explore Swaps
                  </button>
                </div>
              </section>

              {/* Achievements & Milestones segment */}
              <MilestonesSection
                committedSavings={totalCommittedSavings}
                activePledgesCount={committedActionIds.length}
              />

              {/* Collapsible Technical Carbon glossary panel */}
              <section className="pt-4" id="dashboard-glossary-section">
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowGlossaryPanel(!showGlossaryPanel)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/80 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-widest transition shadow-3xs cursor-pointer focus:outline-none"
                    id="toggle-glossary-panel-button"
                  >
                    <span>{showGlossaryPanel ? 'Close Science Lexicon' : 'Explore Technical Carbon Glossary'}</span>
                    <span className="text-zinc-400 font-mono">[{showGlossaryPanel ? '−' : '+'}]</span>
                  </button>
                </div>

                {showGlossaryPanel && (
                  <div className="mt-5 animate-fade-in text-left">
                    <GlossaryPanel onClose={() => setShowGlossaryPanel(false)} />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==================== PAGE 2: CALCULATOR ==================== */}
          {currentPage === 'calculator' && (
            <div className="space-y-8" id="page-calculator">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                  <Calculator size={20} className="text-emerald-600" />
                  Carbon Emissions Calculator
                </h1>
                <p className="text-xs text-zinc-500 max-w-xl">
                  Adjust parameters in each category block below to accurately estimate active ecological metrics instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Category selector column */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-xs">
                  <span className="text-[9.5px] tracking-wider uppercase font-extrabold text-zinc-400 font-mono">
                    Lifestyle Segments
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight leading-tight">Step-by-step audit</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                    Toggle between segments or click on any of the category cards above to configure your active consumption metrics.
                  </p>

                  <div className="flex flex-col gap-2 mt-4 pt-2">
                    {[
                      { id: 'transport', label: '🚗 Transport Metrics', icon: Car, activeColor: 'bg-[#f0f9f3] text-emerald-800 border-emerald-300' },
                      { id: 'energy', label: '🔌 Energy Footprint', icon: Zap, activeColor: 'bg-[#fefaf0] text-amber-800 border-amber-300' },
                      { id: 'food', label: '🌱 Food & Diet Sourcing', icon: Leaf, activeColor: 'bg-[#f0f9f3] text-emerald-800 border-emerald-500' },
                      { id: 'shopping', label: '🛍️ Shopping & Waste', icon: ShoppingBag, activeColor: 'bg-[#fbf7fc] text-purple-800 border-purple-300' }
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveCategory(cat.id as any);
                            setCalculationComplete(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center justify-between transition cursor-pointer ${
                            isActive
                              ? `${cat.activeColor} shadow-xs border-l-4`
                              : 'bg-zinc-50/50 hover:bg-zinc-50 border-zinc-200/80 text-zinc-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            {cat.label}
                          </span>
                          <span className="font-mono text-[9px] font-bold opacity-80 uppercase tracking-widest text-[#059669]">
                            {isActive && 'Active'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mt-6 text-zinc-500 text-[11px] leading-relaxed">
                    💡 <span className="font-bold text-zinc-700 uppercase tracking-wider">Ecological Tip:</span> Carbon metrics reflect international environmental databases with live mathematical coefficients. Slide parameters to inspect carbon impacts instantly.
                  </div>
                </div>

                {/* Slider Inputs Segment Panel or Calculate Report results */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs relative overflow-hidden" id="calculator-right-panel">
                  {isCalculating ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center"
                      id="calculating-overlay"
                    >
                      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-5"></div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-1.5" id="calc-status-title">
                        Auditing Lifestyle Data
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono animate-pulse" id="calc-step-subtitle">
                        {calculatingStage}
                      </p>
                    </motion.div>
                  ) : calculationComplete ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                      id="calculation-results-card"
                    >
                      <div className="flex items-center gap-3 border-b border-zinc-150 pb-4">
                        <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shrink-0 select-none">
                          <Award size={24} className="text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#059669] bg-emerald-100/60 px-2.5 py-0.5 rounded border border-emerald-200 font-mono">
                            Audit Complete
                          </span>
                          <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight mt-0.5" id="results-headline">
                            Active Carbon Footprint Report
                          </h2>
                        </div>
                      </div>

                      {/* Carbon footprint total display */}
                      <div className="bg-[#f0f9f3] p-6 rounded-2xl border border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-4" id="footprint-score-plate">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 font-mono">
                            Total Annual Footprint
                          </span>
                          <div className="flex items-baseline justify-center sm:justify-start gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono">
                              {(currentBreakdown.total / 1000).toFixed(2)}
                            </span>
                            <span className="text-sm font-extrabold text-[#059669]">tonnes CO₂e / yr</span>
                          </div>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono block mb-1">
                            National Benchmark comparison
                          </span>
                          <div className="text-xs font-bold text-emerald-900 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 inline-block" id="comparison-metric">
                            {currentBreakdown.total <= 1500 ? (
                              <span className="text-emerald-700 flex items-center gap-1">✨ Below India Avg (1.5t)</span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">⚠️ Above India Avg (1.5t)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Segment bar breakdown progress list */}
                      <div className="space-y-4" id="results-bar-breakdown">
                        <h4 className="text-xs font-black text-zinc-805 uppercase tracking-wider">Lifestyle Breakdown</h4>
                        
                        <div className="space-y-3.5">
                          {/* Transport Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-700 flex items-center gap-1">🚗 Transport & Commutes</span>
                              <span className="font-mono text-zinc-500">{(currentBreakdown.transport / 1000).toFixed(2)} t CO₂ ({Math.round((currentBreakdown.transport / (currentBreakdown.total || 1)) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, Math.round((currentBreakdown.transport / (currentBreakdown.total || 1)) * 100))}%` }}
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          {/* Home Energy Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-700 flex items-center gap-1">🔌 Home Utility Energy</span>
                              <span className="font-mono text-zinc-500">{(currentBreakdown.energy / 1000).toFixed(2)} t CO₂ ({Math.round((currentBreakdown.energy / (currentBreakdown.total || 1)) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, Math.round((currentBreakdown.energy / (currentBreakdown.total || 1)) * 100))}%` }}
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          {/* Diet & Food Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-700 flex items-center gap-1">🌱 Food & Diet Sourcing</span>
                              <span className="font-mono text-zinc-500">{(currentBreakdown.food / 1000).toFixed(2)} t CO₂ ({Math.round((currentBreakdown.food / (currentBreakdown.total || 1)) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, Math.round((currentBreakdown.food / (currentBreakdown.total || 1)) * 100))}%` }}
                                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          {/* Shopping Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-700 flex items-center gap-1">🛍️ Shopping & Consumer Waste</span>
                              <span className="font-mono text-zinc-500">{(currentBreakdown.shopping / 1000).toFixed(2)} t CO₂ ({Math.round((currentBreakdown.shopping / (currentBreakdown.total || 1)) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, Math.round((currentBreakdown.shopping / (currentBreakdown.total || 1)) * 100))}%` }}
                                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Carbon audit description paragraph */}
                      <div className="bg-zinc-50 rounded-xl border border-zinc-200/80 p-4 text-xs text-zinc-600 leading-relaxed" id="auditor-recommendation-paragraph">
                        <span className="font-black text-zinc-800 block mb-1">📋 ECOTRACK AUDITOR CONCLUSION</span>
                        {currentBreakdown.transport >= currentBreakdown.energy && currentBreakdown.transport >= currentBreakdown.food ? (
                          "Your high-altitude flight routes or daily combustion driving comprises your heaviest carbon sector. Shifting commutes to electric rail/metro grids or substituting flights with virtual meets yields immediate major drops."
                        ) : currentBreakdown.energy >= currentBreakdown.food ? (
                          "Household energy utilities represent your peak emission load. Optimizing electricity draw, using clean natural gas mixtures, or splitting shares between household members offers effective abatement."
                        ) : (
                          "Food and diet sourcing forms the baseline of your carbon impact. Adopting organic vegetarian diets, eliminating surplus meal prep waste, and reducing fast-fashion purchases helps stabilize your profile."
                        )}
                      </div>

                      {/* Navigations CTAs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2" id="results-cta-actions">
                        <button
                          onClick={() => setCalculationComplete(false)}
                          className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center focus:outline-none"
                        >
                          Modify Parameters
                        </button>
                        <button
                          onClick={() => {
                            setCalculationComplete(false);
                            setCurrentPage('pledges');
                          }}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs focus:outline-none"
                        >
                          Habit Pledges <TrendingDown size={11} />
                        </button>
                        <button
                          onClick={() => {
                            setCalculationComplete(false);
                            setCurrentPage('analytics');
                          }}
                          className="px-4 py-2.5 bg-emerald-850 hover:bg-emerald-900 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs focus:outline-none"
                        >
                          Climate Coach <Sparkles size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8 flex flex-col justify-between h-full">
                      <CalculatorTab
                        activeCategory={activeCategory}
                        inputs={inputs}
                        onUpdate={setInputs}
                      />
                      
                      <div className="border-t border-zinc-150 pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4" id="calculate-trigger-bar">
                        <div className="text-zinc-500 text-xs text-center sm:text-left">
                          Adjust sliders and click <span className="font-bold text-zinc-755">Calculate Footprint</span> to generate your detailed report.
                        </div>
                        <button
                          onClick={handleTriggerCalculate}
                          className="w-full sm:w-auto shrink-0 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] border-0"
                          id="trigger-calculate-button"
                        >
                          <Calculator size={14} />
                          Calculate Footprint
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PAGE 3: HABIT PLEDGES ==================== */}
          {currentPage === 'pledges' && (
            <div className="space-y-4 animate-fade-in" id="page-pledges">
              <div className="space-y-1 pb-4">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                  <TrendingDown size={20} className="text-emerald-600" />
                  Habit Pledge Reduction Checklist
                </h1>
                <p className="text-xs text-zinc-500 max-w-xl">
                  Commit to specific household and lifestyle habit modifications here to shave off carbon points directly.
                </p>
              </div>

              <ActionTracker
                committedActionIds={committedActionIds}
                onToggleAction={handleToggleAction}
                baseEmissionsTotal={currentBreakdown.total}
              />
            </div>
          )}

          {/* ==================== PAGE 4: ANALYTICS & AI ==================== */}
          {currentPage === 'analytics' && (
            <div className="space-y-8 animate-fade-in" id="page-analytics">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-emerald-600 animate-pulse" />
                  Historical Projections & Climate Coach
                </h1>
                <p className="text-xs text-zinc-500 max-w-xl">
                  Review carbon target trends and request a customized carbon-reduction action audit generated by Gemini.
                </p>
              </div>

              {/* Integrated Metrics Line Progress and Global benchmark comparative bar */}
              <HistoryChart
                currentBreakdown={currentBreakdown}
                activeEmissionsWithSavings={activeEmissionsWithSavings}
                committedSavings={totalCommittedSavings}
              />

              {/* D3.js Projected Pledge Impact Visualization */}
              <ProjectedPledgeImpactChart
                currentBreakdown={currentBreakdown}
                activeEmissionsWithSavings={activeEmissionsWithSavings}
                committedSavings={totalCommittedSavings}
              />

              {/* Dynamic Server-Side AI Guidance Module */}
              <InsightsPanel
                breakdown={currentBreakdown}
                inputs={inputs}
                committedActionIds={committedActionIds}
              />
            </div>
          )}

          {/* ==================== PAGE 5: GREEN MARKETPLACE ==================== */}
          {currentPage === 'marketplace' && (
            <div className="space-y-4 animate-fade-in" id="page-marketplace">
              <GreenMarketplace
                currentBreakdown={currentBreakdown}
                committedSavings={totalCommittedSavings}
                onNavigateToCategory={(cat) => {
                  setActiveCategory(cat as any);
                  setCurrentPage('calculator');
                }}
              />
            </div>
          )}

          {/* ==================== PAGE 6: OFFSET HUB ==================== */}
          {currentPage === 'offsets' && (
            <div className="space-y-4 animate-fade-in" id="page-offsets">
              <OffsetHub
                currentBreakdown={currentBreakdown}
                totalCommittedSavings={totalCommittedSavings}
                activeEmissionsWithSavings={activeEmissionsWithSavings}
              />
            </div>
          )}
        </motion.div>
      </main>

      {/* Sustainable Footnotes Disclaimer */}
      <footer className="border-t border-zinc-200/60 bg-white py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-400 text-xs space-y-3.5">
          <div className="flex items-center justify-center gap-4 flex-wrap text-emerald-600 hover:text-emerald-800 font-extrabold text-[9.5px] uppercase tracking-wider">
            <button 
              onClick={() => setIsFAQOpen(true)}
              className="hover:text-emerald-800 transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
            >
              <ShieldCheck size={12} className="stroke-[2.5]" />
              <span>How are our metrics calculated? (Database Reference FAQ)</span>
            </button>
            <span className="text-zinc-200 hidden sm:inline">|</span>
            <span className="text-zinc-400 font-semibold normal-case">Data Sources: IPCC, US EPA, DEFRA & IEA databases</span>
          </div>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart size={11} className="text-emerald-600 fill-emerald-500" /> for individual ecological awareness initiative. All figures are based on peer-reviewed global warming coefficients.
          </p>
          <p className="text-[10px] text-zinc-400">
            © {new Date().getFullYear()} Carbon Footprint Awareness Platform (United Nations Sustainable Development Goals alignment target).
          </p>
        </div>
      </footer>

      {/* Trust & Database Methodology Portal */}
      <TrustFAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </div>
  );
}
