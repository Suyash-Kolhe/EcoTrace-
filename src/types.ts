/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CarType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';
export type DietType = 'vegan' | 'vegetarian' | 'low-meat' | 'high-meat';

export interface TransportInputs {
  carDistance: number; // km per year
  carType: CarType;
  publicTransitHours: number; // hours per week
  flightsShort: number; // flights per year (under 3 hours)
  flightsLong: number; // flights per year (over 3 hours)
  petrolCarKm: number;
  dieselCarKm: number;
  electricCarKm: number;
  busKm: number;
  trainMetroKm: number;
}

export interface EnergyInputs {
  electricityKwh: number; // kWh per year
  greenEnergyShare: number; // percentage (0 - 100)
  gasCubicMeters: number; // m3 per month
  heatingFuelLiters: number; // Liters per year
  naturalGasKwh: number; // kWh per year
  householdSize: number; // people
}

export interface FoodInputs {
  dietType: DietType;
  organicShare: number; // percentage (0 - 100)
  foodWasteShare: number; // percentage (0 - 100) - where 0 is no waste, 100 is high waste
}

export interface ShoppingInputs {
  clothesMonthly: number; // currency units per month
  electronicsYearly: number; // currency units per year
  recyclingPaper: boolean;
  recyclingPlastic: boolean;
  recyclingGlass: boolean;
  recyclingMetal: boolean;
}

export interface FootprintInputs {
  transport: TransportInputs;
  energy: EnergyInputs;
  food: FoodInputs;
  shopping: ShoppingInputs;
}

export interface FootprintBreakdown {
  transport: number; // kg CO2 / year
  energy: number;    // kg CO2 / year
  food: number;      // kg CO2 / year
  shopping: number;  // kg CO2 / year
  total: number;     // kg CO2 / year
}

export interface ActionItem {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'shopping';
  title: string;
  description: string;
  co2SavingKg: number; // kg CO2 saved per year
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HistoryEntry {
  id: string;
  date: string; // "YYYY-MM" or readable e.g. "Jun 2026"
  breakdown: FootprintBreakdown;
  activeActionsCount: number;
  totalSavingsKg: number;
}

export interface AIInsight {
  summary: string;
  highestCategoryAnalysis: string;
  actionPlan: {
    title: string;
    description: string;
    impact: string;
  }[];
  encouragement: string;
}
