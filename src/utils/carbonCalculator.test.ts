import { describe, it, expect } from 'vitest';
import {
  calculateTransportCO2,
  calculateEnergyCO2,
  calculateFoodCO2,
  calculateShoppingCO2,
  calculateFullFootprint
} from './carbonCalculator';
import { FootprintInputs } from '../types';

describe('Carbon Calculator Utility Functions', () => {
  describe('calculateTransportCO2', () => {
    it('should calculate emissions accurately with default values', () => {
      const transportInputs = {
        carType: 'petrol' as const,
        carDistance: 5000,
        publicTransitHours: 5,
        flightsShort: 2,
        flightsLong: 1,
        petrolCarKm: 5000,
        dieselCarKm: 0,
        electricCarKm: 0,
        busKm: 1500,
        trainMetroKm: 1000
      };
      
      const res = calculateTransportCO2(transportInputs);
      // Math:
      // Car: 5000 * 0.18 = 900
      // Bus: 1500 * 0.08 = 120
      // TrainMetro: 1000 * 0.03 = 30
      // FlightsShort: 2 * 220 = 440
      // FlightsLong: 1 * 950 = 950
      // Total = 900 + 120 + 30 + 440 + 950 = 2440
      expect(res).toBe(2440);
    });

    it('should return 0 when inputs are undefined', () => {
      expect(calculateTransportCO2(undefined as any)).toBe(0);
    });
  });

  describe('calculateEnergyCO2', () => {
    it('should divide emissions across household members with newer model', () => {
      const energyInputs = {
        electricityKwh: 3000,
        naturalGasKwh: 8000,
        householdSize: 2,
        // legacy values
        greenEnergyShare: 0,
        gasCubicMeters: 0,
        heatingFuelLiters: 0
      };
      // Math:
      // Electricity: 3000 * 0.82 = 2460
      // Gas: 8000 * 0.185 = 1480
      // Sum = 2460 + 1480 = 3940
      // Split by 2 = 1970
      const res = calculateEnergyCO2(energyInputs);
      expect(res).toBe(1970);
    });

    it('should use legacy fallback if householdSize or naturalGasKwh is missing', () => {
      const energyInputs = {
        electricityKwh: 200, // monthly
        greenEnergyShare: 20, // percent
        gasCubicMeters: 30, // monthly
        heatingFuelLiters: 100, // yearly
        naturalGasKwh: undefined as any,
        householdSize: undefined as any
      };
      // Math electricity: (200 * 12) * 0.82 * (1 - 0.20) = 2400 * 0.82 * 0.8 = 1574.4
      // Math gas: (30 * 12) * 2 = 360 * 2 = 720
      // Math heating: 100 * 2.68 = 268
      // Sum = 1574.4 + 720 + 268 = 2562.4 -> Math.round is 2562
      const res = calculateEnergyCO2(energyInputs as any);
      expect(res).toBe(2562);
    });

    it('should handle undefined gracefully', () => {
      expect(calculateEnergyCO2(undefined as any)).toBe(0);
    });
  });

  describe('calculateFoodCO2', () => {
    it('should compute vegetarian baseline with 0 waste & some organic share', () => {
      const foodInputs = {
        dietType: 'vegetarian' as const,
        organicShare: 50, // 50% organic -> 50% * 0.15 = 7.5% reduction (factor 0.925)
        foodWasteShare: 30 // 30% average waste -> 0% wasteFactor adjustment (factor 1.0)
      };
      // Math: 1300 (vegetarian) * 0.925 * 1.0 = 1202.5 -> 1203
      const res = calculateFoodCO2(foodInputs);
      expect(res).toBe(1203);
    });

    it('should handle undefined gracefully', () => {
      expect(calculateFoodCO2(undefined as any)).toBe(0);
    });
  });

  describe('calculateShoppingCO2', () => {
    it('should estimate clothes & electrical spend properly with recycling', () => {
      const shoppingInputs = {
        clothesMonthly: 2000,
        electronicsYearly: 10000,
        recyclingPaper: true, // -45
        recyclingPlastic: true, // -70
        recyclingGlass: false,
        recyclingMetal: false
      };
      // Math clothes: (2000 * 12) * 0.0018 = 24000 * 0.0018 = 43.2
      // Math electronics: 10000 * 0.0034 = 34
      // sum = 77.2
      // recycling: paper (-45) + plastic (-70) = -115
      // total = 77.2 - 115 = -37.8 => capped at 0
      const res = calculateShoppingCO2(shoppingInputs);
      expect(res).toBe(0);
    });

    it('should calculate positive values when spending is high', () => {
      const shoppingInputs = {
        clothesMonthly: 12000, // (12000 * 12) * 0.0018 = 259.2
        electronicsYearly: 50000, // 50000 * 0.0034 = 170
        recyclingPaper: true, // -45
        recyclingPlastic: true, // -70
        recyclingGlass: true, // -35
        recyclingMetal: true // -50
        // sum = 429.2
        // recycling savings = -200
        // total = 229.2 => Math.round is 229
      };
      const res = calculateShoppingCO2(shoppingInputs);
      expect(res).toBe(229);
    });

    it('should handle undefined gracefully', () => {
      expect(calculateShoppingCO2(undefined as any)).toBe(0);
    });
  });

  describe('calculateFullFootprint', () => {
    it('should sum all segments together in the breakdown and clip negative totals to 150', () => {
      const inputs: FootprintInputs = {
        transport: {
          carType: 'petrol',
          carDistance: 100,
          publicTransitHours: 0,
          flightsShort: 0,
          flightsLong: 0,
          petrolCarKm: 100,
          dieselCarKm: 0,
          electricCarKm: 0,
          busKm: 0,
          trainMetroKm: 0
        },
        energy: {
          electricityKwh: 100,
          naturalGasKwh: 100,
          householdSize: 1,
          greenEnergyShare: 0,
          gasCubicMeters: 0,
          heatingFuelLiters: 0
        },
        food: {
          dietType: 'vegan',
          organicShare: 100, // 100% organic -> 15% reduction
          foodWasteShare: 0 // 0% waste -> -9% reduction
        },
        shopping: {
          clothesMonthly: 0,
          electronicsYearly: 0,
          recyclingPaper: true,
          recyclingPlastic: true,
          recyclingGlass: true,
          recyclingMetal: true
        }
      };

      const res = calculateFullFootprint(inputs);
      expect(res.total).toBeGreaterThanOrEqual(150); // min clipped baseline is 150
      expect(res).toHaveProperty('transport');
      expect(res).toHaveProperty('energy');
      expect(res).toHaveProperty('food');
      expect(res).toHaveProperty('shopping');
    });
  });
});
