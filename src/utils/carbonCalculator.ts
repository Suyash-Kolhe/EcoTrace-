/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FootprintInputs, FootprintBreakdown, TransportInputs, EnergyInputs, FoodInputs, ShoppingInputs } from '../types';

// Emission factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  // Transport (per km)
  car: {
    petrol: 0.18,
    diesel: 0.17,
    hybrid: 0.10,
    electric: 0.04,
    none: 0,
  },
  publicTransitHr: 1.5, // kg CO2 per hour of public transit travel (assuming average speed & occupancy)
  flightShort: 220,     // kg CO2 per short-haul return flight (< 3 hrs)
  flightLong: 950,      // kg CO2 per long-haul return flight (> 3 hrs)
  busKm: 0.08,          // kg CO2 per km for bus transport
  trainMetroKm: 0.03,   // kg CO2 per km for electric train/metro/tramway

  // Energy
  electricityKwh: 0.82,  // kg CO2 per kWh (Indian average grid mix, coal-heavy)
  naturalGasKwh: 0.185,  // kg CO2 per kWh of LPG/natural gas
  naturalGasM3: 2.0,     // kg CO2 per cubic meter of natural gas / LPG
  heatingFuelLiter: 2.68, // kg CO2 per liter of heating oil (rare in India, but included for complete math)

  // Food (baseline kg CO2 per person per year by diet)
  diet: {
    'high-meat': 2600,
    'low-meat': 1800,
    'vegetarian': 1300,
    'vegan': 850,
  },

  // Shopping (kg CO2 per Indian Rupee spent, adjusted from USD @ ~1 USD = 83 INR)
  spending: {
    clothes: 0.0018,      // per ₹ spent
    electronics: 0.0034,  // per ₹ spent
  },
  // Recycling credits (kg CO2 saved per year)
  recycling: {
    paper: -45,
    plastic: -70,
    glass: -35,
    metal: -50,
  }
};

export function calculateTransportCO2(inputs: TransportInputs): number {
  if (!inputs) return 0;
  
  // Use granular entries if they exist, otherwise fallback to legacy carType logic
  const petrolKm = inputs.petrolCarKm !== undefined ? inputs.petrolCarKm : (inputs.carType === 'petrol' ? inputs.carDistance : 0);
  const dieselKm = inputs.dieselCarKm !== undefined ? inputs.dieselCarKm : (inputs.carType === 'diesel' ? inputs.carDistance : 0);
  const electricKm = inputs.electricCarKm !== undefined ? inputs.electricCarKm : (inputs.carType === 'electric' ? inputs.carDistance : 0);
  
  const carEmissions = (petrolKm * 0.18) + (dieselKm * 0.17) + (electricKm * 0.04);
  
  const busKm = inputs.busKm !== undefined ? inputs.busKm : (inputs.publicTransitHours * 52 * 10); // fallback Estimate (10km per hr of transit)
  const trainMetroKm = inputs.trainMetroKm !== undefined ? inputs.trainMetroKm : (inputs.publicTransitHours * 52 * 15); // fallback estimate (15km per hr of transit)
  
  const transitEmissions = (busKm * EMISSION_FACTORS.busKm) + (trainMetroKm * EMISSION_FACTORS.trainMetroKm);
  
  const flightShortEmissions = (inputs.flightsShort || 0) * EMISSION_FACTORS.flightShort;
  const flightLongEmissions = (inputs.flightsLong || 0) * EMISSION_FACTORS.flightLong;

  return Math.round(carEmissions + transitEmissions + flightShortEmissions + flightLongEmissions);
}

export function calculateEnergyCO2(inputs: EnergyInputs): number {
  if (!inputs) return 0;
  
  // Use household size if available (as shown in the screenshot)
  if (inputs.householdSize !== undefined && inputs.naturalGasKwh !== undefined) {
    const electricityEmissions = (inputs.electricityKwh || 0) * EMISSION_FACTORS.electricityKwh;
    const gasEmissions = (inputs.naturalGasKwh || 0) * EMISSION_FACTORS.naturalGasKwh;
    const shareSplit = inputs.householdSize || 1;
    
    return Math.round((electricityEmissions + gasEmissions) / shareSplit);
  }
  
  // Legacy fallback math
  const electricityEmissions = (inputs.electricityKwh * 12) * EMISSION_FACTORS.electricityKwh * (1 - inputs.greenEnergyShare / 100);
  const gasEmissions = (inputs.gasCubicMeters * 12) * EMISSION_FACTORS.naturalGasM3;
  const heatingEmissions = inputs.heatingFuelLiters * EMISSION_FACTORS.heatingFuelLiter;

  return Math.round(electricityEmissions + gasEmissions + heatingEmissions);
}

export function calculateFoodCO2(inputs: FoodInputs): number {
  if (!inputs) return 0;
  const baseDietEmissions = EMISSION_FACTORS.diet[inputs.dietType] || 1800;
  
  // Organic share reduction: organic farming reduces pesticide-based emissions. Up to 15% reduction.
  const organicDiscount = 1 - (inputs.organicShare / 100) * 0.15;
  
  // Food waste burden: wasting food increases carbon impact.
  // 0% waste = -5% reduction from baseline behavior, 100% waste = +25% burden
  const wasteFactor = 1 + ((inputs.foodWasteShare - 30) / 100) * 0.3; // 30% is typical average waste

  return Math.round(baseDietEmissions * organicDiscount * wasteFactor);
}

export function calculateShoppingCO2(inputs: ShoppingInputs): number {
  if (!inputs) return 0;
  const clothesEmissions = (inputs.clothesMonthly * 12) * EMISSION_FACTORS.spending.clothes;
  const electronicsEmissions = inputs.electronicsYearly * EMISSION_FACTORS.spending.electronics;

  let recyclingSavings = 0;
  if (inputs.recyclingPaper) recyclingSavings += EMISSION_FACTORS.recycling.paper;
  if (inputs.recyclingPlastic) recyclingSavings += EMISSION_FACTORS.recycling.plastic;
  if (inputs.recyclingGlass) recyclingSavings += EMISSION_FACTORS.recycling.glass;
  if (inputs.recyclingMetal) recyclingSavings += EMISSION_FACTORS.recycling.metal;

  // Shopping emissions cannot drop below zero (recycling credits offset spending emissions)
  return Math.max(0, Math.round(clothesEmissions + electronicsEmissions + recyclingSavings));
}

export function calculateFullFootprint(inputs: FootprintInputs): FootprintBreakdown {
  const transport = calculateTransportCO2(inputs.transport);
  const energy = calculateEnergyCO2(inputs.energy);
  const food = calculateFoodCO2(inputs.food);
  const shopping = calculateShoppingCO2(inputs.shopping);
  const total = transport + energy + food + shopping;

  return {
    transport,
    energy,
    food,
    shopping,
    total
  };
}

// Initial defaults for standard user input
export const DEFAULT_INPUTS: FootprintInputs = {
  transport: {
    carDistance: 8000,    // average Indian urban vehicle distance
    carType: 'petrol',
    publicTransitHours: 6, // bus/metro commuters
    flightsShort: 0,
    flightsLong: 0,
    petrolCarKm: 0,
    dieselCarKm: 0,
    electricCarKm: 0,
    busKm: 0,
    trainMetroKm: 0,
  },
  energy: {
    electricityKwh: 0, // kWh per year
    greenEnergyShare: 0,
    gasCubicMeters: 14,   // standard Indian cooking gas cylinders (LPG, ~14.2 kg)
    heatingFuelLiters: 0,
    naturalGasKwh: 0,  // kWh per year
    householdSize: 1,  // people
  },
  food: {
    dietType: 'vegetarian', // highly popular/default in India
    organicShare: 15,
    foodWasteShare: 15,
  },
  shopping: {
    clothesMonthly: 3000,   // ₹3,000 per month
    electronicsYearly: 20000, // ₹20,000 per year
    recyclingPaper: true,
    recyclingPlastic: true,
    recyclingGlass: false,
    recyclingMetal: false,
  }
};

// Global perspective constants for layout comparison
export const GLOBAL_COMPARISONS = {
  worldAverage: 4500,     // 4.5 tonnes
  usAverage: 15500,       // 15.5 tonnes
  euAverage: 6500,        // 6.5 tonnes
  indiaAverage: 1900,     // 1.9 tonnes (average annual per capita emissions in India)
  globalTarget2030: 2000, // 2 tonnes limit to stay under 1.5C
};
