/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Map, 
  BookOpen, 
  Database, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  FileText, 
  Scale, 
  ShieldCheck, 
  Check, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TrustFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: 'methodology' | 'databases' | 'formulas' | 'trust';
  question: string;
  answer: React.ReactNode;
}

export const TrustFAQModal: React.FC<TrustFAQModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('source-data');

  const faqs: FAQItem[] = [
    {
      id: 'source-data',
      category: 'databases',
      question: 'Which global databases are utilized for these carbon calculations?',
      answer: (
        <div className="space-y-3 text-xs leading-relaxed text-zinc-600">
          <p>
            Our calculations are compiled from peer-reviewed databases and official government standard frameworks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-zinc-750">
            <li>
              <strong>IPCC (Intergovernmental Panel on Climate Change)</strong>: We map global warming potential (GWP) offsets over 100-year horizons using standard AR5 & AR6 estimates.
            </li>
            <li>
              <strong>US EPA (Environmental Protection Agency)</strong>: Used for passenger vehicle fuel-economy averages, natural gas therms, and average waste decomposition metrics.
            </li>
            <li>
              <strong>UK DEFRA (Department for Environment, Food & Rural Affairs)</strong>: Provides highly granular emissions-factors for public transport (buses, subways), aviation seat-classes (short vs long-haul), and raw consumer shopping/retail lifecycles.
            </li>
            <li>
              <strong>IEA (International Energy Agency)</strong>: Determines grid electricity mixes by region, indexing how much coal, gas, hydro, and wind powers an average domestic household grid.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'formula-transport',
      category: 'formulas',
      question: 'What is the exact mathematical model for Transport emissions?',
      answer: (
        <div className="space-y-2.5 text-xs text-zinc-650">
          <p className="font-semibold text-zinc-800">Formula:</p>
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg font-mono text-[11px] text-emerald-800 font-bold">
            Annual Transport CO₂ (kg) = Annual Kilometers × Emission Coefficient (kg/km)
          </div>
          <p className="font-medium text-zinc-600">Where typical vehicle Coefficients are:</p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-zinc-500 font-medium">
            <li><strong>Gasoline Car (Average SUV/Sedan)</strong>: ~0.18 kg CO₂ per kilometer (EPA standard)</li>
            <li><strong>Diesel Car</strong>: ~0.17 kg CO₂ per kilometer</li>
            <li><strong>Electric Vehicle (EV) Grid mix</strong>: ~0.053 kg CO₂ per kilometer (IEA grid factor based on average recharging efficiencies)</li>
            <li><strong>Bicycle / E-Bike offset</strong>: Saves approximately ~0.13 - 0.18 kg CO₂ per kilometer swapped from active gas vehicle use</li>
          </ul>
        </div>
      )
    },
    {
      id: 'formula-energy',
      category: 'formulas',
      question: 'How do you calculate household Energy footprint variables?',
      answer: (
        <div className="space-y-2.5 text-xs text-zinc-650">
          <p className="font-semibold text-zinc-800">Formula:</p>
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg font-mono text-[11px] text-emerald-800 font-bold">
            Energy Footprint = (Monthly Electricity kWh × 12 × Grid Coefficient) + (Monthly Gas Therms × 12 × 5.3)
          </div>
          <p className="font-medium text-zinc-600">Underlying Grid Assumptions:</p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-zinc-500 font-medium">
            <li><strong>Electricity Grid Mix</strong>: Average global Grid Coefficient is valued at approximately <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">0.42 kg CO₂e / kWh</code> based on national energy mixes combining fossil fuels with renewable grids.</li>
            <li><strong>Natural Gas combustion</strong>: Valued at <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">5.3 kg CO₂</code> per Therm (EPA 2024 Inventory data).</li>
          </ul>
        </div>
      )
    },
    {
      id: 'formula-diet',
      category: 'formulas',
      question: 'How is the diet / food footprint computed?',
      answer: (
        <div className="space-y-3.5 text-xs text-zinc-650">
          <p className="font-medium text-zinc-600">
            Our food multipliers trace to the landmark Oxford University Food Emissions Study (Poore & Nemecek, 2018), which evaluated the complete lifecycle of agriculture:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono font-medium">
            <div className="p-2.5 bg-rose-50/50 border border-rose-100 text-rose-800 rounded-lg">
              <span className="font-bold block uppercase text-[10px]">High Meat Diet</span>
              Est. 2,900 kg CO₂e / yr
            </div>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-lg">
              <span className="font-bold block uppercase text-[10px]">Vegan / Plant-Based</span>
              Est. 1,100 kg CO₂e / yr (Over 60% reduction)
            </div>
          </div>
          <p className="italic text-[10.5px] leading-normal text-zinc-500">
            The study factors in methane generation during livestock ruminant digestion, fertilizer synthesis energy, land-use conversion, packaging, processing facilities and regional food freight miles.
          </p>
        </div>
      )
    },
    {
      id: 'how-to-trust',
      category: 'trust',
      question: 'How can I verify the transparency ratings and credibility of Eco Swaps?',
      answer: (
        <div className="space-y-3 text-xs text-zinc-650">
          <p>
            We strictly partner with brands verified by third-party certification authorities. Our transparency index does not accept paid placements. Ratings are calculated using three pillars:
          </p>
          <ul className="list-decimal pl-5 space-y-2 font-medium text-zinc-700">
            <li>
              <strong>Supply Chain Sourcing (40% Weight)</strong>: Independent verification of biological or recycled feedstocks (e.g., USDA Organic, FSC Wood, GOTS cotton).
            </li>
            <li>
              <strong>Operational Audits (30% Weight)</strong>: Publicly accessible corporate carbon filing scores, climate-neutral operations, and certified B-Corp evaluations.
            </li>
            <li>
              <strong>Post-Consumer Lifecycles (30% Weight)</strong>: Closed-loop recovery programs, repair guarantees, and fully biodegradable packaging design.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'defra-lifecycle',
      category: 'methodology',
      question: 'Does this platform calculate Scope 1, Scope 2, or Scope 3 emissions?',
      answer: (
        <div className="space-y-2.5 text-xs text-zinc-650">
          <p>
            This applet models personal footprints using greenhouse frameworks designed for individual lifestyle audits:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-zinc-700">
            <li><strong>Direct (Scope 1)</strong>: Tailpipe emissions from burning fossil fuels inside personal automobile engines.</li>
            <li><strong>Indirect (Scope 2)</strong>: Utility emissions caused by electricity generation purchased for domestic lights and appliances.</li>
            <li><strong>Supply Chain (Scope 3)</strong>: Visualized via food choice indices, commercial airlines, and waste/recycling categories.</li>
          </ul>
        </div>
      )
    }
  ];

  // Filtering logic
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCat = activeCategory === 'all' || faq.category === activeCategory;
      const matchSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery, faqs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="trust-faq-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Main Panel Content container */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in"
          id="trust-faq-modal-panel"
        >
          {/* Header segment */}
          <div className="p-6 border-b border-zinc-150 bg-zinc-50 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 font-mono text-[9px] font-black text-[#059669] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wider">
                <ShieldCheck size={11} className="stroke-[2.5]" />
                Scientific Integrity & Trust Center
              </div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 uppercase tracking-tight">
                Data Methodology & Global Databases
              </h2>
              <p className="text-[11px] text-zinc-500 leading-normal max-w-lg">
                We believe calculations should be transparent. Below explains standard math coefficients, peer-reviewed databases, and transparency ratings audited to build user trust.
              </p>
            </div>
            
            <button 
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 hover:bg-zinc-200 text-zinc-450 hover:text-zinc-700 rounded-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filtering and search row */}
          <div className="p-4 bg-white border-b border-zinc-150 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search calculation formulas & global databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All FAQs' },
                { id: 'databases', label: '🗄️ Standard Databases' },
                { id: 'formulas', label: '📐 Calculation Formulas' },
                { id: 'trust', label: '🛡️ Brand Auditing' },
                { id: 'methodology', label: '🌱 Scopes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 font-black uppercase text-[9px] tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core scrollable body of answers */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-white">
            <div className="space-y-2.5">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className={`border rounded-xl transition duration-200 overflow-hidden ${
                      isExpanded ? 'border-zinc-300 shadow-3xs' : 'border-zinc-200 bg-zinc-50/30'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="w-full px-4.5 py-4 text-left flex items-center justify-between gap-4 font-extrabold text-xs uppercase tracking-tight text-zinc-800 hover:text-zinc-900"
                    >
                      <span className="flex items-center gap-2">
                        {faq.category === 'formulas' && <Scale size={13} className="text-emerald-700" />}
                        {faq.category === 'databases' && <Database size={13} className="text-emerald-700" />}
                        {faq.category === 'trust' && <ShieldCheck size={13} className="text-emerald-700" />}
                        {faq.category === 'methodology' && <BookOpen size={13} className="text-emerald-700" />}
                        <span>{faq.question}</span>
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="px-4.5 pb-4 border-t border-zinc-150 pt-3 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFaqs.length === 0 && (
                <div className="p-8 border border-dashed border-zinc-200 rounded-xl text-center space-y-2 text-zinc-400 text-xs">
                  <p className="font-extrabold text-zinc-700 uppercase">No FAQ categories found</p>
                  <p className="text-[10px]">Try searching another keyword (such as "IPCC", "DEFRA", or "miles").</p>
                </div>
              )}
            </div>

            {/* Citations list footer inside modal */}
            <div className="border-t border-zinc-150 pt-5 mt-6 space-y-3">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 font-mono tracking-widest">
                Official Peer-Reviewed Academic Citations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href="https://www.ipcc.ch/report/sixth-assessment-report-cycle/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-start gap-2 text-[10.5px] hover:border-emerald-300 hover:bg-emerald-50/10 transition group"
                >
                  <FileText size={14} className="text-zinc-500 shrink-0 group-hover:text-emerald-700" />
                  <div className="text-zinc-600 space-y-0.5">
                    <span className="font-bold text-zinc-800 block text-[10px] uppercase">IPCC AR6 Reports</span>
                    Environmental coefficients for climate modeling.
                  </div>
                  <ExternalLink size={10} className="text-zinc-400 ml-auto" />
                </a>

                <a 
                  href="https://www.nature.com/articles/nclimate2073" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-start gap-2 text-[10.5px] hover:border-emerald-300 hover:bg-emerald-50/10 transition group"
                >
                  <FileText size={14} className="text-zinc-500 shrink-0 group-hover:text-emerald-700" />
                  <div className="text-zinc-600 space-y-0.5">
                    <span className="font-bold text-zinc-800 block text-[10px] uppercase">Oxford Food Assessment</span>
                    Poore & Nemecek (2018) land/emissions study.
                  </div>
                  <ExternalLink size={10} className="text-zinc-400 ml-auto" />
                </a>

                <a 
                  href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-start gap-2 text-[10.5px] hover:border-emerald-300 hover:bg-emerald-50/10 transition group"
                >
                  <FileText size={14} className="text-zinc-500 shrink-0 group-hover:text-emerald-700" />
                  <div className="text-zinc-600 space-y-0.5">
                    <span className="font-bold text-zinc-800 block text-[10px] uppercase">DEFRA Factors 2023</span>
                    Public transport & global lifestyle life-cycle numbers.
                  </div>
                  <ExternalLink size={10} className="text-zinc-400 ml-auto" />
                </a>

                <a 
                  href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-start gap-2 text-[10.5px] hover:border-emerald-300 hover:bg-emerald-50/10 transition group"
                >
                  <FileText size={14} className="text-zinc-500 shrink-0 group-hover:text-emerald-700" />
                  <div className="text-zinc-600 space-y-0.5">
                    <span className="font-bold text-zinc-800 block text-[10px] uppercase">US EPA equivalencies</span>
                    Gasoline fuel averages & thermal natural gas indexes.
                  </div>
                  <ExternalLink size={10} className="text-zinc-400 ml-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Lower footer action buttons */}
          <div className="p-4 border-t border-zinc-150 bg-zinc-50 text-right flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 pl-2">
              <Check className="text-emerald-600 inline" size={13} />
              Verified Calculations
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-3xs transition cursor-pointer"
            >
              Acknowledged
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
