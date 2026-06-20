import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCarbonPDFReport } from './generatePdfReport';
import { FootprintInputs, FootprintBreakdown } from '../types';

// Mock jsPDF correctly as a constructor function
vi.mock('jspdf', () => {
  return {
    jsPDF: function() {
      return {
        setDrawColor: vi.fn(),
        setLineWidth: vi.fn(),
        line: vi.fn(),
        setFillColor: vi.fn(),
        rect: vi.fn(),
        setFont: vi.fn(),
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        splitTextToSize: vi.fn().mockImplementation((text: string) => [text]),
        output: vi.fn().mockReturnValue('dummy-pdf-blob'),
        save: vi.fn()
      };
    }
  };
});

describe('generateCarbonPDFReport Utility', () => {
  let originalLocalStorage: any;

  beforeEach(() => {
    originalLocalStorage = (global as any).localStorage;
    
    // Setup a simple mock localStorage for Node environment
    (global as any).localStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({
        streakCount: 5,
        lastLoggedDate: '2026-06-19'
      })),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn()
    };
  });

  afterEach(() => {
    (global as any).localStorage = originalLocalStorage;
  });

  const dummyInputs: FootprintInputs = {
    transport: {
      carType: 'petrol',
      carDistance: 12000,
      publicTransitHours: 5,
      flightsShort: 3,
      flightsLong: 1,
      petrolCarKm: 12000,
      dieselCarKm: 0,
      electricCarKm: 0,
      busKm: 500,
      trainMetroKm: 300
    },
    energy: {
      electricityKwh: 400,
      naturalGasKwh: 1200,
      householdSize: 3,
      greenEnergyShare: 25,
      gasCubicMeters: 40,
      heatingFuelLiters: 150
    },
    food: {
      dietType: 'low-meat',
      organicShare: 40,
      foodWasteShare: 15
    },
    shopping: {
      clothesMonthly: 3000,
      electronicsYearly: 25000,
      recyclingPaper: true,
      recyclingPlastic: true,
      recyclingGlass: false,
      recyclingMetal: false
    }
  };

  const dummyBreakdown: FootprintBreakdown = {
    total: 5400,
    transport: 2400,
    energy: 1600,
    food: 900,
    shopping: 500
  };

  it('should compile and run without throwing errors with standard parameters', () => {
    const reportData = {
      inputs: dummyInputs,
      breakdown: dummyBreakdown,
      committedActionIds: ['ev-switch', 'led-lights', 'compost-habits'],
      totalSavings: 1450,
      userEmail: 'explorer-citizen@test.com'
    };

    expect(() => generateCarbonPDFReport(reportData)).not.toThrow();
  });

  it('should fallback to defaults when userEmail is omitted and local storage is empty', () => {
    // Override localStorage mock to return null (clean fallback)
    (global as any).localStorage.getItem.mockReturnValueOnce(null);

    const reportData = {
      inputs: dummyInputs,
      breakdown: dummyBreakdown,
      committedActionIds: [],
      totalSavings: 0
    };

    expect(() => generateCarbonPDFReport(reportData)).not.toThrow();
  });
});
