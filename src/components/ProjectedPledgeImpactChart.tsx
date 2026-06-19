/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { FootprintBreakdown } from '../types';
import { Sparkles, Calendar, HelpCircle, ArrowRight, Check } from 'lucide-react';

interface ProjectedPledgeImpactChartProps {
  currentBreakdown: FootprintBreakdown;
  activeEmissionsWithSavings: number;
  committedSavings: number;
}

interface ChartDataPoint {
  monthIndex: number;
  monthLabel: string;
  baselineVal: number;
  pledgedVal: number;
  savingVal: number;
}

export const ProjectedPledgeImpactChart: React.FC<ProjectedPledgeImpactChartProps> = ({
  currentBreakdown,
  activeEmissionsWithSavings,
  committedSavings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart view state: 'cumulative' | 'monthly'
  const [viewType, setViewType] = useState<'cumulative' | 'monthly'>('cumulative');

  // Chart hover interactivity state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dimensions state tracked responsively
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Update dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Keep height relative and aesthetically balanced
      const height = Math.max(280, Math.min(360, window.innerHeight * 0.35));
      setDimensions({ width: Math.max(300, width), height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Generate 12-month calendar labels starting next month (July 2026)
  const monthLabels = [
    'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26',
    'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27'
  ];

  // Prepare projection dataset
  const baseAvgTotal = currentBreakdown.total;
  const pledgedAvgTotal = activeEmissionsWithSavings;
  const baseMonthly = baseAvgTotal / 12;
  const pledgedMonthly = pledgedAvgTotal / 12;

  const dataset: ChartDataPoint[] = monthLabels.map((label, index) => {
    const monthNum = index + 1;
    if (viewType === 'cumulative') {
      return {
        monthIndex: index,
        monthLabel: label,
        baselineVal: baseMonthly * monthNum,
        pledgedVal: pledgedMonthly * monthNum,
        savingVal: (baseMonthly - pledgedMonthly) * monthNum
      };
    } else {
      return {
        monthIndex: index,
        monthLabel: label,
        baselineVal: baseMonthly,
        pledgedVal: pledgedMonthly,
        savingVal: baseMonthly - pledgedMonthly
      };
    }
  });

  // Render D3 chart inside useEffect
  useEffect(() => {
    if (!svgRef.current || dataset.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 30, right: 30, bottom: 45, left: 55 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous elements
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Define main SVG view-box
    svgElement
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svgElement
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // --- SCALES ---
    const xScale = d3.scalePoint()
      .domain(monthLabels)
      .range([0, chartWidth]);

    const yMax = d3.max(dataset, d => Math.max(d.baselineVal, d.pledgedVal)) || 1000;
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1]) // Add 10% breathing room at top
      .range([chartHeight, 0]);

    // --- GRID LINES ---
    g.append('g')
      .attr('class', 'grid-lines')
      .attr('stroke', '#f3f4f6')
      .attr('stroke-width', 1)
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d));

    g.append('g')
      .attr('class', 'grid-lines-vertical')
      .attr('stroke', '#fafafa')
      .attr('stroke-dasharray', '2 2')
      .selectAll('line')
      .data(monthLabels)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d) || 0)
      .attr('x2', d => xScale(d) || 0)
      .attr('y1', 0)
      .attr('y2', chartHeight);

    // --- AXES ---
    const xAxis = d3.axisBottom(xScale).tickSize(4);
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => {
        const val = Number(d);
        if (val >= 1000) {
          return `${(val / 1000).toFixed(1)}t`;
        }
        return `${val}kg`;
      })
      .tickSize(4);

    // Render X Axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#e4e4e7'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#d1d5db'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#71717a')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('font-family', 'Inter, sans-serif')
        .attr('dy', '8px')
      );

    // Render Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', '#e4e4e7'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#d1d5db'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#71717a')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('dx', '-4px')
      );

    // --- GRADIENTS & SHADING ---
    // Area gradient for pledged
    const pledgedGradId = `pledged-gradient-${viewType}`;
    const pledgedGrad = svgElement.append('defs')
      .append('linearGradient')
      .attr('id', pledgedGradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    pledgedGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.22);
    pledgedGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // Area between Baseline and Pledged lines (the direct saving impact area)
    const areaBetween = d3.area<ChartDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y0(d => yScale(d.baselineVal))
      .y1(d => yScale(d.pledgedVal))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataset)
      .attr('class', 'savings-gap-area')
      .attr('fill', 'url(#savings-gap-grad)')
      .attr('d', areaBetween);

    // Add saving area gradient
    const savingGrad = svgElement.append('defs')
      .append('linearGradient')
      .attr('id', 'savings-gap-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    savingGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#34d399')
      .attr('stop-opacity', 0.15);
    savingGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')
      .attr('stop-opacity', 0.02);

    // Area representing committed baseline ceiling
    const areaBaseline = d3.area<ChartDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y0(chartHeight)
      .y1(d => yScale(d.baselineVal))
      .curve(d3.curveMonotoneX);

    // Area representing pledged levels
    const areaPledged = d3.area<ChartDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y0(chartHeight)
      .y1(d => yScale(d.pledgedVal))
      .curve(d3.curveMonotoneX);

    // Draw pledged area below
    g.append('path')
      .datum(dataset)
      .attr('class', 'pledged-area')
      .attr('fill', `url(#${pledgedGradId})`)
      .attr('d', areaPledged);

    // --- LINE GENERATORS ---
    const lineBaseline = d3.line<ChartDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y(d => yScale(d.baselineVal))
      .curve(d3.curveMonotoneX);

    const linePledged = d3.line<ChartDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y(d => yScale(d.pledgedVal))
      .curve(d3.curveMonotoneX);

    // 1. Draw Unpledged baseline curve (dashed gray/red)
    g.append('path')
      .datum(dataset)
      .attr('fill', 'none')
      .attr('stroke', '#a1a1aa')
      .attr('stroke-width', 2.2)
      .attr('stroke-dasharray', '4 4')
      .attr('d', lineBaseline);

    // 2. Draw Pledged active curve (solid green)
    g.append('path')
      .datum(dataset)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', linePledged);

    // --- HOVER FOCUS INTERACTIONS (D3 SVG elements overlay) ---
    // Add horizontal hover focus indicator bar
    const hoverFocusLine = g.append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2 2')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .style('opacity', 0);

    // Circular ticks on curves
    const baselineCircle = g.append('circle')
      .attr('r', 5)
      .attr('fill', '#71717a')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    const pledgedCircle = g.append('circle')
      .attr('r', 5.5)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    // Invisible mouse event tracking nodes
    const interactionGroup = g.append('g').attr('class', 'interaction-nodes');
    
    // Approximate spacing width per month label
    const pointsX = dataset.map(d => xScale(d.monthLabel) || 0);

    // Transparent rect overlays for precise focal points
    interactionGroup.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', (d, i) => {
        const currX = pointsX[i];
        const nextX = pointsX[i + 1] || chartWidth;
        const width = nextX - currX;
        return currX - width / 2;
      })
      .attr('y', 0)
      .attr('width', (d, i) => {
        const currX = pointsX[i];
        const prevX = pointsX[i - 1] || 0;
        const nextX = pointsX[i + 1] || chartWidth;
        return ((nextX - currX) / 2) + ((currX - prevX) / 2);
      })
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredIndex(d.monthIndex);
        
        const px = xScale(d.monthLabel) || 0;
        hoverFocusLine
          .attr('x1', px)
          .attr('x2', px)
          .style('opacity', 1);

        baselineCircle
          .attr('cx', px)
          .attr('cy', yScale(d.baselineVal))
          .style('opacity', 1);

        pledgedCircle
          .attr('cx', px)
          .attr('cy', yScale(d.pledgedVal))
          .style('opacity', 1);
      })
      .on('mousemove', (event, d) => {
        // Keeps tracking index consistent on drag/move
      })
      .on('mouseleave', () => {
        setHoveredIndex(null);
        hoverFocusLine.style('opacity', 0);
        baselineCircle.style('opacity', 0);
        pledgedCircle.style('opacity', 0);
      });

  }, [dimensions, dataset, monthLabels, viewType]);

  const activeHoverData = hoveredIndex !== null ? dataset[hoveredIndex] : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs relative" id="d3-projections-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4 mb-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black text-emerald-800 bg-[#e6f4ea] px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-widest leading-none">
            <Sparkles size={11} className="text-emerald-700 animate-pulse" />
            D3 Climate Projection Engine
          </span>
          <h3 className="text-zinc-900 font-extrabold text-sm uppercase tracking-tight">
            12-Month Pledge Savings Projections
          </h3>
          <p className="text-zinc-400 text-[11px] font-medium leading-tight">
            Visualized in D3 - Comparing unpledged carbon ceilings against active commitment scenarios
          </p>
        </div>

        {/* Dynamic Navigation Toggles */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0 text-xs shadow-3xs">
          <button
            onClick={() => setViewType('cumulative')}
            className={`px-3 py-1.5 rounded-md font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
              viewType === 'cumulative'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Cumulative Accumulation
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`px-3 py-1.5 rounded-md font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
              viewType === 'monthly'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Monthly Slices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Actual Chart SVG Column */}
        <div className="lg:col-span-8 flex flex-col justify-center min-w-0" ref={containerRef}>
          <div className="w-full select-none overflow-hidden rounded-xl bg-[#fafbfa] border border-zinc-200/50 p-2 relative">
            <svg ref={svgRef} className="mx-auto overflow-visible" />
            
            {/* Interactive Snap-to-Point overlay tooltip panel */}
            {activeHoverData && (
              <div 
                className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs border border-zinc-200/80 rounded-lg p-3 shadow-md text-xs space-y-1.5 select-all z-20"
                style={{ pointerEvents: 'none' }}
              >
                <div className="flex items-center gap-1.5 border-b border-zinc-150 pb-1">
                  <Calendar size={11} className="text-[#059669]" />
                  <span className="font-extrabold uppercase font-mono text-[10px] tracking-wider text-zinc-800">
                    {activeHoverData.monthLabel}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-5 font-medium text-zinc-500 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 inline-block" />
                      Baseline Ceiling:
                    </span>
                    <strong className="font-mono text-zinc-800">
                      {activeHoverData.baselineVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-5 font-medium text-zinc-500 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      Pledged Level:
                    </span>
                    <strong className="font-mono text-emerald-700 font-extrabold">
                      {activeHoverData.pledgedVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-5 font-bold text-emerald-800 text-[10px] bg-emerald-50/70 border border-emerald-100/40 px-1.5 py-0.5 rounded">
                    <span>🌱 Net Offset Saved:</span>
                    <span className="font-mono font-black">
                      -{activeHoverData.savingVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytical Legend and Overview Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fcfdfc] border border-zinc-200 rounded-xl p-4.5 space-y-3 shadow-3xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-650 flex items-center gap-1.5">
              💡 Projection Commentary
            </h4>
            
            {viewType === 'cumulative' ? (
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Over a 12-month span, your committed lifestyle updates stack up substantially. By sustaining these habits, you avoid releasing an aggregate of <strong className="text-emerald-700 font-extrabold">{(committedSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e</strong> into the atmosphere! This creates a robust wedge of savings shown shaded in green.
              </p>
            ) : (
              <p className="text-zinc-550 text-[11px] leading-relaxed">
                On a month-to-month basis, your active pledge selections drop your average household metric from <strong className="font-bold text-zinc-800">{(baseMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</strong> to <strong className="font-extrabold text-emerald-700">{(pledgedMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</strong>, securing a recurring regular buffer of <strong className="font-mono text-emerald-800 font-black">{(baseMonthly - pledgedMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</strong>.
              </p>
            )}

            <div className="space-y-2 pt-2 border-t border-zinc-150">
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="w-4 h-1 border-t-2 border-dashed border-zinc-400 block shrink-0" />
                <span className="text-zinc-600 font-medium">Unpledged Baseline ceiling</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="w-4 h-1 border-t-2 border-[#10b981] block shrink-0" />
                <span className="text-[#059669] font-bold">Active lifestyle trajectory</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="w-4 h-2.5 bg-[#e6fbf4] border border-[#a7f3d0]/65 rounded block shrink-0" />
                <span className="text-emerald-800 font-bold">Green climate savings buffer</span>
              </div>
            </div>
          </div>

          {/* Savings Milestone Callout */}
          {committedSavings > 0 ? (
            <div className="bg-gradient-to-br from-emerald-1100 to-emerald-900 border border-emerald-950 p-4.5 rounded-xl text-white shadow-2xs space-y-2 relative overflow-hidden">
              <p className="text-[9.5px] uppercase font-bold tracking-widest text-emerald-200">
                ⭐ Annual Environmental Wedge
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-white">
                  {(committedSavings / 1000).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-250">
                  tonnes offset / year
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 font-medium leading-relaxed">
                Equal to planting approximately <strong className="text-white font-extrabold">{Math.round(committedSavings / 21.8)}</strong> regular softwood trees sustained over 10 full years!
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-zinc-650 text-xs flex items-start gap-2.5 shadow-3xs leading-relaxed">
              <span className="text-amber-600 font-bold shrink-0">⚠️</span>
              <div>
                <p className="font-extrabold text-zinc-900 uppercase tracking-tight text-[10px] text-amber-800">
                  Add commitments to see savings wedge
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Activate habit pledges in the checklists. These will automatically feed the projection chart to construct your eco savings slope instantly!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
