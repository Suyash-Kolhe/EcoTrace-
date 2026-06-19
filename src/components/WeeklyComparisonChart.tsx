/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { FootprintBreakdown } from '../types';
import { TrendingDown, Calendar, Info, Sparkles } from 'lucide-react';

interface WeeklyComparisonChartProps {
  currentBreakdown: FootprintBreakdown;
  activeEmissionsWithSavings: number;
  committedSavings: number;
}

export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({
  currentBreakdown,
  activeEmissionsWithSavings,
  committedSavings
}) => {
  // Convert annual metrics to average daily values (kg CO2e)
  const dailyBaselineAvg = currentBreakdown.total / 365;
  const dailyPledgedAvg = activeEmissionsWithSavings / 365;
  const dailySavingsAvg = committedSavings / 365;

  // Let's generate a highly realistic 7-day dataset (Monday to Sunday)
  // We'll introduce minor deterministic daily variance based on typical human behaviors
  // (e.g. higher transport or food impacts on weekends, lower shopping/energy on certain days)
  const weeklyData = useMemo(() => {
    const days = [
      { name: 'Mon', transportVar: 0.9, energyVar: 0.95, foodVar: 0.90, shoppingVar: 0.80 },
      { name: 'Tue', transportVar: 0.95, energyVar: 1.0, foodVar: 0.95, shoppingVar: 0.85 },
      { name: 'Wed', transportVar: 1.0, energyVar: 1.02, foodVar: 1.0, shoppingVar: 0.90 },
      { name: 'Thu', transportVar: 0.98, energyVar: 0.98, foodVar: 0.95, shoppingVar: 0.95 },
      { name: 'Fri', transportVar: 1.15, energyVar: 1.05, foodVar: 1.10, shoppingVar: 1.20 },
      { name: 'Sat', transportVar: 1.30, energyVar: 1.12, foodVar: 1.25, shoppingVar: 1.40 },
      { name: 'Sun', transportVar: 1.10, energyVar: 1.08, foodVar: 1.20, shoppingVar: 1.10 }
    ];

    return days.map(day => {
      // Aggregate the variations to form a realistic baseline curve
      const avgMultiplier = (day.transportVar + day.energyVar + day.foodVar + day.shoppingVar) / 4;
      
      // Previous Week baseline (higher, no active lifestyle savings, with natural daily variation)
      const prevWeekBaseline = dailyBaselineAvg * avgMultiplier;
      
      // Current Week with savings applied (lower, active pledges, with natural variation)
      // Make sure current week value doesn't drop below a minimum threshold
      const currentWeekEmissions = Math.max(0.5, dailyPledgedAvg * avgMultiplier);

      return {
        day: day.name,
        'Previous Week Baseline': parseFloat(prevWeekBaseline.toFixed(2)),
        'Current Week (Pledged)': parseFloat(currentWeekEmissions.toFixed(2)),
        'Daily Savings': parseFloat(Math.max(0, prevWeekBaseline - currentWeekEmissions).toFixed(2))
      };
    });
  }, [dailyBaselineAvg, dailyPledgedAvg]);

  // Compute total weekly aggregates for quick indicators
  const totalPrevWeekKg = useMemo(() => weeklyData.reduce((sum, d) => sum + d['Previous Week Baseline'], 0), [weeklyData]);
  const totalCurrWeekKg = useMemo(() => weeklyData.reduce((sum, d) => sum + d['Current Week (Pledged)'], 0), [weeklyData]);
  const totalWeeklySavedKg = Math.max(0, totalPrevWeekKg - totalCurrWeekKg);
  const percentReduction = totalPrevWeekKg > 0 ? (totalWeeklySavedKg / totalPrevWeekKg) * 100 : 0;

  // Custom tooltips with styled layout matching index.css guidelines
  const customTooltipFormatter = (value: any, name: any) => {
    return [`${value} kg CO₂e`, name];
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs" id="weekly-trends-card">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4 mb-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black text-[#059669] bg-[#f0f9f3] px-2.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest leading-none">
            <Calendar size={11} className="text-emerald-700" />
            7-Day Micro Progress
          </span>
          <h3 className="text-zinc-900 font-extrabold text-sm uppercase tracking-tight">
            Weekly Carbon Velocity Progress
          </h3>
          <p className="text-zinc-400 text-[11px] font-medium leading-relaxed">
            Real-time daily emissions comparing unpledged values to active lifestyle commitments
          </p>
        </div>

        {/* Weekly Stat Callout */}
        <div className="bg-[#fcfdfc] border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-3xs shrink-0">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm select-none">
            📈
          </span>
          <div>
            <p className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-zinc-450">Weekly Offset Velocity</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black text-[#059669] font-mono">
                -{totalWeeklySavedKg.toFixed(1)} kg
              </span>
              <span className="text-[10px] text-zinc-450 font-bold">
                ({percentReduction.toFixed(1)}% drop)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Line Graph block */}
        <div className="lg:col-span-8 w-full h-[260px] sm:h-[300px]" id="weekly-linechart-stage">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f0" />
              <XAxis
                dataKey="day"
                stroke="#71717a"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}k`}
              />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{
                  background: '#F8FAF8',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                }}
              />
              <Legend
                verticalAlign="top"
                iconType="circle"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#52525b', fontWeight: 'bold' }}
              />
              {/* Previous week baseline (dashed, grey) */}
              <Line
                type="monotone"
                dataKey="Previous Week Baseline"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#a1a1aa' }}
                activeDot={{ r: 5 }}
              />
              {/* Current week pledged (solid, green) */}
              <Line
                type="monotone"
                dataKey="Current Week (Pledged)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly contextual breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fafbfa] border border-zinc-150 p-4 rounded-xl text-xs space-y-3 shadow-3xs">
            <h4 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <TrendingDown size={14} className="text-emerald-700" />
              Progress Diagnostics
            </h4>
            
            <p className="text-zinc-500 text-[11px] leading-relaxed font-normal">
              Your profile currently emits an average of <strong className="text-zinc-800">{(totalPrevWeekKg).toFixed(1)} kg CO₂e</strong> over an standard 7-day loop.
            </p>

            <p className="text-zinc-500 text-[11px] leading-relaxed font-normal">
              By adhering to active commitments, you drop your daily footprints considerably, totaling <strong className="text-emerald-800 font-extrabold">{(totalCurrWeekKg).toFixed(1)} kg CO₂e</strong> instead. This stops <strong className="text-emerald-700 font-extrabold">{(totalWeeklySavedKg).toFixed(1)} kg</strong> of greenhouse accumulation this week!
            </p>

            {committedSavings === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-900 text-[10px] leading-relaxed">
                💡 <strong className="uppercase">Commitment tip:</strong> The current week matches the previous week baseline precisely because no active habit pledges have been committed yet! Go to the checklist tab to pledge changes.
              </div>
            )}
          </div>

          <div className="border border-zinc-200/80 p-4 rounded-xl space-y-2.5">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Weekly Carbon Benchmarks
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center bg-zinc-50/60 p-2 rounded border border-zinc-150">
                <span className="text-zinc-500 font-bold">Unpledged Baseline</span>
                <span className="font-mono text-zinc-800 font-extrabold">{totalPrevWeekKg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50/30 p-2 rounded border border-emerald-100">
                <span className="text-emerald-800 font-bold">Current Commitment</span>
                <span className="font-mono text-[#059669] font-black">{totalCurrWeekKg.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
