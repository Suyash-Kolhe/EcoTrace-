/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { GlossaryTooltip } from './GlossaryTooltip';

interface MetricCardProps {
  id: string;
  title: string;
  value: number; // kg CO2
  percentage: number;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Animated count-up text component with spring scale pop whenever the footprint updates.
 */
const CountUpText: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    // Transition duration: 650ms for highly responsive feedback
    const duration = 650;
    const startTime = performance.now();
    let animationFrameId: number;

    const updateValue = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo easing function for robust, organic acceleration & deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateValue);
      } else {
        prevValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(updateValue);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  const formatAnimatedCo2 = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} t`;
    }
    return `${Math.round(kg).toLocaleString()} kg`;
  };

  return (
    <motion.span
      key={Math.round(value)} // Spring pop animation when integer bounds update
      initial={{ scale: 0.93, opacity: 0.75 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="inline-block origin-left hover:text-emerald-700 transition-colors"
    >
      {formatAnimatedCo2(displayValue)}
    </motion.span>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percentage,
  icon: Icon,
  colorClass,
  bgColorClass,
  borderColorClass,
  description,
  isActive,
  onClick
}) => {
  return (
    <motion.button
      id={`metric-card-${title.toLowerCase()}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${
        isActive
          ? `bg-white shadow-lg scale-[1.025] -translate-y-0.5 border-emerald-600 ring-4 ring-emerald-50/70 shadow-emerald-600/5`
          : 'bg-white border-zinc-200/80 hover:border-zinc-350 hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.06)] hover:ring-2 hover:ring-zinc-100/40'
      }`}
    >
      <div className="flex items-start justify-between min-w-0">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-baseline gap-1.5 min-h-[32px]">
            <CountUpText value={value} />
            <span className="text-xs font-medium text-zinc-400 font-sans uppercase flex items-center">
              <GlossaryTooltip term="CO2e">CO₂e</GlossaryTooltip>/yr
            </span>
          </div>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${bgColorClass} ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
          <span className="truncate pr-1">{description}</span>
          <span className="font-mono font-bold text-zinc-700">{percentage}%</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
};
