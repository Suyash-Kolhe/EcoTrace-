/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { FootprintBreakdown } from '../types';
import { GLOBAL_COMPARISONS } from '../utils/carbonCalculator';
import { Landmark, Target, Award, Globe } from 'lucide-react';

interface HistoryChartProps {
  currentBreakdown: FootprintBreakdown;
  activeEmissionsWithSavings: number; // emissions reflecting active commits
  committedSavings: number;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({
  currentBreakdown,
  activeEmissionsWithSavings,
  committedSavings
}) => {
  // 1. Simulate 5 months of progress leading into their current results
  const historicalData = [
    { month: 'Jan', Transport: 3100, Energy: 2200, Food: 1950, Shopping: 1100, Total: 8350 },
    { month: 'Feb', Transport: 3000, Energy: 2150, Food: 1900, Shopping: 1050, Total: 8100 },
    { month: 'Mar', Transport: 2900, Energy: 1800, Food: 1850, Shopping: 950, Total: 7500 },
    { month: 'Apr', Transport: 2800, Energy: 1750, Food: 1800, Shopping: 900, Total: 7250 },
    { month: 'May', Transport: 2600, Energy: 1600, Food: 1800, Shopping: 850, Total: 6850 },
    {
      month: 'Active',
      Transport: currentBreakdown.transport,
      Energy: currentBreakdown.energy,
      Food: currentBreakdown.food,
      Shopping: currentBreakdown.shopping,
      Total: currentBreakdown.total
    }
  ];

  // 2. Comparison groups: Active vs Averages (in tonnes)
  const comparisonsData = [
    {
      name: 'Your Base',
      emissions: Number((currentBreakdown.total / 1000).toFixed(2)),
      fill: '#a8a29e' // stone-400
    },
    {
      name: 'Your Pledge',
      emissions: Number((activeEmissionsWithSavings / 1000).toFixed(2)),
      fill: '#059669' // emerald-600
    },
    {
      name: 'India Avg',
      emissions: GLOBAL_COMPARISONS.indiaAverage / 1000,
      fill: '#f97316' // orange-500 (saffron)
    },
    {
      name: 'World Avg',
      emissions: GLOBAL_COMPARISONS.worldAverage / 1000,
      fill: '#eab308' // yellow-500
    },
    {
      name: 'EU Avg',
      emissions: GLOBAL_COMPARISONS.euAverage / 1000,
      fill: '#78716c' // stone-500
    },
    {
      name: 'Paris 2030',
      emissions: GLOBAL_COMPARISONS.globalTarget2030 / 1000,
      fill: '#3b82f6' // blue-500
    }
  ];

  // Tooltip Formatter
  const valueFormatter = (value: any) => [`${parseFloat(value).toLocaleString()} kg CO₂`, 'Emissions'];
  const comparisonFormatter = (value: any) => [`${parseFloat(value).toFixed(2)} tonnes CO₂`, 'Per capita / yr'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="history-charts-container">
      {/* Historical Track */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-4 mb-4">
          <div>
            <span className="text-[9px] uppercase font-black tracking-widest text-[#059669] bg-[#f0f9f3] px-2.5 py-0.5 rounded border border-emerald-100 font-mono">
              Ecological History
            </span>
            <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight mt-1.5">Footprint Progress Track</h3>
          </div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Stacked emissions by tracking month (kg CO₂e)</p>
        </div>

        {/* Breakdown Stacked Area Chart */}
        <div className="h-[280px]" id="area-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorShopping" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f0" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip formatter={valueFormatter} contentStyle={{ background: '#F8FAF8', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '11px' }} />
              <Legend verticalAlign="top" iconType="circle" height={36} wrapperStyle={{ fontSize: '11px', color: '#52525b' }} />
              <Area type="monotone" dataKey="Transport" stackId="1" stroke="#10b981" fillOpacity={0.15} fill="#10b981" />
              <Area type="monotone" dataKey="Energy" stackId="1" stroke="#f59e0b" fillOpacity={0.15} fill="#f59e0b" />
              <Area type="monotone" dataKey="Food" stackId="1" stroke="#047857" fillOpacity={0.15} fill="#047857" />
              <Area type="monotone" dataKey="Shopping" stackId="1" stroke="#a855f7" fillOpacity={0.15} fill="#a855f7" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparisons Panel */}
      <div className="xl:col-span-5 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-4 mb-4">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-[#059669] bg-[#f0f9f3] px-2.5 py-0.5 rounded border border-emerald-100 font-mono">
                Comparative benchmarks
              </span>
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight mt-1.5 font-sans">Target Calibration</h3>
            </div>
          </div>

          {/* Comparisons Bar Chart */}
          <div className="h-[210px]" id="bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonsData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f0" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} interval={0} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip formatter={comparisonFormatter} contentStyle={{ background: '#F8FAF8', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
                  {comparisonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                {/* Benchmark references */}
                <ReferenceLine y={GLOBAL_COMPARISONS.globalTarget2030 / 1000} stroke="#3b82f6" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone reports */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-150 text-center">
          <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 flex flex-col justify-between h-20">
            <span className="text-[9px] text-zinc-400 font-bold uppercase font-mono block">Paris limit</span>
            <span className="text-sm font-black text-blue-600 block my-1">2.0 tonnes</span>
            <span className="text-[9px] text-zinc-400 leading-none">Stay below 1.5C</span>
          </div>

          <div className="bg-[#f0f9f3] p-2.5 rounded-lg border border-emerald-100 flex flex-col justify-between h-20">
            <span className="text-[9px] text-[#047857] font-black uppercase font-mono block">Your pledge</span>
            <span className="text-sm font-black text-emerald-800 block my-1">
              {(activeEmissionsWithSavings / 1000).toFixed(2)} t
            </span>
            <span className="text-[9px] text-emerald-800 leading-none font-bold">Active choice</span>
          </div>

          <div className="bg-[#fff7ed] p-2.5 rounded-lg border border-orange-100 flex flex-col justify-between h-20">
            <span className="text-[9px] text-orange-700 font-black uppercase font-mono block">India average</span>
            <span className="text-sm font-black text-orange-700 block my-1">1.9 tonnes</span>
            <span className="text-[9px] text-orange-655 leading-none font-semibold">Low-footprint cap</span>
          </div>
        </div>
      </div>
    </div>
  );
};
