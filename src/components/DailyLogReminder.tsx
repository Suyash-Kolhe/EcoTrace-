/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarRange, 
  Check, 
  Flame, 
  Sparkles, 
  X, 
  CheckSquare, 
  Square, 
  Info, 
  Award, 
  Plus, 
  Trash2, 
  MapPin, 
  Navigation, 
  Bike, 
  Bus, 
  Car, 
  Footprints, 
  Home,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { REDUCTION_ACTIONS } from '../data/actions';

interface DailyLogReminderProps {
  committedActionIds: string[];
  onNavigateToPledges: () => void;
}

export interface ManualActivityEntry {
  id: string;
  activityType: string; // 'cycling' | 'walking' | 'transit' | 'ev' | 'carpool' | 'wfh'
  distanceKm: number;
  description: string;
  carbonAvoidedKg: number;
  timestamp: string;
}

interface DailyLogData {
  lastLoggedDate: string | null;
  streakCount: number;
  history: { [date: string]: string[] }; // date -> list of completed action IDs
  dismissedDate: string | null;
  manualActivities: { [date: string]: ManualActivityEntry[] }; // date -> manual activity logs
}

export const ACTIVITY_PRESETS = [
  { id: 'cycling', label: 'Biking / Cycling', rate: 0.18, icon: '🚲', color: 'bg-emerald-50 text-emerald-800 border-emerald-150', desc: 'Saves 0.18 kg CO₂e per km vs driving a gasoline car.' },
  { id: 'walking', label: 'Walking / Running', rate: 0.18, icon: '🚶', color: 'bg-green-50 text-green-800 border-green-150', desc: 'Saves 0.18 kg CO₂e per km vs regular gasoline vehicle.' },
  { id: 'transit', label: 'Bus / Train Transit', rate: 0.12, icon: '🚌', color: 'bg-sky-50 text-sky-800 border-sky-150', desc: 'Saves 0.12 kg CO₂e per km vs single-occupancy driving.' },
  { id: 'ev', label: 'Electric Vehicle trip', rate: 0.10, icon: '⚡🚗', color: 'bg-cyan-50 text-cyan-800 border-cyan-150', desc: 'Saves 0.10 kg CO₂e per km vs standard internal combustion motor.' },
  { id: 'carpool', label: 'Shared Ride / Carpool', rate: 0.08, icon: '👥', color: 'bg-indigo-50 text-indigo-800 border-indigo-150', desc: 'Saves 0.08 kg CO₂e per km by cutting down solo travel.' },
  { id: 'wfh', label: 'Work from Home Avoided Trip', rate: 0.18, icon: '🏠', color: 'bg-purple-50 text-purple-800 border-purple-150', desc: 'Avoids average transit daily mileage baseline (~0.18 kg/km avoided commute).' }
];

export const DailyLogReminder: React.FC<DailyLogReminderProps> = ({
  committedActionIds,
  onNavigateToPledges
}) => {
  // Safe robust date calculate functions
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getYesterdayString = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  // Storage and state
  const [logData, setLogData] = useState<DailyLogData>(() => {
    try {
      const saved = localStorage.getItem('carbon_platform_daily_habits_log');
      const parsed = saved ? JSON.parse(saved) : null;
      return {
        lastLoggedDate: parsed?.lastLoggedDate || null,
        streakCount: parsed?.streakCount || 0,
        history: parsed?.history || {},
        dismissedDate: parsed?.dismissedDate || null,
        manualActivities: parsed?.manualActivities || {}
      };
    } catch {
      return {
        lastLoggedDate: null,
        streakCount: 0,
        history: {},
        dismissedDate: null,
        manualActivities: {}
      };
    }
  });

  // Active Logging Navigation mode: 'pledges' | 'manual' | 'streaks'
  const [activeTab, setActiveTab2] = useState<'pledges' | 'manual' | 'streaks'>('manual');

  const subtractDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Input States for Manual logging mode
  const [actType, setActType] = useState('cycling');
  const [actDistance, setActDistance] = useState('');
  const [actDesc, setActDesc] = useState('');

  // Checklist of custom completed IDs for today
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  // Sync state back to localStorage
  useEffect(() => {
    localStorage.setItem('carbon_platform_daily_habits_log', JSON.stringify(logData));
  }, [logData]);

  // Set default checked values to be equal to committed action IDs when tracker opens
  useEffect(() => {
    if (committedActionIds.length > 0) {
      // If we already logged today in history, pull those instead of defaulting to all committed
      const loggedToday = logData.history[todayStr];
      if (loggedToday) {
        setCheckedIds(loggedToday);
      } else {
        setCheckedIds(committedActionIds);
      }
    }
  }, [committedActionIds, logData.history, todayStr]);

  const hasLoggedToday = logData.lastLoggedDate === todayStr;
  const isDismissed = logData.dismissedDate === todayStr;

  // Toggle checklist items
  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Add Manual Physical Activity Entry
  const handleAddManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceVal = parseFloat(actDistance);
    if (isNaN(distanceVal) || distanceVal <= 0) return;

    const preset = ACTIVITY_PRESETS.find(p => p.id === actType);
    if (!preset) return;

    const savedCo2Val = distanceVal * preset.rate;
    
    const newEntry: ManualActivityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      activityType: actType,
      distanceKm: distanceVal,
      description: actDesc.trim() || `${preset.label}`,
      carbonAvoidedKg: parseFloat(savedCo2Val.toFixed(3)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLogData(prev => {
      const curManual = prev.manualActivities || {};
      const currentDayList = curManual[todayStr] || [];
      return {
        ...prev,
        manualActivities: {
          ...curManual,
          [todayStr]: [...currentDayList, newEntry]
        }
      };
    });

    // Reset inputs
    setActDistance('');
    setActDesc('');

    // Trigger celebration / note
    setCelebrationMessage(
      `Logged Manual Activity! You traveled ${distanceVal} km with ${preset.label} and prevented approx. ${savedCo2Val.toFixed(2)} kg of CO₂e emissions!`
    );
    setTimeout(() => {
      setCelebrationMessage(null);
    }, 4500);
  };

  // Remove Manual Physical Activity Entry
  const handleRemoveManualActivity = (id: string) => {
    setLogData(prev => {
      const curManual = prev.manualActivities || {};
      const currentDayList = curManual[todayStr] || [];
      return {
        ...prev,
        manualActivities: {
          ...curManual,
          [todayStr]: currentDayList.filter(item => item.id !== id)
        }
      };
    });
  };

  // Log today's entry
  const handleSubmitLog = () => {
    const isConsecutive = logData.lastLoggedDate === yesterdayStr;
    const isAlreadyLogged = logData.lastLoggedDate === todayStr;
    
    let newStreak = logData.streakCount;
    if (!isAlreadyLogged) {
      if (isConsecutive) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    setLogData((prev) => ({
      ...prev,
      lastLoggedDate: todayStr,
      streakCount: newStreak,
      history: {
        ...prev.history,
        [todayStr]: checkedIds
      }
    }));

    // Trigger celebration message
    const completedCount = checkedIds.length;
    const savedActions = REDUCTION_ACTIONS.filter(a => checkedIds.includes(a.id));
    const totalDailySavingKg = savedActions.reduce((acc, curr) => acc + (curr.co2SavingKg / 365), 0);
    const manualToday = logData.manualActivities?.[todayStr] || [];
    const totalManualSavingKg = manualToday.reduce((acc, curr) => acc + curr.carbonAvoidedKg, 0);
    const aggregateDailySaved = totalDailySavingKg + totalManualSavingKg;
    
    setCelebrationMessage(
      `Pledges Logged! You maintained ${completedCount} carbon-saving habit${completedCount !== 1 ? 's' : ''} today, offsetting approximately ${aggregateDailySaved.toFixed(2)} kg of CO₂e for the day! Streak: ${newStreak} day${newStreak !== 1 ? 's' : ''}!`
    );

    setIsChecklistOpen(false);

    // Fade out notification celebration
    setTimeout(() => {
      setCelebrationMessage(null);
    }, 6000);
  };

  // Reset log / testing purposes
  const handleResetStreak = () => {
    setLogData({
      lastLoggedDate: null,
      streakCount: 0,
      history: {},
      dismissedDate: null,
      manualActivities: {}
    });
    setCheckedIds(committedActionIds);
    setCelebrationMessage("Log history cleared. Start fresh!");
    setTimeout(() => setCelebrationMessage(null), 2500);
  };

  const getActionStreakData = (actionId: string) => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Check if completed today or yesterday
    const completedToday = !!logData.history[todayStr]?.includes(actionId);
    const completedYesterday = !!logData.history[yesterdayStr]?.includes(actionId);

    if (completedToday || completedYesterday) {
      let checkDateStr = completedToday ? todayStr : yesterdayStr;
      let dayOffset = 0;
      while (true) {
        const dateToCheck = subtractDays(checkDateStr, dayOffset);
        if (logData.history[dateToCheck]?.includes(actionId)) {
          currentStreak++;
          dayOffset++;
        } else {
          break;
        }
      }
    }

    // Now calculate all-time max streak
    // Get all calendar dates from history
    const historyDates = Object.keys(logData.history).sort();
    if (historyDates.length > 0) {
      const start = new Date(historyDates[0]);
      const end = new Date(todayStr);
      let runningStreak = 0;
      
      const currentIter = new Date(start);
      while (currentIter <= end) {
        const iterStr = currentIter.toISOString().split('T')[0];
        if (logData.history[iterStr]?.includes(actionId)) {
          runningStreak++;
          if (runningStreak > maxStreak) {
            maxStreak = runningStreak;
          }
        } else {
          runningStreak = 0;
        }
        currentIter.setDate(currentIter.getDate() + 1);
      }
    }

    // Completion rate over the last 7 days
    let completedLast7 = 0;
    const last7Days: { dateStr: string; label: string; completed: boolean }[] = [];
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const dateToCheck = subtractDays(todayStr, i);
      const wasCompleted = !!logData.history[dateToCheck]?.includes(actionId);
      if (wasCompleted) {
        completedLast7++;
      }
      
      const dObj = new Date(dateToCheck);
      const dayLabel = daysArr[dObj.getDay()];
      last7Days.push({
        dateStr: dateToCheck,
        label: dayLabel,
        completed: wasCompleted
      });
    }

    const ratePercentage = Math.min(100, Math.round((completedLast7 / 7) * 100));

    return {
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      ratePercentage,
      last7Days
    };
  };

  const handleSeedMockHistory = () => {
    if (committedActionIds.length === 0) {
      setCelebrationMessage("Please commit/pledge to at least one habit first so we can seed its history!");
      setTimeout(() => setCelebrationMessage(null), 3000);
      return;
    }

    const newHistory: { [date: string]: string[] } = {};
    
    // Seed the last 6 days plus today
    for (let i = 0; i <= 6; i++) {
      const dateToCheck = subtractDays(todayStr, i);
      // Seed committed actions, randomly skipping some occasionally to look organic
      newHistory[dateToCheck] = committedActionIds.filter((_, idx) => {
        return (i + idx) % 5 !== 3;
      });
    }

    setLogData((prev) => ({
      ...prev,
      lastLoggedDate: todayStr,
      streakCount: 7,
      history: {
        ...prev.history,
        ...newHistory
      }
    }));

    setCelebrationMessage("Successfully seeded 7 days of organic habit history! Explore your streaks & live calendar details now below.");
    setActiveTab2('streaks');
    setTimeout(() => setCelebrationMessage(null), 5000);
  };

  // Count active committed pledges
  const activeCount = committedActionIds.length;

  // Gather current day manual calculations
  const manualActivitiesToday = logData.manualActivities?.[todayStr] || [];
  const manualDailySavingsTotal = manualActivitiesToday.reduce((sum, item) => sum + item.carbonAvoidedKg, 0);

  return (
    <div className="w-full space-y-4" id="daily-climate-logger-module">
      <AnimatePresence>
        {celebrationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 flex items-start gap-3.5 shadow-md relative overflow-hidden z-30"
          >
            <div className="absolute right-0 top-0 select-none opacity-5 text-white pointer-events-none translate-x-4 -translate-y-4">
              <Award size={100} />
            </div>
            <span className="p-2 bg-emerald-850 rounded-lg text-emerald-300 shrink-0 select-none animate-bounce">
              <Sparkles size={16} />
            </span>
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-white uppercase tracking-wider mb-0.5">EcoTrace Daily Log Lock-In!</p>
              <p className="leading-relaxed font-normal">{celebrationMessage}</p>
            </div>
            <button
              onClick={() => setCelebrationMessage(null)}
              className="text-emerald-400 hover:text-emerald-250 cursor-pointer text-xs font-bold px-1.5"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main unified logging frame (always visible to support manual logs & habit checklists) */}
      <div 
        className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs relative overflow-hidden"
        id="unified-daily-tracker-card"
      >
        {/* Decorative badge background element */}
        <div className="absolute right-0 top-0 select-none opacity-[0.02] text-zinc-800 pointer-events-none translate-x-12 -translate-y-6 scale-150">
          <CalendarRange size={180} />
        </div>

        {/* Card Header & Aggregates */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4 mb-5">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black text-emerald-800 bg-[#e6f4ea] px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-widest leading-none">
              <CalendarRange size={11} className="stroke-[2]" />
              Manual & Active Habits Log
            </span>
            <h3 className="text-zinc-900 font-extrabold text-sm uppercase tracking-tight">
              Daily Activity & Pledges Auditing
            </h3>
            <p className="text-zinc-400 text-[11px] font-medium leading-normal">
              Directly type physical trips, bike miles, and transit distances to dynamically audit daily footprint offsets.
            </p>
          </div>

          {/* Dynamic state badges */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {logData.streakCount > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-lg font-mono text-[10px] font-black shadow-3xs">
                <Flame size={12} className="fill-amber-400 stroke-amber-600 animate-pulse" />
                <span>{logData.streakCount} Day Streak</span>
              </div>
            )}
            <span className={`text-[9px] font-black uppercase font-mono px-2.5 py-1 rounded border shadow-3xs ${
              hasLoggedToday 
                ? 'bg-emerald-50 text-[#059669] border-emerald-100'
                : 'bg-zinc-100 text-zinc-550 border-zinc-200/80'
            }`}>
              {hasLoggedToday ? 'Logged Today' : 'Awaiting Audit'}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-zinc-200 mb-5 text-xs font-bold uppercase tracking-wider text-zinc-500">
          <button
            onClick={() => setActiveTab2('manual')}
            className={`pb-2.5 px-4 font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'text-zinc-900 border-zinc-900 font-extrabold'
                : 'text-zinc-400 border-transparent hover:text-zinc-750'
            }`}
          >
            🏃 Manual Activity & Distance Log 🚶
          </button>
          
          <button
            onClick={() => setActiveTab2('pledges')}
            className={`pb-2.5 px-4 font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pledges'
                ? 'text-zinc-900 border-zinc-900 font-extrabold'
                : 'text-zinc-400 border-transparent hover:text-zinc-750'
            }`}
          >
            📋 Habit Pledge Checklist
            {activeCount > 0 && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] px-1.5 rounded-md">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab2('streaks')}
            className={`pb-2.5 px-4 font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'streaks'
                ? 'text-zinc-900 border-zinc-900 font-extrabold'
                : 'text-zinc-400 border-transparent hover:text-zinc-750'
            }`}
          >
            🔥 Habit Streaks Tracker
            {activeCount > 0 && (
              <span className="bg-amber-50 text-amber-800 border border-amber-250 text-[9px] px-1.5 rounded-md flex items-center gap-0.5 font-mono">
                <Flame size={9} className="fill-amber-400 text-amber-600" />
                <span>Streaks</span>
              </span>
            )}
          </button>
        </div>

        {/* Tab contents */}
        <div>
          {activeTab === 'manual' && (
            <div className="space-y-5" id="manual-distance-log-tab">
              {/* Manual Input Form */}
              <form onSubmit={handleAddManualActivity} className="p-4 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-4 shadow-3xs">
                <div className="flex items-center gap-1.5 text-zinc-800 text-[10px] font-extrabold uppercase font-mono tracking-wider">
                  <Navigation size={12} className="text-zinc-500" />
                  <span>Log a physical activity or transit trip</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Activity Preset selector */}
                  <div className="md:col-span-4 flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-tight">Activity Type</label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      {ACTIVITY_PRESETS.map(preset => (
                        <option key={preset.id} value={preset.id}>
                          {preset.icon} {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Distance Keying */}
                  <div className="md:col-span-3 flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-tight flex items-center gap-1">
                      <span>Distance Traveling</span>
                      <span className="text-[9.5px] lowercase font-normal italic font-mono text-zinc-450">(kilometers)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={actDistance}
                        onChange={(e) => setActDistance(e.target.value)}
                        placeholder="e.g. 12.5"
                        required
                        className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-10 py-1.5 text-xs text-zinc-800 font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-[10px] font-sans font-bold text-zinc-400">
                        km
                      </span>
                    </div>
                  </div>

                  {/* Description / custom note */}
                  <div className="md:col-span-5 flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-tight">Trip Purpose / Custom label</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={actDesc}
                        onChange={(e) => setActDesc(e.target.value)}
                        placeholder="e.g. Morning commute to tech hub, local grocery trip"
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-700 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white text-[10px] uppercase font-black tracking-wider rounded-lg shrink-0 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={12} className="stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footnote on selected rate savings */}
                {actType && (
                  <div className="text-[10.5px] text-zinc-450 font-medium flex items-start gap-1.5 bg-white p-2.5 rounded border border-zinc-150/70">
                    <Info size={13} className="text-[#059669] shrink-0 mt-0.5" />
                    <span>
                      <strong>Offset multiplier:</strong> {ACTIVITY_PRESETS.find(p => p.id === actType)?.desc}
                    </span>
                  </div>
                )}
              </form>

              {/* List of currently recorded physical activities */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase font-mono tracking-wider text-zinc-400">
                    Logged Activities for Today ({todayStr})
                  </h4>
                  {manualActivitiesToday.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                      Total Avoided: <strong className="font-mono">{manualDailySavingsTotal.toFixed(2)} kg CO₂e</strong>
                    </span>
                  )}
                </div>

                {manualActivitiesToday.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 rounded-xl p-5 text-center text-xs text-zinc-450 bg-[#fafafa]">
                    <span className="text-xl inline-block mb-1 select-none">🗺️</span>
                    <p className="font-bold text-zinc-700 mb-0.5 uppercase tracking-tight">No physical activity logged today yet</p>
                    <p className="text-[10px] max-w-sm mx-auto text-zinc-400 font-normal">
                      Use the distance form above to write down walks, bicycle commutes, or bus transit, and see carbon savings construct live dynamically!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white shadow-3xs">
                    <table className="w-full text-left text-xs text-zinc-700 border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          <th className="px-4 py-2.5">Preset</th>
                          <th className="px-4 py-2.5">Trip Description</th>
                          <th className="px-4 py-2.5 text-right">Distance</th>
                          <th className="px-4 py-2.5 text-right text-emerald-800">Carbon Prevented</th>
                          <th className="px-4 py-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-xs">
                        {manualActivitiesToday.map((item) => {
                          const preset = ACTIVITY_PRESETS.find(p => p.id === item.activityType);
                          return (
                            <tr key={item.id} className="hover:bg-zinc-50/50">
                              <td className="px-4 py-3 whitespace-nowrap font-bold">
                                <span className="inline-block mr-1.5 text-sm">{preset?.icon}</span>
                                <span className="text-zinc-600 font-mono text-[10px] uppercase">{preset?.label}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-zinc-800 max-w-xs truncate">
                                {item.description}
                                <span className="block text-[9px] text-zinc-400 font-normal">{item.timestamp}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-zinc-600 whitespace-nowrap">
                                {item.distanceKm.toFixed(1)} km
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-black text-[#059669] whitespace-nowrap bg-emerald-50/20">
                                -{item.carbonAvoidedKg.toFixed(2)} kg
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleRemoveManualActivity(item.id)}
                                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete entry"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pledges' && (
            <div className="space-y-4" id="pledge-checklist-tab">
              {activeCount === 0 ? (
                <div className="p-5 border border-dashed border-zinc-200 bg-[#fafbfa] rounded-xl text-center text-xs text-zinc-400">
                  <Info size={16} className="mx-auto text-zinc-400 mb-2" />
                  <p className="font-extrabold text-zinc-700 uppercase tracking-tight">No Active Habit Pledges Saved</p>
                  <p className="text-[10px] text-zinc-400 font-normal max-w-sm mx-auto mt-0.5">
                    You haven't committed to any recurring lifestyle habits on the pledges page yet. Commit to habits like WFH, vegan meals, or cycling to see them listed here so you can tick them off daily!
                  </p>
                  <button
                    onClick={onNavigateToPledges}
                    className="px-4 py-1.5 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition-all"
                  >
                    Go choose some pledges →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Active Lifestyle Pledges Audit checklist</span>
                    <span className="text-emerald-700">Checked values commit today</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                    {REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id)).map(action => {
                      const isChecked = checkedIds.includes(action.id);
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleToggleCheck(action.id)}
                          className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-white border-emerald-250 shadow-3xs'
                              : 'bg-zinc-50 border-zinc-200/80 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5 text-emerald-600">
                            {isChecked ? (
                              <CheckSquare size={17} className="fill-emerald-50 text-emerald-600" />
                            ) : (
                              <Square size={17} className="text-zinc-350" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate uppercase tracking-tight">{action.title}</p>
                            <p className="text-zinc-400 text-[10px] truncate">{action.description}</p>
                            <span className="inline-block text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1">
                              -{(action.co2SavingKg / 365).toFixed(2)} kg/day
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-100 pt-4 mt-2">
                    <div className="text-[10px] text-zinc-400 font-medium">
                      Pressing Lock-In fires streak counts and saves todays completion list.
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {logData.streakCount > 0 && (
                        <button
                          onClick={handleResetStreak}
                          className="text-[9.5px] font-bold uppercase text-rose-500 hover:text-rose-700 cursor-pointer mr-3"
                        >
                          Reset Streak Log
                        </button>
                      )}

                      <button
                        onClick={handleSubmitLog}
                        className="px-4.5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-2xs cursor-pointer text-center"
                      >
                        Resave Checked Log
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'streaks' && (
            <div className="space-y-6" id="habit-streaks-tab-content">
              {/* Top Summary Info Card */}
              <div className="p-4.5 bg-[#fafafb] border border-zinc-200 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-zinc-900 font-extrabold text-xs uppercase tracking-tight flex items-center gap-1.5">
                      <span>🔥 Habit Streaks Dashboard</span>
                    </h4>
                    <p className="text-zinc-500 text-[10.5px] font-medium leading-relaxed">
                      Maintaining habit loops consecutive days creates deep ecological resilience. Lock-in your completed checklists daily to build these streak chains!
                    </p>
                  </div>

                  {/* Seed Demo button */}
                  <button
                    onClick={handleSeedMockHistory}
                    className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 text-zinc-700 hover:text-emerald-800 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition shadow-3xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    title="Populates last 7 days of checklist logs with realistic historical completions to instantly test features."
                  >
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>Seed 7-Day Demo History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-zinc-150 p-3.5 rounded-lg space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono text-zinc-400 block">Overall Logging Streak</span>
                    <div className="flex items-center gap-1.5">
                      <Flame className="text-amber-500 fill-amber-400" size={18} />
                      <span className="font-mono text-base font-black text-zinc-900">{logData.streakCount} Days</span>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-150 p-3.5 rounded-lg space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono text-zinc-400 block">Committed Focus Habits</span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="text-[#059669]" size={16} />
                      <span className="font-mono text-base font-black text-zinc-900">{activeCount} Habits</span>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-150 p-3.5 rounded-lg space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono text-zinc-400 block">Logging Consistency</span>
                    <span className="font-mono text-sm font-extrabold text-zinc-650">
                      {logData.lastLoggedDate ? `Last: ${logData.lastLoggedDate}` : 'No records yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Committed Habits Loop */}
              {activeCount === 0 ? (
                <div className="p-5 border border-dashed border-zinc-200 bg-[#fafbfa] rounded-xl text-center text-xs text-zinc-400">
                  <Info size={16} className="mx-auto text-zinc-400 mb-2" />
                  <p className="font-extrabold text-zinc-700 uppercase tracking-tight">No Active Habit Pledges Saved</p>
                  <p className="text-[10px] text-zinc-400 font-normal max-w-sm mx-auto mt-0.5">
                    Choose and commit to recurring lifestyle habits on the pledges page first. They will dynamically compile here with streak metrics!
                  </p>
                  <button
                    onClick={onNavigateToPledges}
                    className="px-4 py-1.5 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition-all"
                  >
                    Go choose some pledges →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4" id="habit-streaks-grid">
                  {REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id)).map(action => {
                    const streakStats = getActionStreakData(action.id);
                    return (
                      <div 
                        key={action.id}
                        className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-all shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        {/* Left: Habit Identity Info */}
                        <div className="space-y-2 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <h5 className="font-extrabold text-xs text-zinc-900 uppercase tracking-tight">{action.title}</h5>
                          </div>
                          <p className="text-zinc-500 text-[10.5px] leading-relaxed font-medium">
                            {action.description}
                          </p>
                          <span className="inline-block text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.2">
                            Defends -{action.co2SavingKg} kg CO₂ / yr
                          </span>
                        </div>

                        {/* Middle: 7-Day Visual Calendar Bar */}
                        <div className="space-y-2 shrink-0">
                          <p className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-zinc-450">
                            Last 7 Days Loop Completion
                          </p>
                          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
                            {streakStats.last7Days.map((day, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-1" title={`${day.dateStr}: ${day.completed ? 'Completed' : 'No record'}`}>
                                <span className="text-[8px] font-black uppercase text-zinc-400 font-mono w-7 text-center">
                                  {day.label}
                                </span>
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold border transition ${
                                  day.completed
                                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-3xs'
                                    : 'bg-white text-zinc-300 border-zinc-200'
                                }`}>
                                  {day.completed ? '✔' : '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Streak count figures & Consistency % badge */}
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:w-36 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-150 md:pl-5">
                          <div className="flex items-center gap-1.5 md:justify-start">
                            <Flame className={`w-4 h-4 ${streakStats.currentStreak > 0 ? 'text-amber-500 fill-amber-400' : 'text-zinc-300'}`} />
                            <div className="leading-tight text-left">
                              <span className="block text-[8px] uppercase font-black font-mono text-zinc-450 leading-none">Current</span>
                              <span className="font-mono text-xs font-black text-zinc-900">{streakStats.currentStreak} Days</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 md:justify-start">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <div className="leading-tight text-left">
                              <span className="block text-[8px] uppercase font-black font-mono text-zinc-450 leading-none">Record High</span>
                              <span className="font-mono text-xs font-black text-zinc-900">{streakStats.maxStreak} Days</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 md:justify-start">
                            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                            <div className="leading-tight text-left">
                              <span className="block text-[8px] uppercase font-black font-mono text-zinc-450 leading-none">7-Day Rate</span>
                              <span className="font-mono text-xs font-black text-emerald-800">{streakStats.ratePercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
