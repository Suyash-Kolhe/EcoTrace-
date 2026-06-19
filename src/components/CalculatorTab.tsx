/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FootprintInputs, CarType, DietType, ShoppingInputs } from '../types';
import { Car, Flame, Plane, Train, Zap, ShoppingBag, Trash, RefreshCw, Leaf } from 'lucide-react';

interface CalculatorTabProps {
  activeCategory: 'transport' | 'energy' | 'food' | 'shopping';
  inputs: FootprintInputs;
  onUpdate: (updater: (prev: FootprintInputs) => FootprintInputs) => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  activeCategory,
  inputs,
  onUpdate
}) => {
  // Transport updater helpers
  const handleTransportChange = <K extends keyof FootprintInputs['transport']>(
    key: K,
    value: FootprintInputs['transport'][K]
  ) => {
    onUpdate((prev) => ({
      ...prev,
      transport: { ...prev.transport, [key]: value }
    }));
  };

  // Energy updater helpers
  const handleEnergyChange = <K extends keyof FootprintInputs['energy']>(
    key: K,
    value: FootprintInputs['energy'][K]
  ) => {
    onUpdate((prev) => ({
      ...prev,
      energy: { ...prev.energy, [key]: value }
    }));
  };

  // Food updater helpers
  const handleFoodChange = <K extends keyof FootprintInputs['food']>(
    key: K,
    value: FootprintInputs['food'][K]
  ) => {
    onUpdate((prev) => ({
      ...prev,
      food: { ...prev.food, [key]: value }
    }));
  };

  // Shopping updater helpers
  const handleShoppingChange = <K extends keyof FootprintInputs['shopping']>(
    key: K,
    value: FootprintInputs['shopping'][K]
  ) => {
    onUpdate((prev) => ({
      ...prev,
      shopping: { ...prev.shopping, [key]: value }
    }));
  };

  switch (activeCategory) {
    case 'transport':
      return (
        <div className="space-y-6" id="calc-tab-transport">
          <div className="bg-white rounded-2xl border border-zinc-155 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <span className="p-2 sm:p-2.5 bg-emerald-50 text-xl sm:text-2xl rounded-xl border border-emerald-100 shrink-0 select-none">
                🚗
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                  Transport
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                  Enter your annual travel distances and number of flights.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Petrol Car (km/year) */}
              <div>
                <label htmlFor="petrolCarKm" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Petrol Car <span className="text-zinc-400 font-normal lowercase">(km/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.petrolCarKm || 0) * 0.18).toFixed(1)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="petrolCarKm"
                  type="number"
                  min="0"
                  value={inputs.transport.petrolCarKm || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('petrolCarKm', val);
                    handleTransportChange('carDistance', val);
                    handleTransportChange('carType', 'petrol');
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Annual kilometres driven in a petrol or hybrid car
                </p>
              </div>

              {/* Diesel Car (km/year) */}
              <div>
                <label htmlFor="dieselCarKm" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Diesel Car <span className="text-zinc-400 font-normal lowercase">(km/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.dieselCarKm || 0) * 0.17).toFixed(1)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="dieselCarKm"
                  type="number"
                  min="0"
                  value={inputs.transport.dieselCarKm || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('dieselCarKm', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Annual kilometres driven in a diesel car
                </p>
              </div>

              {/* Electric Vehicle (km/year) */}
              <div>
                <label htmlFor="electricCarKm" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Electric Vehicle <span className="text-zinc-400 font-normal lowercase">(km/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.electricCarKm || 0) * 0.04).toFixed(1)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="electricCarKm"
                  type="number"
                  min="0"
                  value={inputs.transport.electricCarKm || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('electricCarKm', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Annual kilometres driven in a battery electric car
                </p>
              </div>

              {/* Bus (km/year) */}
              <div>
                <label htmlFor="busKm" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Bus <span className="text-zinc-400 font-normal lowercase">(km/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.busKm || 0) * 0.08).toFixed(1)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="busKm"
                  type="number"
                  min="0"
                  value={inputs.transport.busKm || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('busKm', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Annual kilometres travelled by bus or coach
                </p>
              </div>

              {/* Train / Metro (km/year) */}
              <div>
                <label htmlFor="trainMetroKm" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Train / Metro <span className="text-zinc-400 font-normal lowercase">(km/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.trainMetroKm || 0) * 0.03).toFixed(1)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="trainMetroKm"
                  type="number"
                  min="0"
                  value={inputs.transport.trainMetroKm || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('trainMetroKm', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Annual kilometres by train, metro, or tram
                </p>
              </div>

              {/* Short-Haul Flights (flights/year) */}
              <div>
                <label htmlFor="flightsShort" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Short-Haul Flights <span className="text-zinc-400 font-normal lowercase">(flights/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.flightsShort || 0) * 220).toFixed(0)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="flightsShort"
                  type="number"
                  min="0"
                  value={inputs.transport.flightsShort || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('flightsShort', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Flights under 3 hours (e.g. London to Paris)
                </p>
              </div>

              {/* Long-Haul Flights (flights/year) */}
              <div>
                <label htmlFor="flightsLong" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Long-Haul Flights <span className="text-zinc-400 font-normal lowercase">(flights/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    ~{((inputs.transport.flightsLong || 0) * 950).toFixed(0)} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="flightsLong"
                  type="number"
                  min="0"
                  value={inputs.transport.flightsLong || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTransportChange('flightsLong', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Flights over 3 hours (e.g. London to New York)
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'energy':
      return (
        <div className="space-y-6" id="calc-tab-energy">
          <div className="bg-white rounded-2xl border border-zinc-155 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <span className="p-2 sm:p-2.5 bg-amber-50 text-xl sm:text-2xl rounded-xl border border-amber-100 shrink-0 select-none">
                🏠
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                  Home Energy
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                  Your household's annual energy consumption. Costs are split equally across household members.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Electricity (kWh/year) */}
              <div>
                <label htmlFor="electricityKwh" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Electricity <span className="text-zinc-400 font-normal lowercase">(kWh/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-[#b58014] bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                    ~{((inputs.energy.electricityKwh || 0) * 0.82).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="electricityKwh"
                  type="number"
                  min="0"
                  value={inputs.energy.electricityKwh || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleEnergyChange('electricityKwh', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Check your energy bills — UK average is ~3,700 kWh/year
                </p>
              </div>

              {/* Natural Gas (kWh/year) */}
              <div>
                <label htmlFor="naturalGasKwh" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Natural Gas <span className="text-zinc-400 font-normal lowercase">(kWh/year)</span></span>
                  <span className="font-mono text-[11px] font-bold text-[#b58014] bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                    ~{((inputs.energy.naturalGasKwh || 0) * 0.185).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg CO₂/yr
                  </span>
                </label>
                <input
                  id="naturalGasKwh"
                  type="number"
                  min="0"
                  value={inputs.energy.naturalGasKwh || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleEnergyChange('naturalGasKwh', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  UK average is ~12,000 kWh/year for heating and cooking
                </p>
              </div>

              {/* Household Size (people) */}
              <div>
                <label htmlFor="householdSize" className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                  <span>Household Size <span className="text-zinc-400 font-normal lowercase">(people)</span></span>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    Split share: {((1 / (inputs.energy.householdSize || 1)) * 100).toFixed(0)}%
                  </span>
                </label>
                <input
                  id="householdSize"
                  type="number"
                  min="1"
                  value={inputs.energy.householdSize || 1}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    handleEnergyChange('householdSize', val);
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-3 border border-zinc-200 rounded-xl font-bold font-mono text-zinc-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 font-normal leading-relaxed">
                  Number of people sharing your home (home emissions split equally)
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'food':
      return (
        <div className="space-y-6" id="calc-tab-food">
          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <Leaf className="text-emerald-700" size={18} />
              Dietary Profile
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Food production, especially livestock operations, is responsible for major global methane & land-use emissions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
              {(['high-meat', 'low-meat', 'vegetarian', 'vegan'] as DietType[]).map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => handleFoodChange('dietType', diet)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    inputs.food.dietType === diet
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div>
                    <span className="text-xl">
                      {diet === 'high-meat' && '🥩'}
                      {diet === 'low-meat' && '🍗'}
                      {diet === 'vegetarian' && '🧀'}
                      {diet === 'vegan' && '🌱'}
                    </span>
                    <p className="font-bold capitalize text-zinc-800 text-xs mt-1.5">
                      {diet.replace('-', ' ')}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-3">
                    {diet === 'high-meat' && '2,600 kg CO₂/yr'}
                    {diet === 'low-meat' && '1,800 kg CO₂/yr'}
                    {diet === 'vegetarian' && '1,300 kg CO₂/yr'}
                    {diet === 'vegan' && '850 kg CO₂/yr'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-zinc-200" />

          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <Leaf className="text-emerald-600" size={18} />
              Organic Food Commitment
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Organic crops use carbon-friendly land practices and avoid chemical mineral fertilizers.
            </p>

            <div className="mt-4">
              <div className="flex justify-between items-center text-sm mb-1.5">
                <label htmlFor="organicShare" className="font-bold text-zinc-700 text-xs">Organic Sourcing Share</label>
                <span className="font-mono text-emerald-700 font-extrabold bg-[#f0f9f3] px-2.5 py-0.5 rounded text-xs border border-emerald-100">
                  {inputs.food.organicShare}%
                </span>
              </div>
              <input
                id="organicShare"
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.food.organicShare}
                onChange={(e) => handleFoodChange('organicShare', parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>Conventional (0%)</span>
                <span>Partially (50%)</span>
                <span>Fully Local/Organic (100%)</span>
              </div>
            </div>
          </div>

          <hr className="border-zinc-200" />

          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <Trash className="text-zinc-500" size={18} />
              Household Food Waste
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Wasted food decomposes in landfill sites to release heavy greenhouse emissions. Minimizing food waste drastically offsets your food footprint.
            </p>

            <div className="mt-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-200">
              <div className="flex justify-between items-center text-sm mb-1.5">
                <label htmlFor="foodWasteShare" className="font-bold text-zinc-700 text-xs">Estimated Food Waste</label>
                <span className={`font-mono font-extrabold px-2.5 py-0.5 rounded text-xs border ${
                  inputs.food.foodWasteShare < 15 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  {inputs.food.foodWasteShare}% of purchases
                </span>
              </div>
              <input
                id="foodWasteShare"
                type="range"
                min="0"
                max="80"
                step="5"
                value={inputs.food.foodWasteShare}
                onChange={(e) => handleFoodChange('foodWasteShare', parseInt(e.target.value))}
                className="w-full accent-zinc-700 cursor-pointer h-2 bg-zinc-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>Zero waste (0%)</span>
                <span>Global Average (~30%)</span>
                <span>Extremely wasteful (80%)</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'shopping':
      return (
        <div className="space-y-6" id="calc-tab-shopping">
          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <ShoppingBag className="text-purple-600" size={18} />
              Consumption & Buying Habits
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Manufacturing, packaging, and transporting clothes, consumer goods, and gadgets leave significant industrial footprints.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <label htmlFor="clothesMonthly" className="font-bold text-zinc-700 text-xs uppercase">Clothing Habits</label>
                  <span className="font-mono text-purple-700 font-extrabold bg-[#fbf7fc] px-2 py-0.5 rounded text-xs border border-purple-200">
                    ₹{inputs.shopping.clothesMonthly.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <input
                  id="clothesMonthly"
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
                  value={inputs.shopping.clothesMonthly}
                  onChange={(e) => handleShoppingChange('clothesMonthly', parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>Thrift Only</span>
                  <span>Modest (₹2,500)</span>
                  <span>High Purchases (₹12,020+)</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <label htmlFor="electronicsYearly" className="font-bold text-zinc-700 text-xs uppercase">Electronics & Tech Sourcing</label>
                  <span className="font-mono text-purple-700 font-extrabold bg-[#fbf7fc] px-2 py-0.5 rounded text-xs border border-purple-200">
                    ₹{inputs.shopping.electronicsYearly.toLocaleString('en-IN')} / year
                  </span>
                </div>
                <input
                  id="electronicsYearly"
                  type="range"
                  min="0"
                  max="150000"
                  step="2000"
                  value={inputs.shopping.electronicsYearly}
                  onChange={(e) => handleShoppingChange('electronicsYearly', parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>Sparing (₹5,000)</span>
                  <span>Average (₹20,000)</span>
                  <span>Flagships (₹80,000+)</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-zinc-200" />

          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
              <RefreshCw className="text-emerald-600" size={18} />
              Recycling & Waste Offsets
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Select recycling practices you already actively sustain in your household to offset consumption carbon burdens.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { key: 'recyclingPaper', label: '📰 Paper & Card', credit: '45kg Co2/yr' },
                { key: 'recyclingPlastic', label: '🥤 Plastics', credit: '70kg Co2/yr' },
                { key: 'recyclingGlass', label: '🍾 Glass Bottles', credit: '35kg Co2/yr' },
                { key: 'recyclingMetal', label: '🥫 Metal & Cans', credit: '50kg Co2/yr' }
              ].map((item) => {
                const isChecked = inputs.shopping[item.key as keyof ShoppingInputs] as boolean;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleShoppingChange(item.key as any, !isChecked)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-medium'
                        : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold uppercase text-zinc-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-zinc-350 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isChecked ? 'text-emerald-700 bg-emerald-100/60' : 'text-zinc-400 bg-zinc-100'} px-2 py-0.5 rounded self-start mt-2`}>
                      -{item.credit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
