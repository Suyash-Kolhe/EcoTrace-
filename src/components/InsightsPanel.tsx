/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FootprintBreakdown, FootprintInputs, AIInsight, ActionItem } from '../types';
import { REDUCTION_ACTIONS } from '../data/actions';
import { Sparkles, RefreshCcw, Loader2, Compass, AlertCircle, Quote, Leaf, CheckCircle } from 'lucide-react';

interface InsightsPanelProps {
  breakdown: FootprintBreakdown;
  inputs: FootprintInputs;
  committedActionIds: string[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  breakdown,
  inputs,
  committedActionIds
}) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState<number>(0);

  // Climate rotating helper tips for loading UI
  const loadingTips = [
    "Analyzing transportation vectors and weekly flight impacts...",
    "Inspecting home power tariffs and carbon offsets...",
    "Querying agricultural methane impact ratios based on your diet...",
    "Calculating potential industrial recycling offsets...",
    "Synthesizing customized low-carbon habit suggestions...",
    "Running carbon reduction projections with target global trajectories..."
  ];

  // Rotate loading tips
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load cached insight if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem('carbon_insights_cache');
      if (cached) {
        setInsight(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("Could not read cached insights", e);
    }
  }, []);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    setLoadingTipIndex(0);

    try {
      const activeActions = REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id));

      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          breakdown,
          inputs,
          activeActions: activeActions.map((a) => ({
            title: a.title,
            co2SavingKg: a.co2SavingKg,
            category: a.category
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const data: AIInsight = await response.json();
      setInsight(data);
      localStorage.setItem('carbon_insights_cache', JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong generating your custom insights. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs min-h-[400px]" id="ai-insights-panel">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-5 mb-6">
        <div>
          <h2 className="text-base font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="text-emerald-500 animate-pulse" size={18} />
            AI Climate Audit & Coach
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Generate customized carbon-reduction actions rooted in scientific feedback.
          </p>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-300 transition text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-xs cursor-pointer shrink-0 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={12} />
              Generating...
            </>
          ) : insight ? (
            <>
              <RefreshCcw size={12} />
              Recalculate Audit
            </>
          ) : (
            <>
              <Compass size={12} />
              Request AI Audit Plan
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center max-w-md mx-auto space-y-6 animate-pulse" id="insights-loading-ui">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Gemini is auditing your footprint...</h3>
            <p className="text-zinc-400 text-xs mt-1">Please hold on, scientific calibrations take a few seconds.</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
            <p className="text-xs text-zinc-600 font-bold italic transition-all duration-500">
              &ldquo; {loadingTips[loadingTipIndex]} &rdquo;
            </p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-5 border border-rose-250 rounded-xl bg-rose-50 text-rose-900 max-w-xl mx-auto text-center my-6 space-y-3" id="insights-error-ui">
          <AlertCircle className="mx-auto text-rose-500" size={28} />
          <p className="font-extrabold text-sm uppercase tracking-wide">Action Audit Temporarily Unavailable</p>
          <p className="text-xs leading-relaxed max-w-sm mx-auto">{error}</p>
          <button
            onClick={generateInsights}
            className="text-[10px] uppercase tracking-wider font-extrabold px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 rounded transition mt-2 cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      )}

      {!insight && !loading && !error && (
        <div className="py-20 text-center max-w-md mx-auto space-y-5" id="insights-prompt-ui">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">No active AI audit generated</h3>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
              Click &ldquo;Request AI Audit Plan&rdquo; above. We will send your current calculator and habit selections to our server-side environmental model to produce scientifically grounded advice.
            </p>
          </div>
        </div>
      )}

      {insight && !loading && !error && (
        <div className="space-y-8 animate-fade-in" id="insights-content-ui">
          {/* Executive Summary Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative">
            <Quote className="absolute right-4 top-4 text-zinc-200/85" size={48} />
            <span className="text-[10px] uppercase tracking-widest font-black font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
              Carbon Coach Executive Summary
            </span>
            <p className="mt-4 text-zinc-700 text-sm leading-relaxed font-normal">
              {insight.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Highest Category Analysis */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 p-6 rounded-xl space-y-4 shadow-xs">
              <h3 className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                <AlertCircle size={14} className="text-emerald-600" />
                Primary Carbon Vectors
              </h3>
              <p className="font-extrabold text-zinc-900 text-sm uppercase tracking-tight leading-tight">
                Where is your footprint heaviest?
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                {insight.highestCategoryAnalysis}
              </p>
            </div>

            {/* Targeted Action Plan List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-[10px] font-extrabold text-zinc-400 tracking-widest uppercase flex items-center gap-1.5 font-mono">
                <CheckCircle size={14} className="text-emerald-500" />
                Targeted Recommendation Plan ({insight.actionPlan.length} Steps)
              </h3>

              {insight.actionPlan.map((plan, i) => (
                <div
                  key={i}
                  className="bg-white border border-zinc-200 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between transition hover:border-zinc-350 shadow-2xs"
                >
                  <div className="absolute right-0 top-0 bg-zinc-100 border-l border-b border-zinc-200 font-mono text-[10px] font-black text-zinc-500 px-3.5 py-1.5 rounded-bl-lg select-none">
                    0{i + 1}
                  </div>

                  <div className="pr-10 min-w-0">
                    <h4 className="font-extrabold text-zinc-900 text-sm uppercase tracking-tight">{plan.title}</h4>
                    <p className="mt-2 text-xs text-zinc-500 leading-relaxed font-normal">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-bold text-[9px] uppercase tracking-wide text-emerald-850 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      Offset Leverage
                    </span>
                    <span className="font-mono text-emerald-800 font-bold uppercase tracking-wider text-xs">{plan.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-zinc-200" />

          {/* Inspirational Closing Word */}
          <div className="bg-[#f0f9f3] border border-emerald-100 p-6 rounded-xl flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shrink-0 mt-0.5">
              <Leaf size={16} />
            </div>
            <div>
              <p className="text-zinc-900 font-black text-xs uppercase tracking-wider">Commitment to Global Goals</p>
              <p className="text-xs text-zinc-650 leading-relaxed mt-1">
                {insight.encouragement}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
