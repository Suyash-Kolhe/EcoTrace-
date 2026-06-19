/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Award, Trophy, Lock, CheckCircle2, TreePine, Sparkles, Flame, Zap, ShieldAlert, BadgeInfo } from 'lucide-react';

interface MilestonesSectionProps {
  committedSavings: number; // in kg
  activePledgesCount: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  conditionDescription: string;
  targetSavings?: number; // conditional threshold on CO2 saved (kg)
  targetCount?: number; // conditional threshold on active count (habits)
  badgeEmoji: string;
  accentClass: string; // for border/text highlights
  badgeIcon: React.ReactNode;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  committedSavings,
  activePledgesCount,
}) => {
  // Define standard milestone tiers
  const milestones: Milestone[] = useMemo(() => [
    {
      id: 'pledge-pioneer',
      title: 'Pledge Pioneer',
      description: 'Took the first crucial step toward decarbonization by committing to a sustainable habit.',
      conditionDescription: 'Commit to 1 or more active pledges',
      targetCount: 1,
      badgeEmoji: '🌱',
      accentClass: 'from-emerald-500 to-green-600',
      badgeIcon: <TreePine size={24} className="text-white" />
    },
    {
      id: 'co2-shaver',
      title: 'CO₂ Shaver',
      description: 'Shaved off your baseline footprint with effective small adjustments.',
      conditionDescription: 'Save 100 kg or more of annual CO₂e',
      targetSavings: 100,
      badgeEmoji: '⚡',
      accentClass: 'from-cyan-400 to-blue-500',
      badgeIcon: <Zap size={22} className="text-white" />
    },
    {
      id: 'half-tonne-shield',
      title: 'Half-Tonne Shield',
      description: 'Forged a solid defensive barrier against greenhouse emissions.',
      conditionDescription: 'Save 500 kg or more of annual CO₂e',
      targetSavings: 500,
      badgeEmoji: '🛡️',
      accentClass: 'from-amber-400 to-amber-600',
      badgeIcon: <Award size={24} className="text-white" />
    },
    {
      id: 'habit-stacker',
      title: 'Habit Stacker',
      description: 'Integrated multiple lifestyle updates simultaneously to form a clean-energy routine.',
      conditionDescription: 'Maintain 5 or more active habit pledges',
      targetCount: 5,
      badgeEmoji: '🔥',
      accentClass: 'from-orange-500 to-amber-500',
      badgeIcon: <Flame size={22} className="text-white" />
    },
    {
      id: 'one-tonne-club',
      title: '1 Tonne Saved Club',
      description: 'Officially eliminated a full metric tonne (1,000 kg) of annual carbon from your footprint!',
      conditionDescription: 'Save 1,000 kg or more of annual CO₂e',
      targetSavings: 1000,
      badgeEmoji: '🏆',
      accentClass: 'from-emerald-600 to-teal-700',
      badgeIcon: <Trophy size={24} className="text-white shadow-sm" />
    },
    {
      id: 'eco-champion',
      title: 'Eco Champion Elite',
      description: 'An outstanding climate vanguard. Saving a massive amount of greenhouse gas annually.',
      conditionDescription: 'Save 3,000 kg or more of annual CO₂e',
      targetSavings: 3000,
      badgeEmoji: '✨',
      accentClass: 'from-purple-600 to-indigo-700',
      badgeIcon: <Sparkles size={24} className="text-white animate-pulse" />
    }
  ], []);

  // Compute status for milestones
  const evaluatedMilestones = useMemo(() => {
    return milestones.map((m) => {
      let isUnlocked = false;
      let currentProgress = 0;
      let targetProgress = 100;

      if (m.targetCount !== undefined) {
        isUnlocked = activePledgesCount >= m.targetCount;
        currentProgress = activePledgesCount;
        targetProgress = m.targetCount;
      } else if (m.targetSavings !== undefined) {
        isUnlocked = committedSavings >= m.targetSavings;
        currentProgress = committedSavings;
        targetProgress = m.targetSavings;
      }

      // Clamp percentage between 0 and 100
      const percentage = Math.min(100, Math.max(0, (currentProgress / targetProgress) * 100));

      return {
        ...m,
        isUnlocked,
        currentProgress,
        targetProgress,
        percentage
      };
    });
  }, [milestones, committedSavings, activePledgesCount]);

  // Statistics summaries
  const unlockedCount = evaluatedMilestones.filter((m) => m.isUnlocked).length;
  const isOneTonneUnlocked = committedSavings >= 1000;

  return (
    <section className="space-y-4" id="dashboard-milestones">
      {/* Header and Statistics Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-zinc-400">
            ECOLOGICAL ACHIEVEMENTS
          </span>
          <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
            <Trophy size={16} className="text-amber-500 fill-amber-100" />
            Milestones & Habit Badges
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-zinc-200/60 shadow-3xs">
            Unlocked: <span className="font-mono text-emerald-700 font-black text-xs">{unlockedCount}</span> / {milestones.length}
          </div>
          {isOneTonneUnlocked && (
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-150 shadow-2xs flex items-center gap-1">
              🎉 1 Tonne Club Member
            </span>
          )}
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="milestones-cards-grid">
        {evaluatedMilestones.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              m.isUnlocked
                ? 'bg-white border-emerald-200 shadow-xs'
                : 'bg-zinc-50/70 border-zinc-200/70 opacity-75'
            }`}
          >
            {/* Subtle background decoration for unlocked icons */}
            {m.isUnlocked && (
              <div className="absolute right-0 top-0 select-none opacity-[0.03] text-emerald-900 pointer-events-none translate-x-3 -translate-y-3 scale-150">
                {m.badgeIcon}
              </div>
            )}

            <div className="flex items-start gap-3.5">
              {/* Badge Icon Slot */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm relative ${
                  m.isUnlocked
                    ? `bg-gradient-to-br ${m.accentClass}`
                    : 'bg-zinc-200 border border-zinc-300/45 text-zinc-400'
                }`}
              >
                {m.isUnlocked ? (
                  m.badgeIcon
                ) : (
                  <Lock size={15} className="text-zinc-400 shrink-0" />
                )}

                {/* Micro Unlocked Check Overlay */}
                {m.isUnlocked && (
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-emerald-100 shadow-3xs">
                    <CheckCircle2 size={11} className="text-emerald-600 fill-emerald-50" />
                  </span>
                )}
              </div>

              <div>
                <h3
                  className={`font-extrabold text-xs uppercase tracking-tight flex items-center gap-1.5 ${
                    m.isUnlocked ? 'text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  {m.title}
                  <span className="text-sm select-none">{m.badgeEmoji}</span>
                </h3>
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider font-mono mt-0.5">
                  {m.conditionDescription}
                </p>
                <p className="text-zinc-500 text-[11px] leading-normal font-normal mt-1.5">
                  {m.description}
                </p>
              </div>
            </div>

            {/* Achievement Progress Indicators */}
            <div className="pt-4 mt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-450 mb-1">
                <span>PROGRESS</span>
                <span>
                  {m.targetSavings !== undefined ? (
                    <>
                      {Math.round(m.currentProgress).toLocaleString()} / {m.targetProgress.toLocaleString()} kg
                    </>
                  ) : (
                    <>
                      {m.currentProgress} / {m.targetProgress} active
                    </>
                  )}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-150 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.isUnlocked
                      ? 'bg-emerald-600'
                      : m.percentage > 40
                      ? 'bg-amber-400'
                      : 'bg-zinc-400'
                  }`}
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
