/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { HelpCircle, Info, BookOpen } from 'lucide-react';

export type GlossaryTerm = 
  | 'CO2e'
  | 'Baseline'
  | 'Offset'
  | 'Pledge'
  | 'Net Zero'
  | 'Gold Standard'
  | 'Paris Accord'
  | 'Scope 1'
  | 'Scope 2';

export interface TermDefinition {
  title: string;
  shortDef: string;
  detailed: string;
}

export const GLOSSARY_DEFINITIONS: Record<GlossaryTerm, TermDefinition> = {
  'CO2e': {
    title: 'Carbon Dioxide Equivalent (CO₂e)',
    shortDef: 'Universal metric balancing multiple greenhouse gases.',
    detailed: 'The standard metric used to compare emissions from various greenhouse gases (like methane, nitrous oxide, and CFCs) based on their Global Warming Potential (GWP) relative to carbon dioxide.'
  },
  'Baseline': {
    title: 'Emission Baseline',
    shortDef: 'Your unmitigated gross lifestyle footprint.',
    detailed: 'The reference point representing your standard carbon emissions before executing any carbon reductions, pledge actions, or purchasing certified carbon offsets.'
  },
  'Offset': {
    title: 'Carbon Offset Credit',
    shortDef: 'Neutralizing residual emissions via verified external projects.',
    detailed: 'A transferrable greenhouse gas reduction certificate representing the verified removal or prevention of 1 metric tonne of CO₂e from entering the atmosphere (e.g. through reforestation or clean energy pipelines).'
  },
  'Pledge': {
    title: 'Action Pledge / Commitment',
    shortDef: 'A direct behavioral commitment to lower daily carbon output.',
    detailed: 'Decisive operational lifestyle changes (e.g., switching to LED illumination, dietary organic shifts, cycling to work) designed to permanently lower your gross baseline carbon emissions.'
  },
  'Net Zero': {
    title: 'Net Zero Emissions',
    shortDef: 'Perfect equilibrium between gross output and carbon neutralization.',
    detailed: 'Achieving an overall neutral state where greenhouse gases released into the atmosphere are entirely balanced by physical removals or offsets, leaving a net-zero climate impact.'
  },
  'Gold Standard': {
    title: 'Gold Standard Certification (GS)',
    shortDef: 'Rigorous third-party auditing validating ultimate ecological integrity.',
    detailed: 'The premier global independent certification body (established by WWF and other NGOs) ensuring carbon reduction projects deliver verified climate impacts and empower local host communities.'
  },
  'Paris Accord': {
    title: 'Paris Agreement (2,000 kg Target)',
    shortDef: 'Global target to limit systemic warming within 1.5°C.',
    detailed: 'The historic international treaty aiming to keep global average warming well below 2°C. To achieve this, individual annual emissions must be driven down to a target baseline of under 2,000 kg (2 tonnes) CO₂e.'
  },
  'Scope 1': {
    title: 'Scope 1 Emissions (Direct)',
    shortDef: 'Direct combustion from resources owned or leased by you.',
    detailed: 'Direct emissions from sources that you personally run or burn, such as the gasoline in your direct commuter car engine or heating oil burned inside your home furnace.'
  },
  'Scope 2': {
    title: 'Scope 2 Emissions (Indirect)',
    shortDef: 'Indirect electricity and thermal grid utility footprints.',
    detailed: 'Indirect emissions resulting from the generation of electricity, heating, or cooling purchased and consumed in your household or workspace from regional energy grids.'
  }
};

interface GlossaryTooltipProps {
  term: GlossaryTerm;
  children?: ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const definition = GLOSSARY_DEFINITIONS[term];

  // Close when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <span className="relative inline-block" ref={triggerRef}>
      {/* Interactive text trigger */}
      <span
        onClick={handleToggle}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b-2 border-dotted border-emerald-400 hover:border-emerald-600 transition duration-150 inline-flex items-center gap-0.5 text-zinc-900 font-bold bg-emerald-50/30 hover:bg-emerald-50/70 px-1 rounded select-none group"
        title="Click or hover to view glossary concept"
      >
        {children || term}
        <HelpCircle size={10} className="text-emerald-500 group-hover:text-emerald-700 transition duration-150" />
      </span>

      {/* Pop Floating card */}
      {isOpen && definition && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 shadow-xl text-left animate-fade-in pointer-events-auto"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Triangle stem */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-zinc-900 pointer-events-none"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
              <span className="p-1 bg-emerald-950/40 text-emerald-405 rounded border border-emerald-900/40">
                <Info size={11} className="stroke-[2.5]" />
              </span>
              <h4 className="text-[11px] font-black tracking-tight text-white uppercase leading-tight font-sans">
                {definition.title}
              </h4>
            </div>

            <p className="text-[10px] text-emerald-300 font-semibold leading-relaxed">
              {definition.shortDef}
            </p>

            <p className="text-[9.5px] text-zinc-400 font-medium leading-relaxed">
              {definition.detailed}
            </p>

            {/* Click to close for touchscreen helpers */}
            <div className="pt-1.5 text-right border-t border-zinc-800/60 block sm:hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-[8.5px] uppercase font-extrabold tracking-wider text-zinc-450 hover:text-white px-1.5 py-0.5 bg-zinc-800/40 rounded focus:outline-none"
              >
                Close ×
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

/**
 * Interactive glossary sidebar sheet / modal helper to view all terms in the footprint app.
 */
interface GlossaryPanelProps {
  onClose?: () => void;
}

export function GlossaryPanel({ onClose }: GlossaryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = Object.entries(GLOSSARY_DEFINITIONS).filter(([key, def]) => {
    const query = searchTerm.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      def.title.toLowerCase().includes(query) ||
      def.detailed.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-emerald-600 shrink-0" />
          <h3 className="text-xs sm:text-sm font-black text-zinc-900 uppercase tracking-tight">
            Climate Science Terms Glossary
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 text-xs font-bold uppercase transition bg-zinc-50 px-2 py-1 rounded"
          >
            Hide Panel ×
          </button>
        )}
      </div>

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Search technical terms (e.g., CO2, Gold, Scope...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs font-semibold px-4.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:outline-none transition-colors"
          id="glossary-panel-search"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredTerms.length > 0 ? (
          filteredTerms.map(([key, def]) => (
            <div
              key={key}
              className="bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-200 text-left space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/55">
                  {key}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase font-sans">
                  EcoTrace Lexicon
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-zinc-900 leading-tight">
                {def.title}
              </h4>
              <p className="text-[10px] text-emerald-805 font-bold leading-snug">
                {def.shortDef}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                {def.detailed}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-zinc-400 py-6 text-xs font-medium">
            No glossary matches found matching "{searchTerm}". Try another search keyword.
          </div>
        )}
      </div>
    </div>
  );
}
