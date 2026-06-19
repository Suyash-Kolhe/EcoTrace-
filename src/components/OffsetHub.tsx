/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle, 
  ExternalLink, 
  DollarSign, 
  Users, 
  FileCheck, 
  TrendingDown, 
  Leaf, 
  Wind, 
  ChevronRight, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Info 
} from 'lucide-react';

interface OffsetHubProps {
  currentBreakdown: {
    transport: number;
    energy: number;
    food: number;
    shopping: number;
    total: number;
  };
  totalCommittedSavings: number;
  activeEmissionsWithSavings: number;
}

interface OffsetTransaction {
  id: string;
  projectId: string;
  projectName: string;
  amountInr: number;
  co2OffsetKg: number;
  dateStr: string;
  certificateId: string;
}

export function OffsetHub({ 
  currentBreakdown, 
  totalCommittedSavings, 
  activeEmissionsWithSavings 
}: OffsetHubProps) {
  // Local active transactions loaded from localStorage
  const [transactions, setTransactions] = useState<OffsetTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('carbon_platform_offset_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('carbon_platform_offset_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Selected project key
  const [selectedProjectId, setSelectedProjectId] = useState<string>('reforestation');
  
  // Custom slider setting for offset slider: percentage of residual emissions to offset (from 0 to 100)
  const [offsetPercent, setOffsetPercent] = useState<number>(100);

  // Simulation form states
  const [donorName, setDonorName] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [successCertificate, setSuccessCertificate] = useState<OffsetTransaction | null>(null);

  // Projects portfolio data
  const projects = useMemo(() => [
    {
      id: 'reforestation',
      title: 'Western Ghats Agroforestry & Canopy Restoration',
      icon: Leaf,
      category: 'nature',
      costPerTonne: 1250.00, // ₹1,250 per tonne
      verification: 'Gold Standard & Verra (GS-9081)',
      location: 'Silent Valley Foothills, Kerala, India',
      description: 'Restoration of highly degraded moist-deciduous and evergreen canopies by nurturing organic endemics. Builds critical biological corridors connecting local elephant biosphere reserves.',
      impacts: [
        { label: 'Carbon Sequestration', val: '180,500 tonnes CO₂e / year sequestered' },
        { label: 'Biodiversity Shielding', val: 'Protects critical nesting grounds for rare Lion-tailed Macaques' },
        { label: 'Community Employment', val: 'Provides robust agroforestry wages to 280 tribal families' }
      ],
      allocation: {
        field: 78,
        community: 14,
        audit: 8
      },
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-250',
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'cookstoves',
      title: 'Rural Biogas Systems & Clean Cookstoves',
      icon: Users,
      category: 'social',
      costPerTonne: 750.00, // ₹750 per tonne
      verification: 'Gold Standard (GS-5641)',
      location: 'Chhotanagpur Plateau, Jharkhand, India',
      description: 'Replacing toxic open-smoke firewood chulhas with domestic agricultural biogas digesters and certified smokeless cookstoves, reducing wood harvesting fuel by 70%.',
      impacts: [
        { label: 'Particulate Methane Mitigation', val: '340,000 tonnes direct CO₂e offset credits retirement' },
        { label: 'Respiratory Safeguard', val: 'Reduces heavy indoor kitchen particulate pm2.5 loads by up to 80%' },
        { label: 'Sal Forest Conserv', val: 'Reduces surrounding forest foraging stress by eliminating firewood collection' }
      ],
      allocation: {
        field: 72,
        community: 18,
        audit: 10
      },
      tagColor: 'text-teal-705 bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600 bg-teal-50'
    },
    {
      id: 'windfarms',
      title: 'Gujarat Thar Desert Clean Wind Grid',
      icon: Wind,
      category: 'technology',
      costPerTonne: 980.00, // ₹980 per tonne
      verification: 'Verified Carbon Standard (VCS-1893)',
      location: 'Kutch Peninsula, Gujarat, India',
      description: 'Constructing robust utility-scale wind installations to feed cleaner power into fossil-heavy regional power transmission networks, replacing thermal stack outputs.',
      impacts: [
        { label: 'Fossil Substitution', val: '950,000 tonnes coal emission avoidance annually' },
        { label: 'Ecological Bird Safeguards', val: 'Thermal-radar sensory flightway triggers ensure safe flight buffers for wildlife' },
        { label: 'Desert Village Water', val: 'Sponsors solar-driven reverse osmosis clean drinking water stations' }
      ],
      allocation: {
        field: 80,
        community: 12,
        audit: 8
      },
      tagColor: 'text-purple-700 bg-purple-50 border-purple-250',
      iconColor: 'text-purple-600 bg-purple-50'
    }
  ], []);

  // Compute active variables
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Compute carbon mass to offset based on selected percentage
  const residualTonnes = activeEmissionsWithSavings / 1000;
  const targetOffsetKg = useMemo(() => {
    return Math.round(activeEmissionsWithSavings * (offsetPercent / 100));
  }, [activeEmissionsWithSavings, offsetPercent]);

  const targetOffsetTonnes = targetOffsetKg / 1000;

  // Cost calculation
  const totalCostInr = useMemo(() => {
    return Number((targetOffsetTonnes * activeProject.costPerTonne).toFixed(2));
  }, [targetOffsetTonnes, activeProject.costPerTonne]);

  // Handle donation submission
  const handleRetireCredits = (e: FormEvent) => {
    e.preventDefault();
    if (targetOffsetKg <= 0) return;
    
    setIsSimulating(true);

    setTimeout(() => {
      const serialNum = "CERT-ET-" + Math.floor(10000000 + Math.random() * 90000000);
      const newTx: OffsetTransaction = {
        id: 'tx-' + Date.now(),
        projectId: activeProject.id,
        projectName: activeProject.title,
        amountInr: totalCostInr,
        co2OffsetKg: targetOffsetKg,
        dateStr: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        certificateId: serialNum
      };

      setTransactions(prev => [newTx, ...prev]);
      setSuccessCertificate(newTx);
      setIsSimulating(false);
      // Clean name
      setDonorName('');
    }, 1500);
  };

  // Cumulative offset calculations
  const totalOffsetRetiredKg = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.co2OffsetKg, 0);
  }, [transactions]);

  // Remove transaction
  const handleRemoveTransaction = (id: string) => {
    if (confirm("Are you sure you want to revoke this retirement logging entry?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-8" id="offset-hub-page">
      {/* Intro Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
          <Award size={20} className="text-emerald-600 animate-bounce" />
          Verified Offset & Contribution Hub
        </h1>
        <p className="text-xs text-zinc-500 max-w-xl">
          Neutralize remaining residual carbon emissions that can't be reduced immediately. Fund globally audited programs with 100% financial and environmental transparency.
        </p>
      </div>

      {/* Main Indicators Row: Net Footprint and retired credits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="offset-indicators">
        {/* Remaining net emissions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 relative overflow-hidden shadow-3xs">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#dc2626] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            Current Residual Baseline
          </span>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {residualTonnes.toFixed(2)} <span className="text-xs text-zinc-400">tonnes / yr</span>
            </span>
            <p className="text-[11px] text-zinc-400 font-semibold mt-1">
              {activeEmissionsWithSavings.toLocaleString()} kg CO₂e remaining after habit savings
            </p>
          </div>
        </div>

        {/* Total Carbon retired */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 relative overflow-hidden shadow-3xs">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            Total Carbon Credits Retired
          </span>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              {(totalOffsetRetiredKg / 1000).toFixed(2)} <span className="text-xs text-emerald-600">tonnes</span>
            </span>
            <p className="text-[11px] text-zinc-400 font-semibold mt-1">
              Permanently neutralized across certified projects ledger
            </p>
          </div>
          <div className="absolute right-3 bottom-3 text-emerald-100/40 pointer-events-none">
            <Award size={48} />
          </div>
        </div>

        {/* Net Zero Pathway Balance */}
        <div className="bg-[#1b3d22] text-[#e8f5e9] border border-transparent rounded-xl p-5 relative overflow-hidden shadow-3xs">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#a7f3d0] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            Audit Pathway Status
          </span>
          <div className="mt-4">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
              {totalOffsetRetiredKg >= activeEmissionsWithSavings && activeEmissionsWithSavings > 0 ? (
                <>
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <span>Certified Net Zero</span>
                </>
              ) : (
                <span>
                  {Math.max(0, 100 - Math.round((totalOffsetRetiredKg / (activeEmissionsWithSavings || 1)) * 100))}% To Net Zero
                </span>
              )}
            </span>
            <p className="text-[11px] text-emerald-200 font-medium mt-1">
              {totalOffsetRetiredKg >= activeEmissionsWithSavings && activeEmissionsWithSavings > 0
                ? "You have retired offsets covering 100% of your current ecological profile footprint!"
                : `${Math.max(0, Math.round((activeEmissionsWithSavings - totalOffsetRetiredKg) / 1000)).toFixed(2)} more tonnes to balance completely`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: interactive configurator and projects list */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Project selector */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-400 font-mono">
                Step 1: Choose Your Verified Environmental Project
              </span>
              <h3 className="text-sm font-extrabold text-zinc-800 uppercase tracking-tight">Globally Audited Registries Portfolio</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {projects.map((proj) => {
                const IconComponent = proj.icon;
                const isSelected = selectedProjectId === proj.id;
                
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setSuccessCertificate(null); // clear cert display
                    }}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-full space-y-4 ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-605 shadow-xs' 
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${proj.iconColor} border border-zinc-100`}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 tracking-tight leading-snug uppercase">{proj.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold tracking-tight mt-0.5">{proj.location}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-semibold uppercase font-mono tracking-wide">
                        Cost per tonne
                      </div>
                      <div className="font-mono text-xs font-bold text-zinc-900">
                        ${proj.costPerTonne.toFixed(2)} <span className="text-[9px] text-zinc-400 font-normal">USD</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Project Details with transparency reports */}
            <div className="border border-zinc-150 rounded-xl p-5 bg-zinc-50/50 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${activeProject.tagColor}`}>
                  {activeProject.verification}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Registry Audit Certified
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-850 italic">
                  "{activeProject.description}"
                </p>
              </div>

              {/* Verified Project Impact Indicators */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-[#059669] block">
                  Project Impact Metrics (Audit Transparency Report)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeProject.impacts.map((imp, idx) => (
                    <div key={idx} className="bg-white border border-zinc-200/80 p-3 rounded-lg flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                        {imp.label}
                      </span>
                      <p className="text-[10px] font-extrabold text-zinc-800 leading-snug mt-1.5">
                        {imp.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fund Allocation bar */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-zinc-500">
                    Sovereign Financial Transparency Matrix & Fund Allocation
                  </span>
                  <span className="text-[9px] text-zinc-405 font-bold">100% Retained Implementation Allocation</span>
                </div>
                
                {/* Visual grid representing allocation bar */}
                <div className="h-4 w-full rounded-lg overflow-hidden flex text-[8.5px] font-bold text-white text-center">
                  <div 
                    className="bg-emerald-700 h-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{ width: `${activeProject.allocation.field}%` }}
                    title={`On-The-Ground Field Sourcing: ${activeProject.allocation.field}%`}
                  >
                    {activeProject.allocation.field}%
                  </div>
                  <div 
                    className="bg-[#2e6d3c] h-full flex items-center justify-center shrink-0 transition-all duration-300 border-l border-emerald-900/10"
                    style={{ width: `${activeProject.allocation.community}%` }}
                    title={`Indigenous & Community Trusts: ${activeProject.allocation.community}%`}
                  >
                    {activeProject.allocation.community}%
                  </div>
                  <div 
                    className="bg-[#6b7280] h-full flex items-center justify-center shrink-0 transition-all duration-300 border-l border-emerald-900/10"
                    style={{ width: `${activeProject.allocation.audit}%` }}
                    title={`Audit & Third-Party Auditing: ${activeProject.allocation.audit}%`}
                  >
                    {activeProject.allocation.audit}%
                  </div>
                </div>

                {/* Allocation visual labels */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-zinc-400 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-emerald-700 block"></span>
                    <span>Direct Field Sourcing ({activeProject.allocation.field}%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-[#2e6d3c] block"></span>
                    <span>Indigenous Community Trusts ({activeProject.allocation.community}%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-[#6b7280] block"></span>
                    <span>Independent Auditor Records ({activeProject.allocation.audit}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Calculator & Certificate Retirement form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#059669] font-mono">
                Step 2: Balance Estimator
              </span>
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-tight">Retirement Contribution Form</h3>
            </div>

            {/* Slider or Percent Quick Select */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-tight">
                  Tonnage Volume Slider
                </span>
                <span className="font-mono text-xs font-black text-zinc-900">
                  {offsetPercent}% Offset
                </span>
              </div>

              {/* Real Input slider */}
              <input 
                type="range"
                min="5"
                max="100"
                step="5"
                value={offsetPercent}
                onChange={(e) => {
                  setOffsetPercent(parseInt(e.target.value));
                  setSuccessCertificate(null); // Clear displayed cert if they edit scale
                }}
                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[25, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setOffsetPercent(num);
                      setSuccessCertificate(null);
                    }}
                    className={`py-1.5 rounded text-[10px] font-extrabold tracking-wider border transition-all uppercase cursor-pointer ${
                      offsetPercent === num
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-3xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    {num}%
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-[#f0f9f3] rounded-xl p-4 border border-emerald-100/50 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                <span>Selected Carbon Volume:</span>
                <span className="font-mono text-zinc-905">{targetOffsetTonnes.toFixed(2)} tonnes</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-505 pl-1.5 border-l border-emerald-305">
                <span>Equivalent Mass CO₂e:</span>
                <span className="font-mono">{targetOffsetKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-750">
                <span>Project Base Cost Rate:</span>
                <span className="font-mono">₹{activeProject.costPerTonne.toLocaleString('en-IN')} / tonne</span>
              </div>
              
              <div className="border-t border-emerald-200/50 pt-2 flex justify-between items-end">
                <span className="text-xs font-black uppercase text-emerald-805 tracking-wide">
                  Total Investment:
                </span>
                <span className="font-mono text-xl font-black text-emerald-800 leading-none">
                  ₹{totalCostInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Retirement validation form */}
            <form onSubmit={handleRetireCredits} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-500 block">
                  Certificate Named Retirement Holder
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Suyash Kolhe / Eco citizen"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-200/80 focus:border-emerald-600 focus:outline-none transition-colors"
                />
              </div>

              {targetOffsetKg <= 0 ? (
                <div className="bg-amber-50 text-amber-800 border border-amber-150 rounded-xl p-3 text-[10px] leading-relaxed">
                  ⚠️ Your residual footprint is currently completely offset or set to zero. Adjust sliders to generate custom credit offsets.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-555 active:bg-emerald-700 text-white rounded-xl text-[10px] uppercase font-black tracking-widest transition cursor-pointer shadow-3xs flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying on Blockchain ledger...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={12} className="stroke-[2.5]" />
                      <span>Retire Verified Carbon Credits</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Pop Certificate Portal */}
      <AnimatePresence>
        {successCertificate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/30 gap-6 shadow-xl relative overflow-hidden" 
            id="certificate-popup-view"
          >
            {/* Elegant Background Stamp Overlay */}
            <div className="absolute right-0 bottom-0 select-none opacity-[0.03] text-emerald-100 pointer-events-none transform translate-x-12 translate-y-12">
              <Award size={360} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide text-white">Verified Voluntary Carbon Standard Retirement</h3>
                  <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-0.5">EcoTrace Climate Ledger Certification</p>
                </div>
              </div>
              <button 
                onClick={() => setSuccessCertificate(null)}
                className="text-white/60 hover:text-white px-2 py-1 text-xs font-bold uppercase transition bg-white/5 hover:bg-white/10 rounded-lg self-start sm:self-center shrink-0 cursor-pointer"
              >
                Close View ×
              </button>
            </div>

            <div className="py-6 space-y-4 relative z-10 text-center max-w-xl mx-auto">
              <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-emerald-400">
                OFFICIAL CARBON CREDIT RETIREMENT DEED
              </span>
              
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                CONGRATULATIONS REDUCTION CITIZEN!
              </h2>

              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-lg mx-auto font-medium">
                This verification certifies that an investment of <span className="text-white font-extrabold">₹{successCertificate.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (INR)</span> has been securely retired. This represents the permanent retirement of <span className="text-emerald-300 font-extrabold font-mono">{(successCertificate.co2OffsetKg / 1000).toFixed(2)} tonnes</span> of greenhouse gas emissions ({successCertificate.co2OffsetKg.toLocaleString()} kg CO₂e) under the registry framework.
              </p>

              {/* Certificate Inner Frame */}
              <div className="border border-emerald-500/20 bg-emerald-950/50 rounded-xl p-4 inline-block text-left w-full max-w-md space-y-3 font-mono text-[10.5px]">
                <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                  <span className="text-emerald-400">PROJECT FUNDED:</span>
                  <span className="text-white font-bold">{successCertificate.projectName}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                  <span className="text-emerald-400">BENEFICIARY RETIREMENT NAME:</span>
                  <span className="text-white font-bold">{donorName || 'EcoTrace Supporter'}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                  <span className="text-emerald-400">CERTIFICATE SERIAL ID:</span>
                  <span className="text-teal-300 font-bold">{successCertificate.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">DATE RETIRED LOGGED:</span>
                  <span className="text-white font-bold">{successCertificate.dateStr}</span>
                </div>
              </div>

              <div className="text-[10px] text-emerald-300/80 italic">
                ✓ Credits permanently locked on virtual climate registers. Non-transferable serial codes.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section: Retired offsets history ledger */}
      <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4" id="offset-history-ledger">
        <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5">
          <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-zinc-400">
            Certified Receipts Ledger ({transactions.length})
          </span>
          {transactions.length > 0 && (
            <span className="text-[9.5px] text-emerald-700 font-extrabold uppercase tracking-wider">
              Total: {(totalOffsetRetiredKg / 1000).toFixed(2)} Tonnes Neutralized
            </span>
          )}
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-150 text-zinc-400 font-bold text-[10px] uppercase tracking-wide">
                  <th className="py-2.5">Project Name</th>
                  <th>Retired Holder ID & Serial</th>
                  <th>Date Logged</th>
                  <th>Rupee Cost (INR)</th>
                  <th className="text-right">Tonnage Carbon Offset</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50/40">
                    <td className="py-3 font-bold text-zinc-900 pr-4">
                      {tx.projectName}
                    </td>
                    <td className="font-mono text-[10px] pr-4">
                      <span className="text-zinc-400">ID:</span> {tx.certificateId}
                    </td>
                    <td className="text-zinc-500 pr-4">{tx.dateStr}</td>
                    <td className="font-mono text-zinc-800 pr-4">₹{tx.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right font-mono font-bold text-emerald-700">
                      -{(tx.co2OffsetKg / 1000).toFixed(3)} t
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleRemoveTransaction(tx.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition cursor-pointer text-[10px] uppercase font-bold focus:outline-none"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-zinc-200 bg-zinc-50/50 rounded-xl space-y-2.5">
            <Info size={24} className="text-zinc-300 mx-auto" />
            <p className="text-zinc-405 text-xs font-bold uppercase tracking-wide">No past offset transactions recorded</p>
            <p className="text-zinc-500 text-xs max-w-md mx-auto leading-relaxed">
              When you offset any amount of carbon, dynamic certificates will populate this secure ledger, confirming your certified environmental contributions.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
