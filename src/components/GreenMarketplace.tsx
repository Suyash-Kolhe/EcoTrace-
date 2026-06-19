/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Car, 
  Zap, 
  Leaf, 
  Award, 
  Search, 
  Percent, 
  BarChart4, 
  Filter, 
  CheckCircle2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  TreePine,
  Coffee,
  Plane,
  Fuel,
  Info
} from 'lucide-react';
import { FootprintBreakdown } from '../types';

interface GreenMarketplaceProps {
  currentBreakdown: FootprintBreakdown;
  committedSavings: number; // in kg
  onNavigateToCategory?: (category: string) => void;
}

export interface PartnerBrand {
  id: string;
  name: string;
  logo: string;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'offsets';
  productName: string;
  description: string;
  whySavesCo2: string;
  transparencyRating: string; // A+, A, A- etc.
  trustScore: number; // 0-100
  certifications: string[];
  approxAnnualSavingKg: number;
  perkJargon: string; // e.g. "$40 Off First Month"
  promoCode: string;
  websiteUrl: string;
  equivalentMetric: string; // e.g. "Equivalent to planting 12 trees"
  detailedTrustReport: string;
}

export const GREEN_BRANDS: PartnerBrand[] = [
  {
    id: 'tata-solar',
    name: 'PM Surya Ghar (Tata Solar)',
    logo: '☀️',
    category: 'energy',
    productName: 'Subsidized Grid-Matched Rooftop Solar',
    description: 'Allows urban and rural homes to install premium rooftop solar panels with direct Ministry subsidy, covering 100% of residential power bills with renewable solar energy.',
    whySavesCo2: 'Displaces coal/gas electricity generation on the state discom grid share with clean solar power certificates.',
    transparencyRating: 'A+',
    trustScore: 99,
    certifications: ['Govt. of India Certified', 'MNRE Subsidized', 'ISO 14001 Solar'],
    approxAnnualSavingKg: 2400,
    perkJargon: 'Direct ₹78,000 Central Govt Subsidy + Free Grid Survey',
    promoCode: 'MREYSURYA',
    websiteUrl: 'https://pmsuryaghar.gov.in/',
    equivalentMetric: 'Equivalent to offloading 4.2 tonnes of standard coal usage',
    detailedTrustReport: 'Audited central installation networks. Direct benefit transfer (DBT) model registered with the Ministry of New and Renewable Energy.'
  },
  {
    id: 'ather-energy',
    name: 'Ather Commute & Grid',
    logo: '⚡',
    category: 'transport',
    productName: 'Smart Utility Electric Scooters',
    description: 'Vanguard Indian smart electric scooters designed to completely replace petrol bikes, eliminating high-particulate exhaust emissions for daily office and market commutes.',
    whySavesCo2: 'Dramatically reduces petrol consumption by shifting urban commutes to highly efficient electric drivetrains.',
    transparencyRating: 'A',
    trustScore: 96,
    certifications: ['FAME-II Audited', 'WRI India Certified Unit'],
    approxAnnualSavingKg: 920,
    perkJargon: '₹12,400 State EV subsidy + Free Residential Charging Point',
    promoCode: 'ECOATHER',
    websiteUrl: 'https://www.atherenergy.com/',
    equivalentMetric: 'Equivalent to saving 480 liters of petrol burning',
    detailedTrustReport: 'Batteries conform to rigorous safety standards (AIS-156). Cells are processed under closed-loop material recycling guidelines.'
  },
  {
    id: 'the-organic-world',
    name: 'The Organic World Baskets',
    logo: '🥦',
    category: 'food',
    productName: 'Chemical-Free Fresh Produce & Grocery',
    description: 'Sourced directly from certified chemical-free, pesticide-free organic farmer cooperatives near Maharashtra, Karnataka & South regions, bypassing long supply routes.',
    whySavesCo2: 'Avoids heavy nitrous oxide emissions from synthetic nitrogen fertilizers and cuts retail distribution storage emissions.',
    transparencyRating: 'A',
    trustScore: 92,
    certifications: ['FSSAI Organic Certified', 'NPOP Compliant Organic'],
    approxAnnualSavingKg: 240,
    perkJargon: '₹250 Flat Discount on Baskets above ₹1,200',
    promoCode: 'ORGANICINDIA',
    websiteUrl: 'https://theorganicworld.com/',
    equivalentMetric: 'Shields 6,550 square meters of soil from toxic runoffs',
    detailedTrustReport: 'Maintains direct farm gates logs. Third-party soil audit test registers verified and public on app portals for complete trust.'
  },
  {
    id: 'doodlage',
    name: 'Doodlage Circular Apparel',
    logo: '🧥',
    category: 'shopping',
    productName: 'Upcycled & Organic Recycled ward garments',
    description: 'Indian circular fashion design house that salvages industrial post-production textile waste and post-consumer cotton blocks to create exquisite high-comfort apparel.',
    whySavesCo2: 'Keeps clothing out of carbon-heavy landfills and side-steps the intensive chemical dyes and water used to process virgin threads.',
    transparencyRating: 'A+',
    trustScore: 95,
    certifications: ['GOTS Certified', 'Global Recycled Standard', 'Fair Trade India'],
    approxAnnualSavingKg: 110,
    perkJargon: '15% Off Your First Circular Wardrobe Purchase',
    promoCode: 'DOODLAGETRACE',
    websiteUrl: 'https://www.doodlage.in/',
    equivalentMetric: 'Equivalent to saving 4,100 liters of freshwater dye runoff',
    detailedTrustReport: 'Provides fully transparent carbon footprint metrics on wash garments tags. Works exclusively with verified labor unions.'
  },
  {
    id: 'smarter-homes',
    name: 'Smarter Homes Meters',
    logo: '🚰',
    category: 'energy',
    productName: 'Water & Appliance Smart Utility Monitors',
    description: 'Enables high-rise apartments in major Indian cities to isolate water leakages and high-load appliance consumption using secure IoT sub-metering grids.',
    whySavesCo2: 'Minimizes electricity needed to run common-area water pumps, water tankers, and home appliances.',
    transparencyRating: 'A-',
    trustScore: 91,
    certifications: ['WRI Smart City Partner', 'ISO 9001 certified'],
    approxAnnualSavingKg: 350,
    perkJargon: '₹1,500 Off Home Hub Unit + Complimentary Smart App setup',
    promoCode: 'SMARTINDIRA',
    websiteUrl: 'https://smarterhomes.com/',
    equivalentMetric: 'Prevents waste of up to 25,000 liters of purified water',
    detailedTrustReport: 'Cloud server logs are certified 100% net carbon neutral, utilizing wind energy generation credits.'
  },
  {
    id: 'bare-necessities',
    name: 'Bare Necessities Zero-Waste',
    logo: '🧼',
    category: 'shopping',
    productName: 'Solid Refillable Personal & Home Care',
    description: 'Beautiful, handcrafted Indian personal care solutions including solid shampoo bars, bamboo dental accessories, and chemical-free powder deterges in compostable jars.',
    whySavesCo2: 'Alleviates single-use plastic creation burdens and significantly reduces bulk freight transit tonnage.',
    transparencyRating: 'A',
    trustScore: 97,
    certifications: ['Cruelty-Free certified', '100% Plastic Free', 'Zero Waste India'],
    approxAnnualSavingKg: 45,
    perkJargon: '20% Off Refillable Wellness Starters Kit',
    promoCode: 'BARETRACE20',
    websiteUrl: 'https://barenecessities.in/',
    equivalentMetric: 'Blocks 30 single-use heavy plastic containers, preventing ocean slop',
    detailedTrustReport: 'Artisanally produced by women-led self-help cooperatives in South India, with open wages and material ledger reviews.'
  },
  {
    id: 'living-food',
    name: 'Living Food Company',
    logo: '🌱',
    category: 'food',
    productName: 'Local Hydroponic Greens & Vegan Dairy alternatives',
    description: 'Clean, plant-based vegan milk alternatives, cheese substitutes, and hydroponically grown, pesticide-free microgreens delivered locally in major metro cities.',
    whySavesCo2: 'Shirting dairy and high-meat consumption to crop-based proteins drops agricultural greenhouse emissions by 75%.',
    transparencyRating: 'A-',
    trustScore: 90,
    certifications: ['PETA Approved Vegan', 'FSSAI Sourced Organic'],
    approxAnnualSavingKg: 410,
    perkJargon: 'Free Vegan Starter Butter + ₹300 Signup Credit',
    promoCode: 'LIVINGIND',
    websiteUrl: 'https://www.livingfood.co/',
    equivalentMetric: 'Avoids burning or transit fuel emissions equal to driving 860 km',
    detailedTrustReport: 'Ships cold products in reusable insulated foil liners. Sources 100% of organic ingredients from surrounding regional farms.'
  }
];

export const GreenMarketplace: React.FC<GreenMarketplaceProps> = ({
  currentBreakdown,
  committedSavings,
  onNavigateToCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CO2 Swap Simulator States
  const [simDistance, setSimDistance] = useState<number>(30); // km/week
  const [simDietMeals, setSimDietMeals] = useState<number>(5); // meals/week
  const [simSolarKwh, setSimSolarKwh] = useState<number>(200); // kWh/month

  // 1. Identify contextually relevant high impact category on startup
  const primaryHighSectorAlert = useMemo(() => {
    const list = [
      { name: 'transport', val: currentBreakdown.transport },
      { name: 'energy', val: currentBreakdown.energy },
      { name: 'food', val: currentBreakdown.food },
      { name: 'shopping', val: currentBreakdown.shopping }
    ];
    // Sort descending
    list.sort((a, b) => b.val - a.val);
    return list[0];
  }, [currentBreakdown]);

  // Filtered lists of brands
  const filteredBrands = useMemo(() => {
    return GREEN_BRANDS.filter((brand) => {
      const matchCat = selectedCategory === 'all' || brand.category === selectedCategory;
      const matchSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          brand.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brand.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Contextual brands specifically designed for the peak category
  const contextRecommendedAlternative = useMemo(() => {
    return GREEN_BRANDS.find(b => b.category === primaryHighSectorAlert.name);
  }, [primaryHighSectorAlert]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Calculations for prospective simulations
  const simEbikeSavings = useMemo(() => {
    const rateSaves = 0.18; // kg/km vs regular car
    return simDistance * 52 * rateSaves; // Year savings
  }, [simDistance]);

  const simVeganSavings = useMemo(() => {
    const rateSaves = 3.2; // kg per plant-based meal replacement
    return simDietMeals * 52 * rateSaves;
  }, [simDietMeals]);

  const simSolarSavings = useMemo(() => {
    const coalEmissionRate = 0.52; // kg per kWh
    return simSolarKwh * 12 * coalEmissionRate;
  }, [simSolarKwh]);

  return (
    <div className="space-y-8" id="eco-marketplace-hub">
      {/* Header and Context Segment */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-[#059669] rounded-lg">
            <ShoppingBag size={20} className="stroke-[2]" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight">
              Verified Green Alternatives Marketplace
            </h1>
            <p className="text-xs text-zinc-500">
              Candid swaps and verified climate-friendly alternatives matched contextually to your footprint variables. No generic advertising.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Contextual Recommendations (surfaced at moment of relevance) */}
      <div 
        className="p-5 bg-gradient-to-br from-emerald-50/50 via-white to-zinc-55 border border-emerald-100 rounded-2xl relative overflow-hidden shadow-xs"
        id="contextual-alternative-banner"
      >
        <div className="absolute right-0 top-0 select-none opacity-[0.03] text-emerald-900 pointer-events-none translate-x-3 -translate-y-3 scale-150">
          <Award size={130} />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
              ✨ Contextual Audit Insight
            </div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
              Your highest footprint factor is <strong className="text-emerald-700 capitalize">{primaryHighSectorAlert.name}</strong> 
              ({Math.round(primaryHighSectorAlert.val).toLocaleString()} kg CO₂/yr)
            </h3>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-2xl">
              We identified custom alternatives vetted for transparency. Making a simple swap in this area cuts greenhouse impacts significantly far faster than micro-optimizations elsewhere!
            </p>

            {/* Micro comparison scale */}
            {contextRecommendedAlternative && (
              <div className="bg-white/80 border border-zinc-150 p-3.5 rounded-xl space-y-2 max-w-xl">
                <p className="text-[10px] font-black uppercase text-zinc-450 font-mono">Projected Category Avoidance Swap</p>
                <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-4">
                  <div className="text-xs text-zinc-500">
                    <span className="font-bold text-zinc-700">Baseline emissions:</span> {Math.round(primaryHighSectorAlert.val).toLocaleString()} kg CO₂
                  </div>
                  <div className="hidden sm:inline text-zinc-300">|</div>
                  <div className="text-xs text-[#059669] font-bold">
                    <span>Swapping saves approx:</span> -{contextRecommendedAlternative.approxAnnualSavingKg} kg CO₂ / yr
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Spotlight Card of Relevance */}
          {contextRecommendedAlternative && (
            <div className="w-full md:w-80 bg-white border border-emerald-200/90 p-4.5 rounded-xl shadow-2xs shrink-0 hover:border-emerald-400 group transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase bg-emerald-50 text-[#059669] px-2 py-0.5 rounded border border-emerald-100">
                  Top Recommended swap
                </span>
                <span className="font-mono text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                  {contextRecommendedAlternative.transparencyRating} Audit
                </span>
              </div>

              <div className="flex gap-2.5 mb-2.5">
                <span className="text-xl select-none">{contextRecommendedAlternative.logo}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-zinc-900 truncate uppercase tracking-tight">{contextRecommendedAlternative.name}</h4>
                  <p className="text-zinc-500 text-[10px] leading-tight font-medium truncate">{contextRecommendedAlternative.productName}</p>
                </div>
              </div>

              <p className="text-zinc-650 text-[11px] leading-relaxed line-clamp-2">
                {contextRecommendedAlternative.description}
              </p>

              <div className="pt-3.5 mt-3 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-[9px] font-mono text-emerald-800 font-extrabold flex items-center gap-1">
                  <ShieldCheck size={11} className="stroke-[2.5]" />
                  <span>{contextRecommendedAlternative.trustScore}/100 Trust</span>
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById(`brand-card-${contextRecommendedAlternative.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.className += " ring-2 ring-emerald-500 bg-emerald-50/20";
                      setTimeout(() => {
                        el.className = el.className.replace(" ring-2 ring-emerald-500 bg-emerald-50/20", "");
                      }, 2500);
                    }
                  }}
                  className="font-extrabold text-[9px] uppercase tracking-wider text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  Retrieve Code & Perks →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive prospective swap simulator (keeps users motivated) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-xs" id="interactive-swap-calculator">
        <div className="border-b border-zinc-150 pb-4 mb-5">
          <div className="flex items-center gap-1.5 uppercase font-mono text-[9px] font-black text-[#059669] bg-[#f0f9f3] px-2.5 py-0.5 rounded border border-emerald-100 max-w-max">
            <BarChart4 size={11} />
            Interactive Impact Swap Simulator
          </div>
          <h3 className="text-zinc-900 font-black text-sm uppercase tracking-tight mt-1.5">
            Visualize Potential Lifestyle Swaps Live
          </h3>
          <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
            Configure raw parameters below to calculate exact carbon avoidance equivalent to physical nature tree plantings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* E-Bike Switch Slider */}
          <div className="p-4 bg-zinc-50/80 rounded-xl space-y-4 border border-zinc-200 shadow-3xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-800 uppercase tracking-tight">
                <span>🚲 Switch E-Bike for Errands</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Ride e-bikes instead of gasoline drives for groceries & weekly commutes.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-baseline font-mono text-[10px] font-bold text-zinc-500 text-right">
                <span>Weekly Travel Distance:</span>
                <span className="text-zinc-900 font-black text-xs">{simDistance} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={simDistance}
                onChange={(e) => setSimDistance(parseInt(e.target.value))}
                className="w-full accent-emerald-600 h-1 rounded-lg"
              />
            </div>

            <div className="bg-white border border-emerald-50 px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 text-center">
              <p className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">PROJECTED OXYGEN BENEFIT</p>
              <div className="text-[#059669] font-black text-sm font-mono">
                -{simEbikeSavings.toFixed(1)} kg CO₂e / yr
              </div>
              <p className="text-[10.5px] text-zinc-500 font-medium flex items-center justify-center gap-1">
                <TreePine size={12} className="text-emerald-700 inline" />
                <span>Equivalent to <strong>{Math.ceil(simEbikeSavings / 20)}</strong> mature trees planted</span>
              </p>
            </div>
          </div>

          {/* Vegan Meals Slider */}
          <div className="p-4 bg-zinc-50/80 rounded-xl space-y-4 border border-zinc-200 shadow-3xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-800 uppercase tracking-tight">
                <span>🌱 Plant-Based Meal Replacements</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Ditch high-meat beef/dairy foods for vegan plant substitutions.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-baseline font-mono text-[10px] font-bold text-zinc-500 text-right">
                <span>Replacement Meals:</span>
                <span className="text-zinc-900 font-black text-xs">{simDietMeals} meals/wk</span>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                step="1"
                value={simDietMeals}
                onChange={(e) => setSimDietMeals(parseInt(e.target.value))}
                className="w-full accent-emerald-600 h-1 rounded-lg"
              />
            </div>

            <div className="bg-white border border-emerald-50 px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 text-center">
              <p className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">PROJECTED LAND REDUCTION</p>
              <div className="text-[#059669] font-black text-sm font-mono">
                -{simVeganSavings.toFixed(1)} kg CO₂e / yr
              </div>
              <p className="text-[10.5px] text-zinc-500 font-medium flex items-center justify-center gap-1">
                <Coffee size={12} className="text-amber-700 inline" />
                <span>Avoids <strong>{Math.ceil(simVeganSavings / 3.2)}</strong> standard burger footprints</span>
              </p>
            </div>
          </div>

          {/* Wind Solar energy Slider */}
          <div className="p-4 bg-zinc-50/80 rounded-xl space-y-4 border border-zinc-200 shadow-3xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-800 uppercase tracking-tight">
                <span>⚡ Community Renewable Energy</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Off-channel clean energy grid credits allocated to your home electricity.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-baseline font-mono text-[10px] font-bold text-zinc-500 text-right">
                <span>Target home utilization:</span>
                <span className="text-zinc-900 font-black text-xs">{simSolarKwh} kWh/mo</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={simSolarKwh}
                onChange={(e) => setSimSolarKwh(parseInt(e.target.value))}
                className="w-full accent-emerald-600 h-1 rounded-lg"
              />
            </div>

            <div className="bg-white border border-emerald-50 px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 text-center">
              <p className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">PROJECTED GRID OFFSET</p>
              <div className="text-[#059669] font-black text-sm font-mono">
                -{simSolarSavings.toFixed(1)} kg CO₂e / yr
              </div>
              <p className="text-[10.5px] text-zinc-500 font-medium flex items-center justify-center gap-1">
                <Fuel size={12} className="text-zinc-600 inline" />
                <span>Prevents burning <strong>{Math.ceil(simSolarSavings * 0.44)}</strong> liters of oil</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Marketplace Browsing & Product Cards */}
      <div className="space-y-5" id="marketplace-search-browsing">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
          {/* Quick search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search verified alternatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Categories filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-zinc-400 hidden sm:inline" />
            {[
              { id: 'all', label: 'All Alternatives' },
              { id: 'energy', label: '🔌 Clean Energy' },
              { id: 'transport', label: '🚗 Transport Options' },
              { id: 'food', label: '🌱 Food Supply' },
              { id: 'shopping', label: '🛍️ Circular Retail' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 font-black uppercase text-[10px] tracking-wider rounded-lg border-zinc-200 transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-zinc-900 border text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="green-brands-market-grid">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              id={`brand-card-${brand.id}`}
              className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Upper segment */}
              <div className="space-y-4">
                {/* Brand Identity */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-2xl select-none shrink-0 shadow-3xs">
                      {brand.logo}
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 flex items-center gap-1.5">
                        {brand.name}
                        <span className="text-[10px] select-none text-emerald-600">✔</span>
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                        {brand.productName}
                      </p>
                    </div>
                  </div>

                  {/* Audit transparency badge */}
                  <div className="text-right">
                    <span className="inline-block font-mono text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded leading-none">
                      {brand.transparencyRating} Audit
                    </span>
                    <span className="block text-[8px] uppercase font-bold text-zinc-400 font-mono tracking-wider mt-1">
                      {brand.trustScore}/100 trust
                    </span>
                  </div>
                </div>

                {/* Main Product explanation */}
                <div className="space-y-2">
                  <p className="text-zinc-700 text-xs leading-normal font-medium">
                    {brand.description}
                  </p>
                  
                  <div className="p-3 bg-[#fcfdfc] border border-emerald-100/60 rounded-xl space-y-1">
                    <p className="text-[9.5px] font-black uppercase font-mono text-zinc-450">ECOLOGICAL IMPACT MECHANICS</p>
                    <p className="text-zinc-500 text-[10.5px] leading-relaxed">
                      {brand.whySavesCo2}
                    </p>
                  </div>
                </div>

                {/* Accompanying audit report & certs */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {brand.certifications.map((cert) => (
                      <span key={cert} className="bg-zinc-50 border border-zinc-150 text-zinc-500 text-[8.5px] uppercase font-mono font-bold px-1.5 py-0.5 rounded">
                        🛡️ {cert}
                      </span>
                    ))}
                  </div>

                  <p className="text-zinc-400 text-[10px] italic leading-relaxed bg-[#fbfbfb] p-2 rounded border border-zinc-100">
                    <strong>Report:</strong> {brand.detailedTrustReport}
                  </p>
                </div>
              </div>

              {/* Lower segment: Promo code / Call to action */}
              <div className="pt-5 mt-5 border-t border-zinc-100 space-y-4">
                {/* Visual conversion stats */}
                <div className="flex justify-between items-center text-[10px] font-mono font-bold leading-none">
                  <span className="text-emerald-800 uppercase">Approx saving:</span>
                  <span className="text-[#059669] text-xs font-black">
                    -{brand.approxAnnualSavingKg} kg CO₂ / yr
                  </span>
                </div>

                {/* Promo Code Drawer */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-emerald-800 leading-none mb-1">
                      EXCLUSIVE PERK
                    </p>
                    <p className="text-zinc-800 text-[11px] font-bold truncate">
                      {brand.perkJargon}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyCode(brand.id, brand.promoCode)}
                    className={`px-3.5 py-1.5 font-extrabold text-[9px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-3xs ${
                      copiedId === brand.id
                        ? 'bg-emerald-800 border-emerald-950 text-white'
                        : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {copiedId === brand.id ? (
                      <>
                        <Check size={11} className="stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Percent size={11} />
                        <span>Copy: {brand.promoCode}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Outgoing direct links */}
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 dark:bg-zinc-100 dark:border-zinc-200 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-extrabold text-center rounded-lg text-[10px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all shadow-3xs"
                >
                  <span>Explore Clean Option</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}

          {filteredBrands.length === 0 && (
            <div className="col-span-full border border-dashed border-zinc-200 rounded-2xl p-10 text-center space-y-2 bg-[#fbfbfb]">
              <span className="text-3xl select-none">🔍</span>
              <p className="font-extrabold text-zinc-700 text-sm uppercase tracking-tight">No clean alternatives matched your criteria</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-normal">
                Try modifying your search or check alternative segment tabs.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-1.5 mt-2 bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wide rounded-lg cursor-pointer transition-all"
              >
                Clear Search filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
