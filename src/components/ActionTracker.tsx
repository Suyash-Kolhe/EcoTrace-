/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActionItem } from '../types';
import { REDUCTION_ACTIONS } from '../data/actions';
import { CheckCircle2, Circle, Filter, ArrowUpRight, Award, Zap, HelpCircle } from 'lucide-react';

interface ActionTrackerProps {
  committedActionIds: string[];
  onToggleAction: (actionId: string) => void;
  baseEmissionsTotal: number;
}

export const ActionTracker: React.FC<ActionTrackerProps> = ({
  committedActionIds,
  onToggleAction,
  baseEmissionsTotal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transport' | 'energy' | 'food' | 'shopping'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Calculate savings of committed actions
  const committedActions = REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id));
  const totalSavings = committedActions.reduce((acc, curr) => acc + curr.co2SavingKg, 0);
  const percentageReduced = baseEmissionsTotal > 0 ? Math.min(100, Math.round((totalSavings / baseEmissionsTotal) * 100)) : 0;

  // Filter actions list
  const filteredActions = REDUCTION_ACTIONS.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs" id="action-tracker-panel">
      {/* Target Progress Summary Card */}
      <div className="bg-[#1A2E1A] rounded-xl p-6 text-white mb-6 relative overflow-hidden">
        {/* Decorative graphic background */}
        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-12 translate-y-12 select-none">
          <Award size={240} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-250 text-[10px] font-extrabold uppercase tracking-widest mb-3 border border-emerald-700/60">
              <Award size={12} />
              Reduction Target Center
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">Your Climate Action Pledge</h3>
            <p className="text-zinc-300 text-xs mt-1.5 max-w-lg leading-relaxed">
              Adopt custom carbon-saving habits. Each choice offsets your active footprint calculation immediately, simulating long-term ecological balance.
            </p>
          </div>

          <div className="shrink-0 bg-white/5 backdrop-blur-xs border border-white/10 p-5 rounded-xl text-center md:text-right min-w-[170px]">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a7f3d0]">Committed Offset</p>
            <p className="font-mono text-xl sm:text-2xl font-black text-[#a7f3d0] mt-1.5">
              -{totalSavings.toLocaleString()}{' '}
              <span className="text-[10px] font-sans text-white/70 uppercase tracking-wider">kg/yr</span>
            </p>
            <p className="text-[11px] text-zinc-300 mt-1">
              Reduced footprint by <span className="font-mono font-bold text-white bg-emerald-800 px-1.5 py-0.5 rounded">{percentageReduced}%</span>
            </p>
          </div>
        </div>

        {/* Progress bar to visual reduction goal */}
        <div className="mt-6 relative z-10">
          <div className="flex justify-between text-[11px] text-zinc-300 mb-1.5 font-bold uppercase tracking-wider">
            <span>SAVINGS TARGET ACHIEVEMENT</span>
            <span>{percentageReduced}% / 30% baseline goal</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (percentageReduced / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 text-zinc-600 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs uppercase tracking-wider shrink-0">
            <Filter size={14} className="text-zinc-400" />
            <span>Refine Pledges ({filteredActions.length} choices)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Select Buttons */}
            <div className="flex items-center gap-1 bg-[#F7F9F7] p-1 rounded-lg border border-zinc-200 text-xs shadow-xs max-w-full overflow-x-auto">
              {(['all', 'transport', 'energy', 'food', 'shopping'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-zinc-800 text-white font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {cat === 'all' ? 'All Areas' : cat}
                </button>
              ))}
            </div>

            {/* Difficulty Toggle Buttons */}
            <div className="flex items-center gap-1 bg-[#F7F9F7] p-1 rounded-lg border border-zinc-200 text-xs shadow-xs">
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition cursor-pointer shrink-0 ${
                    selectedDifficulty === diff
                      ? 'bg-emerald-600 text-white font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {diff === 'all' ? 'All Difficulties' : diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.length > 0 ? (
          filteredActions.map((action) => {
            const isCommitted = committedActionIds.includes(action.id);
            return (
              <button
                key={action.id}
                id={`action-item-${action.id}`}
                onClick={() => onToggleAction(action.id)}
                className={`group p-5 rounded-xl border text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                  isCommitted
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-xs ring-4 ring-emerald-50/50'
                    : 'border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50'
                }`}
              >
                {/* Selection Circle Selector Icon */}
                <span className="mt-0.5 shrink-0 transition-transform group-hover:scale-105">
                  {isCommitted ? (
                    <CheckCircle2 className="text-emerald-600 fill-emerald-100" size={20} />
                  ) : (
                    <Circle className="text-zinc-300 hover:text-zinc-400" size={20} />
                  )}
                </span>

                {/* Body Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] tracking-widest uppercase font-bold font-mono text-zinc-400">
                      {action.category}
                    </span>
                    <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                      action.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : action.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-800 border border-amber-100'
                        : 'bg-[#fdf2f2] text-rose-800 border border-rose-100'
                    }`}>
                      {action.difficulty}
                    </span>
                  </div>

                  <h4 className="mt-1 font-bold text-zinc-900 text-sm group-hover:text-emerald-850">
                    {action.title}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed truncate-2-lines">
                    {action.description}
                  </p>

                  <div className="flex items-center gap-1 mt-4">
                    <span className="font-mono text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      -{action.co2SavingKg} kg CO₂/yr
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 ml-auto font-medium">
                      <Zap size={10} className="text-amber-400" />
                      Climate impact
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <HelpCircle size={32} className="mx-auto text-zinc-300 animate-bounce mb-2" />
            <p className="font-bold text-zinc-600 text-sm">No actions fit these filters</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 leading-relaxed">
              Try readjusting your category buttons or selecting &ldquo;All Difficulties&rdquo; to unlock reduction activities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
